import './style.css';
import { VisualEngine } from './visual/VisualEngine';
import { AudioEngine } from './audio/AudioEngine';
import { PiPPlayer } from './player/PiPPlayer';
import { DropZone } from './ui/DropZone';
import { Controls } from './ui/Controls';

function bootstrap(): void {
  const container = document.getElementById('canvas-container')!;
  
  // 1. Initialize Visual & Audio Engines
  const visualEngine = new VisualEngine(container);
  const audioEngine = new AudioEngine();

  // 2. Initialize UI Components
  const pipPlayer = new PiPPlayer(audioEngine, visualEngine);
  new DropZone(audioEngine, pipPlayer);
  new Controls(audioEngine, pipPlayer);

  // 3. Main 60fps Audio-Visual Render Loop
  function animate(): void {
    requestAnimationFrame(animate);
    const metrics = audioEngine.getMetrics();
    visualEngine.render(metrics);
  }

  animate();

  // Optional: Auto-unlock AudioContext on first user interaction anywhere
  const unlockAudio = () => {
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('pointerdown', unlockAudio);
  window.addEventListener('keydown', unlockAudio);
}

// Start application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
