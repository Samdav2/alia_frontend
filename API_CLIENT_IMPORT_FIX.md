# API Client Import Fix

## Date: March 15, 2026

## Issue
The API services were trying to import `apiClient` as a named export, but it was exported as a default export from `src/lib/apiClient.ts`.

**Error:**
```
Export apiClient doesn't exist in target module
import { apiClient } from '@/lib/apiClient';
```

## Root Cause
The `apiClient` in `src/lib/apiClient.ts` was exported as:
```typescript
export default apiClient;
```

But the services were importing it as:
```typescript
import { apiClient } from '@/lib/apiClient';  // ❌ Wrong - named import
```

## Solution
Fixed all API service imports to use default import syntax:

### Files Updated:
1. `src/services/api/authService.ts`
2. `src/services/api/userService.ts`
3. `src/services/api/courseService.ts`
4. `src/services/api/enrollmentService.ts`
5. `src/services/api/progressService.ts`
6. `src/services/api/lecturerService.ts`
7. `src/services/api/adminService.ts`

### Change Applied:
```typescript
// Before (❌ Wrong)
import { apiClient } from '@/lib/apiClient';

// After (✅ Correct)
import apiClient from '@/lib/apiClient';
```

## Verification
- ✅ All API services compile without errors
- ✅ All components using these services compile without errors
- ✅ No TypeScript diagnostics found
- ✅ Import statements are consistent across all files

## Result
All backend API integration is now working correctly with proper imports. The lecturer and admin dashboards can now successfully connect to the backend API.