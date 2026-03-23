# Two-Way Sign Language System Setup Guide

## Module 1: Vision Engine (SignInterpreter.tsx)
**Location:** `src/components/Accessibility/SignInterpreter.tsx`

### What it does:
- Captures user's hands via webcam using MediaPipe
- Tracks 21 hand joints in real-time
- Feeds landmarks into TensorFlow.js model for sign prediction
- Displays recognized sign in real-time

### Setup Instructions:

1. **MediaPipe is already loaded** from CDN (no additional installation needed)

2. **Train your custom model** using Google's Teachable Machine:
   - Go to: https://teachablemachine.withgoogle.com/
   - Select "Hand Pose"
   - Record multiple examples of each sign you want to recognize
   - Export as TensorFlow.js format
   - Download the model files: `model.json`, `metadata.json`, and `weights.bin`

3. **Add your model to the project:**
   - Create folder: `public/models/sign_recognition/`
   - Place downloaded files there
   - Update `predictSign()` function to load and use your model:

```typescript
// In SignInterpreter.tsx, update predictSign():
import * as tf from '@tensorflow/tfjs';

const predictSign = useCallback(async (landmarks: any[]) => {
  try {
    const model = await tf.loadLayersModel('indexeddb://sign_model');

    // Flatten 21 landmarks (x,y,z) to 63-element array
    const flatLandmarks = landmarks.flatMap(p => [p.x, p.y, p.z]);
    const tensor = tf.tensor2d([flatLandmarks]);

    const prediction = model.predict(tensor) as any;
    const predictions = await prediction.data();
    const maxIdx = Array.from(predictions).indexOf(Math.max(...Array.from(predictions)));

    const labels = ['A', 'B', 'C', 'Hello', 'Thank You', ...]; // Your sign names
    setCurrentSign(labels[maxIdx]);

    tensor.dispose();
    prediction.dispose();
  } catch (err) {
    console.error('Prediction error:', err);
  }
}, []);
```

4. **Install TensorFlow.js:**
```bash
npm install @tensorflow/tfjs
```

---

## Module 2: Avatar Engine (SignAvatar.tsx)
**Location:** `src/components/Accessibility/SignAvatar.tsx`

### What it does:
- Renders a 3D humanoid avatar using React Three Fiber
- Plays pre-baked signing animations based on text input
- Creates two-way communication (human signs → computer responds with sign)

### Setup Instructions:

1. **Get a 3D humanoid model:**
   - **Option A (Free):** Download from Mixamo (https://www.mixamo.com)
   - **Option B (Free):** ReadyPlayerMe (https://readyplayer.me)
   - **Option C (Premium):** Purchase from TurboSquid, Sketchfab

2. **Prepare the model in Blender:**
   - Open the model in Blender
   - Create animations for each sign:
     - Right-click the Armature → Pose Mode
     - Create keyframes for hand/arm positions
     - Save animation clips with names: `Anim_Hello`, `Anim_ThankYou`, `Anim_Idle`, etc.
   - Export as GLB format (File → Export → glTF 2.0 .glb)

3. **Place model in your project:**
   - Save the `.glb` file as: `public/models/signing_avatar.glb`
   - The component will auto-load it

4. **Add animation mappings:**
   - Edit the `Avatar` component in SignAvatar.tsx
   - Add more animation conditions:

```typescript
if (normalizedText === 'hello') clipToPlay = actions['Anim_Hello'];
if (normalizedText === 'thank you') clipToPlay = actions['Anim_ThankYou'];
if (normalizedText === 'goodbye') clipToPlay = actions['Anim_Goodbye'];
if (normalizedText === 'help') clipToPlay = actions['Anim_Help'];
```

---

## Integration into Your App

### Add to a page:
```tsx
import SignInterpreter from '@/components/Accessibility/SignInterpreter';
import SignAvatar from '@/components/Accessibility/SignAvatar';

export default function SignLanguagePage() {
  return (
    <div className="flex gap-8 p-8 bg-slate-950">
      <SignInterpreter />
      <SignAvatar />
    </div>
  );
}
```

---

## Architecture Flow

```
User makes sign gesture
        ↓
Camera captures video (MediaPipe)
        ↓
Extract 21 hand landmarks
        ↓
Normalize coordinates
        ↓
Feed to TensorFlow.js model
        ↓
Get predicted sign label
        ↓
Display translation on screen
        ↓
OPTIONAL: Send to avatar to respond with counter-sign
```

---

## Performance Optimization Tips

1. **Reduce model size:**
   - Use quantization when exporting from Teachable Machine
   - This reduces download time from ~50MB to ~5MB

2. **Cache the model:**
   - Use IndexedDB to cache TensorFlow models
   - After first load, subsequent loads are instant

3. **Optimize animations:**
   - Use lower-poly count models for faster rendering
   - Bake animations into GLB instead of using IK bones

4. **Gesture recognition:**
   - Add confidence thresholds (only recognize if > 80% confidence)
   - Require 3+ consecutive frames with same prediction to confirm

---

## Testing Checklist

- [ ] Camera permissions requested on first load
- [ ] Hand detection works in different lighting conditions
- [ ] Sign predictions are accurate for trained gestures
- [ ] Avatar loads and animations play smoothly
- [ ] Can type text and see avatar sign it
- [ ] Works on mobile (both cameras front/back)
- [ ] Performance stays above 30 FPS on mid-range devices

---

## Next Steps

1. **Connect to real backend:** Store recognized signs in database
2. **Add ASL/BSL dictionary:** Expand beyond basic signs
3. **Real-time communication:** Let two users sign to each other via video
4. **Mobile optimization:** Test on phones with different screen sizes
5. **Accessibility feedback:** Test with Deaf/HoH community members

---

## Resources

- **MediaPipe Docs:** https://developers.google.com/mediapipe
- **TensorFlow.js:** https://www.tensorflow.org/js
- **React Three Fiber:** https://docs.pmnd.rs/react-three-fiber/
- **Blender Tutorials:** https://www.blender.org/support/
- **Sign Language Dictionary:** https://www.signdictionary.com/ (ASL)
