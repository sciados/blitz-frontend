# 🚀 Blitz Deployment Guide

Complete guide to deploy your frontend to Vercel and backend to Railway.

---

## 📦 Part 1: Deploy Backend to Railway

### Step 1: Setup PostgreSQL Database

1. Go to [Railway.app](https://railway.app)
2. Click **"New Project"**
3. Click **"Provision PostgreSQL"**
4. Wait for it to deploy
5. Click on the PostgreSQL service
6. Go to **"Variables"** tab
7. Copy the `DATABASE_URL` value (you'll need this)

### Step 2: Deploy Backend Service

1. In the same Railway project, click **"New Service"**
2. Choose **"GitHub Repo"** (or deploy from CLI)
3. Select your backend repo/folder
4. Railway will auto-detect Python

### Step 3: Connect Database to Backend

1. Click on your backend service
2. Go to **"Variables"** tab
3. Click **"Reference"** → Select PostgreSQL service
4. Add variable:
   - Name: `DATABASE_URL`
   - Value: `${{Postgres.DATABASE_URL}}`
5. Click **"Add"**

### Step 4: Get Your Backend URL

1. Go to **"Settings"** tab in your backend service
2. Click **"Generate Domain"**
3. Copy the URL (e.g., `https://your-app.railway.app`)
4. Save this - you'll need it for the frontend!

### Step 5: Verify Deployment

```bash
# Test your Railway backend
curl https://your-app.railway.app/health

# Should return: {"status": "healthy"}
```

---

## 🎨 Part 2: Deploy Frontend to Vercel

### Step 1: Prepare Your Frontend

Create a `next.config.js` in your frontend root:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
}

module.exports = nextConfig
```

### Step 2: Deploy to Vercel

1. Go to [Vercel.com](https://vercel.com)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (or your frontend folder)
5. **Environment Variables:**
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://your-app.railway.app` (from Railway Step 4)
6. Click **"Deploy"**

### Step 3: Update CORS in Railway Backend

Once Vercel gives you a URL (e.g., `https://blitz.vercel.app`):

1. Go back to Railway backend service
2. Edit `main.py` CORS section:

```python
allow_origins=[
    "http://localhost:3000",
    "https://blitz.vercel.app",  # Your actual Vercel URL
    "https://*.vercel.app",
],
```

3. Commit and push changes
4. Railway will auto-redeploy

---

## 🗄️ Part 3: View Data in pgAdmin

### Connect to Railway PostgreSQL

1. Open **pgAdmin**
2. Right-click **"Servers"** → **Create** → **Server**

**General Tab:**
- Name: `Blitz Railway`

**Connection Tab:**
Parse your Railway `DATABASE_URL`:
```
postgresql://postgres:password@containers-us-west-123.railway.app:5432/railway
```

- Host: `containers-us-west-123.railway.app`
- Port: `5432`
- Database: `railway`
- Username: `postgres`
- Password: `[your password from DATABASE_URL]`

**SSL Tab:**
- SSL Mode: `Require`

3. Click **"Save"**

### View Your Signups

```sql
-- See all signups
SELECT * FROM email_signups 
ORDER BY created_at DESC;

-- Count by type
SELECT audience_type, COUNT(*) as count
FROM email_signups 
WHERE is_active = TRUE
GROUP BY audience_type;

-- Recent signups (24 hours)
SELECT email, audience_type, created_at
FROM email_signups 
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- Export emails for a specific audience
SELECT email 
FROM email_signups 
WHERE audience_type = 'affiliate' 
AND is_active = TRUE;
```

---

## ✅ Testing the Full Stack

### 1. Test Backend (Railway)

```bash
# Health check
curl https://your-app.railway.app/health

# Create signup
curl -X POST https://your-app.railway.app/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "audience_type": "affiliate",
    "source": "coming-soon"
  }'

# Get stats
curl https://your-app.railway.app/api/stats
```

### 2. Test Frontend (Vercel)

1. Visit your Vercel URL
2. Fill out the email signup form
3. Submit
4. Check Railway logs: `railway logs`
5. Check pgAdmin to see the new entry

### 3. Verify in pgAdmin

```sql
SELECT * FROM email_signups 
WHERE email = 'test@example.com';
```

---

## 🔧 Environment Variables Summary

### Railway Backend
```
DATABASE_URL = ${{Postgres.DATABASE_URL}} (auto-linked)
PORT = 8000 (auto-set by Railway)
```

### Vercel Frontend
```
NEXT_PUBLIC_API_URL = https://your-app.railway.app
```

---

## 📊 API Endpoints Available

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/signup` | POST | Create signup |
| `/api/signups` | GET | List all signups |
| `/api/stats` | GET | Get statistics |
| `/api/export` | GET | Export CSV |
| `/api/signup/{email}` | DELETE | Remove signup |

---

## 🚨 Troubleshooting

### "CORS Error" in Browser
- Check Railway backend `allow_origins` includes your Vercel URL
- Redeploy Railway backend after updating CORS

### "DATABASE_URL not set"
- Make sure PostgreSQL service is linked to backend in Railway
- Check Railway backend environment variables

### Form Not Submitting
- Open browser console (F12) to see errors
- Verify `NEXT_PUBLIC_API_URL` is set in Vercel
- Test backend endpoint directly with curl

### Can't Connect pgAdmin
- Verify SSL is set to "Require"
- Double-check host, port, username, password from Railway
- Make sure you're parsing DATABASE_URL correctly

---

## 🎉 You're Done!

Your complete stack:
- ✅ Backend on Railway (Python/FastAPI)
- ✅ Database on Railway (PostgreSQL)
- ✅ Frontend on Vercel (Next.js/React)
- ✅ pgAdmin connected for data viewing

Now start collecting those emails! 📧💰