# 🚀 Blitz Email Service Integration - Handover Document for MiniMax

**Date:** November 29, 2024  
**Project:** Email Signup Service Integration  
**Platform:** Blitz Marketing Automation Platform  
**Developer:** MiniMax  

---

## 📋 Executive Summary

This document provides complete implementation instructions for integrating the new email signup service into the existing Blitz SaaS platform. The service captures pre-launch signups for three distinct user types: Product Developers, Affiliate Marketers, and Small Business Owners.

### Technology Stack
- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS (EXISTING)
- **Backend:** FastAPI, Python, SQLAlchemy, PostgreSQL (EXISTING)
- **New Service:** Email signup microservice (FastAPI)
- **Hosting:** Vercel (Frontend) + Railway (Backend) (EXISTING)
- **Database:** PostgreSQL with pgAdmin (EXISTING)

---

## 🎯 Implementation Overview

### What's Being Added
1. **New Database Table:** `email_signups` (auto-created by new service)
2. **New API Endpoints:** 6 endpoints for signup management
3. **New Frontend Pages:** 4 landing pages (Coming Soon + 3 targeted pages)
4. **Integration Points:** Connect new service to existing Blitz backend

### Integration Strategy
**Option A - Microservice (Recommended for MVP):**
- Deploy email service as separate Railway service
- Keep existing Blitz backend untouched
- Use different database or same PostgreSQL instance

**Option B - Monolithic Integration:**
- Merge email service code into existing Blitz backend
- Add routes to existing FastAPI application
- Use existing database connection

**Recommendation:** Start with Option A (microservice) for faster deployment, migrate to Option B later if desired.

---

## 📁 File Structure & Placement

### New Backend Files (Railway)

```
blitz-backend/
├── services/
│   └── email_service/          # NEW - Email microservice
│       ├── main.py             # FastAPI app with all endpoints
│       ├── requirements.txt    # Python dependencies
│       ├── .env.example        # Environment template
│       ├── railway.json        # Railway config
│       ├── Procfile           # Railway start command
│       └── README.md          # Service documentation
```

**OR** (if integrating into existing backend):

```
blitz-backend/
├── app/
│   ├── routers/
│   │   └── email_signups.py    # NEW - Email signup routes
│   ├── models/
│   │   └── email_signup.py     # NEW - EmailSignup model
│   ├── schemas/
│   │   └── email_signup.py     # NEW - Pydantic schemas
│   └── main.py                 # MODIFY - Import new router
```

### New Frontend Files (Vercel)

```
blitz-frontend/
├── app/
│   ├── coming-soon/
│   │   └── page.tsx            # NEW - Coming Soon page
│   ├── for-developers/
│   │   └── page.tsx            # NEW - Product Developers page
│   ├── for-affiliates/
│   │   └── page.tsx            # NEW - Affiliate Marketers page
│   └── for-businesses/
│       └── page.tsx            # NEW - Small Business page
├── components/
│   └── email-signup/
│       ├── SignupForm.tsx      # NEW - Reusable signup component
│       └── AudienceSelector.tsx # NEW - Audience type selector
├── lib/
│   └── api/
│       └── email-service.ts    # NEW - API client for email service
└── .env.local                  # MODIFY - Add API_URL
```

---

## 🗄️ Database Schema

### New Table: `email_signups`

```sql
CREATE TABLE email_signups (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    audience_type VARCHAR(50) NOT NULL CHECK (audience_type IN ('product-dev', 'affiliate', 'business')),
    source VARCHAR(100) DEFAULT 'coming-soon',
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    notified BOOLEAN DEFAULT FALSE,
    notes TEXT
);

-- Indexes for performance
CREATE INDEX idx_email_signups_email ON email_signups(email);
CREATE INDEX idx_email_signups_audience ON email_signups(audience_type);
CREATE INDEX idx_email_signups_created ON email_signups(created_at DESC);
CREATE INDEX idx_email_signups_active ON email_signups(is_active) WHERE is_active = TRUE;

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_email_signups_updated_at 
    BEFORE UPDATE ON email_signups 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### pgAdmin Setup Instructions

1. **Connect to Railway PostgreSQL:**
   - Host: [From Railway DATABASE_URL]
   - Port: 5432
   - Database: railway (or your db name)
   - Username: postgres
   - Password: [From Railway DATABASE_URL]
   - SSL Mode: Require

2. **Table will auto-create on first run** of the email service
3. **Manual creation** (optional): Run SQL above in pgAdmin Query Tool

---

## 🔌 API Integration

### New Endpoints to Implement

#### 1. POST `/api/signup` - Create Email Signup
**Purpose:** Capture new email signups from landing pages

**Request:**
```json
{
  "email": "user@example.com",
  "audience_type": "affiliate",  // "product-dev" | "affiliate" | "business"
  "source": "coming-soon"         // Optional: tracking source
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "audience_type": "affiliate",
  "source": "coming-soon",
  "created_at": "2024-11-29T10:30:00Z"
}
```

**Error Handling:**
- **422:** Invalid email format or audience_type
- **200:** Email already exists (update instead of error)

**Implementation Location:**
```python
# File: app/routers/email_signups.py or services/email_service/main.py
@router.post("/api/signup", response_model=EmailSignupResponse)
async def create_signup(signup: EmailSignupCreate, db: Session = Depends(get_db)):
    # Check for existing email
    # If exists: update audience_type and updated_at
    # If new: create new record
    # Return signup data
```

---

#### 2. GET `/api/signups` - List All Signups
**Purpose:** Admin dashboard to view all signups

**Query Parameters:**
- `skip` (int): Pagination offset (default: 0)
- `limit` (int): Results per page (default: 100, max: 1000)
- `audience_type` (string): Filter by type (optional)

**Response:**
```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "audience_type": "affiliate",
    "source": "coming-soon",
    "created_at": "2024-11-29T10:30:00Z"
  }
]
```

**Security Note:** ⚠️ Add authentication before production!

---

#### 3. GET `/api/stats` - Signup Statistics
**Purpose:** Dashboard metrics and analytics

**Response:**
```json
{
  "total_signups": 150,
  "product_dev": 45,
  "affiliate": 75,
  "business": 30,
  "last_24h": 12
}
```

**Implementation:**
```python
# Count queries with SQLAlchemy
total = db.query(EmailSignup).filter(EmailSignup.is_active == True).count()
# Group by audience_type
# Filter by created_at for last_24h
```

---

#### 4. GET `/api/export` - Export Emails as CSV
**Purpose:** Export email list for email campaigns

**Query Parameters:**
- `audience_type` (string): Filter by type (optional)

**Response:**
```json
{
  "csv": "Email,Audience Type,Source,Created At\nuser@example.com,affiliate,coming-soon,2024-11-29T10:30:00Z",
  "count": 150
}
```

**Alternative:** Return actual CSV file with proper headers
```python
from fastapi.responses import StreamingResponse
import io

# Return CSV as downloadable file
return StreamingResponse(
    io.StringIO(csv_content),
    media_type="text/csv",
    headers={"Content-Disposition": "attachment; filename=signups.csv"}
)
```

---

#### 5. DELETE `/api/signup/{email}` - Remove Signup
**Purpose:** Allow users to unsubscribe or admin to remove

**Response:**
```json
{
  "message": "Signup removed successfully"
}
```

**Error:**
- **404:** Email not found

**Implementation:** Soft delete (set `is_active = FALSE`)

---

#### 6. GET `/health` - Health Check
**Purpose:** Railway and monitoring systems

**Response:**
```json
{
  "status": "healthy",
  "service": "email-signups",
  "database": "connected"
}
```

---

## 💻 Frontend Integration

### 1. Environment Variables

**Add to Vercel:**
```bash
NEXT_PUBLIC_API_URL=https://blitz-email-service.railway.app
# OR if integrated into main backend:
NEXT_PUBLIC_API_URL=https://api.blitz.com
```

**Add to `.env.local` for development:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

### 2. API Client Setup

**File: `lib/api/email-service.ts`**

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export type AudienceType = 'product-dev' | 'affiliate' | 'business';

export interface SignupRequest {
  email: string;
  audience_type: AudienceType;
  source?: string;
}

export interface SignupResponse {
  id: number;
  email: string;
  audience_type: AudienceType;
  source: string;
  created_at: string;
}

export const emailService = {
  async createSignup(data: SignupRequest): Promise<SignupResponse> {
    const response = await fetch(`${API_URL}/api/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Signup failed');
    }

    return response.json();
  },

  async getStats() {
    const response = await fetch(`${API_URL}/api/stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },
};
```

---

### 3. Reusable Signup Component

**File: `components/email-signup/SignupForm.tsx`**

```typescript
'use client';

import { useState } from 'react';
import { emailService, AudienceType } from '@/lib/api/email-service';

interface SignupFormProps {
  source?: string;
  defaultAudience?: AudienceType;
  onSuccess?: () => void;
}

export default function SignupForm({ 
  source = 'coming-soon', 
  defaultAudience,
  onSuccess 
}: SignupFormProps) {
  const [email, setEmail] = useState('');
  const [audience, setAudience] = useState<AudienceType | ''>(defaultAudience || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !audience) return;
    
    setLoading(true);
    
    try {
      await emailService.createSignup({
        email,
        audience_type: audience,
        source,
      });
      
      setSuccess(true);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center p-8 bg-green-900/20 rounded-xl border border-green-700/30">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-2xl font-bold mb-2">You're on the list!</h3>
        <p className="text-gray-300">We'll notify you at {email}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Audience selector if not default */}
      {!defaultAudience && (
        <div>
          <label className="block text-sm font-semibold mb-2">I'm interested as a...</label>
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value as AudienceType)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg"
            required
          >
            <option value="">Select...</option>
            <option value="product-dev">Product Developer</option>
            <option value="affiliate">Affiliate Marketer</option>
            <option value="business">Business Owner</option>
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold mb-2">Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg"
          required
        />
      </div>

      {error && (
        <div className="p-3 bg-red-900/20 border border-red-700/30 rounded text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !email || !audience}
        className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Submitting...' : 'Notify Me When It Launches'}
      </button>
    </form>
  );
}
```

---

### 4. Page Routes to Create

**Create these Next.js pages:**

```typescript
// app/coming-soon/page.tsx
import ComingSoonPage from '@/components/pages/ComingSoonPage';
export default ComingSoonPage;

// app/for-developers/page.tsx
import ProductDevelopersPage from '@/components/pages/ProductDevelopersPage';
export default ProductDevelopersPage;

// app/for-affiliates/page.tsx
import AffiliateMarketersPage from '@/components/pages/AffiliateMarketersPage';
export default AffiliateMarketersPage;

// app/for-businesses/page.tsx
import SmallBusinessPage from '@/components/pages/SmallBusinessPage';
export default SmallBusinessPage;
```

**Page Files:** Convert the provided JSX files to TypeScript:
- `coming-soon-page.jsx` → `components/pages/ComingSoonPage.tsx`
- `product-developers-page.jsx` → `components/pages/ProductDevelopersPage.tsx`
- `affiliate-marketers-page.jsx` → `components/pages/AffiliateMarketersPage.tsx`
- `small-business-page.jsx` → `components/pages/SmallBusinessPage.tsx`

---

## 🚀 Deployment Steps

### Step 1: Database Setup (pgAdmin)

**Option A: Auto-create (Recommended)**
1. Deploy the service
2. Table will be created automatically on first run

**Option B: Manual creation**
1. Open pgAdmin
2. Connect to Railway PostgreSQL
3. Run the SQL schema provided above

---

### Step 2: Deploy Backend Service

**If Microservice Approach:**

1. Create new Railway service in existing project
2. Link to same PostgreSQL database
3. Set environment variables:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   PORT=8000
   ```
4. Deploy files from `services/email_service/`
5. Generate domain (e.g., `blitz-email.railway.app`)

**If Monolithic Integration:**

1. Add routes to existing Blitz backend:
   ```python
   # main.py
   from app.routers import email_signups
   
   app.include_router(
       email_signups.router,
       tags=["email-signups"]
   )
   ```
2. Push to Railway (auto-deploys)

---

### Step 3: Update CORS Settings

**In Backend main.py:**

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://blitz.vercel.app",          # Your production domain
        "https://blitz-staging.vercel.app",  # Staging domain
        "https://*.vercel.app",              # All Vercel preview deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

### Step 4: Deploy Frontend to Vercel

1. Add environment variable in Vercel:
   - `NEXT_PUBLIC_API_URL` = `https://blitz-email.railway.app` (or your backend URL)
2. Push code to GitHub
3. Vercel auto-deploys

---

### Step 5: Test Integration

**Test Signup Flow:**
```bash
# 1. Visit coming soon page
https://blitz.vercel.app/coming-soon

# 2. Submit email form

# 3. Verify in pgAdmin
SELECT * FROM email_signups ORDER BY created_at DESC LIMIT 10;

# 4. Test API directly
curl -X POST https://blitz-email.railway.app/api/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","audience_type":"affiliate"}'

# 5. Get stats
curl https://blitz-email.railway.app/api/stats
```

---

## 🔐 Security Considerations

### Immediate (Before Launch)

1. **Rate Limiting:**
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/signup")
@limiter.limit("5/minute")  # Max 5 signups per minute per IP
async def create_signup(...):
    pass
```

2. **Email Validation:**
```python
from pydantic import EmailStr, validator

class EmailSignupCreate(BaseModel):
    email: EmailStr  # Built-in email validation
    
    @validator('email')
    def validate_email_domain(cls, v):
        # Block disposable email domains
        blocked_domains = ['tempmail.com', 'throwaway.email']
        domain = v.split('@')[1]
        if domain in blocked_domains:
            raise ValueError('Email domain not allowed')
        return v.lower()
```

3. **CAPTCHA Integration (Optional):**
- Add reCAPTCHA or hCaptcha to signup form
- Verify token on backend before saving

---

### Production Security (Post-Launch)

1. **Admin Endpoints Authentication:**
```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer

security = HTTPBearer()

async def verify_admin(token: str = Depends(security)):
    # Integrate with existing Blitz auth system
    if not is_admin(token):
        raise HTTPException(status_code=403, detail="Admin access required")
    return token

@app.get("/api/signups")
async def get_signups(admin: str = Depends(verify_admin), ...):
    pass
```

2. **Database Backups:**
- Railway auto-backs up PostgreSQL
- Set up additional manual backups:
```bash
railway run pg_dump > backup_$(date +%Y%m%d).sql
```

3. **Monitoring:**
- Add logging for suspicious activity
- Track failed signup attempts
- Monitor API usage

---

## 📊 Analytics & Tracking

### Metrics to Track

**In Existing Blitz Dashboard:**
1. Total signups by audience type
2. Daily signup rate
3. Conversion rate (signups → active users after launch)
4. Source tracking (which landing page converts best)

**Query Examples:**
```sql
-- Signups by day
SELECT 
    DATE(created_at) as signup_date,
    COUNT(*) as signups
FROM email_signups 
WHERE is_active = TRUE
GROUP BY DATE(created_at)
ORDER BY signup_date DESC;

-- Conversion by source
SELECT 
    source,
    audience_type,
    COUNT(*) as count
FROM email_signups 
WHERE is_active = TRUE
GROUP BY source, audience_type;

-- Growth rate
SELECT 
    DATE_TRUNC('week', created_at) as week,
    COUNT(*) as weekly_signups
FROM email_signups 
WHERE is_active = TRUE
GROUP BY week
ORDER BY week DESC;
```

---

## 🎨 Design System Integration

### Tailwind Theme Variables

All landing pages use:
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Blitz brand colors
        'blitz-dark': '#0a0a0a',
        'blitz-gray': '#1a1a1a',
        'blitz-purple': '#8b5cf6',
        'blitz-blue': '#3b82f6',
        'blitz-green': '#10b981',
      },
    },
  },
}
```

### Component Consistency
- All buttons use gradient backgrounds
- Card components use `bg-gradient-to-br from-gray-800 to-gray-900`
- Emojis for visual accent (no icon libraries needed)
- Responsive design with Tailwind breakpoints

---

## 🧪 Testing Checklist

### Backend Testing

- [ ] Email signup creates new record
- [ ] Duplicate email updates existing record (doesn't error)
- [ ] Invalid email format returns 422
- [ ] Invalid audience_type returns 422
- [ ] Stats endpoint returns correct counts
- [ ] Export returns valid CSV
- [ ] Soft delete marks record inactive
- [ ] Health check returns 200

**Test Commands:**
```bash
# Create signup
pytest tests/test_email_signups.py::test_create_signup

# Duplicate handling
pytest tests/test_email_signups.py::test_duplicate_email

# Stats accuracy
pytest tests/test_email_signups.py::test_stats_calculation
```

---

### Frontend Testing

- [ ] Form validates email format
- [ ] Form requires audience selection
- [ ] Submit button disabled without inputs
- [ ] Loading state shows during submission
- [ ] Success message displays after signup
- [ ] Error message shows on failure
- [ ] CORS works from Vercel domain
- [ ] Mobile responsive on all pages

**Test Checklist:**
```typescript
// Create test file: __tests__/SignupForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignupForm from '@/components/email-signup/SignupForm';

test('submits form with valid data', async () => {
  render(<SignupForm />);
  
  fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
    target: { value: 'test@example.com' }
  });
  
  fireEvent.click(screen.getByText('Notify Me When It Launches'));
  
  await waitFor(() => {
    expect(screen.getByText("You're on the list!")).toBeInTheDocument();
  });
});
```

---

## 📧 Email Campaign Integration (Future)

### After Launch - Converting Signups to Users

**Step 1: Export Emails**
```python
# Export by audience type
emails = db.query(EmailSignup).filter(
    EmailSignup.audience_type == "affiliate",
    EmailSignup.is_active == True,
    EmailSignup.notified == False
).all()
```

**Step 2: Send Launch Emails**
```python
# Use existing email service (SendGrid, Mailgun, etc.)
for signup in emails:
    send_launch_email(
        to=signup.email,
        template=f"launch_{signup.audience_type}",
        data={"audience_type": signup.audience_type}
    )
    
    # Mark as notified
    signup.notified = True
    db.commit()
```

**Step 3: Track Conversions**
```sql
-- Add conversion tracking
ALTER TABLE email_signups ADD COLUMN converted_to_user BOOLEAN DEFAULT FALSE;
ALTER TABLE email_signups ADD COLUMN converted_at TIMESTAMP;

-- Update when user signs up
UPDATE email_signups 
SET converted_to_user = TRUE, converted_at = NOW()
WHERE email = 'user@example.com';
```

---

## 🐛 Common Issues & Solutions

### Issue 1: CORS Error in Browser
**Symptom:** `Access-Control-Allow-Origin` error in console

**Solution:**
1. Check Railway backend logs: `railway logs`
2. Verify CORS origins include Vercel URL
3. Ensure Vercel domain is correct (check for typos)
4. Redeploy backend after CORS changes

---

### Issue 2: Form Submits But No Data in Database
**Symptom:** Success message shows, but pgAdmin shows no new records

**Solution:**
1. Check Railway logs for errors
2. Verify `DATABASE_URL` is set correctly
3. Check if table exists: `SELECT * FROM email_signups;`
4. Test endpoint directly with curl
5. Check if `is_active = FALSE` (soft deleted)

---

### Issue 3: "Relation email_signups does not exist"
**Symptom:** PostgreSQL error about missing table

**Solution:**
1. Run the service once to auto-create table
2. OR manually create table with SQL schema
3. Verify connection string is correct
4. Check PostgreSQL service is running in Railway

---

### Issue 4: Duplicate Signups Not Updating
**Symptom:** Second signup with same email returns error

**Solution:**
1. Check logic in `create_signup` function
2. Ensure it queries for existing email first
3. Update record instead of creating new
4. Verify unique constraint on email column

---

## 🔄 Migration Path

### Current State → Future State

**Phase 1: MVP (Week 1)**
- ✅ Deploy email service as microservice
- ✅ Launch coming soon page
- ✅ Track signups in separate table

**Phase 2: Integration (Week 2-3)**
- Merge email service into main Blitz backend
- Add admin dashboard to view signups
- Integrate with existing user system

**Phase 3: Launch (Week 4)**
- Send launch emails to signups
- Convert signups to actual users
- Track conversion metrics

**Phase 4: Optimization (Ongoing)**
- A/B test landing pages
- Add more signup sources
- Implement referral tracking

---

## 📝 Code Files Reference

### Provided Files

1. **Backend:**
   - `backend/main.py` - Complete FastAPI service
   - `backend/requirements.txt` - Dependencies
   - `backend/.env.example` - Environment template
   - `backend/railway.json` - Railway config
   - `backend/Procfile` - Start command
   - `backend/README.md` - Documentation

2. **Frontend:**
   - `coming-soon-page.jsx` - Main landing page
   - `product-developers-page.jsx` - Developer-focused page
   - `affiliate-marketers-page.jsx` - Affiliate-focused page
   - `small-business-page.jsx` - Business-focused page

3. **Documentation:**
   - `DEPLOYMENT_GUIDE.md` - Step-by-step deployment
   - This handover document

---

## ✅ MiniMax Implementation Checklist

### Pre-Implementation
- [ ] Review all provided code files
- [ ] Understand existing Blitz architecture
- [ ] Decide on microservice vs monolithic approach
- [ ] Set up local development environment

### Database Setup
- [ ] Connect pgAdmin to Railway PostgreSQL
- [ ] Review database schema
- [ ] Understand table structure and relationships
- [ ] Test manual SQL queries

### Backend Implementation
- [ ] Deploy email service (or integrate into existing)
- [ ] Verify table auto-creation
- [ ] Test all 6 API endpoints
- [ ] Configure CORS settings
- [ ] Add rate limiting
- [ ] Test with Postman/curl

### Frontend Implementation
- [ ] Convert JSX files to TypeScript
- [ ] Create API client (`lib/api/email-service.ts`)
- [ ] Build reusable SignupForm component
- [ ] Create 4 page routes
- [ ] Add environment variables to Vercel
- [ ] Test form submission

### Integration Testing
- [ ] Test full signup flow (frontend → backend → database)
- [ ] Verify data appears in pgAdmin
- [ ] Test error handling
- [ ] Test duplicate email handling
- [ ] Test all 3 audience types
- [ ] Test on mobile devices

### Production Deployment
- [ ] Deploy backend to Railway
- [ ] Deploy frontend to Vercel
- [ ] Verify environment variables
- [ ] Test production URLs
- [ ] Monitor logs for errors
- [ ] Set up error alerting

### Post-Launch
- [ ] Monitor signup metrics
- [ ] Export email lists for campaigns
- [ ] Plan launch email strategy
- [ ] Track conversion rates

---

## 🆘 Support & Questions

### Resources
- **FastAPI Docs:** https://fastapi.tiangolo.com/
- **SQLAlchemy Docs:** https://docs.sqlalchemy.org/
- **Railway Docs:** https://docs.railway.app/
- **Vercel Docs:** https://vercel.com/docs

### Quick Reference
- **Backend Service Port:** 8000
- **Database Port:** 5432
- **Primary Table:** `email_signups`
- **Valid Audience Types:** `product-dev`, `affiliate`, `business`

### Testing Endpoints
```bash
# Health check
curl https://your-service.railway.app/health

# Create signup
curl -X POST https://your-service.railway.app/api/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","audience_type":"affiliate"}'

# Get stats
curl https://your-service.railway.app/api/stats

# Export CSV
curl https://your-service.railway.app/api/export
```

---

## 🎯 Success Criteria

Implementation is complete when:
- ✅ All 4 landing pages are live and responsive
- ✅ Email signup form works end-to-end
- ✅ Data is saved to PostgreSQL database
- ✅ pgAdmin shows signup records correctly
- ✅ Stats endpoint returns accurate counts
- ✅ CSV export works for all audience types
- ✅ No CORS errors in production
- ✅ Mobile experience is smooth
- ✅ Error handling works properly
- ✅ All tests pass

---

## 🚀 Ready to Implement?

**Estimated Implementation Time:** 4-6 hours

**Suggested Order:**
1. Setup database and verify schema (30 min)
2. Deploy backend service to Railway (1 hour)
3. Test all API endpoints (30 min)
4. Convert frontend files to TypeScript (1 hour)
5. Implement SignupForm component (1 hour)
6. Create page routes (30 min)
7. Deploy to Vercel (30 min)
8. End-to-end testing (1 hour)

**You've got this, MiniMax! All the code is provided and tested. Just follow this guide step-by-step and you'll have the email service integrated smoothly. 🎉**

---

**Document Version:** 1.0  
**Last Updated:** November 29, 2024  
**Next Review:** After Phase 1 deployment