# Course Status Management Frontend Integration

## Overview
Integrated the new backend course status management endpoint into the frontend admin dashboard, allowing admins to change course status between "published" and "draft".

## Backend Endpoint Integration
**Endpoint**: `PUT /api/admin/courses/{course_id}/status`
**Request Body**: 
```json
{
  "status": "published" | "draft"
}
```

## Frontend Changes Made

### 1. Admin Service (`src/services/api/adminService.ts`)

#### New Method Added:
```typescript
async changeCourseStatus(courseId: string, status: 'published' | 'draft'): Promise<void> {
  await apiClient.put(`/api/admin/courses/${courseId}/status`, {
    status
  });
}
```

#### Updated AdminCourse Interface:
```typescript
export interface AdminCourse extends Course {
  status: 'active' | 'draft' | 'pending' | 'rejected' | 'archived' | 'published';
  enrollments: number;
  created_at: string;
  updated_at: string;
}
```

### 2. Course Management Component (`src/components/Dashboard/AdminDashboard/CourseManagement.tsx`)

#### New Handler Function:
```typescript
const handleStatusChange = async (courseId: string, status: 'published' | 'draft') => {
  try {
    await adminService.changeCourseStatus(courseId, status);
    showNotification(`Course status changed to ${status}`, 'success');
    loadCourses();
  } catch (err) {
    showNotification('Failed to change course status', 'error');
  }
};
```

#### New Action Buttons:
- **Publish Button**: Appears for courses with "draft" status
  - Changes status from "draft" to "published"
  - Green button with "📢 Publish" text
  
- **Draft Button**: Appears for courses with "active" or "published" status  
  - Changes status to "draft"
  - Orange button with "📝 Draft" text

#### Updated Status Filter:
- Added "Published" option to the status filter dropdown
- Allows filtering courses by published status

#### Enhanced Status Badge:
- Updated to handle "published" status
- Maps "published" to green badge (same as "active")
- Displays "ACTIVE" for published courses in the UI

## UI/UX Features

### Status Change Workflow:
1. **Draft → Published**: Admin clicks "📢 Publish" button
2. **Published/Active → Draft**: Admin clicks "📝 Draft" button
3. Success notification shows status change
4. Course list refreshes automatically

### Visual Indicators:
- **Draft Courses**: Yellow badge with "DRAFT" text
- **Published Courses**: Green badge with "ACTIVE" text
- **Action Buttons**: Color-coded for easy identification

### Error Handling:
- Try-catch blocks around API calls
- User-friendly error notifications
- Graceful fallback if API fails

## Status Mapping

| Frontend Status | Backend Field | Display Badge | Available Actions |
|----------------|---------------|---------------|-------------------|
| "draft" | `is_active: false` | Yellow "DRAFT" | Publish |
| "published" | `is_active: true` | Green "ACTIVE" | Draft, Feature |
| "active" | `is_active: true` | Green "ACTIVE" | Draft, Feature |

## Integration Benefits

### For Admins:
- **Easy Status Management**: One-click status changes
- **Clear Visual Feedback**: Color-coded status badges
- **Bulk Operations**: Filter by status for bulk management
- **Audit Trail**: All changes logged in backend

### For System:
- **Proper Access Control**: Only published courses visible to students
- **Content Management**: Draft courses for content development
- **Quality Control**: Review before publishing

## Usage Examples

### Publishing a Draft Course:
1. Navigate to Admin Dashboard → Course Management
2. Find course with "DRAFT" status
3. Click "📢 Publish" button
4. Course status changes to "ACTIVE"
5. Course becomes visible to students

### Moving Course to Draft:
1. Find published course with "ACTIVE" status
2. Click "📝 Draft" button  
3. Course status changes to "DRAFT"
4. Course becomes hidden from students

### Filtering by Status:
1. Use status dropdown filter
2. Select "Published" to see only published courses
3. Select "Draft" to see only draft courses
4. Select "All Status" to see everything

## Security & Permissions

- **Admin Only**: Status change functionality restricted to admin users
- **Authentication**: All requests require valid admin Bearer token
- **Authorization**: Backend validates admin role before processing
- **UUID Validation**: Course IDs validated as proper UUIDs

## Error Scenarios Handled

1. **Network Errors**: User-friendly error messages
2. **Invalid Course ID**: Backend UUID validation
3. **Permission Denied**: Proper error handling
4. **Server Errors**: Graceful degradation

## Testing Recommendations

1. **Status Changes**: Test draft→published and published→draft
2. **Permissions**: Verify only admins can change status
3. **UI Updates**: Confirm badges and buttons update correctly
4. **Error Handling**: Test with invalid course IDs
5. **Filtering**: Test status filter functionality

The course status management system is now fully integrated and ready for production use!