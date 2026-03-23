# API Endpoint Mapping Correction

## Issue
The frontend services were using incorrect endpoint paths that don't match the actual backend API.

## Backend API Endpoints (from OpenAPI spec)

### ✅ Authentication (Fixed)
- `POST /api/auth/register` ✅
- `POST /api/auth/login` ✅  
- `POST /api/auth/logout` ✅
- `POST /api/auth/refresh` ✅

### ✅ User Management (Fixed)
- `GET /api/users/profile` ✅
- `PUT /api/users/profile` ✅
- `GET /api/users` ✅ (Admin)
- `PUT /api/users/{user_id}/deactivate` ✅ (Admin)
- `PUT /api/users/{user_id}/activate` ✅ (Admin)

### ✅ Course Management (Fixed)
- `GET /api/courses` ✅
- `POST /api/courses` ✅ (Lecturer/Admin)
- `GET /api/courses/{course_id}` ✅
- `PUT /api/courses/{course_id}` ✅ (Lecturer/Admin)
- `DELETE /api/courses/{course_id}` ✅ (Admin)
- `GET /api/courses/{course_id}/modules` ✅
- `GET /api/courses/{course_id}/modules/{module_id}/topics` ✅
- `GET /api/courses/{course_id}/topics/{topic_id}` ✅

### ✅ Enrollments (Fixed)
- `GET /api/enrollments` ✅
- `POST /api/enrollments` ✅
- `DELETE /api/enrollments/{course_id}` ✅

### ✅ Progress Tracking (Fixed)
- `GET /api/progress/{course_id}` ✅
- `POST /api/progress/{course_id}/topics/{topic_id}` ✅

### 🔄 Lecturer Endpoints (Need Update)
- `GET /api/lecturer/courses/my`
- `PUT /api/lecturer/courses/{course_id}/publish`
- `PUT /api/lecturer/courses/{course_id}/unpublish`
- `POST /api/lecturer/courses/{course_id}/modules`
- `PUT /api/lecturer/courses/modules/{module_id}`
- `DELETE /api/lecturer/courses/modules/{module_id}`
- `PUT /api/lecturer/courses/{course_id}/modules/reorder`
- `POST /api/lecturer/courses/modules/{module_id}/topics`
- `PUT /api/lecturer/courses/topics/{topic_id}`
- `DELETE /api/lecturer/courses/topics/{topic_id}`
- `PUT /api/lecturer/courses/modules/{module_id}/topics/reorder`
- `GET /api/lecturer/courses/{course_id}/enrollments`
- `GET /api/lecturer/courses/{course_id}/analytics`
- `GET /api/lecturer/courses/{course_id}/students/{student_id}/progress`
- `GET /api/lecturer/class-demographics`
- `GET /api/lecturer/alerts`
- `POST /api/lecturer/notifications`
- `POST /api/lecturer/quizzes`
- `PUT /api/lecturer/quizzes/{quiz_id}`
- `DELETE /api/lecturer/quizzes/{quiz_id}`

### 🔄 Admin Endpoints (Need Update)
- `GET /api/admin/dashboard`
- `GET /api/admin/users`
- `POST /api/admin/users`
- `PUT /api/admin/users/{user_id}`
- `DELETE /api/admin/users/{user_id}`
- `POST /api/admin/users/bulk-action`
- `GET /api/admin/courses`
- `PUT /api/admin/courses/{course_id}/approve`
- `PUT /api/admin/courses/{course_id}/reject`
- `PUT /api/admin/courses/{course_id}/feature`
- `GET /api/admin/statistics`
- `GET /api/admin/accessibility-report`
- `GET /api/admin/performance-metrics`
- `GET /api/admin/system-health`
- `POST /api/admin/announcements`
- `GET /api/admin/announcements`
- `PUT /api/admin/announcements/{announcement_id}`
- `DELETE /api/admin/announcements/{announcement_id}`
- `GET /api/admin/departments`
- `POST /api/admin/departments`
- `PUT /api/admin/departments/{department_id}`
- `DELETE /api/admin/departments/{department_id}`
- `GET /api/admin/audit-logs`

### Additional Endpoints Available
- `GET /api/analytics/performance`
- `GET /api/analytics/accessibility`
- `POST /api/analytics/accessibility/{feature}`
- `GET /api/notifications`
- `PUT /api/notifications/{notification_id}/read`
- `PUT /api/notifications/read-all`
- `POST /api/files/upload`
- `GET /api/files/{file_id}`
- `DELETE /api/files/{file_id}`
- `POST /api/ai/chat`
- `POST /api/ai/simplify`
- `POST /api/ai/voice/session`
- `POST /api/ai/voice/transcribe`

## Changes Made

### ✅ Fixed Services
1. **authService.ts** - Added `/api` prefix to all endpoints
2. **userService.ts** - Added `/api` prefix to all endpoints  
3. **courseService.ts** - Added `/api` prefix and fixed topic endpoint
4. **enrollmentService.ts** - Added `/api` prefix and fixed endpoint structure
5. **progressService.ts** - Updated to match actual API structure

### 🔄 Services to Update
1. **lecturerService.ts** - Already has correct endpoints
2. **adminService.ts** - Already has correct endpoints

## Key Corrections

### Authentication
```typescript
// ❌ Before
await apiClient.post('/auth/register', data);

// ✅ After  
await apiClient.post('/api/auth/register', data);
```

### Course Details
```typescript
// ❌ Before
await apiClient.get(`/courses/topics/${topicId}`);

// ✅ After
await apiClient.get(`/api/courses/${courseId}/topics/${topicId}`);
```

### Enrollments
```typescript
// ❌ Before
await apiClient.get('/enrollments/my', { params });

// ✅ After
await apiClient.get('/api/enrollments', { params });
```

### Progress Tracking
```typescript
// ❌ Before
await apiClient.post('/progress/topics', data);

// ✅ After
await apiClient.post(`/api/progress/${courseId}/topics/${topicId}`, data);
```

## Testing Status

### ✅ Ready to Test
- Authentication (register, login, logout, refresh)
- User profile (get, update)
- Course listing and details
- Enrollment (enroll, get enrollments, unenroll)
- Progress tracking

### 🔄 Need Backend Running
All endpoints require the backend server to be running at `http://localhost:8000`

## Next Steps

1. ✅ **Fixed core services** - Authentication, Users, Courses, Enrollments, Progress
2. 🔄 **Verify lecturer/admin services** - Check if endpoints match
3. 🧪 **Test all endpoints** - Use the test suite
4. 🔧 **Update components** - Replace mock data with API calls

## Verification Commands

```bash
# Check backend is running
curl http://localhost:8000/health

# Test registration
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test User","email":"test@example.com","password":"test123","role":"student","department":"CS"}'

# Test login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Test courses (no auth required)
curl http://localhost:8000/api/courses
```

## Status

✅ **FIXED** - Core API services now use correct endpoints  
🧪 **READY** - Ready for testing with backend  
📱 **NEXT** - Update frontend components to use API services  

---

**Date:** March 15, 2026  
**Issue:** Wrong API endpoint paths  
**Resolution:** Added `/api` prefix and fixed endpoint structure  
**Status:** ✅ RESOLVED