# 🤟 Sign Command Integration Guide

## Overview

The **Command Execution Engine** (`useSignNavigation` hook) transforms detected hand signs into actionable commands on your platform. With a built-in **1.5-second cooldown**, the system prevents command spam while enabling hands-free, accessibility-first navigation.

---

## 🎯 Available Sign Commands

### Navigation Commands

#### `SCROLL_DOWN`
- **Action:** Scrolls down 400px with smooth animation
- **Use Case:** Navigate through course content, lectures, assignments
- **Example:** Student signs SCROLL_DOWN while reading course materials

#### `SCROLL_UP`
- **Action:** Scrolls up 400px with smooth animation
- **Use Case:** Return to top of page, review previous content
- **Example:** Student signs SCROLL_UP to see course description again

#### `GO_BACK`
- **Action:** Navigate to previous page (router.back())
- **Use Case:** Return from course details to course list
- **Example:** Student finishes viewing a course and signs GO_BACK to return

#### `GO_HOME` / `DASHBOARD`
- **Action:** Navigate to `/dashboard` route
- **Use Case:** Quick access to main dashboard from anywhere
- **Example:** Student on course page signs DASHBOARD to go home

---

### Course & Video Commands

#### `ATTEND_CLASS`
- **Action:** Clicks element with `data-primary-action` attribute
- **Use Case:** Join live lecture, start video playback, submit assignment
- **Requires:** `<button data-primary-action>` on the page
- **Example:**
  ```tsx
  <button
    data-primary-action
    className="bg-blue-600 px-6 py-3 rounded-lg font-bold"
    onClick={handleJoinClass}
  >
    Join Live Lecture
  </button>
  ```

#### `PLAY_VIDEO` / `STOP_VIDEO`
- **Action:** Toggle play/pause on all `<video>` elements on page
- **Use Case:** Control video playback hands-free
- **Example:**
  ```tsx
  <div className="course-video-container">
    <video
      width="100%"
      height="auto"
      controls
    >
      <source src="/course-video.mp4" type="video/mp4" />
    </video>
  </div>
  ```

---

### System Commands

#### `ASK_FOR_HELP`
- **Action:** Focuses element with `data-help-input` attribute
- **Use Case:** Open help chat, focus question input, trigger support modal
- **Requires:** `<input data-help-input>` or similar element
- **Example:**
  ```tsx
  <input
    data-help-input
    type="text"
    placeholder="Ask a question..."
    className="w-full border rounded-lg p-3"
  />
  ```

#### `HELLO` / `GREET`
- **Action:** No navigation action (acknowledgment only)
- **Use Case:** System recognizes greeting but doesn't need to do anything
- **Result:** Sign is logged, response is spoken, no cooldown triggered

---

## 📋 Cooldown Mechanism

**Problem:** Without debouncing, a single hand gesture detected at 30 FPS would trigger 30 commands per second!

**Solution:** 1.5-second cooldown prevents command spam
- ✅ User makes gesture (e.g., SCROLL_DOWN)
- ✅ Command executes immediately
- ⏳ System locks for 1.5 seconds
- ❌ Any signs detected in next 1.5s are ignored
- ✅ Cooldown expires, ready for next command

**Console Output:**
```
📖 SCROLL_DOWN detected
⏱️ Cooldown activated for 1.5s (last: SCROLL_DOWN)
⏳ Command ignored (cooldown): SCROLL_UP  (user tried to sign during cooldown)
✅ Cooldown expired - ready for next command
```

---

## 🏗️ HTML Implementation Guide

### Pattern 1: Primary Action Button (ATTEND_CLASS)

Use this for main interactive elements like:
- "Join Class" buttons
- "Start Quiz" buttons
- "Submit Assignment" buttons
- "Play Lecture" buttons

```tsx
// ❌ WRONG - No data attribute
<button onClick={handleJoinClass}>
  Join Live Lecture
</button>

// ✅ RIGHT - data-primary-action added
<button
  data-primary-action
  onClick={handleJoinClass}
  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
>
  🎓 Join Live Lecture
</button>
```

### Pattern 2: Help/Support Input (ASK_FOR_HELP)

Use this for question inputs, chat boxes, support fields:

```tsx
// ❌ WRONG - No data attribute
<input
  type="text"
  placeholder="Ask a question..."
/>

// ✅ RIGHT - data-help-input added
<div className="mt-4">
  <label className="block text-white font-bold mb-2">Questions?</label>
  <input
    data-help-input
    type="text"
    placeholder="Sign ASK_FOR_HELP to focus here..."
    className="w-full border border-slate-600 rounded-lg p-3 bg-slate-800 text-white"
    onKeyDown={(e) => {
      if (e.key === 'Enter') {
        handleSubmitQuestion(e.currentTarget.value);
      }
    }}
  />
</div>
```

### Pattern 3: Video Elements (PLAY_VIDEO / STOP_VIDEO)

The system automatically finds all `<video>` elements. Just ensure they're present:

```tsx
// ✅ CORRECT - Video will be found automatically
<div className="course-video-section">
  <video
    width="100%"
    height="auto"
    controls
    className="rounded-lg shadow-lg"
  >
    <source src="/lectures/intro.mp4" type="video/mp4" />
    Your browser does not support HTML5 video.
  </video>
</div>
```

---

## 🚀 Real-World Integration Examples

### Example 1: Course Details Page

```tsx
'use client';

import React from 'react';

const CourseDetailsPage = ({ courseId }: { courseId: string }) => {
  const handleJoinClass = () => {
    console.log('Joining class...');
    // Your join logic
  };

  const handleSubmitQuestion = (question: string) => {
    console.log('Question:', question);
    // Your question submission logic
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Course Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Advanced JavaScript</h1>
        <p className="text-slate-400">Learn functional programming, async patterns, and modern JS</p>
      </div>

      {/* Join Button - SIGN COMMAND: ATTEND_CLASS */}
      <div className="mb-8">
        <button
          data-primary-action
          onClick={handleJoinClass}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg transition-all text-lg"
        >
          🎓 Join Live Lecture Now
        </button>
        <p className="text-sm text-slate-400 mt-2">💡 Tip: Sign ATTEND_CLASS to join!</p>
      </div>

      {/* Course Video - SIGN COMMANDS: PLAY_VIDEO / STOP_VIDEO */}
      <div className="mb-8 bg-slate-900 rounded-lg overflow-hidden">
        <video
          width="100%"
          height="auto"
          controls
          className="w-full"
        >
          <source src="/course-intro.mp4" type="video/mp4" />
        </video>
        <p className="text-sm text-slate-400 p-4">💡 Tip: Sign PLAY_VIDEO or STOP_VIDEO to control!</p>
      </div>

      {/* Course Content - SIGN COMMANDS: SCROLL_UP / SCROLL_DOWN */}
      <div className="mb-8 space-y-4">
        <h2 className="text-2xl font-bold">Course Overview</h2>
        <p>Section 1: Fundamentals...</p>
        <p>Section 2: Advanced Concepts...</p>
        <p>Section 3: Project Build...</p>
        <p className="text-sm text-slate-400">💡 Tip: Sign SCROLL_UP or SCROLL_DOWN to navigate!</p>
      </div>

      {/* Question Section - SIGN COMMAND: ASK_FOR_HELP */}
      <div className="mb-8 bg-slate-800 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Have Questions?</h3>
        <input
          data-help-input
          type="text"
          placeholder="Type your question..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSubmitQuestion((e.target as HTMLInputElement).value);
            }
          }}
          className="w-full border border-slate-600 rounded-lg p-3 bg-slate-700 text-white"
        />
        <p className="text-sm text-slate-400 mt-2">💡 Tip: Sign ASK_FOR_HELP to focus this field!</p>
      </div>

      {/* Back Navigation - SIGN COMMAND: GO_BACK */}
      <div className="mb-8">
        <button
          onClick={() => window.history.back()}
          className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-all"
        >
          ← Back to Courses
        </button>
        <p className="text-sm text-slate-400 mt-2">💡 Tip: Sign GO_BACK to return!</p>
      </div>
    </div>
  );
};

export default CourseDetailsPage;
```

### Example 2: Dashboard with Quick Actions

```tsx
'use client';

import React from 'react';

const EnhancedDashboard = () => {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">My Learning Dashboard</h1>

      {/* Active Course Card with ATTEND_CLASS */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Currently Enrolled</h2>

          <div className="space-y-4">
            <div className="bg-slate-900 rounded-lg p-4">
              <h3 className="font-bold mb-2">Advanced JavaScript</h3>
              <p className="text-sm text-slate-400 mb-3">Lesson 5 of 12</p>
              <button
                data-primary-action
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition-all"
              >
                ▶️ Continue Lesson
              </button>
              <p className="text-xs text-slate-500 mt-2">Sign: ATTEND_CLASS</p>
            </div>

            <div className="bg-slate-900 rounded-lg p-4">
              <h3 className="font-bold mb-2">Web Design Fundamentals</h3>
              <p className="text-sm text-slate-400 mb-3">Lesson 2 of 8</p>
              <button
                data-primary-action
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition-all"
              >
                ▶️ Start Lesson
              </button>
              <p className="text-xs text-slate-500 mt-2">Sign: ATTEND_CLASS</p>
            </div>
          </div>
        </div>

        {/* Support Section with ASK_FOR_HELP */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Need Help?</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">Search Knowledge Base</label>
              <input
                data-help-input
                type="text"
                placeholder="Search or ask..."
                className="w-full border border-slate-600 rounded-lg p-3 bg-slate-700 text-white"
              />
              <p className="text-xs text-slate-500 mt-2">Sign: ASK_FOR_HELP</p>
            </div>

            <div>
              <p className="text-sm font-bold mb-3">Quick Links:</p>
              <ul className="space-y-2 text-sm">
                <li>📧 Email Support</li>
                <li>💬 Live Chat</li>
                <li>📖 Video Tutorials</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content Section */}
      <div className="bg-slate-800 rounded-lg p-6 max-h-96 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {/* Long list of items that requires scrolling */}
          <p className="text-slate-400">📚 Completed Assignment: "ES6 Arrow Functions"</p>
          <p className="text-slate-400">✅ Passed Quiz: "JavaScript Async Patterns"</p>
          <p className="text-slate-400">📝 New Announcement: "Next week's live session"</p>
          <p className="text-slate-400">🏆 Badge Earned: "JavaScript Expert"</p>
          {/* More items... */}
        </div>
        <p className="text-xs text-slate-500 mt-4">Sign: SCROLL_UP / SCROLL_DOWN to navigate</p>
      </div>
    </div>
  );
};

export default EnhancedDashboard;
```

---

## 🔧 Advanced: Custom Sign Commands

Want to add your own signs? Extend the hook:

```tsx
// src/hooks/useSignNavigation.ts - Add to switch statement

case 'CUSTOM_ACTION':
  console.log('🎯 CUSTOM_ACTION detected');
  // Your custom logic here
  const customElement = document.querySelector('[data-custom]');
  if (customElement) {
    // Do something
    actionTaken = true;
  }
  break;
```

Then use in your component:

```tsx
<button
  data-custom
  onClick={handleCustomAction}
  className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg"
>
  Custom Feature
</button>
```

---

## 📊 Console Logging

The system provides detailed console logging for debugging:

```
📖 SCROLL_DOWN detected
⏱️ Cooldown activated for 1.5s (last: SCROLL_DOWN)
⏳ Command ignored (cooldown): SCROLL_UP
✅ Cooldown expired - ready for next command
🎓 ATTEND_CLASS detected
✅ Clicking primary action button
🎬 VIDEO CONTROL detected
▶️ Playing video
🆘 ASK_FOR_HELP detected
✅ Focusing help input
ℹ️ Sign 'HELLO' has no navigation action
```

---

## ✅ Checklist for Your Pages

When adding sign command support to a page, use this checklist:

- [ ] Import and use `useSignNavigation` hook
- [ ] Add `data-primary-action` to main CTAs (Join, Submit, Start)
- [ ] Add `data-help-input` to help/support fields
- [ ] Ensure videos have `<video>` tags (for PLAY_VIDEO/STOP_VIDEO)
- [ ] Test SCROLL_UP/SCROLL_DOWN navigation
- [ ] Verify GO_BACK functionality
- [ ] Test with actual hand signs (at /dashboard/sign-language or /admin/train)
- [ ] Check console logs for proper command execution

---

## 🎓 Training New Signs

Once you've prepared your pages with data-attributes, train your model on these commands:

1. Go to `/admin/train`
2. Record yourself making the sign (e.g., hold down "SCROLL_DOWN" button)
3. Make 50+ variations (different speeds, angles, distances)
4. Train the model (50 epochs)
5. Download model.json + weights.bin
6. Upload to `/public` folder
7. System will now recognize your custom signs!

---

## 🐛 Troubleshooting

### Button not clicking on ATTEND_CLASS?
- [ ] Check element has `data-primary-action` attribute
- [ ] Verify element exists when sign is detected
- [ ] Check browser console for "No primary action button found"

### Help input not focusing on ASK_FOR_HELP?
- [ ] Check input has `data-help-input` attribute
- [ ] Verify input exists on the page
- [ ] Check browser console for "No help input found"

### Commands not executing at all?
- [ ] Verify `useSignNavigation` hook is properly imported
- [ ] Check `executeCommand(sign)` is called in `handleSignDetected`
- [ ] Verify MediaPipe is initialized (check vision engine on hub page)
- [ ] Check browser console for detailed error messages

### Too many commands firing?
- This shouldn't happen! Cooldown prevents spam. If it does:
  - [ ] Check browser console for cooldown messages
  - [ ] Verify cooldown timer is working (1.5s between commands)
  - [ ] Check that `cooldownRef.current` is properly toggling

---

## 📱 Mobile Considerations

Sign recognition works best on:
- ✅ Desktop with external camera
- ✅ Laptops with built-in camera
- ⚠️ Tablets (if hand is visible in frame)
- ⚠️ Mobile phones (limited hand visibility)

For mobile, ensure:
- Page scrolls are still accessible via sign commands
- Buttons are large enough to target with mouse/touch
- Fallback to touch controls if camera unavailable

---

## 🎯 Best Practices

1. **Use data-attributes consistently** - Makes debugging easier
2. **Add hint text** - Tell users which sign to use
3. **Test without signs first** - Ensure normal navigation works
4. **Monitor console logs** - Understand what's happening
5. **Provide fallback** - Always have manual controls too
6. **Document your signs** - Help users know what to do

---

**Ready to build? Start with Example 1 (Course Details Page) and adapt to your needs!** 🚀
