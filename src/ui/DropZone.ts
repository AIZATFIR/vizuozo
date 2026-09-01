import { AudioEngine } from '../audio/AudioEngine';
import { PiPPlayer } from '../player/PiPPlayer';

export class DropZone {
  private dropZoneEl: HTMLElement;
  private audioEngine: AudioEngine;
  private pipPlayer: PiPPlayer;
  private dragCounter = 0;

  constructor(audioEngine: AudioEngine, pipPlayer: PiPPlayer) {
    this.audioEngine = audioEngine;
    this.pipPlayer = pipPlayer;
    this.dropZoneEl = document.getElementById('drop-zone')!;

    this.bindEvents();
  }

  private bindEvents(): void {
    window.addEventListener('dragenter', (e) => {
      e.preventDefault();
      this.dragCounter++;
      this.dropZoneEl.classList.remove('hidden');
    });

    window.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    window.addEventListener('dragleave', (e) => {
      e.preventDefault();
      this.dragCounter--;
      if (this.dragCounter <= 0) {
        this.dragCounter = 0;
        this.dropZoneEl.classList.add('hidden');
      }
    });

    window.addEventListener('drop', (e) => {
      e.preventDefault();
      this.dragCounter = 0;
      this.dropZoneEl.classList.add('hidden');

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|flac|aac)$/i.test(file.name)) {
          this.audioEngine.loadAudioFile(file);
          this.pipPlayer.setSource('file');
        }
      }
    });
  }
}
