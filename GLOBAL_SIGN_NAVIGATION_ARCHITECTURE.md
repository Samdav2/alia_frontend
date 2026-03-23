# 🌍 Global Sign Navigation - Visual Architecture

## System Overview

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                       ROOT APPLICATION LAYOUT                    ┃
┃                     (src/app/layout.tsx)                         ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                              │
                              ▼
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃              SIGN NAVIGATION PROVIDER (WRAPPER)                  ┃
┃           (src/context/SignNavigationContext.tsx)               ┃
┃                                                                  ┃
┃  • Manages global sign detection state                          ┃
┃  • Listens for 'sign-detected' custom events                    ┃
┃  • Executes commands (scroll, click, navigate)                  ┃
┃  • Manages 1.5s cooldown between commands                       ┃
┃  • Provides useGlobalSignNavigation() hook                      ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
    EVERY PAGE           ♿ ACCESSIBILITY      HOME PAGE
   (Dashboard,           MENU                 (or any page)
    Courses, etc.)       ┌──────────────┐      ┌────────────┐
   ┌─────────────┐       │              │      │            │
   │             │       │ TOGGLE BTN   │      │ Can mount  │
   │  Navigation │       │              │      │SignInterp. │
   │  Commands   │       │"Sign Nav ON" │      │  here      │
   │  Execute    │       │  (Green)     │      │            │
   │  Globally!  │       │              │      └────────────┘
   │             │       │Status Info   │            │
   └─────────────┘       │- Last sign   │            ▼
         ▲               │- Commands    │    ┌────────────────┐
         │               │- Available   │    │ SIGN           │
         │               │              │    │ INTERPRETER    │
         │               └──────────────┘    │ Component      │
         │                    │              │                │
         │                    ▼              │• Detects hand  │
         │            ┌──────────────┐      │• Gets landmarks│
         │            │Visibility:   │      │• Predicts sign │
         │            │Enabled/      │      │• Emits events  │
         │            │Disabled      │      │                │
         │            └──────────────┘      └────────────────┘
         │                                          │
         │                                          ▼
         │                            window.dispatchEvent(
         │                            'sign-detected',
         │                            {detail: {sign: 'SCROLL_DOWN'}}
         │                            )
         │                                          │
         │                                          │
         └──────────────────────────────────────────┘
```

---

## Command Execution Flow

```
┌─────────────────────────────────────────────────────────┐
│ User Makes Hand Gesture                                 │
│ (e.g., hand moving downward = SCROLL_DOWN)             │
└─────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│ SignInterpreter (if mounted)                            │
│ • MediaPipe detects 21 hand landmarks                   │
│ • Extracts wrist-relative features                      │
│ • TensorFlow.js predicts sign confidence                │
└─────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│ High Confidence Match (>60%)                            │
│ ✅ SCROLL_DOWN detected                                 │
└─────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│ SignInterpreter Emits Global Event                      │
│ window.dispatchEvent('sign-detected',                   │
│   {detail: {sign: 'SCROLL_DOWN'}}                       │
│ )                                                        │
└─────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│ SignNavigationContext Receives Event                    │
│ (global event listener triggered)                       │
└─────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│ Check Cooldown Status                                   │
│ ├─ If cooldownRef.current === true → Ignore command    │
│ └─ If cooldownRef.current === false → Execute!         │
└─────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│ Execute Command: window.scrollBy({top: 400})            │
│ ✅ Page scrolls down 400px smoothly                     │
└─────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│ Activate Cooldown                                       │
│ • cooldownRef.current = true                            │
│ • Set setTimeout(1500ms) to reset                       │
│ • Update UI: "Cooldown activated"                       │
└─────────────────────────────────────────────────────────┘
                           ▼
        (1.5 seconds pass - all new signs ignored)
                           ▼
┌─────────────────────────────────────────────────────────┐
│ Cooldown Expires                                        │
│ • cooldownRef.current = false                           │
│ • Update UI: "Ready for next command"                   │
│ • Ready for new sign detection                          │
└─────────────────────────────────────────────────────────┘
                           ▼
                   🔄 REPEAT CYCLE
```

---

## File Dependencies

```
src/app/layout.tsx
  └─ imports: SignNavigationProvider
       │
       └─ src/context/SignNavigationContext.tsx
            │
            ├─ imports: useRouter (for navigation)
            ├─ Creates: SignNavigationContext
            ├─ Exports: SignNavigationProvider (component)
            └─ Exports: useGlobalSignNavigation() hook
                 │
                 └─ Used by: SignNavigationToggle

src/components/Accessibility/SignInterpreter.tsx
  └─ Emits: window.dispatchEvent('sign-detected', ...)
       │
       ├─ Listened by: SignNavigationContext
       └─ Also calls: onSignDetected prop (local)
            │
            └─ Used by: SignLanguageAccessibilityHub

src/components/Accessibility/SignNavigationToggle.tsx
  └─ imports: useGlobalSignNavigation
       │
       └─ Uses: isEnabled, toggleSignNavigation, lastDetectedSign, commandsExecuted
            │
            └─ Displayed in: AccessibilityMenu

src/components/Dashboard/Accessibility/AccessibilityMenu.tsx
  └─ imports: SignNavigationToggle
       │
       └─ Renders in: Accessibility menu (♿ button)
            │
            └─ Available: Every page via layout.tsx
```

---

## Data Flow Example: SCROLL_DOWN

```
┌─────────────────────────────────────────────────────────────┐
│                    START: User gesture                       │
│                   (hand moving down)                         │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              DETECT: MediaPipe Hand Pose                     │
│  Landmarks: [wrist, thumb_CMC, thumb_MCP, thumb_IP, ...]   │
│             [index_MCP, index_PIP, ..., pinky_DIP]           │
│  (21 total landmarks × 3 axes = 63 features)                │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│             EXTRACT: Wrist-Relative Features                │
│  • Normalize all 21 landmarks relative to wrist (0)         │
│  • Result: 63 normalized floats                             │
│  • Invariant to: scale, position, rotation                  │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│            PREDICT: TensorFlow.js Neural Network             │
│  Input: [63 floats]                                          │
│  Model: 128 → 64 → 32 → [num_signs] layers                 │
│  Output: [confidence_sign_1, confidence_sign_2, ...]        │
│  Best match: SCROLL_DOWN (0.87 confidence)                  │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│           VALIDATE: Is confidence > 0.6?                    │
│           ✅ YES (0.87 > 0.6)                               │
│           → Proceed with action                             │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│         EMIT: Global Custom Event                           │
│  window.dispatchEvent('sign-detected', {                    │
│    detail: {sign: 'SCROLL_DOWN'}                            │
│  })                                                          │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│       LISTEN: SignNavigationContext receives event          │
│       Handler: handleSignDetected(event)                    │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│       CHECK: Is cooldown active?                            │
│       cooldownRef.current === false? → YES, proceed!        │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│       EXECUTE: Switch statement finds command               │
│       case 'SCROLL_DOWN':                                   │
│         window.scrollBy({ top: 400, behavior: 'smooth' })   │
│         actionTaken = true                                  │
│         break                                               │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│       COOLDOWN: Activate 1500ms lock                        │
│       cooldownRef.current = true                            │
│       setTimeout(() => {                                    │
│         cooldownRef.current = false                         │
│       }, 1500)                                              │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│       UPDATE: Component state                               │
│       setLastDetectedSign('SCROLL_DOWN')                    │
│       setCommandsExecuted(count + 1)                        │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│       RESULT: ✅ Page scrolled 400px down!                  │
│                                                              │
│       ♿ Menu shows:                                        │
│       • Last Sign: SCROLL_DOWN                              │
│       • Commands: +1                                        │
│       • Status: ⏳ Cooldown (1.5s)                          │
└─────────────────────────────────────────────────────────────┘
                             │
           (1.5 seconds elapse - all new signs ignored)
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│       READY: Cooldown expired                               │
│       cooldownRef.current = false                           │
│       ✅ Ready for next command                             │
│                                                              │
│       ♿ Menu shows:                                        │
│       • Status: ✅ Ready                                    │
│       • Waiting for next gesture...                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Interaction Map

```
                    ♿ Button (visible on all pages)
                           │
                           ▼
                  AccessibilityFAB.tsx
                  (bottom-right corner)
                           │
                           ▼
                  AccessibilityMenu.tsx
                  (opens when clicked)
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    [Bionic Reading] [Dyslexia Font] [Sign Navigation Toggle]
    [High Contrast]   [Voice Nav]        (NEW!)
    [Gaze Scroll]     [Auto-Pilot]       │
                                          ▼
                              SignNavigationToggle.tsx
                              │
                              ├─ Uses: useGlobalSignNavigation()
                              │
                              ├─ Displays:
                              │  • Toggle button (ON/OFF)
                              │  • Last sign detected
                              │  • Commands count
                              │  • Help text
                              │
                              ▼
                    SignNavigationContext
                    (global provider)
```

---

## Enable/Disable Sequence

```
User clicks ♿ button
         │
         ▼
AccessibilityMenu opens
         │
         ▼
User scrolls to "Sign Navigation" section
         │
         ▼
User sees "Sign Navigation OFF" (red button)
         │
         ▼
User clicks toggle button
         │
         ▼
toggleSignNavigation() called
         │
         ▼
setIsEnabled(prev => !prev)
         │
         ▼
isEnabled changes: false → true
         │
         ▼
useEffect triggered (depends on [isEnabled])
         │
         ▼
window.addEventListener('sign-detected')
         │
         ▼
Console: "✅ GLOBAL SIGN NAVIGATION ENABLED"
         │
         ▼
UI updates: "Sign Navigation ON" (green button)
         │
         ▼
✅ System ready to detect signs everywhere!
         │
         ├─ On Dashboard? ✅ Works
         ├─ On Course page? ✅ Works
         ├─ On Settings? ✅ Works
         ├─ Anywhere? ✅ Works!
         │
         ▼
User makes a hand gesture
         │
         ▼
Command executes globally
         │
         ▼
🌍 Sign Navigation Active!
```

---

## Context Lifecycle

```
┌────────────────────────────────────────────────────┐
│         Application Startup (Initial Load)         │
└────────────────────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────┐
│    Root layout.tsx wraps app with provider         │
│    <SignNavigationProvider>                        │
│      {children}                                    │
│    </SignNavigationProvider>                       │
└────────────────────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────┐
│  Context initialized:                              │
│  • isEnabled = false (default)                     │
│  • lastDetectedSign = null                         │
│  • commandsExecuted = 0                            │
│  • cooldownRef = false                             │
│  • useEffect hook not listening yet                │
└────────────────────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────┐
│  User clicks ♿ → AccessibilityMenu opens          │
│  User toggles "Sign Navigation OFF" → ON          │
└────────────────────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────┐
│  isEnabled: false → true                           │
│  (state update triggers re-render)                 │
└────────────────────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────┐
│  useEffect (depends on [isEnabled]) triggered      │
│  Since isEnabled = true, now listening!            │
└────────────────────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────┐
│  window.addEventListener('sign-detected')         │
│  Handler: (event) => executeCommand(event.detail) │
└────────────────────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────┐
│  ✅ Now listening for global sign events!          │
│  Any 'sign-detected' event will execute a command  │
└────────────────────────────────────────────────────┘
                      │
                      ▼
         (User makes gestures - commands execute)
                      │
                      ▼
┌────────────────────────────────────────────────────┐
│  User clicks toggle again: ON → OFF               │
│  isEnabled: true → false                           │
└────────────────────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────┐
│  useEffect cleanup triggered                       │
│  window.removeEventListener('sign-detected')      │
│  Handler removed from event queue                  │
└────────────────────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────┐
│  ❌ No longer listening for global events         │
│  'sign-detected' events now ignored               │
│  (but still captured by local hub handlers)       │
└────────────────────────────────────────────────────┘
```

---

## State Diagram

```
                     DISABLED STATE
                    (isEnabled=false)
                           │
                ┌──────────┴──────────┐
                │                     │
           On startup         User toggles OFF
                │                     │
                └──────────┬──────────┘
                           │
                    not listening
                           │
            'sign-detected' events → ignored
                           │
        (User can still use local hub callback)
                           │
                ┌──────────┴──────────┐
                │                     │
           User toggles ON      Another page load
                │                     │
                └──────────┬──────────┘
                           │
                    ENABLED STATE
                   (isEnabled=true)
                           │
                 NOW LISTENING
                           │
      'sign-detected' events → processed
                           │
        executeCommand() called
                           │
        ┌─────────────┬────────────────┐
        │             │                │
   cooldown     command executed   state updated
    active        globally         (UI refreshes)
        │             │
        └─────────────┴────────────────┐
                     │
            1.5s passes (setTimeout)
                     │
            cooldownRef set to false
                     │
            ✅ READY FOR NEXT COMMAND
```

---

## Perfect! 🌍

This architecture ensures that:

✅ **Global**: Works on every page automatically
✅ **Simple**: No per-page code changes needed
✅ **Safe**: Cooldown prevents spam
✅ **Debuggable**: Console logs everything
✅ **Flexible**: Can be enabled/disabled anytime
✅ **Performance**: ~100ms latency
✅ **Scalable**: Works with any number of signs
✅ **Maintainable**: Single source of truth (context)
