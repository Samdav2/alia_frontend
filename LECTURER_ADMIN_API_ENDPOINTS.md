# Lecturer & Admin API Endpoints - Complete List

## Overview
Complete list of backend API endpoints needed for Lecturer and Admin dashboards to be fully functional.

---

## 🎓 LECTURER ENDPOINTS

### Course Management

#### 1. Create Course
```
POST /api/courses
Authorization: Bearer {token}
Role: Lecturer

Request Body:
{
  "code": "CS101",
  "title": "Introduction to Python",
  "description": "Learn Python from scratch",
  "department": "Computer Science",
  "level": "beginner",
  "duration": "12 weeks",
  "tags": ["python", "programming"],
  "thumbnail": "url_or_file"
}

Response:
{
  "success": true,
  "data": {
    "id": "course-uuid",
    "code": "CS101",
    "title": "Introduction to Python",
    ...
  }
}
```

#### 2. Update Course
```
PUT /api/courses/{course_id}
Authorization: Bearer {token}
Role: Lecturer (own courses only)

Request Body:
{
  "title": "Updated Title",
  "description": "Updated description",
  "level": "intermediate"
}
```

#### 3. Delete Course
```
DELETE /api/courses/{course_id}
Authorization: Bearer {token}
Role: Lecturer (own courses only)
```

#### 4. Get My Courses
```
GET /api/courses/my
Authorization: Bearer {token}
Role: Lecturer

Query Params:
- page (optional)
- limit (optional)
- status (optional): "active", "draft", "archived"

Response:
{
  "success": true,
  "data": {
    "courses": [...],
    "pagination": {...}
  }
}
```

#### 5. Publish/Unpublish Course
```
PUT /api/courses/{course_id}/publish
PUT /api/courses/{course_id}/unpublish
Authorization: Bearer {token}
Role: Lecturer
```

### Module Management

#### 6. Create Module
```
POST /api/courses/{course_id}/modules
Authorization: Bearer {token}
Role: Lecturer

Request Body:
{
  "title": "Module 1: Basics",
  "description": "Introduction to basics",
  "order": 1,
  "duration": "2 weeks"
}
```

#### 7. Update Module
```
PUT /api/courses/modules/{module_id}
Authorization: Bearer {token}
Role: Lecturer

Request Body:
{
  "title": "Updated Module Title",
  "description": "Updated description",
  "order": 2
}
```

#### 8. Delete Module
```
DELETE /api/courses/modules/{module_id}
Authorization: Bearer {token}
Role: Lecturer
```

#### 9. Reorder Modules
```
PUT /api/courses/{course_id}/modules/reorder
Authorization: Bearer {token}
Role: Lecturer

Request Body:
{
  "module_orders": [
    {"module_id": "uuid1", "order": 1},
    {"module_id": "uuid2", "order": 2}
  ]
}
```

### Topic Management

#### 10. Create Topic
```
POST /api/courses/modules/{module_id}/topics
Authorization: Bearer {token}
Role: Lecturer

Request Body:
{
  "title": "Topic 1: Variables",
  "description": "Learn about variables",
  "content": "Full content here...",
  "content_type": "text",
  "order": 1,
  "duration": 30,
  "resources": [
    {
      "type": "video",
      "url": "https://...",
      "title": "Video Tutorial"
    }
  ]
}
```

#### 11. Update Topic
```
PUT /api/courses/topics/{topic_id}
Authorization: Bearer {token}
Role: Lecturer

Request Body:
{
  "title": "Updated Topic",
  "content": "Updated content",
  "duration": 45
}
```

#### 12. Delete Topic
```
DELETE /api/courses/topics/{topic_id}
Authorization: Bearer {token}
Role: Lecturer
```

#### 13. Reorder Topics
```
PUT /api/courses/modules/{module_id}/topics/reorder
Authorization: Bearer {token}
Role: Lecturer

Request Body:
{
  "topic_orders": [
    {"topic_id": "uuid1", "order": 1},
    {"topic_id": "uuid2", "order": 2}
  ]
}
```

### Quiz Management

#### 14. Create Quiz
```
POST /api/courses/topics/{topic_id}/quizzes
Authorization: Bearer {token}
Role: Lecturer

Request Body:
{
  "title": "Topic 1 Quiz",
  "description": "Test your knowledge",
  "time_limit": 600,
  "passing_score": 70,
  "questions": [
    {
      "question": "What is a variable?",
      "type": "multiple_choice",
      "options": ["A", "B", "C", "D"],
      "correct_answer": "A",
      "points": 10
    }
  ]
}
```

#### 15. Update Quiz
```
PUT /api/courses/quizzes/{quiz_id}
Authorization: Bearer {token}
Role: Lecturer
```

#### 16. Delete Quiz
```
DELETE /api/courses/quizzes/{quiz_id}
Authorization: Bearer {token}
Role: Lecturer
```

### Student Analytics

#### 17. Get Course Enrollments
```
GET /api/courses/{course_id}/enrollments
Authorization: Bearer {token}
Role: Lecturer

Query Params:
- page
- limit
- status: "active", "completed", "dropped"

Response:
{
  "success": true,
  "data": {
    "enrollments": [
      {
        "id": "enrollment-uuid",
        "user": {
          "id": "user-uuid",
          "full_name": "John Doe",
          "email": "john@example.com"
        },
        "enrolled_at": "2024-03-15T10:00:00Z",
        "progress_percentage": 45,
        "status": "active"
      }
    ],
    "pagination": {...}
  }
}
```

#### 18. Get Course Analytics
```
GET /api/courses/{course_id}/analytics
Authorization: Bearer {token}
Role: Lecturer

Response:
{
  "success": true,
  "data": {
    "total_enrollments": 150,
    "active_students": 120,
    "completion_rate": 65,
    "average_progress": 45,
    "average_quiz_score": 78,
    "topic_completion_rates": [
      {"topic_id": "uuid", "title": "Topic 1", "completion_rate": 85}
    ],
    "struggling_students": [
      {
        "user_id": "uuid",
        "full_name": "Student Name",
        "progress": 15,
        "average_score": 45
      }
    ]
  }
}
```

#### 19. Get Student Progress
```
GET /api/courses/{course_id}/students/{student_id}/progress
Authorization: Bearer {token}
Role: Lecturer

Response:
{
  "success": true,
  "data": {
    "student": {...},
    "enrollment": {...},
    "topic_progress": [
      {
        "topic_id": "uuid",
        "topic_title": "Topic 1",
        "status": "completed",
        "time_spent": 1800,
        "completed_at": "2024-03-15T12:00:00Z"
      }
    ],
    "quiz_attempts": [
      {
        "quiz_id": "uuid",
        "topic_title": "Topic 1",
        "score": 85,
        "attempted_at": "2024-03-15T13:00:00Z"
      }
    ]
  }
}
```

#### 20. Get Class Demographics
```
GET /api/lecturer/class-demographics
Authorization: Bearer {token}
Role: Lecturer

Response:
{
  "success": true,
  "data": {
    "total_students": 250,
    "by_department": [
      {"department": "Computer Science", "count": 150},
      {"department": "Engineering", "count": 100}
    ],
    "by_disability": [
      {"type": "visual", "count": 20},
      {"type": "dyslexia", "count": 15}
    ],
    "accessibility_usage": {
      "bionic_reading": 45,
      "voice_navigation": 30,
      "high_contrast": 25
    }
  }
}
```

### Alerts & Notifications

#### 21. Get Student Alerts
```
GET /api/lecturer/alerts
Authorization: Bearer {token}
Role: Lecturer

Response:
{
  "success": true,
  "data": {
    "alerts": [
      {
        "id": "alert-uuid",
        "type": "struggling_student",
        "severity": "high",
        "student": {
          "id": "uuid",
          "full_name": "John Doe"
        },
        "course": {
          "id": "uuid",
          "title": "Course Name"
        },
        "message": "Student has not accessed course in 7 days",
        "created_at": "2024-03-15T10:00:00Z"
      }
    ]
  }
}
```

#### 22. Send Notification to Students
```
POST /api/lecturer/notifications
Authorization: Bearer {token}
Role: Lecturer

Request Body:
{
  "course_id": "course-uuid",
  "recipient_type": "all" | "struggling" | "specific",
  "student_ids": ["uuid1", "uuid2"], // if specific
  "title": "Important Update",
  "message": "Please check the new assignment",
  "type": "announcement"
}
```

### File Upload

#### 23. Upload Course Material
```
POST /api/files/upload
Authorization: Bearer {token}
Role: Lecturer

Request: multipart/form-data
- file: File
- type: "thumbnail" | "video" | "document" | "resource"
- course_id: "course-uuid" (optional)

Response:
{
  "success": true,
  "data": {
    "file_id": "file-uuid",
    "url": "https://storage.../file.pdf",
    "filename": "lecture-notes.pdf",
    "size": 1024000,
    "type": "document"
  }
}
```

---

## 👨‍💼 ADMIN ENDPOINTS

### User Management

#### 24. Get All Users (Enhanced)
```
GET /api/admin/users
Authorization: Bearer {token}
Role: Admin

Query Params:
- page
- limit
- role: "student", "lecturer", "admin"
- department
- is_active: true/false
- search: search by name or email

Response:
{
  "success": true,
  "data": {
    "users": [...],
    "pagination": {...},
    "statistics": {
      "total_users": 500,
      "active_users": 450,
      "by_role": {
        "student": 400,
        "lecturer": 90,
        "admin": 10
      }
    }
  }
}
```

#### 25. Create User
```
POST /api/admin/users
Authorization: Bearer {token}
Role: Admin

Request Body:
{
  "full_name": "New User",
  "email": "user@example.com",
  "password": "password123",
  "role": "lecturer",
  "department": "Computer Science"
}
```

#### 26. Update User
```
PUT /api/admin/users/{user_id}
Authorization: Bearer {token}
Role: Admin

Request Body:
{
  "full_name": "Updated Name",
  "role": "admin",
  "is_active": true
}
```

#### 27. Delete User
```
DELETE /api/admin/users/{user_id}
Authorization: Bearer {token}
Role: Admin
```

#### 28. Bulk User Actions
```
POST /api/admin/users/bulk-action
Authorization: Bearer {token}
Role: Admin

Request Body:
{
  "action": "activate" | "deactivate" | "delete",
  "user_ids": ["uuid1", "uuid2", "uuid3"]
}
```

### Course Management (Admin)

#### 29. Get All Courses (Admin View)
```
GET /api/admin/courses
Authorization: Bearer {token}
Role: Admin

Query Params:
- page
- limit
- status: "active", "draft", "archived"
- instructor_id
- department

Response includes all courses from all instructors
```

#### 30. Approve/Reject Course
```
PUT /api/admin/courses/{course_id}/approve
PUT /api/admin/courses/{course_id}/reject
Authorization: Bearer {token}
Role: Admin

Request Body (for reject):
{
  "reason": "Content needs revision"
}
```

#### 31. Feature Course
```
PUT /api/admin/courses/{course_id}/feature
Authorization: Bearer {token}
Role: Admin

Request Body:
{
  "featured": true,
  "featured_order": 1
}
```

### System Analytics

#### 32. Get System Statistics
```
GET /api/admin/statistics
Authorization: Bearer {token}
Role: Admin

Response:
{
  "success": true,
  "data": {
    "users": {
      "total": 500,
      "active": 450,
      "new_this_month": 50
    },
    "courses": {
      "total": 50,
      "active": 45,
      "draft": 5
    },
    "enrollments": {
      "total": 2500,
      "active": 2000,
      "completed": 400
    },
    "engagement": {
      "daily_active_users": 200,
      "average_session_time": 3600,
      "total_learning_hours": 50000
    }
  }
}
```

#### 33. Get Accessibility Report
```
GET /api/admin/accessibility-report
Authorization: Bearer {token}
Role: Admin

Response:
{
  "success": true,
  "data": {
    "total_users_with_disabilities": 85,
    "by_disability_type": [
      {"type": "visual", "count": 30},
      {"type": "dyslexia", "count": 25},
      {"type": "hearing", "count": 15},
      {"type": "motor", "count": 15}
    ],
    "feature_usage": {
      "bionic_reading": 120,
      "voice_navigation": 80,
      "high_contrast": 95,
      "screen_reader": 40
    },
    "accommodation_requests": [
      {
        "user_id": "uuid",
        "full_name": "Student Name",
        "disability_type": "visual",
        "accommodations_needed": ["extended_time", "audio_content"],
        "status": "pending"
      }
    ]
  }
}
```

#### 34. Get Performance Metrics
```
GET /api/admin/performance-metrics
Authorization: Bearer {token}
Role: Admin

Query Params:
- start_date
- end_date
- metric_type: "engagement", "completion", "satisfaction"

Response:
{
  "success": true,
  "data": {
    "time_series": [
      {
        "date": "2024-03-01",
        "active_users": 180,
        "enrollments": 25,
        "completions": 10
      }
    ],
    "top_courses": [
      {
        "course_id": "uuid",
        "title": "Course Name",
        "enrollments": 150,
        "completion_rate": 75
      }
    ],
    "top_instructors": [
      {
        "instructor_id": "uuid",
        "full_name": "Dr. Smith",
        "courses": 5,
        "total_students": 300,
        "average_rating": 4.5
      }
    ]
  }
}
```

### System Health

#### 35. Get System Health
```
GET /api/admin/system-health
Authorization: Bearer {token}
Role: Admin

Response:
{
  "success": true,
  "data": {
    "status": "healthy",
    "uptime": 99.9,
    "database": {
      "status": "connected",
      "response_time": 15
    },
    "storage": {
      "used": 50000000000,
      "total": 100000000000,
      "percentage": 50
    },
    "api": {
      "requests_per_minute": 150,
      "average_response_time": 200,
      "error_rate": 0.5
    },
    "recent_errors": [
      {
        "timestamp": "2024-03-15T10:00:00Z",
        "error": "Database timeout",
        "count": 3
      }
    ]
  }
}
```

### Notifications & Announcements

#### 36. Create System Announcement
```
POST /api/admin/announcements
Authorization: Bearer {token}
Role: Admin

Request Body:
{
  "title": "System Maintenance",
  "message": "System will be down for maintenance",
  "type": "maintenance" | "update" | "announcement",
  "priority": "high" | "medium" | "low",
  "target_roles": ["student", "lecturer"],
  "start_date": "2024-03-20T00:00:00Z",
  "end_date": "2024-03-20T04:00:00Z"
}
```

#### 37. Get All Announcements
```
GET /api/admin/announcements
Authorization: Bearer {token}
Role: Admin

Query Params:
- page
- limit
- status: "active", "scheduled", "expired"
```

#### 38. Update Announcement
```
PUT /api/admin/announcements/{announcement_id}
Authorization: Bearer {token}
Role: Admin
```

#### 39. Delete Announcement
```
DELETE /api/admin/announcements/{announcement_id}
Authorization: Bearer {token}
Role: Admin
```

### Department Management

#### 40. Get All Departments
```
GET /api/admin/departments
Authorization: Bearer {token}
Role: Admin

Response:
{
  "success": true,
  "data": {
    "departments": [
      {
        "id": "dept-uuid",
        "name": "Computer Science",
        "code": "CS",
        "head": "Dr. John Doe",
        "student_count": 200,
        "course_count": 15
      }
    ]
  }
}
```

#### 41. Create Department
```
POST /api/admin/departments
Authorization: Bearer {token}
Role: Admin

Request Body:
{
  "name": "Data Science",
  "code": "DS",
  "head": "Dr. Jane Smith",
  "description": "Department of Data Science"
}
```

#### 42. Update Department
```
PUT /api/admin/departments/{department_id}
Authorization: Bearer {token}
Role: Admin
```

#### 43. Delete Department
```
DELETE /api/admin/departments/{department_id}
Authorization: Bearer {token}
Role: Admin
```

### Audit Logs

#### 44. Get Audit Logs
```
GET /api/admin/audit-logs
Authorization: Bearer {token}
Role: Admin

Query Params:
- page
- limit
- user_id
- action_type: "create", "update", "delete", "login"
- resource_type: "user", "course", "enrollment"
- start_date
- end_date

Response:
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "log-uuid",
        "user": {
          "id": "user-uuid",
          "full_name": "Admin User"
        },
        "action": "update",
        "resource_type": "course",
        "resource_id": "course-uuid",
        "changes": {
          "title": {
            "old": "Old Title",
            "new": "New Title"
          }
        },
        "ip_address": "192.168.1.1",
        "timestamp": "2024-03-15T10:00:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

---

## 📊 SUMMARY

### Lecturer Endpoints: 23 endpoints
- Course CRUD: 5 endpoints
- Module CRUD: 4 endpoints
- Topic CRUD: 4 endpoints
- Quiz CRUD: 3 endpoints
- Analytics: 4 endpoints
- Alerts: 2 endpoints
- File Upload: 1 endpoint

### Admin Endpoints: 21 endpoints
- User Management: 5 endpoints
- Course Management: 3 endpoints
- System Analytics: 3 endpoints
- System Health: 1 endpoint
- Announcements: 4 endpoints
- Departments: 4 endpoints
- Audit Logs: 1 endpoint

### Total: 44 new endpoints needed

---

## 🔐 Authorization Rules

### Lecturer:
- Can only manage their own courses
- Can view analytics for their courses
- Can view enrolled students in their courses
- Cannot access admin functions

### Admin:
- Full access to all endpoints
- Can manage all users and courses
- Can view system-wide analytics
- Can perform bulk operations

---

## 📝 Next Steps

1. Implement Lecturer API Service
2. Implement Admin API Service
3. Update CourseManagement component
4. Update UserManagement component
5. Update Analytics components
6. Add file upload functionality
7. Implement real-time notifications
