# Internal Messaging System - Handover Document

**Date:** 2025-12-01
**Project:** Blitz Marketing Automation Platform
**Task:** Add "Send Message" button to Directory for connected users + Fix recipients dropdown

---

## **What We're Working On**

### **Goal**
Enhance the internal messaging system to allow users to:
1. Click "Send Message" button on connected users in the Directory page
2. Have the compose message form pre-populated with the selected recipient
3. Have "Add Recipients" button auto-populate with all allowed recipients (connections)

### **Current Context**
User has reported that the "Add More Recipients" dropdown shows "No recipients found" even though they have 2 confirmed connections.

---

## **Work Completed So Far**

### ✅ **1. Added "Send Message" Button to Directory Listing**
**File:** `src/app/affiliates/page.tsx`
**Location:** Lines 613-627
**Change:**
- Added "Send Message" button for connected users only
- Button only appears when `affiliate.is_connected` is true
- Uses `MessageSquare` icon from Lucide React
- Calls existing `handleSendMessage()` function which navigates to: `/messages/compose?recipient_id={user_id}&name={encoded_name}`

**Code Snippet:**
```tsx
{affiliate.is_connected ? (
  <div className="space-y-2">
    <div className="flex items-center gap-2 text-green-600">
      <UserCheck className="w-5 h-5" />
      <span className="text-sm font-medium">Connected</span>
    </div>
    {/* Send Message Button */}
    <button
      onClick={() => handleSendMessage(affiliate)}
      className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
    >
      <MessageSquare className="w-4 h-4" />
      Send Message
    </button>
  </div>
) : ...}
```

### ✅ **2. Fixed Backend API Bug**
**File:** `C:\Users\shaun\OneDrive\Documents\GitHub\blitz-backend/app/api/message_recipients.py`
**Issue:** Database query was using wrong field names
**Original Bug:**
```python
# WRONG - Field names don't exist
AffiliateConnection.requester_id == current_user.id
AffiliateConnection.recipient_id == current_user.id
```

**Fixed Code:**
```python
# CORRECT - Using actual database field names
AffiliateConnection.user1_id == current_user.id
AffiliateConnection.user2_id == current_user.id
```

**Location:** Lines 28-46

### ✅ **3. Fixed Data Structure Consistency**
**File:** `C:\Users\shaun\OneDrive\Documents\GitHub\blitz-backend/app/api/message_recipients.py`
**Change:** When no connections exist, return consistent object structure
**Before:** `connections: []`
**After:** `connections: { "Creator": [], "Affiliate": [], "Business": [], "Other": [] }`

**Location:** Lines 48-62

### ✅ **4. Verified Compose Message Functionality**
**File:** `src/app/messages/compose/page.tsx`
**Status:** Already has all required functionality:
- **Pre-selected recipients from URL params** (lines 50-67): Handles `recipient_id` and `name` query params
- **"Add Recipients" dropdown** (lines 69-380): Fetches from `/api/messages/recipients` API
- **Searchable recipients** (lines 94-97): Filters by name/email
- **User type badges** (lines 346-358): Shows Creator/Affiliate badges
- **Multiple recipient selection**: Checkbox-based selection with removable chips

---

## **Root Cause Analysis**

### **Why "Add More Recipients" Shows "No Recipients Found"**

**Primary Issue:** Backend API query error

The `/api/messages/recipients` endpoint was querying `AffiliateConnection.requester_id` and `AffiliateConnection.recipient_id`, but these fields **don't exist** in the database.

**Actual Database Schema:**
```python
class AffiliateConnection(Base):
    __tablename__ = "affiliate_connections"

    id = Column(Integer, primary_key=True, index=True)
    user1_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)  # ← Real field
    user2_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)  # ← Real field
    connection_type = Column(String(50), nullable=False)  # mutual_product, approved_request, mutual_connection

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
```

**Why Query Failed:**
- SQLAlchemy query was looking for non-existent columns
- Likely resulted in an empty result set
- Frontend received `connections: {}` with no recipients
- Dropdown showed "No recipients found"

**Fix Applied:**
- Changed queries to use `user1_id` and `user2_id`
- This now correctly retrieves all connections for the current user

---

## **Outstanding Work**

### 🔄 **Pending: Verify Fix Works**
**Task:** Test that recipients dropdown now populates with user's 2 confirmed connections

**SQL Queries to Run (in pgAdmin):**

1. **Verify table structure:**
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'affiliate_connections'
ORDER BY ordinal_position;
```

2. **Check sample data:**
```sql
SELECT id, user1_id, user2_id, connection_type, created_at
FROM affiliate_connections
LIMIT 10;
```

3. **Test specific user's connections** (replace {USER_ID} with actual ID):
```sql
SELECT
    ac.id,
    ac.user1_id,
    ac.user2_id,
    ac.connection_type,
    u1.email as user1_email,
    u1.full_name as user1_name,
    u2.email as user2_email,
    u2.full_name as user2_name
FROM affiliate_connections ac
JOIN users u1 ON ac.user1_id = u1.id
JOIN users u2 ON ac.user2_id = u2.id
WHERE ac.user1_id = {USER_ID} OR ac.user2_id = {USER_ID}
ORDER BY ac.created_at DESC;
```

4. **Count total connections:**
```sql
SELECT COUNT(*) as total_connections
FROM affiliate_connections;
```

---

## **Key Files Modified**

### **Frontend:**
1. `C:\Users\shaun\OneDrive\Documents\GitHub\blitz-frontend\src\app\affiliates\page.tsx`
   - Added "Send Message" button for connected users (lines 613-627)

2. `C:\Users\shaun\OneDrive\Documents\GitHub\blitz-frontend\src\app\messages\compose\page.tsx`
   - No changes needed - already has all required functionality
   - Removed debug console.log statements

### **Backend:**
1. `C:\Users\shaun\OneDrive\Documents\GitHub\blitz-backend\app\api\message_recipients.py`
   - Fixed database query to use correct field names (lines 28-46)
   - Fixed data structure consistency for empty results (lines 48-62)

---

## **System Architecture Context**

### **Messaging System Flow**

**Directory → Send Message:**
1. User visits `/affiliates` (Directory page)
2. Views list of affiliates with connection status
3. Clicks "Send Message" on connected user
4. Navigates to `/messages/compose?recipient_id=X&name=Y`
5. Recipient pre-selected in compose form
6. User composes and sends message

**Add Recipients Flow:**
1. User visits `/messages/compose`
2. Clicks "Add Recipients" button
3. Dropdown makes GET request to `/api/messages/recipients`
4. Backend queries `AffiliateConnection` table for user's connections
5. Returns list grouped by user type
6. User selects recipient(s) from dropdown
7. Selected recipients appear as removable chips

### **Database Schema**

**AffiliateConnection Table:**
- `user1_id`, `user2_id`: Foreign keys to `users.id`
- `connection_type`: Type of connection (e.g., "approved_request", "mutual_connection")
- `created_at`: Timestamp

**How Connections Work:**
- User A and User B both have user IDs
- Connection record created: `(user1_id=A, user2_id=B)` or vice versa
- Query finds connections where current_user is either user1 OR user2
- Returns the OTHER user's ID from each connection

---

## **Expected Results After Fix**

### **Before Fix:**
- "Add More Recipients" shows: "No recipients found"
- Recipients dropdown is empty
- No connections displayed

### **After Fix:**
- "Add More Recipients" shows dropdown with all confirmed connections
- Recipients listed and grouped by user type (Creator, Affiliate, Business, Other)
- Searchable by name/email
- User can select one or multiple recipients
- Selected recipients appear as removable chips above dropdown

---

## **Next Steps When Session Restarts**

### **1. Immediate Testing**
```bash
# In Windows Terminal, restart development servers:
cd C:\Users\shaun\OneDrive\Documents\GitHub\blitz-backend
python -m uvicorn app.main:app --reload --port 8000

# In new terminal:
cd C:\Users\shaun\OneDrive\Documents\GitHub\blitz-frontend
npm run dev
```

### **2. Test in Browser**
1. Login to Blitz platform
2. Go to Messages → Compose
3. Click "Add More Recipients"
4. Verify 2 connections appear in dropdown
5. Test selecting recipients
6. Also test Directory → "Send Message" button

### **3. If Issues Persist**
- Check browser console for errors
- Verify backend logs in Railway/terminal
- Verify `/api/messages/recipients` endpoint returns data
- Check network requests in browser dev tools

---

## **Technical Details**

### **API Endpoint Details**
**Endpoint:** `GET /api/messages/recipients`
**Authentication:** Required (JWT token)
**Response Structure:**
```json
{
  "connections": {
    "Creator": [
      {
        "id": 123,
        "user_id": 123,
        "email": "creator@example.com",
        "full_name": "John Doe",
        "user_type": "Creator",
        "verified": true,
        "mutual_products": []
      }
    ],
    "Affiliate": [...],
    "Business": [...],
    "Other": [...]
  },
  "total": 2,
  "current_user": {
    "id": 456,
    "user_type": "Affiliate",
    "full_name": "Jane Smith"
  }
}
```

### **Frontend Query Structure**
```typescript
const { data: recipientsData } = useQuery({
  queryKey: ["message-recipients"],
  queryFn: async () => {
    const response = await api.get("/api/messages/recipients");
    return response.data;
  },
});

// Flatten to single array
const allRecipients = recipientsData ?
  Object.values(recipientsData.connections || {}).flat() : [];
```

---

## **User's Current Issue**

**Problem:** User has 2 confirmed connections but "Add More Recipients" shows "No recipients found"

**Likely Cause:** Backend query was failing due to incorrect field names in WHERE clause

**Fix Applied:** Updated field names to match database schema

**Expected Result:** After restart and testing, recipients dropdown should populate with 2 connections

---

## **Questions to Verify**

1. ✅ Did we modify the correct backend file? (Yes: `app/api/message_recipients.py`)
2. ✅ Did we use the correct field names? (Yes: `user1_id` and `user2_id`)
3. ✅ Did we maintain consistent data structure? (Yes: Always return object with user type keys)
4. 🔄 Do we need to restart backend for changes to take effect? (Yes - restart uvicorn server)
5. 🔄 Do we need to verify the fix works? (Yes - test in browser)

---

## **Files Not to Modify**

**DO NOT MODIFY:**
- `src/components/AuthGate.tsx` - Authentication gate (working correctly)
- `src/lib/appClient.ts` - API client (working correctly)
- `src/lib/auth.ts` - Authentication utilities (working correctly)

**ALREADY WORKING:**
- Pre-selected recipients from URL params (compose page)
- Recipients dropdown UI (compose page)
- Search and filter functionality
- Multiple recipient selection
- Recipient chips display

---

## **Success Criteria**

**Test Scenario:**
1. User logs in → Has 2 confirmed connections
2. Opens Messages → Compose
3. Clicks "Add More Recipients"
4. **Expected:** Dropdown shows 2 connected users
5. **Before Fix:** Shows "No recipients found"
6. **After Fix:** Shows list of 2 users, searchable and selectable

**Alternative Test:**
1. User goes to Directory → Affiliates
2. Finds a connected user (green border)
3. Clicks "Send Message"
4. Navigates to compose with recipient pre-selected
5. Can send message successfully

---

## **Emergency Rollback Plan**

If the fix causes issues:

**Backend:**
```python
# Revert changes in app/api/message_recipients.py
# Use original query with requester_id/recipient_id
# But this will fail because fields don't exist
```

**Better Approach:**
- The fix is minimal and targeted
- Only changed field names, no other logic
- Should be safe to keep

---

## **Additional Context**

**Platform:** Blitz (simplified rewrite of CampaignForge)
**Frontend:** Next.js 14, TypeScript, React Query, Tailwind CSS
**Backend:** FastAPI, PostgreSQL, SQLAlchemy (async)
**Deployment:** Frontend (Vercel), Backend (Railway)

**Related Endpoints:**
- `/api/affiliates/search` - Directory listings
- `/api/message-requests` - Connection requests
- `/api/messages` - Send/receive messages
- `/api/connections` - Manage connections

---

## **Contact/Context Info**

- **User is testing on local development environment**
- **User has Windows 11 Terminal**
- **User has confirmed connections in database**
- **User needs both Send Message button AND working recipients dropdown**
- **Previous terminal session was disrupted by crash**

---

**End of Handover Document**

*This document should provide complete context for continuing the work seamlessly after restart.*
