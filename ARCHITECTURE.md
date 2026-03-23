# Frontend Architecture Guide

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── dashboard/
│   │   ├── student/             # Student dashboard routes
│   │   ├── lecturer/            # Lecturer dashboard routes
│   │   └── admin/               # Admin dashboard routes
│   ├── courses/
│   │   ├── [id]/                # Course detail page
│   │   └── [id]/topics/[topicId]/  # Topic/lesson page
│   ├── api/                     # API routes
│   │   ├── courses/
│   │   ├── users/
│   │   ├── analytics/
│   │   └── ai/
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles
│
├── components/                  # Reusable React components
│   └── Dashboard/
│       ├── StudentDashboard/    # Student-specific components
│       │   ├── LandingView.tsx
│       │   ├── CourseGrid.tsx
│       │   ├── PersonalizedGreeting.tsx
│       │   ├── RecommendedCourses.tsx
│       │   └── LearningRoom/
│       │       ├── ContentArea.tsx
│       │       ├── Curriculum.tsx
│       │       └── SimplifyButton.tsx
│       ├── LecturerDashboard/   # Lecturer-specific components
│       │   ├── LecturerDashboard.tsx
│       │   ├── CourseManagement.tsx
│       │   ├── ClassDemographics.tsx
│       │   ├── PerformanceMetrics.tsx
│       │   └── AlertSystem.tsx
│       ├── AdminDashboard/      # Admin-specific components
│       │   ├── AdminDashboard.tsx
│       │   ├── SystemHealth.tsx
│       │   ├── UserManagement.tsx
│       │   └── AccessibilityReport.tsx
│       └── Accessibility/       # Shared accessibility components
│           ├── AccessibilityFAB.tsx
│           ├── AccessibilityMenu.tsx
│           ├── TextToSpeechButton.tsx
│           ├── BionicText.tsx
│           └── VoiceCommander.tsx
│
├── context/                     # React Context for state management
│   └── UserPreferencesContext.tsx
│
├── hooks/                       # Custom React hooks
│   ├── useCourses.ts
│   ├── useUsers.ts
│   ├── useAnalytics.ts
│   ├── useGazeTracker.ts
│   └── ...
│
├── services/                    # API service layer
│   ├── courseService.ts
│   ├── userService.ts
│   ├── analyticsService.ts
│   └── ...
│
├── types/                       # TypeScript type definitions
│   └── index.ts
│
└── constants/                   # Global constants
    └── index.ts
```

## Component Organization

### Dashboard Components

Each dashboard (Student, Lecturer, Admin) follows a consistent pattern:

1. **Main Dashboard Component**: Handles tab navigation and layout
2. **Feature Components**: Specific features within each dashboard
3. **Shared Components**: Reusable components across dashboards

### Accessibility Components

Located in `src/components/Dashboard/Accessibility/`:
- **AccessibilityFAB**: Floating action button for accessibility menu
- **AccessibilityMenu**: Menu with all accessibility toggles
- **TextToSpeechButton**: Reusable TTS button component
- **BionicText**: Component for bionic reading effect
- **VoiceCommander**: Voice navigation component

## State Management

### Context API
- `UserPreferencesContext`: Manages user accessibility preferences globally
- Provides: `bionicReading`, `dyslexiaFont`, `highContrast`, `voiceNavigation`

### Custom Hooks
- `useCourses()`: Fetch and manage courses
- `useUsers()`: Fetch and manage users
- `useAnalytics()`: Fetch analytics data
- `useGazeTracker()`: Track eye gaze for accessibility

## API Layer

### Services
Each service handles a specific domain:

```typescript
// courseService.ts
courseService.getCourses()
courseService.getCourseById(id)
courseService.createCourse(data)
courseService.updateCourse(id, data)
courseService.deleteCourse(id)

// userService.ts
userService.getUsers(role?)
userService.getUserById(id)
userService.createUser(data)
userService.updateUser(id, data)
userService.approveUser(id)
userService.resetPassword(id)

// analyticsService.ts
analyticsService.getAccessibilityAnalytics()
analyticsService.getPerformanceAnalytics(courseId)
analyticsService.getSystemHealth()
```

### API Routes
- `GET/POST /api/courses` - Course management
- `GET/POST /api/users` - User management
- `GET /api/analytics/accessibility` - Accessibility metrics
- `GET /api/analytics/performance` - Performance metrics
- `POST /api/ai/simplify` - AI topic simplification

## Styling

- **Framework**: Tailwind CSS
- **Approach**: Utility-first CSS
- **Color Scheme**: Slate, Blue, Green, Purple, Yellow, Red
- **Responsive**: Mobile-first design with `md:` and `lg:` breakpoints

## Key Features

### Student Dashboard
- Personalized greeting with student info
- Course grid with progress bars
- Recommended courses by department
- Learning room with 70/30 split layout
- AI-powered topic simplification
- Text-to-speech for content

### Lecturer Dashboard
- Course management interface
- Class demographics visualization
- Student performance metrics
- Agentic alert system for struggling students

### Admin Dashboard
- System health monitoring
- User management and approval
- Global accessibility usage reports
- API quota tracking

### Accessibility Features
- Bionic reading mode
- Dyslexia-friendly fonts
- High contrast modes (standard, dark, yellow)
- Voice navigation
- Text-to-speech
- Persistent FAB for quick access

## Development Guidelines

### Adding a New Component

1. Create component in appropriate folder under `src/components/`
2. Use TypeScript interfaces for props
3. Mark client components with `'use client'`
4. Use Tailwind for styling
5. Export from component file

### Adding a New API Endpoint

1. Create route file in `src/app/api/`
2. Implement GET/POST/PUT/DELETE handlers
3. Add corresponding service method in `src/services/`
4. Create custom hook if needed in `src/hooks/`

### Adding a New Page

1. Create folder structure in `src/app/`
2. Add `page.tsx` file
3. Import and use dashboard components
4. Include AccessibilityFAB for student-facing pages

## Performance Considerations

- Components are split by feature for better code splitting
- Services handle API caching logic
- Custom hooks manage data fetching
- Lazy loading for dashboard tabs
- Memoization for expensive computations

## Type Safety

- All components have TypeScript interfaces
- Services define return types
- API responses are typed
- Context values are typed

## Future Enhancements

- Add authentication/authorization layer
- Implement real database integration
- Add real-time notifications
- Integrate AI service (OpenAI, Claude, etc.)
- Add file upload for course materials
- Implement quiz engine
- Add video player integration
- Real-time collaboration features
