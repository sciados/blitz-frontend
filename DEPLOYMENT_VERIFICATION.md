# Deployment Verification Checklist

## Pre-Deployment

### 1. Build Status (Vercel)
After pushing to GitHub, check Vercel build logs for:
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Generating static pages
✓ Build completed
```

**🚨 Red Flags in Build:**
- `import', and 'export' cannot be used outside of module code` → ONNX downgrade didn't work
- `Module not found: onnxruntime-web` → Package version mismatch

---

## Post-Deployment Verification

### 2. Content Library Images Tab

**Steps:**
1. Go to: https://blitz.ws/library?tab=images
2. Open browser DevTools → Console tab
3. Scroll through images

**✅ Success Indicators:**
Console shows logs like:
```
Using proxy for image: https://pub-c0ddba9f039845bda33be436955187cb.r2.dev/campaigns/28/edited/draft_... via https://api.blitz.ws
```

**🚨 Red Flags:**
```
Access to fetch at 'https://pub-c0ddba9f039845bda33be436955187cb.r2.dev/...' from origin 'https://blitz.ws' has been blocked by CORS policy
```

---

### 3. Network Tab Verification

**Steps:**
1. Open DevTools → Network tab
2. Filter by: `Images` or search for `proxy`
3. Scroll through image requests

**✅ Success Indicators:**
All image requests go through proxy:
```
Name: proxy?url=https%3A%2F%2Fpub.c0ddba9f039845bda33be436955187cb.r2.dev%2F...
URL: https://api.blitz.ws/api/images/proxy?url=https%3A%2F%2Fpub.c0ddba9f039845bda33be436955187cb.r2.dev%2F...
Status: 200
Type: img
```

**🚨 Red Flags:**
Direct R2 requests (bypassing proxy):
```
Name: draft_20251224_191102_5ed73d78.png
URL: https://pub-c0ddba9f039845bda33be436955187cb.r2.dev/campaigns/28/edited/draft_20251224_191102_5ed73d78.png
Status: (blocked)
Error: CORS error
```

---

### 4. Image Interaction Tests

**✅ Test Each Feature:**

1. **Browse Images**
   - Scroll through grid
   - Images should load without errors
   - No broken image icons

2. **Open Modal**
   - Click any image
   - Modal opens
   - Image displays correctly
   - Check console for proxy logs

3. **Download Image**
   - Click download button
   - Image downloads successfully
   - Check Network tab shows proxy request

4. **Select Multiple Images**
   - Select 3-5 images
   - Batch action buttons appear
   - "Optimize", "Apply Filters", "Batch Process", "Remove Backgrounds" buttons work

---

### 5. Background Removal Test (FREE)

**Steps:**
1. Select 1-2 images
2. Click "Remove Backgrounds (FREE)" button
3. Wait for processing
4. Check results

**✅ Success Indicators:**
- Processing completes
- Images show transparent backgrounds
- Downloads work

**🚨 Red Flags:**
- Processing fails with ONNX errors
- Images don't load

---

### 6. Other Image Locations

**Check these pages too:**

1. **Image Editor**
   - https://blitz.ws/image-editor?imageUrl=...
   - Images load correctly
   - No CORS errors

2. **Admin Images**
   - https://blitz.ws/admin/images
   - All images display

3. **Content Studio Images**
   - https://blitz.ws/content/images
   - Grid loads images

---

## What to Report Back

### If Everything Works ✅

Just confirm:
> "Deployment successful! All images loading via proxy, no CORS errors."

### If Issues Occur 🚨

Please report:

1. **Build Error:**
   - Paste the exact error from Vercel build logs
   - Note which commit/branch

2. **CORS Still Occurring:**
   - Screenshot of console error
   - Note which page/URL
   - Check if proxy logs appear in console

3. **Images Not Loading:**
   - Screenshot of blank/broken images
   - Network tab showing failed requests
   - Any error messages in console

---

## Quick Commands for Testing

### Check Current API URL
```javascript
// Run in browser console on blitz.ws
console.log('API URL:', process.env.NEXT_PUBLIC_API_BASE_URL || 'Not set');
console.log('Inferred from hostname:', window.location.hostname);
```

### Test Proxy Directly
```bash
# In terminal, test if proxy is accessible
curl -I "https://api.blitz.ws/api/images/proxy?url=https://pub-c0ddba9f039845bda33be436955187cb.r2.dev/campaigns/33/edited/test.png"
```

Should return:
```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Cache-Control: public, max-age=31536000
Content-Type: image/png
```

---

## Rollback Trigger Points

**Deploy rollback if you see:**
1. Build fails completely
2. All images are broken
3. Background removal doesn't work
4. CORS errors persist after 2 deployments

---

## Expected Timeline

| Step | Time | What to Check |
|------|------|---------------|
| Build | 5-10 min | Vercel build logs |
| Deploy | 2-5 min | Vercel deployment status |
| Test | 10-15 min | Complete verification checklist |
| **Total** | **~30 min** | **Full verification** |

---

## Success Criteria

✅ **ALL of these must work:**
- [ ] Build completes without errors
- [ ] Images load in Content Library
- [ ] No CORS errors in console
- [ ] Network tab shows proxy requests
- [ ] Download works
- [ ] Modal view works
- [ ] Batch operations work
- [ ] Background removal works

**If all checkboxes ✅ → Deployment is SUCCESS!**
