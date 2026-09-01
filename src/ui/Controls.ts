import { AudioEngine } from '../audio/AudioEngine';
import { PiPPlayer } from '../player/PiPPlayer';
import { VisualPresetId } from '../types';

export class Controls {
  private audioEngine: AudioEngine;
  private pipPlayer: PiPPlayer;
  private idleTimer: number | null = null;
  private idleDelayMs = 2500;

  private fullscreenBtn: HTMLButtonElement;
  private shortcutsBtn: HTMLButtonElement;
  private shortcutsDialog: HTMLDialogElement;
  private closeDialogBtn: HTMLButtonElement;
  private canvasContainer: HTMLElement;

  private presetKeys: Record<string, VisualPresetId> = {
    '1': 'fluid',
    '2': 'dream',
    '3': 'jannah',
    '4': 'rave',
    '5': 'cat',
    '6': 'void'
  };

  constructor(audioEngine: AudioEngine, pipPlayer: PiPPlayer) {
    this.audioEngine = audioEngine;
    this.pipPlayer = pipPlayer;

    this.fullscreenBtn = document.getElementById('btn-fullscreen') as HTMLButtonElement;
    this.shortcutsBtn = document.getElementById('btn-shortcuts') as HTMLButtonElement;
    this.shortcutsDialog = document.getElementById('shortcuts-dialog') as HTMLDialogElement;
    this.closeDialogBtn = document.getElementById('btn-close-dialog') as HTMLButtonElement;
    this.canvasContainer = document.getElementById('canvas-container')!;

    this.bindEvents();
    this.startIdleTimer();
  }

  private bindEvents(): void {
    // Pointer movement resets idle timer
    const onActivity = () => {
      document.body.classList.remove('idle-hidden');
      this.startIdleTimer();
    };

    window.addEventListener('pointermove', onActivity);
    window.addEventListener('pointerdown', onActivity);
    window.addEventListener('keydown', onActivity);

    // Fullscreen toggle
    this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
    this.canvasContainer.addEventListener('dblclick', () => this.toggleFullscreen());

    // Shortcuts Modal
    this.shortcutsBtn.addEventListener('click', () => this.shortcutsDialog.showModal());
    this.closeDialogBtn.addEventListener('click', () => this.shortcutsDialog.close());
    this.shortcutsDialog.addEventListener('click', (e) => {
      if (e.target === this.shortcutsDialog) {
        this.shortcutsDialog.close();
      }
    });

    // Global Keydown shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        this.audioEngine.togglePlayPause();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        this.toggleFullscreen();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        if (this.audioEngine.getCurrentSourceType() === 'mic') {
          this.pipPlayer.setSource('demo');
        } else {
          this.pipPlayer.setSource('mic');
        }
      } else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        this.pipPlayer.toggleState();
      } else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        if (this.shortcutsDialog.open) {
          this.shortcutsDialog.close();
        } else {
          this.shortcutsDialog.showModal();
        }
      } else if (this.presetKeys[e.key]) {
        e.preventDefault();
        this.pipPlayer.setPreset(this.presetKeys[e.key]);
      }
    });
  }

  private startIdleTimer(): void {
    if (this.idleTimer) {
      window.clearTimeout(this.idleTimer);
    }
    this.idleTimer = window.setTimeout(() => {
      // Only hide if shortcuts dialog is not open
      if (!this.shortcutsDialog.open) {
        document.body.classList.add('idle-hidden');
      }
    }, this.idleDelayMs);
  }

  private toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        // Fullscreen could be blocked by browser policy
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }
}
