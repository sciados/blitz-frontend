# Vercel Deployment Fix: ONNX Runtime import.meta Error

## Problem
Vercel deployment was failing with the error:
```
'import', and 'export' cannot be used outside of module code
```

This was caused by `onnxruntime-web@1.21.0` using ESM `import.meta` syntax, which Terser (the minification tool used by Next.js/Webpack) couldn't parse.

## Solution
Downgraded packages to compatible versions:

1. **onnxruntime-web**: `1.21.0` → `1.17.1`
   - Version 1.21.0 uses ESM `import.meta` syntax
   - Version 1.17.1 uses CommonJS, which is compatible with Terser

2. **@imgly/background-removal**: `1.7.0` → `1.4.5`
   - Version 1.7.0 required onnxruntime-web@1.21.0
   - Version 1.4.5 is compatible with onnxruntime-web@1.17.1

## Changes Made

### package.json
- Updated `@imgly/background-removal` to version `1.4.5`
- Automatically downgraded `onnxruntime-web` to `1.17.1`

### next.config.js
- Simplified webpack configuration
- Removed complex Terser exclusion patterns (no longer needed)
- Kept essential WebAssembly and Node.js polyfills

## Verification
- ✅ Build completes successfully locally
- ✅ No Terser errors
- ✅ Background removal functionality preserved
- ✅ All image filters working correctly
- ✅ Batch processing buttons restored

## Testing on Vercel
The fix should resolve the Vercel deployment issue. The build process will:
1. Use onnxruntime-web@1.17.1 (CommonJS compatible)
2. Successfully minify all code including ONNX runtime
3. Deploy without errors

## Technical Details
The root cause was a version incompatibility:
- ONNX Runtime 1.21.0 adopted ESM modules with `import.meta.url`
- Terser (used by Webpack for minification) doesn't support parsing `import.meta`
- Downgrading to 1.17.1 (CommonJS) resolved the issue

This is a temporary workaround. Future solutions could include:
- Using a CDN-hosted ONNX runtime
- Upgrading to Next.js 15+ with better ESM support
- Using webpack 5's ESM handling capabilities

## Files Changed
- `package.json` - Downgraded packages
- `next.config.js` - Simplified configuration

## Status
✅ **FIXED** - Ready for Vercel deployment
