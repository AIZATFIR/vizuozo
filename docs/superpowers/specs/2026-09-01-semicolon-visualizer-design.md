# Design Specification: `;wave` (Semicolon Visualizer)

**Date:** 2026-09-01  
**Project:** `;wave` / `Semicolon Visualizer`  
**Status:** Approved by User  
**Target:** Web-first, PWA-ready, 60fps responsive interactive audio-visual environment  

---

## 1. Overview & Vision
`;wave` is an abstract, highly reactive music visualizer that transforms audio into an immersive living visual space. Rather than a technical waveform or audio analyzer dashboard, the canvas presents a fluid, dreamy, and physical visual world that responds organically to sound properties (bass, mids, treble, transients, RMS energy).

The interface adheres strictly to **"Less is More"**: the visualizer occupies 100vw × 100vh with no static navbars, cards, or control clutter. A floating picture-in-picture (PiP) controller handles playback controls and automatically hides during periods of user inactivity.

---

## 2. Visual Engine Architecture

### 2.1 Technology Stack
- **Three.js + WebGL 2 / Raw GLSL Shaders**: High-performance multi-layered shader rendering, particle simulations, and post-processing bloom.
- **Web Audio API**: Real-time frequency analysis (`AnalyserNode`, FFT 2048), frequency band separation, transient detection, and physical damping filters.
- **Vite + Vanilla TypeScript / CSS**: Lightweight, zero-bloat modern web framework ensuring ultra-fast load times and smooth 60fps execution.

### 2.2 Layered Rendering Model
1. **Layer 0 (Background & Deep Semicolon)**:
   - A deep, monumental `;` rendered at depth with subtle chromatic dispersion and audio-driven volumetric glow.
2. **Layer 1-3 (Multi-Layer Fluid & Organic Blobs)**:
   - Custom GLSL raymarching / noise shaders combining curl noise, simplex noise, and fluid viscosity (honey/watercolor translucency).
   - Bass drives physical volume displacement, mass inertia, and deep expansion.
   - Mids drive ribbon deformation, layered swirls, and harmonic color shifts.
3. **Layer 4 (Particle Field & Caustics)**:
   - GPU particle system with orbital vortexes, starry filaments, and reactive spark velocity driven by treble and transients.
4. **Layer 5 (Atmosphere & Post-Processing)**:
   - Soft pastel bloom, dreamlike chromatic aberration, and subtle filmic grain.

### 2.3 The 6 Visual Presets
1. **`Fluid` (Default)**: Organic liquid honey and pastel watercolor waves that expand with deep physical mass.
2. **`Dream`**: Ethereal, slow-drifting pastel gradients (lavender, cream, mint, peach) with soft floating ribbons.
3. **`Jannah`**: Abstract translucent mosque-like architectural arches, geometric light caustics, floating particles, and peaceful golden-hour pastel hues.
4. **`Rave`**: High-energy electric pastel ribbons, rapid transient ripples, particle bursts, and heightened responsiveness.
5. **`Cat`**: Minimalist, stylized audio-reactive cat silhouette bouncing to the groove, reacting to bass and treble.
6. **`Void`**: Deep cosmic monochrome & subtle iridescence with luminous particle vortexes and jets (matching user reference imagery) and the deep subtle `;`.

---

## 3. Audio Analysis Pipeline

```
Audio Source (Drop / Demo / Mic / Synth)
         ↓
    AudioContext
         ↓
     GainNode
         ↓
   AnalyserNode (FFT 2048)
         ↓
 ┌────────────────────────────────────────────────────────┐
 │ Frequency Band Analysis & Smoothing                    │
 │  - Bass (20 - 150 Hz)    → Large fluid scale & mass    │
 │  - Mids (150 - 2500 Hz)  → Ribbons & organic morphing  │
 │  - Treble (2500 - 16k Hz)→ Particles & caustics        │
 │  - RMS Energy            → Environmental luminescence  │
 │  - Transients / Beat     → Shockwave pulses & bloom    │
 └────────────────────────────────────────────────────────┘
         ↓
 Physical Damping & Inertia Engine (Mass, Momentum, Damping)
         ↓
  GLSL Shader Uniforms & Three.js Particle Buffers
```

### 3.1 Audio Sources
- **Local Audio Files**: Drag-and-drop or file picker for MP3, WAV, OGG, M4A, FLAC with ID3 tag parsing.
- **Built-in Curated Demo Tracks**: High quality ambient/chill/beat demo tracks loaded via AudioBuffer/MediaElement.
- **Microphone Live Input**: Real-time microphone input via `navigator.mediaDevices.getUserMedia()`.
- **Procedural Ambient Synth**: Web Audio oscillator/filter fallback drone for instant zero-dependency immersion.

---

## 4. UI & Interaction Design

### 4.1 Floating PiP Player
- **Expanded**: Compact glassmorphic capsule displaying artwork/orb, track name, artist, seek slider, play/pause, next/prev, source selector, and preset pills.
- **Collapsed**: Minimal glowing orb indicating playback state and audio energy.
- **Hidden / Auto-Fade**: Fades to 0% opacity after 2.5 seconds of mouse/touch inactivity. Instantly restores on pointer movement.

### 4.2 Controls & Shortcuts
- `Space`: Toggle Play / Pause
- `F` / Double-Click: Fullscreen toggle
- `1` - `6`: Instant visual preset selection
- `M`: Toggle microphone live stream
- `H`: Instantly toggle UI visibility
- `Esc`: Exit fullscreen / collapse player

---

## 5. Performance & Quality Targets
- Target 60 FPS on standard desktop and mobile hardware.
- Responsive DPR scaling (0.75x to 2x) based on frame rate monitoring (`Auto`, `High`, `Medium`, `Low`).
- Support `prefers-reduced-motion` with dampened velocities and simplified particle physics.
