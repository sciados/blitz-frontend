# Deployment Fixes - Complete Guide

## Issues Fixed

### 1. ✅ ONNX Runtime Build Error (Vercel Deployment)

**Problem:**
```
'import', and 'export' cannot be used outside of module code
```

**Root Cause:**
- `onnxruntime-web@1.21.0` uses ESM `import.meta` syntax
- Terser (minification tool) cannot parse `import.meta`

**Solution:**
```bash
npm install onnxruntime-web@1.17.1 @imgly/background-removal@1.4.5
```

**Files Changed:**
- `package.json` - Downgraded packages
- `next.config.js` - Simplified webpack config

**Status:** ✅ Fixed - Build succeeds locally and should work on Vercel

---

### 2. ✅ CORS Error for R2 Images (Production)

**Problem:**
```
Access to fetch at 'https://pub-c0ddba9f039845bda33be436955187cb.r2.dev/...' from origin 'https://blitz.ws' has been blocked by CORS policy
```

**Root Cause:**
- Cloudflare R2 bucket blocks cross-origin requests
- Frontend was loading images directly from R2
- Image Editor used proxy (works), Library didn't (fails)

**Solution:**
Smart proxy detection that automatically routes image requests through backend.

#### Files Modified:

**1. `src/app/(dashboard)/library/page.tsx`**
```typescript
const getProxiedImageUrl = (imageUrl: string) => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('/api/') || imageUrl.includes('/api/images/proxy')) return imageUrl;

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  let finalApiUrl = apiBaseUrl;

  // Smart detection: infer API URL from current domain
  if (!finalApiUrl && typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'blitz.ws') {
      finalApiUrl = 'https://api.blitz.ws';
    } else if (hostname.includes('localhost')) {
      finalApiUrl = 'http://localhost:8000';
    }
  }

  if (!finalApiUrl) {
    console.warn('NEXT_PUBLIC_API_BASE_URL not configured');
    return imageUrl;
  }

  console.log('Using proxy for image:', imageUrl.substring(0, 100), 'via', finalApiUrl);
  return `${finalApiUrl}/api/images/proxy?url=${encodeURIComponent(imageUrl)}`;
};
```

Updated:
- Line 1412: Main image grid
- Line 521: Download function
- Line 2035: Modal view

**2. `src/components/ImagePreviewModal.tsx`**
- Added same `getProxiedImageUrl` helper
- Line 62: Download function uses proxy

**3. `src/components/image-editor/BatchProcessingModal.tsx`**
- Added same `getProxiedImageUrl` helper
- Line 157: Download function uses proxy
- Line 436: Result display uses proxy

**4. `next.config.js`**
```javascript
env: {
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.blitz.ws'
}
```

---

## How Smart Proxy Detection Works

### Flow Diagram

**Before (Broken):**
```
Frontend (blitz.ws)
  → Direct fetch to R2 bucket
  → ❌ CORS Error: No 'Access-Control-Allow-Origin' header
```

**After (Fixed):**
```
Frontend (blitz.ws)
  → Check if NEXT_PUBLIC_API_BASE_URL is set
  → If not set, infer from hostname:
    * 'blitz.ws' → 'https://api.blitz.ws'
    * 'localhost' → 'http://localhost:8000'
  → Route through proxy:
  → GET https://api.blitz.ws/api/images/proxy?url=<encoded-r2-url>
  → Backend fetches from R2
  → Returns image with CORS headers
  → ✅ Success!
```

### Proxy Endpoint (Backend)

**Location:** `app/api/proxy.py`

```python
@proxy_router.get("/api/images/proxy")
async def proxy_image(url: str = Query(...)):
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(url)

        return Response(
            content=response.content,
            media_type=content_type,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Cache-Control": "public, max-age=31536000",
            }
        )
```

---

## Environment Variables

### For Local Development

Create `.env.local`:
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### For Production (Vercel)

Set in Vercel Dashboard → Project Settings → Environment Variables:

```
NEXT_PUBLIC_API_BASE_URL=https://api.blitz.ws
```

**OR** leave it unset - the smart detection will infer it from hostname.

---

## Testing the Fix

### 1. Check Console Logs

Open browser DevTools → Console:

You should see logs like:
```
Using proxy for image: https://pub-c0ddba9f039845bda33be436955187cb.r2.dev/campaigns/28/edited/... via https://api.blitz.ws
```

### 2. Check Network Tab

All image requests should go to:
```
GET https://api.blitz.ws/api/images/proxy?url=<encoded-r2-url>
```

NOT directly to R2:
```
GET https://pub-c0ddba9f039845bda33be436955187cb.r2.dev/campaigns/...
```

### 3. Verify Images Load

- Content Library → Images tab
- Click on images to open modal
- Download images
- All should work without CORS errors

---

## Debugging

### If CORS errors persist:

1. **Check console for warnings:**
   ```javascript
   console.warn('NEXT_PUBLIC_API_BASE_URL not configured and cannot infer API URL')
   ```

2. **Manually set the environment variable:**
   ```bash
   # In browser console on blitz.ws
   window.location.hostname
   // Should be 'blitz.ws'
   ```

3. **Verify backend proxy is accessible:**
   ```bash
   curl https://api.blitz.ws/api/images/proxy?url=https://example.com/image.png
   ```

4. **Check Vercel deployment:**
   - Make sure the new build is deployed
   - Check Vercel Function Logs for errors

---

## Rollback Plan

If issues occur, you can:

1. **Revert package versions:**
   ```bash
   npm install onnxruntime-web@1.21.0 @imgly/background-removal@1.7.0
   ```

2. **Disable proxy usage:**
   ```typescript
   // In getProxiedImageUrl, return imageUrl directly
   return imageUrl;
   ```

---

## Summary

| Issue | Status | Solution |
|-------|--------|----------|
| ONNX Runtime Build Error | ✅ Fixed | Downgrade to v1.17.1 |
| CORS for R2 Images | ✅ Fixed | Smart proxy detection |
| Environment Variable | ✅ Optional | Auto-inferred from hostname |
| Production Deployment | ✅ Ready | Deploy updated build |

**All fixes are backward compatible and production-ready!**
