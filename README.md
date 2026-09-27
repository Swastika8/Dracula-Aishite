# Dracula • 愛して (Aishite) — Dual-World Audiovisual Installation

> **Project Status**: This project is actively in progress and will be made better soon, once the recipe is figured out and more sense-making transitions are added!

An experimental interactive audiovisual installation that blends two contrasting visual worlds driven by audio timeline synchronization:

1. **"Dracula" — Tame Impala** (Timestamp: `0:18` to `01:02`): A handmade paper-diorama world of deep twilight oceans, rising paper sun, warm daylight, descending dusk, paper moonrise, the Man in the Moon, and an accelerating glitch breakdown.
2. **"愛して愛して愛して (Aishite Aishite Aishite)" — Kikuo** (Timestamp: `03:02` to `03:28`): A theatrical, obsessive dark doll-world of crimson, magenta, and violet featuring real frame sequences, interactive 2D cursor eye tracking, drifting camellia petals, silk ribbons, a rebellious lagging mirror reflection, multiplied doll copies, and an ending void with glowing eyes that blink and fade to black.
3. **Glitch Transition Sequence**: Synchronized transition using a glitch sound effect with procedural VHS tearing, scanline distortion, blackout, and an expanding pink flare blooming into Aishite's world.

---

## ⚠️ Important Asset Notice (No Copyrighted Media in Repo)

To prevent copyright claims, **NO AUDIO OR VIDEO FILES ARE STORED IN THIS REPOSITORY**.

To run the installation with full sound and frame animations, you need to provide the media files locally.

### Required Audio Files:
Place the following three audio files in the `public/audio/` directory:

| Filename | Track / Audio Source | Segment Used | Notes |
| :--- | :--- | :--- | :--- |
| `public/audio/dracula.mp3` | **"Dracula"** by Tame Impala | `0:18` – `01:02` (44s duration) | Master clock for Section 1 |
| `public/audio/glitch.mp3` | **Glitch Sound Effect** | Full sound (~3.1s) | Triggers during the transition |
| `public/audio/aishite.mp3` | **"愛して愛して愛して"** by Kikuo | `03:02` – `03:28` (26s duration) | Master clock for Section 2 |

*(Synthetic fallback clocks and silent procedural animations will operate if audio files are not present, but real audio is recommended for the intended experience).*

### Required Image Frame Sequences:
Place your extracted animation frames in the `public/frames/` directory:

- **Dracula Frames**: `public/frames/dracula/ezgif-frame-001.jpg` through `ezgif-frame-300.jpg` (1920×1080)
- **Aishite Frames**: `public/frames/aishite/ezgif-frame-001.jpg` through `ezgif-frame-050.jpg` (1920×1080)

---

## Tech Stack
- **Framework**: React 18 + TypeScript + Vite 6
- **Styling**: Pure Vanilla CSS design system (zero Tailwind build dependency)
- **Audio & Timing**: HTML5 Audio API sampled via `requestAnimationFrame` for 60Hz timing precision + Web Audio API `AnalyserNode` for real-time bass/frequency energy detection
- **Graphics & Animation**: Dual-buffered HTML5 Canvas frame rendering with micro-crossfading, Ken Burns camera drift, and 2D cursor-tracking pupil overlays
- **Icons**: Lucide React

---

## Project Structure
```text
├── public/
│   ├── assets/
│   │   ├── left_iris.png       # Extracted pupil sprite for eye tracking
│   │   └── right_iris.png      # Extracted pupil sprite for eye tracking
│   ├── audio/                  # (Local audio files go here - ignored by git)
│   │   ├── dracula.mp3
│   │   ├── aishite.mp3
│   │   └── glitch.mp3
│   ├── frames/                 # (Local image sequences go here - ignored by git)
│   │   ├── dracula/
│   │   └── aishite/
│   └── favicon.svg             # Styled installation icon
├── src/
│   ├── types/
│   │   └── index.ts            # SongTimeline, Beat, LyricLine, and audio state types
│   ├── data/
│   │   └── timelineData.ts     # Pacing map & whisper-synchronized timeline metadata
│   ├── services/
│   │   ├── audioEngine.ts      # Audio engine with RAF polling & synthetic fallback
│   │   └── framePreloader.ts   # Sliding-window LRU image cache
│   ├── components/
│   │   ├── DraculaScene/
│   │   │   ├── DraculaScene.tsx   # Dracula scene container
│   │   │   └── DraculaCanvas.tsx  # Paper diorama canvas with shutter crossfade
│   │   ├── AishiteScene/
│   │   │   ├── AishiteScene.tsx        # Aishite scene container
│   │   │   ├── AishiteCanvas.tsx       # Doll world canvas with petals & ribbons
│   │   │   ├── EyeTrackerOverlay.tsx   # Interactive 2D cursor eye tracking
│   │   │   ├── CursedMirrorOverlay.tsx # Lagging mirror reflection
│   │   │   ├── DollClonesOverlay.tsx   # Multiplied doll copies
│   │   │   └── EndingVoid.tsx          # Pitch black void with blinking eyes
│   │   ├── TransitionOverlay.tsx       # Tearing, blackout & pink flare
│   │   ├── LandingScreen.tsx           # Minimal cinematic landing with ENTER button
│   │   └── ControlsOverlay.tsx         # Minimal auto-hiding playback controls
│   ├── App.tsx                 # Root coordinator & no-loop lifecycle reset
│   ├── index.css               # Vanilla CSS design system & CRT shaders
│   └── main.tsx                # Application entry point
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── .gitignore
```

---

## Getting Started

```bash
# 1. Clone repository
git clone https://github.com/Swastika8/Dracula-Aishite.git
cd Dracula-Aishite

# 2. Install dependencies
npm install

# 3. Add your media files into public/audio/ and public/frames/ (see instructions above)

# 4. Start local development server
npm run dev

# 5. Build for production (TypeScript check + Vite bundle)
npm run build

# 6. Preview production build
npm run preview
```

Open `http://localhost:5173` (or `http://localhost:4173` for preview).

---

## Interactive Controls
- **ENTER**: Starts the experience and unlocks browser audio.
- **Space**: Play / Pause.
- **M**: Mute / Unmute.
- **F**: Fullscreen toggle.
- **Left / Right Arrow**: Seek 3 seconds backward / forward.
- **Restart (Rotate Icon)**: Stops audio, resets timeline state, and returns cleanly to the initial Play/Enter screen.
- **Mouse Movement**: In Section 2, the doll girl's eyes continuously track the viewer's cursor across the screen.
- **Auto-Hide HUD**: Controls bar fades away after 1.8 seconds of mouse stillness to keep the artwork completely unobstructed.

---

## Pacing Map
- **Dracula**:
  - `0–15%`: Night / Opening (slow, atmospheric paper diorama)
  - `15–30%`: Sunrise (noticeably faster progression, ~12 FPS)
  - `30–50%`: Day (continuous, natural movement)
  - `50–65%`: Sunset (smooth cinematic twilight)
  - `65–78%`: Moonrise (atmospheric emerging moon)
  - `78–88%`: Man in the Moon (deliberate character acting)
  - `88–100%`: Glitch / Collapse (rapidly accelerating jitter, frame skipping, chromatic offset) -> Black
- **Aishite**:
  - Opening awakening -> Ribbons & camellias -> Cursed mirror -> Multiplicity -> Obsessive Climax -> The Final Gaze -> Blackout -> Clean return to landing screen (No automatic loop).
