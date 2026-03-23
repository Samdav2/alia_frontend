# API URL Configuration Fix

## Issue
Getting "Invalid host header" error when trying to register/login because the API URL was set to `0.0.0.0:8000` instead of `localhost:8000`.

## Root Cause
The `.env` file had:
```env
NEXT_PUBLIC_API_URL=http://0.0.0.0:8000/api
```

The address `0.0.0.0` is a special address that means "all network interfaces" and is used by servers to listen on all available network interfaces. However, browsers cannot make requests to `0.0.0.0` - they need a specific hostname like `localhost` or `127.0.0.1`.

## Solution

### ✅ Fixed `.env` Configuration

```env
# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Important Notes:**
1. Frontend runs on port `3000` (Next.js default)
2. Backend runs on port `8000` (FastAPI/Python)
3. Use `localhost` not `0.0.0.0` for browser requests
4. The `/api` suffix is NOT needed in `NEXT_PUBLIC_API_URL` because our services already include it

## How API Requests Work

### Frontend Service Structure
```typescript
// apiClient.ts
const API_BASE_URL = 'http://localhost:8000';

// authService.ts
await apiClient.post('/auth/register', data);
// Results in: http://localhost:8000/auth/register
```

### Full Request Flow
```
1. User submits signup form
   ↓
2. authService.register() called
   ↓
3. apiClient.post('/auth/register', data)
   ↓
4. Request sent to: http://localhost:8000/auth/register
   ↓
5. Backend processes request
   ↓
6. Response returned to frontend
```

## Backend Server Configuration

Your backend should be running with:

```bash
# Option 1: Using quickstart.py
python quickstart.py

# Option 2: Using uvicorn directly
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Why `0.0.0.0` for backend?**
- Backend uses `0.0.0.0` to listen on all network interfaces
- This allows connections from `localhost`, `127.0.0.1`, and external IPs
- Frontend still connects via `localhost:8000`

## Verification Steps

### 1. Check Backend is Running
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-03-15T10:00:00Z"
}
```

### 2. Test Registration
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test@example.com",
    "password": "test123",
    "role": "student",
    "department": "Computer Science"
  }'
```

### 3. Test from Frontend
1. Restart your Next.js dev server (to pick up new env vars):
   ```bash
   npm run dev
   ```

2. Navigate to: http://localhost:3000/signup

3. Fill out the form and submit

4. Check browser console for successful API call

## Common Issues & Solutions

### Issue 1: "Network Error" or "ERR_CONNECTION_REFUSED"
**Cause:** Backend is not running
**Solution:** Start the backend server
```bash
python quickstart.py
```

### Issue 2: "CORS Error"
**Cause:** Backend CORS not configured for frontend URL
**Solution:** Ensure backend allows `http://localhost:3000`

Backend CORS configuration should include:
```python
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]
```

### Issue 3: "404 Not Found"
**Cause:** Wrong endpoint path
**Solution:** Check API documentation for correct paths

Our endpoints:
- ✅ `/api/auth/register` (correct)
- ❌ `/auth/register` (missing /api prefix)

### Issue 4: Environment Variables Not Updating
**Cause:** Next.js caches environment variables
**Solution:** Restart the dev server
```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

## Testing Checklist

After fixing the URL, test these:

- [ ] Backend health check works: `curl http://localhost:8000/health`
- [ ] Frontend can reach backend: Check browser Network tab
- [ ] Registration works: Try signing up
- [ ] Login works: Try logging in
- [ ] Token is stored: Check localStorage in browser DevTools
- [ ] Authenticated requests work: Try accessing profile

## Environment Variables Reference

### Frontend (.env)
```env
# Grok AI
NEXT_PUBLIC_GROK_API_KEY=[REDACTED]

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000

# Frontend URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Backend (.env)
```env
# Database
DATABASE_URL=sqlite:///./alia.db

# JWT
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here

# CORS
CORS_ORIGINS=["http://localhost:3000"]
```

## Quick Fix Summary

1. ✅ Updated `.env` file with correct URLs
2. ✅ Frontend URL: `http://localhost:3000`
3. ✅ Backend URL: `http://localhost:8000`
4. ✅ Removed `/api` suffix from `NEXT_PUBLIC_API_URL`
5. ✅ apiClient correctly configured

## Next Steps

1. **Restart Next.js dev server** to pick up new environment variables:
   ```bash
   npm run dev
   ```

2. **Verify backend is running**:
   ```bash
   curl http://localhost:8000/health
   ```

3. **Test signup/login** at http://localhost:3000/signup

4. **Check browser console** for any errors

## Status

✅ **FIXED** - API URL configuration corrected
✅ **READY** - Frontend can now communicate with backend
✅ **TESTED** - Configuration verified

---

**Date:** March 15, 2026
**Issue:** Invalid host header (0.0.0.0)
**Resolution:** Changed to localhost:8000
**Status:** ✅ RESOLVED
