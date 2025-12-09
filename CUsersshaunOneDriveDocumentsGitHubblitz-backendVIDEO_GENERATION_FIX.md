# Video Generation Bug Fixes

## Issues Fixed

### 1. Client-Side Exception on Video Generation
**Error:** `Application error: a client-side exception has occurred` when generating videos (both text-to-video and image-to-video)

**Root Cause:** Backend was returning 422 errors that weren't being properly handled by the frontend

### 2. Campaign ID Type Mismatch
**Problem:** Backend expected `campaign_id` as a string, but frontend was sending it as a number

**Solution:**
- Updated `VideoGenerateRequest` Pydantic schema to accept `Union[str, int]`
- Added proper type conversion with error handling

### 3. Missing Validation
**Problem:** No validation for required fields based on generation mode

**Solution:**
- Added validation to ensure `script` is provided for `text_to_video` mode
- Added validation to ensure `image_url` is provided for `image_to_video` mode
- Added proper error messages for validation failures

## Changes Made

### Backend (`app/api/video.py`)

#### 1. Updated Imports
```python
from typing import Optional, Dict, Any, List, Union
```

#### 2. Updated Pydantic Schema
```python
class VideoGenerateRequest(BaseModel):
    campaign_id: Union[str, int]  # Now accepts both string and int
    generation_mode: str = Field(default="text_to_video", ...)
    script: Optional[str] = Field(None, ...)
    # ... other fields
```

#### 3. Added Request Validation
```python
# Validate request parameters
if request.generation_mode == "text_to_video" and not request.script:
    raise HTTPException(
        status_code=422,
        detail="Script is required for text_to_video mode"
    )

if request.generation_mode == "image_to_video" and not request.image_url:
    raise HTTPException(
        status_code=422,
        detail="Image URL is required for image_to_video mode"
    )
```

#### 4. Added Campaign ID Conversion with Error Handling
```python
# Convert campaign_id to int, handling both string and int inputs
campaign_id_int = None
if request.campaign_id:
    try:
        campaign_id_int = int(request.campaign_id)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=422,
            detail=f"Invalid campaign_id: {request.campaign_id}. Must be a number."
        )
```

#### 5. Fixed All Database Save Calls
Changed from:
```python
campaign_id=int(request.campaign_id) if request.campaign_id else None
```

To:
```python
campaign_id=campaign_id_int
```

## Benefits

1. **Better Error Messages:** Users now see clear, actionable error messages instead of client-side exceptions
2. **Type Flexibility:** Accepts both string and number campaign IDs from the frontend
3. **Validation:** Proper validation ensures all required fields are present before processing
4. **Graceful Handling:** Handles type conversion errors gracefully with descriptive messages

## Testing

To test the fixes:

1. **Text-to-Video:**
   - Select a campaign
   - Enter a script
   - Click "Generate Video"
   - Should work without errors

2. **Image-to-Video:**
   - Select a campaign
   - Choose "Image to Video" mode
   - Select or upload an image
   - Click "Generate Video"
   - Should work without errors

3. **Error Cases:**
   - Try generating without a script (text-to-video) → Should show clear error
   - Try generating without an image (image-to-video) → Should show clear error
   - Invalid campaign ID → Should show clear error message

## Notes

- The frontend already has proper error handling that displays error messages via toast notifications
- All changes are backward compatible
- No database migrations needed
- The fixes maintain the existing API contract while improving validation and error handling
