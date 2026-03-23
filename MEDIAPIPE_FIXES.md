# MediaPipe Loading Fixes

## Problem
MediaPipe Hands and Camera Utils libraries were failing to load from CDN, causing the Vision Engine to fail initialization.

**Error:** `"MediaPipe libraries failed to load"` at SignInterpreter.tsx:192

**Root Cause:** Even though `loadScript()` function resolved successfully, `window.Hands` and `window.Camera` globals were never created on the window object.

## Solutions Implemented

### 1. **Enhanced Script Loading with Retry Logic**
   - Added automatic retry mechanism (3 retries by default) with exponential backoff (1s delay)
   - Script timeout detection (8s timeout per script)
   - Better error handling with detailed console logging
   - Verification that library is actually available on window object before resolving
   - Duplicate script detection to prevent loading same script twice

**Key Changes:**
```typescript
function loadScript(src: string, maxRetries = 3): Promise<void> {
  return new Promise((resolve, reject) => {
    // ... retry logic on failure
    s.onerror = () => {
      if (maxRetries > 0) {
        setTimeout(() => {
          loadScript(src, maxRetries - 1).then(resolve).catch(reject);
        }, 1000);
      }
    };
  });
}
```

### 2. **Fallback CDN Support**
   - If primary CDN fails or libraries don't load, attempts alternative CDN URL
   - Tries version without explicit version number
   - Graceful degradation to demo mode if all attempts fail

```typescript
if (!Hands || !Camera) {
  console.log('Attempting alternative CDN...');
  await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');
  // ... retry with new URLs
}
```

### 3. **Demo Mode Fallback UI**
   - If MediaPipe libraries cannot load, displays helpful error message
   - Shows "Demo Mode" status indicator
   - Displays troubleshooting instructions (refresh page, check internet)
   - Prevents crash, allows user to still access interface

```typescript
if (error) {
  return (
    <div className="flex flex-col items-center gap-4 p-4 w-full h-full bg-slate-900...">
      <span className="text-xs bg-red-900 px-3 py-1 rounded-full text-red-300">Demo Mode</span>
      <p className="text-sm mb-2">📡 {error}</p>
      <p className="text-xs">Try refreshing the page or checking your internet connection.</p>
    </div>
  );
}
```

### 4. **Detailed Console Logging**
   - Logs each script loading stage:
     - "Loading MediaPipe libraries..."
     - "Hands script loaded, window.Hands: true/false"
     - "Camera script loaded, window.Camera: true/false"
   - Helps diagnose CDN issues
   - Shows libraries status even if initialization fails

### 5. **Crossorigin Attribute**
   - Added `s.crossOrigin = 'anonymous'` to script element
   - Ensures CORS compatibility with CDN

### 6. **Additional Delay After Script Load**
   - Added 200ms delay after `onload` fires
   - Gives libraries time to fully initialize on window object
   - Prevents race condition where script loads but library not yet ready

## Testing Checklist

- [ ] Refresh page with debugger open to check console logs
- [ ] Verify "Hands script loaded" and "Camera script loaded" messages appear
- [ ] Check Network tab to confirm CDN requests complete successfully
- [ ] If libraries load successfully:
  - Vision Engine should show camera feed
  - Hand tracking should work with green circles and cyan lines
  - Signs should be detected when making hand gestures
- [ ] If libraries fail to load:
  - Demo Mode message should appear
  - No crash/errors thrown
  - Refresh button allows retry

## Files Modified

- **src/components/Accessibility/SignInterpreter.tsx**
  - Enhanced `loadScript()` function (lines 8-56)
  - Added retry logic with fallback CDN
  - Added `error` state (line 145)
  - Added demo mode UI fallback (lines 303-319)
  - Enhanced console logging in `initEngine()` (lines 243-290)

## CDN URLs Used

**Primary (with version):**
- `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/hands.js`
- `https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3/camera_utils.js`

**Fallback (no version):**
- `https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js`
- `https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js`

## Next Steps if Still Not Working

1. **Check CDN Availability:**
   - Open browser console → Network tab
   - See if script requests return 200 OK
   - Check for CORS errors

2. **Check Browser Support:**
   - MediaPipe requires modern browser (Chrome 88+, Firefox 87+, Safari 14+)
   - Check if WebGL is enabled

3. **Check Internet:**
   - Verify CDN is not blocked by firewall/proxy
   - Try from different network

4. **Alternative: Use Different CDN:**
   - CDN.js: `https://cdnjs.cloudflare.com/ajax/libs/mediapipe/...`
   - Google Cloud: `https://storage.googleapis.com/mediapipe/...`

5. **Local Installation:**
   - Instead of CDN, use `npm install @mediapipe/hands @mediapipe/camera_utils`
   - Import and use directly instead of window globals
