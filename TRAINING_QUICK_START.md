# 🚀 Quick Start: Train Your AI Hand Sign System

## Step 1: Access the Training Studio

Navigate to: **`http://localhost:3000/admin/train`**

You should see:
- 📹 Large video preview (left side)
- 🎮 Controls panel (right side)
- Status: "✅ Studio Ready. Start Recording Data."

## Step 2: Record Your First Sign

### Example: "SCROLL_UP"

1. **Type the sign name:**
   - In the "SIGN NAME" input box, clear it and type: `SCROLL_UP`

2. **Make the gesture:**
   - Show your hand to the camera
   - Make the SCROLL_UP gesture (hand moving upward, fingers extended)

3. **Hold the Record button:**
   - Press and **hold** the blue "HOLD TO RECORD" button
   - Keep holding for **3-5 seconds**
   - While recording, wiggle your hand slightly to capture variations:
     - Move closer to camera
     - Move farther from camera
     - Move left and right
     - Move higher and lower

4. **Release the Record button:**
   - Release to stop recording
   - You should see "Total Datapoints Recorded" increase (usually 100-300 new points per 5-second hold)

## Step 3: Record More Signs

Repeat step 2 for 10-20 different signs:

### Suggested Signs:
- `SCROLL_UP` - Hand moving up
- `SCROLL_DOWN` - Hand moving down
- `HOME` - Fist with thumb pointing (like "go home")
- `BACK` - Hand pointing left
- `NEXT` - Hand pointing right
- `LIKE` - Thumbs up
- `DISLIKE` - Thumbs down
- `OPEN` - Hand open, fingers spread
- `CLOSE` - Hand closing, fingers together
- `YES` - Nodding motion with hand (thumbs up)
- `NO` - Shaking motion with hand (two fingers)
- `HELP` - Both hands up, palms out
- `STOP` - Open palm facing forward
- `PLAY` - Finger pointing forward
- `PAUSE` - Two fingers parallel (like ||)

**For each sign:**
- Minimum: 50 datapoints
- Recommended: 100-300 datapoints
- Best: 50+ datapoints per sign

## Step 4: Check Your Dataset

After recording, you'll see a breakdown:

```
Total Datapoints: 2,847
Unique Signs: 15

DATAPOINTS PER SIGN:
SCROLL_UP: 185
SCROLL_DOWN: 201
HOME: 156
BACK: 178
...
```

**Make sure:**
- ✅ At least 50 datapoints per sign
- ✅ No sign severely under-represented

## Step 5: Train the Neural Network

When you have **50+ total datapoints:**

1. Click the purple button: **"🧠 TRAIN AI"**

2. **Watch the training progress:**
   ```
   🧠 Training AI... Do not close this page
   ```
   - Progress bar fills from 0% to 100%
   - Each epoch takes ~2-5 seconds
   - 50 epochs total = ~2-3 minutes

3. **Monitor the logs** (browser console, optional):
   ```
   Epoch 1/50: loss = 2.3142, accuracy = 0.25
   Epoch 5/50: loss = 1.2340, accuracy = 0.72
   Epoch 10/50: loss = 0.6234, accuracy = 0.89
   ...
   Epoch 50/50: loss = 0.0892, accuracy = 0.98
   ```

4. **Training complete:**
   ```
   ✅ Model Trained! Accuracy: High on 15 signs.
   ```

## Step 6: Download the Brain

Once training finishes:

1. Click the green button: **"💾 DOWNLOAD MODEL"**

2. Browser will download two files:
   - `lasu-sign-model.json` (config file, ~50KB)
   - `lasu-sign-model.weights.bin` (weights data, ~2-5MB)

3. **Save these files** somewhere you can access them

## Step 7: Deploy the Model

1. **Open your project files** (on your computer or in VS Code)

2. **Navigate to:** `public/` folder

3. **Create two new files in `/public/`:**
   - Rename `lasu-sign-model.json` → `model.json`
   - Rename `lasu-sign-model.weights.bin` → `weights.bin`
   - Upload both to `/public/`

4. **Folder structure should look like:**
   ```
   /public/
     ├── model.json          (newly uploaded)
     ├── weights.bin         (newly uploaded)
     ├── webgazer_src.js
     ├── mediapipe/
     │   └── face_mesh/
     └── ...
   ```

5. **Commit changes:**
   ```bash
   git add public/model.json public/weights.bin
   git commit -m "Add trained hand gesture model"
   git push
   ```

## Step 8: Test Your Model

1. **Restart your app** (Ctrl+C to stop dev server, then npm run dev)

2. **Navigate to:** `http://localhost:3000/dashboard/sign-language`

3. **Look for status:**
   ```
   👁️ Vision Engine 🧠
   ✅ Trained Model Active
   ```

4. **Make gestures in front of camera:**
   - Make the signs you trained
   - They should be recognized!
   - Confidence % should show (aim for >60%)

5. **Expected behavior:**
   ```
   Sign: SCROLL_UP
   Confidence: 89%

   [Text-to-speech reads]: "Scrolling up..."
   ```

---

## 🛠️ Troubleshooting

### Problem: "Studio Ready" but video is black
- ✅ **Fix:** Grant camera permission when browser asks
- ✅ **Fix:** Try a different browser (Chrome works best)
- ✅ **Fix:** Refresh the page

### Problem: "No hands detected" in video
- ✅ **Fix:** Ensure hand is visible to camera
- ✅ **Fix:** Make sure lighting is good
- ✅ **Fix:** Move hand closer to camera (30cm is ideal)

### Problem: Recording won't start
- ✅ **Fix:** Make sure hand is detected (green skeleton)
- ✅ **Fix:** Try clicking the button instead of holding

### Problem: Training fails after 5 epochs
- ✅ **Fix:** You need at least 50 datapoints total
- ✅ **Fix:** Record more signs or more examples per sign
- ✅ **Fix:** Check browser console for specific error

### Problem: Model downloads but doesn't load
- ✅ **Fix:** Verify files are in `/public/` folder
- ✅ **Fix:** Files must be named exactly `model.json` and `weights.bin`
- ✅ **Fix:** Restart the dev server after uploading

### Problem: High accuracy in training but predictions wrong in production
- ✅ **Fix:** Your recording hand position may differ from testing position
- ✅ **Fix:** Record more varied examples (different distances, angles)
- ✅ **Fix:** Make more distinct gestures (avoid similar-looking signs)

### Problem: "MediaPipe Hands failed to load"
- ✅ **Fix:** Check internet connection
- ✅ **Fix:** CDN may be temporarily down - try refreshing
- ✅ **Fix:** Clear browser cache (Ctrl+Shift+Delete)

---

## 📊 Success Criteria

Your model is working well when:
- ✅ Training accuracy > 90%
- ✅ Recognition confidence > 70% during testing
- ✅ Signs are recognized within 100-200ms
- ✅ False positives are rare (misidentifying signs)
- ✅ Works with hand at different distances from camera

---

## 🎯 Next Steps

After your first successful model:

1. **Add more signs** (50+)
2. **Fine-tune with difficult signs** (record more variations)
3. **Export for mobile** (convert to TensorFlow Lite)
4. **Create gesture combinations** (sequences of signs)
5. **Add confidence feedback** (improve lower-confidence signs)

---

## 📚 Reference

**File Locations:**
- Training UI: `src/components/Accessibility/SignTrainingStudio.tsx`
- Inference Engine: `src/components/Accessibility/SignInterpreter.tsx`
- Training Route: `src/app/admin/train/page.tsx`
- Demo Route: `src/app/dashboard/sign-language/page.tsx`
- Trained Model: `/public/model.json` + `/public/weights.bin`

**Technologies:**
- **TensorFlow.js**: Neural network training and inference
- **MediaPipe Hands**: Real-time hand pose detection (21 joints)
- **React**: UI and real-time updates
- **Next.js**: Routing and deployment

**Model Info:**
- Input: 63 features (21 joints × 3 axes, wrist-relative)
- Hidden layers: 128 → 64 → 32 neurons
- Output: N classes (one per sign trained)
- Training: 50 epochs, batch size 16

---

**Happy training! 🚀🤖**
