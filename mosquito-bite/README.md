# Mosquito Bite — 3D short (Three.js)

A vertical (9:16), 20-second educational 3D animation: *what happens when a mosquito bites you*.
Everything is procedural Three.js: no models or image files. Captions are in Thai.

| Time | Shot |
|---|---|
| 0–3.2s | Mosquito flies in and lands on the arm |
| 3.2–6.2s | Macro: the proboscis pierces the skin |
| 6.2–14.2s | Skin cross-section: probing for a capillary, saliva, blood sucked up |
| 14.2–16.6s | The abdomen swells with blood |
| 16.6–20s | It flies away; a red, itchy bump rises |

## View
Open `index.html` in a browser served over http (e.g. `npx serve .`). Tap to pause or resume.

## Render to MP4 (1080×1920, 30 fps)
```bash
npm i three@0.170.0 playwright   # ffmpeg must be installed
node render.mjs mosquito-bite.mp4
```
