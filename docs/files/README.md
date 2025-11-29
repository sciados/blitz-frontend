# Blitz Email Service Backend

FastAPI service for handling email signups with PostgreSQL database.

## Features

- ✅ Email signup with validation
- ✅ Audience type tracking (Product Dev, Affiliate, Business)
- ✅ Duplicate email handling
- ✅ Statistics endpoint
- ✅ CSV export
- ✅ Soft delete (mark inactive)
- ✅ CORS configured for Vercel
- ✅ Health check endpoint

## Database Schema

The service automatically creates this table:

```sql
CREATE TABLE email_signups (
    id SERIAL PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    audience_type VARCHAR NOT NULL,
    source VARCHAR DEFAULT 'coming-soon',
    ip_address VARCHAR,
    user_agent VARCHAR,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    notified BOOLEAN DEFAULT FALSE,
    notes VARCHAR
);

-- Indexes automatically created
CREATE INDEX idx_email ON email_signups(email);
CREATE INDEX idx_id ON email_signups(id);
```

## Railway Deployment

### 1. Create PostgreSQL Database in Railway

1. Go to Railway dashboard
2. Click "New Project"
3. Add "PostgreSQL" service
4. Copy the `DATABASE_URL` from the service variables

### 2. Deploy Backend Service

1. Create new service in Railway
2. Connect your GitHub repo (or deploy from CLI)
3. Add environment variable:
   - `DATABASE_URL`: (paste from PostgreSQL service)
4. Railway will auto-detect Python and deploy

### 3. Environment Variables in Railway

Railway automatically provides:
- `DATABASE_URL` (if you link the PostgreSQL service)
- `PORT` (automatically set)

No additional env vars needed!

## Local Development

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Setup Environment

Create `.env` file:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/blitz_emails
PORT=8000
```

### 3. Run Server

```bash
uvicorn main:app --reload
```

Server will be available at `http://localhost:8000`

## API Endpoints

### POST /api/signup
Create new email signup

```bash
curl -X POST "http://localhost:8000/api/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "audience_type": "affiliate",
    "source": "coming-soon"
  }'
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "audience_type": "affiliate",
  "source": "coming-soon",
  "created_at": "2024-01-15T10:30:00"
}
```

### GET /api/signups
Get all signups (with pagination)

```bash
curl "http://localhost:8000/api/signups?skip=0&limit=10&audience_type=affiliate"
```

### GET /api/stats
Get signup statistics

```bash
curl "http://localhost:8000/api/stats"
```

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

### GET /api/export
Export emails as CSV

```bash
curl "http://localhost:8000/api/export?audience_type=affiliate"
```

### DELETE /api/signup/{email}
Soft delete (mark as inactive)

```bash
curl -X DELETE "http://localhost:8000/api/signup/user@example.com"
```

### GET /health
Health check endpoint

```bash
curl "http://localhost:8000/health"
```

## pgAdmin Setup

### Connect to Railway PostgreSQL

1. Open pgAdmin
2. Right-click "Servers" → Create → Server
3. **General Tab:**
   - Name: `Blitz Railway DB`
4. **Connection Tab:**
   - Get values from Railway `DATABASE_URL`:
   - Format: `postgresql://user:pass@host:port/dbname`
   - Host: `containers-us-west-123.railway.app`
   - Port: `5432`
   - Database: `railway` (or your db name)
   - Username: `postgres`
   - Password: (from DATABASE_URL)
5. **SSL Tab:**
   - SSL Mode: `Require`

### View Signups

```sql
-- View all active signups
SELECT * FROM email_signups 
WHERE is_active = TRUE 
ORDER BY created_at DESC;

-- Count by audience type
SELECT audience_type, COUNT(*) 
FROM email_signups 
WHERE is_active = TRUE 
GROUP BY audience_type;

-- Recent signups (last 24h)
SELECT * FROM email_signups 
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

## Connecting Frontend (Vercel)

Update your Coming Soon page:

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const response = await fetch('https://your-railway-app.railway.app/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        audience_type: selectedAudience,
        source: 'coming-soon'
      })
    });
    
    if (response.ok) {
      setSubmitted(true);
    }
  } catch (error) {
    console.error('Signup error:', error);
  }
};
```

## Security Notes

🔒 **For Production:**
- Add authentication to admin endpoints (/api/signups, /api/export)
- Rate limit the signup endpoint
- Add CAPTCHA to prevent spam
- Use environment-based CORS origins
- Enable HTTPS only

## Database Backup

Railway automatically backs up your PostgreSQL database. You can also export manually:

```bash
# From Railway CLI
railway run pg_dump > backup.sql
```

## Troubleshooting

### "DATABASE_URL not set"
- Make sure you've linked the PostgreSQL service in Railway
- Check environment variables in Railway dashboard

### CORS errors
- Update `allow_origins` in `main.py` with your Vercel domain
- Deploy changes to Railway

### Connection refused
- Check Railway deployment logs
- Ensure PORT environment variable is set
- Verify DATABASE_URL format is `postgresql://` not `postgres://`

## Support

For issues, check Railway logs:
```bash
railway logs
```