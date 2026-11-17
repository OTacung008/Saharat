# Swallowed Gum — 3D short (Three.js)

A vertical (9:16), 20-second educational 3D animation: *what happens if you swallow gum*.
It has a stylized character, an English ElevenLabs voiceover, and word-by-word captions in the centre of the screen.

| Time | Shot |
|---|---|
| 0–3.45s | A boy in a park chews gum, swallows it, looks shocked |
| 3.45–7.3s | X-ray: the gum slides down the esophagus into the stomach |
| 7.3–11.7s | Inside the stomach: acid dissolves food, but not the gum |
| 11.7–16.8s | X-ray: the gum travels through the intestines and out |
| 16.8–20s | Back to the boy, relieved: "Not seven years!" |

- `voiceover_raw.mp3`: the ElevenLabs take. `make_timing.py` splits it into phrases, places them on the timeline (`voiceover.wav` / `.mp3`) and writes per-word timings (`words.json`, pasted into `index.html`).
- `index.html`: open over http and tap to play with sound.
- `render.mjs`: renders `swallow-gum.mp4` (1080×1920, 30 fps) with the audio, using Playwright and ffmpeg.
