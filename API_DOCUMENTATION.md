# ALIA Platform - Comprehensive API Documentation

## 🚀 Overview

This document provides complete API endpoint specifications for the ALIA (Adaptive Learning Intelligence Assistant) platform. The platform supports students, lecturers, and administrators with comprehensive learning management and accessibility features.

## 🏗️ Architecture

- **Frontend**: Next.js 14 with TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (recommended) or MongoDB
- **Authentication**: JWT-based authentication
- **File Storage**: AWS S3 or local storage
- **Real-time**: WebSocket connections for live features

## 🔐 Authentication

All API endpoints (except public ones) require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "fullName": "string",
  "email": "string",
  "password": "string",
  "role": "student" | "lecturer",
  "department": "string",
  "studentId": "string" // Only for students
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "fullName": "string",
      "email": "string",
      "role": "string",
      "department": "string"
    },
    "token": "string"
  }
}
```

#### POST /api/auth/login
Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "fullName": "string",
      "email": "string",
      "role": "string"
    },
    "token": "string"
  }
}
```

#### POST /api/auth/logout
Logout user and invalidate token.

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### POST /api/auth/refresh
Refresh access token.

**Request Body:**
```json
{
  "refreshToken": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "string",
    "refreshToken": "string"
  }
}
```

## 👤 User Management

#### GET /api/users/profile
Get current user profile.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "fullName": "string",
    "email": "string",
    "role": "string",
    "department": "string",
    "studentId": "string",
    "preferences": {
      "language": "string",
      "accessibility": {
        "bionicReading": "boolean",
        "dyslexiaFont": "boolean",
        "highContrast": "string",
        "voiceNavigation": "boolean"
      }
    },
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

#### PUT /api/users/profile
Update user profile.

**Request Body:**
```json
{
  "fullName": "string",
  "department": "string",
  "preferences": {
    "language": "string",
    "accessibility": {
      "bionicReading": "boolean",
      "dyslexiaFont": "boolean",
      "highContrast": "string",
      "voiceNavigation": "boolean"
    }
  },
  "disabilityInfo": {
    "hasDisability": "boolean",
    "disabilityType": ["string"],
    "assistiveTechnology": ["string"],
    "accommodationsNeeded": ["string"]
  }
}
```

#### GET /api/users
Get all users (Admin only).

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 20)
- `role`: string (optional filter)
- `department`: string (optional filter)

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "string",
        "fullName": "string",
        "email": "string",
        "role": "string",
        "department": "string",
        "isActive": "boolean",
        "createdAt": "string"
      }
    ],
    "pagination": {
      "page": "number",
      "limit": "number",
      "total": "number",
      "totalPages": "number"
    }
  }
}
```

## 📚 Course Management

#### GET /api/courses
Get all courses.

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 20)
- `department`: string (optional filter)
- `level`: string (optional filter)
- `search`: string (optional search term)

**Response:**
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": "string",
        "code": "string",
        "title": "string",
        "description": "string",
        "instructor": "string",
        "department": "string",
        "level": "string",
        "duration": "string",
        "enrollmentCount": "number",
        "rating": "number",
        "tags": ["string"],
        "thumbnail": "string",
        "isActive": "boolean",
        "createdAt": "string"
      }
    ],
    "pagination": {
      "page": "number",
      "limit": "number",
      "total": "number",
      "totalPages": "number"
    }
  }
}
```

#### GET /api/courses/:id
Get specific course details.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "code": "string",
    "title": "string",
    "description": "string",
    "instructor": "string",
    "department": "string",
    "level": "string",
    "duration": "string",
    "enrollmentCount": "number",
    "rating": "number",
    "tags": ["string"],
    "thumbnail": "string",
    "modules": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "order": "number",
        "topics": [
          {
            "id": "string",
            "title": "string",
            "description": "string",
            "duration": "string",
            "order": "number",
            "contentType": "text" | "video" | "interactive",
            "content": "string",
            "mediaFiles": [
              {
                "type": "image" | "video" | "pdf" | "doc",
                "url": "string",
                "title": "string",
                "description": "string"
              }
            ]
          }
        ]
      }
    ],
    "isActive": "boolean",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

#### POST /api/courses
Create new course (Lecturer/Admin only).

**Request Body:**
```json
{
  "code": "string",
  "title": "string",
  "description": "string",
  "department": "string",
  "level": "string",
  "duration": "string",
  "tags": ["string"],
  "thumbnail": "string"
}
```

#### PUT /api/courses/:id
Update course (Lecturer/Admin only).

#### DELETE /api/courses/:id
Delete course (Admin only).

## 📖 Course Content

#### GET /api/courses/:courseId/modules
Get course modules.

#### GET /api/courses/:courseId/modules/:moduleId/topics
Get module topics.

#### GET /api/courses/:courseId/topics/:topicId
Get specific topic content.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "description": "string",
    "duration": "string",
    "content": "string",
    "mediaFiles": [
      {
        "type": "image" | "video" | "pdf" | "doc",
        "url": "string",
        "title": "string",
        "description": "string",
        "altText": "string"
      }
    ],
    "assessments": [
      {
        "id": "string",
        "type": "quiz" | "assignment",
        "title": "string",
        "questions": [
          {
            "id": "string",
            "question": "string",
            "type": "multiple_choice" | "true_false" | "short_answer",
            "options": ["string"],
            "correctAnswer": "string",
            "explanation": "string"
          }
        ]
      }
    ],
    "prerequisites": ["string"],
    "learningObjectives": ["string"]
  }
}
```

## 🎓 Enrollment Management

#### GET /api/enrollments
Get user's enrollments.

**Response:**
```json
{
  "success": true,
  "data": {
    "enrollments": [
      {
        "id": "string",
        "courseId": "string",
        "course": {
          "id": "string",
          "code": "string",
          "title": "string",
          "instructor": "string"
        },
        "enrollmentDate": "string",
        "status": "active" | "completed" | "dropped",
        "progress": {
          "completedTopics": "number",
          "totalTopics": "number",
          "completionPercentage": "number",
          "timeSpent": "number",
          "lastAccessedAt": "string"
        }
      }
    ]
  }
}
```

#### POST /api/enrollments
Enroll in a course.

**Request Body:**
```json
{
  "courseId": "string"
}
```

#### DELETE /api/enrollments/:courseId
Unenroll from a course.

## 📊 Progress Tracking

#### GET /api/progress/:courseId
Get course progress.

**Response:**
```json
{
  "success": true,
  "data": {
    "courseId": "string",
    "userId": "string",
    "completedTopics": ["string"],
    "currentTopic": "string",
    "timeSpent": "number",
    "completionPercentage": "number",
    "lastAccessedAt": "string",
    "topicProgress": [
      {
        "topicId": "string",
        "status": "not_started" | "in_progress" | "completed",
        "timeSpent": "number",
        "completedAt": "string",
        "score": "number"
      }
    ]
  }
}
```

#### POST /api/progress/:courseId/topics/:topicId
Update topic progress.

**Request Body:**
```json
{
  "status": "in_progress" | "completed",
  "timeSpent": "number",
  "score": "number"
}
```

## 🤖 AI Chat Interface

#### POST /api/ai/chat
Send message to AI assistant.

**Request Body:**
```json
{
  "message": "string",
  "context": {
    "courseId": "string",
    "topicId": "string",
    "conversationHistory": [
      {
        "role": "user" | "assistant",
        "content": "string",
        "timestamp": "string"
      }
    ]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "string",
    "suggestions": ["string"],
    "relatedTopics": [
      {
        "id": "string",
        "title": "string",
        "courseId": "string"
      }
    ]
  }
}
```

#### POST /api/ai/simplify
Simplify content for better understanding.

**Request Body:**
```json
{
  "content": "string",
  "level": "basic" | "intermediate" | "advanced",
  "language": "English" | "Igbo" | "Hausa" | "Yoruba"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "simplifiedContent": "string",
    "keyPoints": ["string"],
    "examples": ["string"]
  }
}
```

## 🎤 Voice Chat

#### POST /api/voice/session
Start voice chat session.

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "string",
    "supportedLanguages": ["string"],
    "maxDuration": "number"
  }
}
```

#### POST /api/voice/transcribe
Transcribe voice input.

**Request Body:**
```json
{
  "sessionId": "string",
  "audioData": "base64_string",
  "language": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transcription": "string",
    "confidence": "number",
    "aiResponse": "string"
  }
}
```

## 📈 Analytics & Reporting

#### GET /api/analytics/performance
Get performance analytics.

**Query Parameters:**
- `period`: "week" | "month" | "semester"
- `courseId`: string (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalTimeSpent": "number",
      "coursesCompleted": "number",
      "averageScore": "number",
      "streakDays": "number"
    },
    "courseProgress": [
      {
        "courseId": "string",
        "courseName": "string",
        "progress": "number",
        "timeSpent": "number",
        "lastAccessed": "string"
      }
    ],
    "weeklyActivity": [
      {
        "date": "string",
        "timeSpent": "number",
        "topicsCompleted": "number"
      }
    ]
  }
}
```

#### GET /api/analytics/accessibility
Get accessibility usage analytics.

**Response:**
```json
{
  "success": true,
  "data": {
    "featureUsage": {
      "bionicReading": "number",
      "voiceNavigation": "number",
      "textToSpeech": "number",
      "highContrast": "number"
    },
    "accessibilityScore": "number",
    "recommendations": ["string"]
  }
}
```

## 🔧 System Administration

#### GET /api/admin/dashboard
Get admin dashboard data.

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalUsers": "number",
      "totalCourses": "number",
      "totalEnrollments": "number",
      "activeUsers": "number"
    },
    "recentActivity": [
      {
        "type": "enrollment" | "completion" | "registration",
        "user": "string",
        "course": "string",
        "timestamp": "string"
      }
    ],
    "systemHealth": {
      "status": "healthy" | "warning" | "critical",
      "uptime": "number",
      "responseTime": "number"
    }
  }
}
```

#### GET /api/admin/users/:userId/accessibility
Get user accessibility report.

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "string",
    "disabilityInfo": {
      "hasDisability": "boolean",
      "disabilityType": ["string"],
      "assistiveTechnology": ["string"],
      "accommodationsNeeded": ["string"]
    },
    "featureUsage": {
      "bionicReading": "number",
      "voiceNavigation": "number",
      "textToSpeech": "number",
      "highContrast": "number"
    },
    "recommendations": ["string"]
  }
}
```

## 📁 File Management

#### POST /api/files/upload
Upload file (images, videos, documents).

**Request Body:** FormData with file

**Response:**
```json
{
  "success": true,
  "data": {
    "fileId": "string",
    "filename": "string",
    "url": "string",
    "type": "string",
    "size": "number"
  }
}
```

#### GET /api/files/:fileId
Get file information.

#### DELETE /api/files/:fileId
Delete file.

## 🔔 Notifications

#### GET /api/notifications
Get user notifications.

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "string",
        "type": "course_update" | "assignment_due" | "achievement",
        "title": "string",
        "message": "string",
        "isRead": "boolean",
        "createdAt": "string",
        "actionUrl": "string"
      }
    ],
    "unreadCount": "number"
  }
}
```

#### PUT /api/notifications/:id/read
Mark notification as read.

## 🌐 WebSocket Events

### Connection
```javascript
const socket = io('/api/socket', {
  auth: {
    token: 'jwt_token'
  }
});
```

### Events

#### voice_chat_start
Start voice chat session.

#### voice_chat_message
Voice chat message exchange.

#### progress_update
Real-time progress updates.

#### notification
Real-time notifications.

## 🚨 Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "string",
    "message": "string",
    "details": "object"
  }
}
```

### Common Error Codes
- `UNAUTHORIZED`: Invalid or missing authentication
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid request data
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

## 📋 Rate Limiting

- **Authentication endpoints**: 5 requests per minute
- **AI Chat**: 30 requests per minute
- **File uploads**: 10 requests per minute
- **General API**: 100 requests per minute

## 🔒 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting
- File upload restrictions
- Secure headers

## 🌍 Internationalization

The API supports multiple languages:
- English (en-US)
- Igbo (ig-NG)
- Hausa (ha-NG)
- Yoruba (yo-NG)

Language is specified via the `Accept-Language` header or `lang` query parameter.

## 📱 Mobile API Considerations

- Optimized response sizes for mobile
- Offline capability support
- Progressive data loading
- Image optimization
- Reduced bandwidth usage

## 🧪 Testing

### Test Environment
- Base URL: `https://api-test.alia.edu.ng`
- Test credentials provided separately

### Postman Collection
A complete Postman collection is available with all endpoints and example requests.

## 📞 Support

For API support and questions:
- Email: api-support@alia.edu.ng
- Documentation: https://docs.alia.edu.ng
- Status Page: https://status.alia.edu.ng

---

**Last Updated**: March 2026
**API Version**: v1.0
**Documentation Version**: 1.0