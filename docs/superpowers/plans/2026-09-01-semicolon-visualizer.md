# `;wave` (Semicolon Visualizer) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `;wave`, an abstract, highly reactive 60fps music visualizer web application featuring multi-layered GLSL fluid shaders, cosmic particle caustics, a deep hidden `;` signature, 6 distinct presets, Web Audio frequency/beat analysis, demo tracks + ambient procedural synth + mic input, and an auto-fading glassmorphic floating PiP player.

**Architecture:** Vite + TypeScript + Three.js + Web Audio API + custom GLSL raymarched fluid/particle shaders. Audio data is analyzed in real-time, mapped through physical mass/inertia damping, and fed directly to shader uniforms and GPU particle buffers. The UI is a zero-clutter 100vw × 100vh canvas with a floating, auto-hiding PiP player.

**Tech Stack:** Vite, TypeScript, Three.js, Web Audio API, Vanilla CSS, Vitest (for audio math & state testing).

## Global Constraints
- Canvas MUST occupy 100vw × 100vh with no static navbars, cards, or permanent dashboard clutter.
- UI MUST auto-fade after 2.5s of pointer inactivity.
- Deep Semicolon `;` MUST be integrated into the shader depth layer organically.
- Audio analysis MUST smoothly map Bass, Mids, Treble, RMS Energy, and Beat Transients without erratic flashing.
- 6 visual presets MUST be fully supported: `Fluid`, `Dream`, `Jannah`, `Rave`, `Cat`, `Void`.
- Must support drag-and-drop audio files, curated demo tracks, ambient synth generator, and live microphone input.

---

### Task 1: Project Scaffolding, Build Setup & Core Type System

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/types/index.ts`
- Test: `tests/types.test.ts`

**Interfaces:**
- Produces: `AudioMetrics`, `VisualPreset`, `QualityLevel`, `PlayerState`, `Track` interfaces used across audio and visual engines.

- [ ] **Step 1: Write the type verification test**
- [ ] **Step 2: Run test to verify setup**
- [ ] **Step 3: Implement Vite config, package.json, TypeScript config, and `src/types/index.ts`**
- [ ] **Step 4: Install dependencies (`three`, `@types/three`, `vite`, `typescript`, `vitest`)**
- [ ] **Step 5: Run tests and verify build config**
- [ ] **Step 6: Commit**

---

### Task 2: Audio Engine & Signal Analysis Pipeline

**Files:**
- Create: `src/audio/AudioAnalyzer.ts`
- Create: `src/audio/AudioEngine.ts`
- Create: `src/audio/SynthGenerator.ts`
- Create: `src/audio/DemoTracks.ts`
- Test: `tests/audioAnalyzer.test.ts`

**Interfaces:**
- Consumes: `AudioMetrics`, `PlayerState` from `src/types/index.ts`.
- Produces: `AudioEngine` class with `init()`, `play()`, `pause()`, `loadSource(file/url)`, `startMic()`, `getMetrics(): AudioMetrics`, `onMetricsUpdate(cb)`.

- [ ] **Step 1: Write tests for AudioAnalyzer frequency separation and exponential smoothing**
- [ ] **Step 2: Run tests to verify failure**
- [ ] **Step 3: Implement AudioAnalyzer (FFT 2048, Bass 20-150Hz, Mids 150-2500Hz, Treble 2500-16kHz, energy, beat transients)**
- [ ] **Step 4: Implement SynthGenerator (procedural harmonic ambient chords & drone for immediate music)**
- [ ] **Step 5: Implement AudioEngine (file drop, demo tracks, mic input, synth fallback)**
- [ ] **Step 6: Run tests and verify audio analysis algorithms**
- [ ] **Step 7: Commit**

---

### Task 3: Custom GLSL Shaders & Fluid / Particle Depth Pipeline

**Files:**
- Create: `src/visual/shaders/fluidShaders.ts`
- Create: `src/visual/shaders/particleShaders.ts`
- Create: `src/visual/shaders/semicolonGlyph.ts`
- Test: `tests/shaders.test.ts`

**Interfaces:**
- Consumes: `AudioMetrics` from `src/audio/AudioEngine`.
- Produces: Shader material definitions (`FluidMaterial`, `ParticleMaterial`) accepting uniforms for time, resolution, audio metrics, color palettes, and deep semicolon mask.

- [ ] **Step 1: Write shader uniform validation test**
- [ ] **Step 2: Implement multi-layered fluid GLSL fragment shader (simplex/curl noise, liquid honey viscosity, chromatic dispersion)**
- [ ] **Step 3: Implement GPU particle vortex shader (point caustics, sparks, jet filaments matching reference imagery)**
- [ ] **Step 4: Implement deep semicolon shader distance field & architectural arch caustics**
- [ ] **Step 5: Run tests to ensure valid shader string compilation**
- [ ] **Step 6: Commit**

---

### Task 4: Visual Engine & 6 Presets (`Fluid`, `Dream`, `Jannah`, `Rave`, `Cat`, `Void`)

**Files:**
- Create: `src/visual/VisualEngine.ts`
- Create: `src/visual/CatMesh.ts`
- Create: `src/visual/presets/index.ts`
- Test: `tests/visualEngine.test.ts`

**Interfaces:**
- Consumes: `AudioEngine`, `AudioMetrics`, shader materials.
- Produces: `VisualEngine` instance managing Three.js canvas, DPR quality scaling, preset morphing, and 60fps render loop.

- [ ] **Step 1: Write preset configuration test**
- [ ] **Step 2: Implement preset parameter profiles (palettes, noise octaves, particle count, reactive sensitivity)**
- [ ] **Step 3: Implement CatMesh (stylized audio-reactive geometric cat for Cat Rave mode)**
- [ ] **Step 4: Implement VisualEngine with Three.js scene, camera, resize handler, and physical inertia update loop**
- [ ] **Step 5: Run tests and verify engine state transitions**
- [ ] **Step 6: Commit**

---

### Task 5: Glassmorphic Floating PiP Player & Minimal UI System

**Files:**
- Create: `src/style.css`
- Create: `src/player/PiPPlayer.ts`
- Create: `src/ui/DropZone.ts`
- Create: `src/ui/Controls.ts`
- Modify: `index.html`
- Modify: `src/main.ts`

**Interfaces:**
- Consumes: `AudioEngine`, `VisualEngine`, `PlayerState`.
- Produces: Complete browser interface with floating PiP, drag-and-drop, keyboard shortcuts, auto-hide timer, and fullscreen management.

- [ ] **Step 1: Implement `src/style.css` with luxury dark glassmorphism, smooth animations, and hidden cursors**
- [ ] **Step 2: Implement `PiPPlayer.ts` (Expanded capsule, Collapsed glowing orb, seek scrubber, track title, presets)**
- [ ] **Step 3: Implement `DropZone.ts` (smooth drag overlay for MP3/WAV/OGG/M4A/FLAC)**
- [ ] **Step 4: Implement `Controls.ts` (shortcuts `Space`, `F`, `1`-`6`, `M`, `H`, mouse idle auto-fade)**
- [ ] **Step 5: Connect `main.ts` with all systems and default autoplay/demo track initialization**
- [ ] **Step 6: Commit**

---

### Task 6: End-to-End Verification & Aesthetic Polish

**Files:**
- Modify: `src/visual/VisualEngine.ts`
- Modify: `src/style.css`
- Verify in browser subagent

- [ ] **Step 1: Run full automated test suite**
- [ ] **Step 2: Launch Vite dev server and test live audio reactivity across all 6 presets**
- [ ] **Step 3: Verify PiP expand/collapse/hide behavior, file drop, mic toggle, and fullscreen**
- [ ] **Step 4: Verify 60fps performance and DPR auto-scaling**
- [ ] **Step 5: Commit final polish**
