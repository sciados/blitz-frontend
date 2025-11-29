from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel, EmailStr, validator
from datetime import datetime
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

# FastAPI app
app = FastAPI(title="Blitz Email Service", version="1.0.0")

# CORS middleware - update origins with your Vercel domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://*.vercel.app",
        "https://yourdomain.com"  # Replace with your actual domain
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable not set")

# Handle Railway's postgres:// vs postgresql:// issue
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Models
class EmailSignup(Base):
    __tablename__ = "email_signups"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    audience_type = Column(String, nullable=False)  # product-dev, affiliate, business
    source = Column(String, default="coming-soon")  # Track where signup came from
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    notified = Column(Boolean, default=False)  # Track if launch email was sent
    notes = Column(String, nullable=True)

# Create tables
Base.metadata.create_all(bind=engine)

# Pydantic Models
class EmailSignupCreate(BaseModel):
    email: EmailStr
    audience_type: str
    source: Optional[str] = "coming-soon"
    
    @validator('audience_type')
    def validate_audience_type(cls, v):
        valid_types = ['product-dev', 'affiliate', 'business']
        if v not in valid_types:
            raise ValueError(f'audience_type must be one of {valid_types}')
        return v

class EmailSignupResponse(BaseModel):
    id: int
    email: str
    audience_type: str
    source: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class StatsResponse(BaseModel):
    total_signups: int
    product_dev: int
    affiliate: int
    business: int
    last_24h: int

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Routes
@app.get("/")
async def root():
    return {
        "service": "Blitz Email Service",
        "status": "active",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for Railway"""
    return {"status": "healthy"}

@app.post("/api/signup", response_model=EmailSignupResponse)
async def create_signup(
    signup: EmailSignupCreate,
    db: Session = Depends(get_db)
):
    """Create a new email signup"""
    
    # Check if email already exists
    existing = db.query(EmailSignup).filter(EmailSignup.email == signup.email).first()
    if existing:
        # Update existing record
        existing.audience_type = signup.audience_type
        existing.source = signup.source
        existing.updated_at = datetime.utcnow()
        existing.is_active = True
        db.commit()
        db.refresh(existing)
        return existing
    
    # Create new signup
    db_signup = EmailSignup(
        email=signup.email,
        audience_type=signup.audience_type,
        source=signup.source
    )
    
    db.add(db_signup)
    db.commit()
    db.refresh(db_signup)
    
    return db_signup

@app.get("/api/signups", response_model=list[EmailSignupResponse])
async def get_signups(
    skip: int = 0,
    limit: int = 100,
    audience_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all signups (protected in production with auth)"""
    query = db.query(EmailSignup).filter(EmailSignup.is_active == True)
    
    if audience_type:
        query = query.filter(EmailSignup.audience_type == audience_type)
    
    signups = query.order_by(EmailSignup.created_at.desc()).offset(skip).limit(limit).all()
    return signups

@app.get("/api/stats", response_model=StatsResponse)
async def get_stats(db: Session = Depends(get_db)):
    """Get signup statistics"""
    from sqlalchemy import func
    from datetime import timedelta
    
    total = db.query(EmailSignup).filter(EmailSignup.is_active == True).count()
    
    product_dev = db.query(EmailSignup).filter(
        EmailSignup.audience_type == "product-dev",
        EmailSignup.is_active == True
    ).count()
    
    affiliate = db.query(EmailSignup).filter(
        EmailSignup.audience_type == "affiliate",
        EmailSignup.is_active == True
    ).count()
    
    business = db.query(EmailSignup).filter(
        EmailSignup.audience_type == "business",
        EmailSignup.is_active == True
    ).count()
    
    yesterday = datetime.utcnow() - timedelta(hours=24)
    last_24h = db.query(EmailSignup).filter(
        EmailSignup.created_at >= yesterday,
        EmailSignup.is_active == True
    ).count()
    
    return {
        "total_signups": total,
        "product_dev": product_dev,
        "affiliate": affiliate,
        "business": business,
        "last_24h": last_24h
    }

@app.delete("/api/signup/{email}")
async def delete_signup(email: str, db: Session = Depends(get_db)):
    """Soft delete a signup (mark as inactive)"""
    signup = db.query(EmailSignup).filter(EmailSignup.email == email).first()
    
    if not signup:
        raise HTTPException(status_code=404, detail="Email not found")
    
    signup.is_active = False
    signup.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Signup removed successfully"}

@app.get("/api/export")
async def export_emails(
    audience_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Export emails as CSV (protected in production with auth)"""
    query = db.query(EmailSignup).filter(EmailSignup.is_active == True)
    
    if audience_type:
        query = query.filter(EmailSignup.audience_type == audience_type)
    
    signups = query.all()
    
    # Create CSV
    import io
    import csv
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Email', 'Audience Type', 'Source', 'Created At'])
    
    for signup in signups:
        writer.writerow([
            signup.email,
            signup.audience_type,
            signup.source,
            signup.created_at.isoformat()
        ])
    
    return {
        "csv": output.getvalue(),
        "count": len(signups)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))