# CORS Fix for R2 Image Access

## Problem
Images in the Content Library were failing to load with CORS errors:
```
Access to fetch at 'https://pub-c0ddba9f039845bda33be436955187cb.r2.dev/...' from origin 'https://blitz.ws' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Root Cause
- **Image Editor**: Uses `/api/images/proxy` endpoint → **Works fine** ✅
- **Content Library**: Loads images directly from R2 → **CORS errors** ❌

The backend has a proxy endpoint that adds CORS headers, but it wasn't being used in the library.

## Solution
Updated all image loading in the Content Library to use the proxy endpoint.

### Files Modified

#### 1. `src/app/(dashboard)/library/page.tsx`
Added helper function:
```typescript
const getProxiedImageUrl = (imageUrl: string) => {
  if (!imageUrl || imageUrl.startsWith('/api/')) return imageUrl;
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl) return imageUrl;
  return `${apiBaseUrl}/api/images/proxy?url=${encodeURIComponent(imageUrl)}`;
};
```

Updated image displays:
- Line 1412: Main image grid → `getProxiedImageUrl(image.image_url)`
- Line 521: Download function → `getProxiedImageUrl(image.image_url)`
- Line 2035: Modal view → `getProxiedImageUrl(selectedLibraryImage.image_url)`

#### 2. `src/components/image-editor/BatchProcessingModal.tsx`
Added same helper function and updated:
- Line 436: Result display → `getProxiedImageUrl(img.edited_url)`
- Line 157: Download function → `getProxiedImageUrl(image.edited_url)`

## How the Proxy Works

**Backend Endpoint**: `/api/images/proxy`

```python
@proxy_router.get("/api/images/proxy")
async def proxy_image(url: str = Query(...)):
    # Fetch from R2
    response = await client.get(url)

    # Return with CORS headers
    return Response(
        content=response.content,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Cache-Control": "public, max-age=31536000",
        }
    )
```

## Flow Comparison

**Before (Broken):**
```
Frontend → R2 Bucket → ❌ CORS Error
```

**After (Fixed):**
```
Frontend → /api/images/proxy → R2 Bucket → ✅ Success with CORS headers
```

## What Still Uses Direct URLs (Intentionally)

These remain as direct URLs (passed as parameters):
- Line 486: Image URL passed to Image Editor (editor handles proxy)
- Line 1534: Image URL passed to Image Editor
- Line 1588: Image URL passed to Video Generation
- Line 2308: API call to save image (not for display)

These are correct because:
1. The receiving page handles the proxy itself (like Image Editor)
2. They're URL parameters, not direct image loads
3. API calls don't need the proxy

## Testing

Build status: ✅ **SUCCESS**
- No CORS errors in library
- Images load correctly
- Download function works
- Modal view works

## Benefits

1. **Consistent**: All image loading uses the same proxy
2. **Secure**: Backend still controls access to R2
3. **Cached**: 1-year cache headers improve performance
4. **Simple**: Single helper function for all use cases

## Deployment

Ready for production deployment. The fix:
- ✅ Works locally
- ✅ Builds successfully
- ✅ Uses existing backend proxy
- ✅ No breaking changes
