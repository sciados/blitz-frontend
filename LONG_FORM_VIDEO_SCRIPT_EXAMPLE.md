# Long-Form Video Script (1+ Minute Example)

## Weight Loss Product - 60-Second Version

### Proper Timestamps for 1+ Minute Video:

**[0-10s]** Are you tired of struggling with weight loss and unhealthy diets?
[VISUAL: Close-up on speaker, direct eye contact]
[ANGLE: Medium shot]
[LIGHTING: Bright, professional setup]

**[10-15s]** This video contains affiliate links. I may earn a commission if you purchase through my link at no extra cost to you.
[VISUAL: Text overlay on screen - 'This video contains affiliate links']
[TRANSITION: Quick fade in]

**[15-25s]** You've tried everything - keto, paleo, Jenny Craig, Weight Watchers - but still can't achieve your health goals.
[B-ROLL: Frustrated person looking in mirror, scales showing no progress]

**[25-35s]** You've spent hundreds of dollars on programs that promised results but left you feeling deprived and exhausted.
[VISUAL: Montage of diet books, gym memberships, meal plans]

**[35-50s]** Introducing AquaSculpt, a revolutionary weight loss solution that helps you achieve a healthier lifestyle without extreme restrictions.
[VISUAL: Product showcase, AquaSculpt logo, benefits text overlay]
[ANGLE: Wide shot showing product in use]

**[50-60s]** AquaSculpt works by... [explain mechanism of action, key ingredients, scientific backing]
[VISUAL: Animation showing how product works in body]

**[60-70s]** Real customers have lost 15, 30, even 50 pounds in just 90 days with AquaSculpt.
[VISUAL: Before/after photos, customer testimonials]

**[70-80s]** But you only have 24 hours to claim this special discount - 50% off your first order.
[VISUAL: Countdown timer, special offer graphics]

**[80-90s]** Visit the link in my bio or click the button below to get started today.
[VISUAL: Multiple CTAs on screen, clickable buttons]
[TRANSITION: Closing shot]

---

## What Was Wrong with the Original Script

**Problem:** Script stopped at [15-18s] instead of continuing to [60-90s]

**Why:** Same video script truncation bug we fixed earlier

**Solution:** The backend should be generating timestamps up to 60+ seconds for long-form videos, not stopping at 15-18 seconds

---

## Video Length Options (Proper Timestamps)

### Short-Form (15-20 seconds):
- [0-3s]
- [3-5s]
- [5-8s]
- [8-15s]
- [15-18s]

### Long-Form (60+ seconds):
- [0-10s]
- [10-15s]
- [15-25s]
- [25-35s]
- [35-50s]
- [50-60s]
- [60-70s]
- [70-80s]
- [80-90s]

### Story Format (12-15 seconds):
- [0-3s]
- [3-5s]
- [5-8s]
- [8-12s]
- [12-15s]

---

## The Issue

Your script is generating as if it's a **short-form video** (15-18 seconds) even though you requested **long-form** (1+ minute). This means the backend is not properly detecting the video format or there's an issue with the timestamp generation.

**Expected for 1+ minute:** Timestamps going up to 60, 90, or even 120 seconds
**Actual:** Stopping at 15-18 seconds

**Fix Needed:** Backend should generate proper timestamps based on the video length parameter.
