# Autonomous Learning Agent Guide

## Overview

The Autonomous Learning Agent is a fully automated system that takes complete control of the learning flow. When activated, it automatically:

1. Selects untaken courses from the available curriculum
2. Starts the course and navigates to the first incomplete topic
3. Processes each topic sequentially with simulated reading progress
4. Marks topics as completed and moves to the next
5. Completes entire courses and automatically moves to the next untaken course
6. Returns to the dashboard when all courses are completed

## Architecture

### Core Components

#### 1. `autonomousAgentService.ts`
The central service managing the autonomous learning flow:

- **State Management**: Tracks current course, topic, progress, and completion status
- **Progress Persistence**: Saves course progress to localStorage
- **Course Selection**: Automatically finds the next untaken course
- **Topic Navigation**: Determines the next incomplete topic in a course
- **Listener Pattern**: Notifies UI components of state changes

Key Methods:
- `start()`: Initializes autonomous mode and selects first course
- `processTopic()`: Simulates learning a topic with progress tracking
- `stop()`: Deactivates autonomous mode
- `markTopicCompleted()`: Records topic completion
- `getNextUntakenCourse()`: Finds next course to take
- `getNextTopic()`: Finds next incomplete topic in current course

#### 2. `useAutoPilot.ts` Hook
React hook that connects the autonomous agent service to the UI:

- Subscribes to agent state changes
- Triggers autonomous flow based on current route
- Handles navigation between courses and topics
- Manages cleanup when mode is deactivated

#### 3. `AutonomousAgentPanel.tsx`
Control panel component for the autonomous agent:

- Start/Stop button for autonomous mode
- Real-time status display
- Progress bar showing topic completion
- List of completed courses
- Debug reset button

#### 4. Integration Points

**Student Dashboard (`LandingView.tsx`)**:
- Displays the autonomous agent control panel
- Shows active status banner when mode is enabled
- Initiates course selection when agent starts

**Learning Room (`LearningRoom.tsx`)**:
- Shows autonomous mode status banner at top
- Displays real-time progress during topic processing
- Automatically navigates to next topic/course

## User Flow

### Starting Autonomous Mode

1. Student navigates to dashboard (`/dashboard/student`)
2. Clicks "Start" button in Autonomous Agent Panel
3. Agent initializes and scans for untaken courses
4. Automatically navigates to first incomplete course/topic
5. Status updates appear in real-time

### During Learning

1. Agent "processes" the current topic with simulated reading
2. Progress bar shows 0-100% completion
3. Status messages update throughout the process
4. Topic is marked as completed in localStorage
5. Agent automatically moves to next topic

### Course Completion

1. When all topics in a course are completed:
   - Course is marked as complete
   - Added to "Courses Completed" list
   - Agent searches for next untaken course
2. If more courses exist:
   - Navigates to next course automatically
   - Continues the learning flow
3. If all courses are completed:
   - Shows completion message
   - Deactivates autonomous mode
   - Returns to dashboard

### Stopping Autonomous Mode

1. Click "Stop" button at any time
2. Agent immediately halts processing
3. Progress is saved
4. User can resume manually or restart autonomous mode later

## Data Persistence

### Course Progress Structure
```typescript
interface CourseProgress {
  courseId: string;
  topicsCompleted: string[];
  totalTopics: number;
  isCompleted: boolean;
  lastAccessedTopic: string | null;
}
```

Stored in localStorage as `course-progress`:
```json
{
  "1": {
    "courseId": "1",
    "topicsCompleted": ["1", "2", "3"],
    "totalTopics": 5,
    "isCompleted": false,
    "lastAccessedTopic": "3"
  }
}
```

## Customization

### Adjusting Processing Speed

In `autonomousAgentService.ts`, modify the delays:

```typescript
// Topic processing speed (currently 500ms per 10% increment)
await new Promise(r => setTimeout(r, 500));

// Delay between topics (currently 1500ms)
await new Promise(r => setTimeout(r, 1500));

// Delay between courses (currently 2000ms)
await new Promise(r => setTimeout(r, 2000));
```

### Adding Real Course Data

Replace mock data with actual API calls:

```typescript
// In autonomousAgentService.ts
async getNextUntakenCourse(): Promise<string | null> {
  // Replace with actual API call
  const courses = await courseService.getCourses();
  const progress = this.loadProgress();
  
  for (const course of courses) {
    const courseProgress = progress.get(course.id);
    if (!courseProgress || !courseProgress.isCompleted) {
      return course.id;
    }
  }
  return null;
}
```

### Integrating with Backend

To connect with a real backend:

1. Update `markTopicCompleted()` to POST to API
2. Load progress from user profile instead of localStorage
3. Fetch actual course/topic data from database
4. Track completion timestamps and learning analytics

## Testing

### Manual Testing

1. **Fresh Start**: Click "Reset Progress" to clear all data
2. **Start Agent**: Click "Start" and observe navigation
3. **Progress Tracking**: Watch progress bar and status updates
4. **Stop/Resume**: Test stopping mid-topic and resuming
5. **Completion**: Let agent complete all courses

### Debug Features

- **Reset Progress Button**: Clears all localStorage data
- **Console Logging**: Check browser console for state changes
- **Status Messages**: Real-time feedback on agent actions

## Future Enhancements

1. **Adaptive Speed**: Adjust processing speed based on content length
2. **Learning Analytics**: Track time spent, comprehension metrics
3. **Smart Recommendations**: AI-powered course selection based on performance
4. **Pause/Resume**: Save exact position and resume later
5. **Multi-Course Parallel**: Process multiple courses simultaneously
6. **Quiz Integration**: Automatically take assessments
7. **Notification System**: Alert user when courses are completed
8. **Voice Feedback**: Speak status updates for accessibility

## Accessibility Considerations

- Status updates are announced via ARIA live regions
- Progress is visible and color-coded
- Can be controlled via keyboard (Start/Stop buttons)
- Compatible with screen readers
- Works with other accessibility features (voice navigation, high contrast)

## Performance

- Lightweight state management (no heavy libraries)
- Efficient localStorage usage
- Minimal re-renders with listener pattern
- Async/await for smooth navigation
- Cleanup on unmount prevents memory leaks
