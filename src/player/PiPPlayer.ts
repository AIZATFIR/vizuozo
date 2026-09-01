import { AudioEngine } from '../audio/AudioEngine';
import { VisualEngine } from '../visual/VisualEngine';
import { AudioSourceType, PiPState, PlayerState, TrackInfo, VisualPresetId } from '../types';

export class PiPPlayer {
  private audioEngine: AudioEngine;
  private visualEngine: VisualEngine;
  private state: PiPState = 'expanded';

  // DOM Elements
  private playerEl: HTMLElement;
  private collapsedOrbBtn: HTMLButtonElement;
  private collapseBtn: HTMLButtonElement;
  private playPauseBtn: HTMLButtonElement;
  private iconPlay: SVGElement;
  private iconPause: SVGElement;
  private prevBtn: HTMLButtonElement;
  private nextBtn: HTMLButtonElement;
  private volumeBtn: HTMLButtonElement;
  private volumeSlider: HTMLInputElement;
  private seekSlider: HTMLInputElement;
  private progressFill: HTMLElement;
  private timeCurrentEl: HTMLElement;
  private timeTotalEl: HTMLElement;
  private trackTitleEl: HTMLElement;
  private trackArtistEl: HTMLElement;

  // Source Buttons
  private srcDemoBtn: HTMLButtonElement;
  private srcSynthBtn: HTMLButtonElement;
  private srcMicBtn: HTMLButtonElement;
  private fileInput: HTMLInputElement;

  // Preset Buttons
  private presetButtons: NodeListOf<HTMLButtonElement>;

  constructor(audioEngine: AudioEngine, visualEngine: VisualEngine) {
    this.audioEngine = audioEngine;
    this.visualEngine = visualEngine;

    this.playerEl = document.getElementById('pip-player')!;
    this.collapsedOrbBtn = document.getElementById('pip-collapsed-view') as HTMLButtonElement;
    this.collapseBtn = document.getElementById('btn-collapse-pip') as HTMLButtonElement;
    this.playPauseBtn = document.getElementById('btn-play-pause') as HTMLButtonElement;
    this.iconPlay = document.getElementById('icon-play') as unknown as SVGElement;
    this.iconPause = document.getElementById('icon-pause') as unknown as SVGElement;
    this.prevBtn = document.getElementById('btn-prev') as HTMLButtonElement;
    this.nextBtn = document.getElementById('btn-next') as HTMLButtonElement;
    this.volumeBtn = document.getElementById('btn-volume') as HTMLButtonElement;
    this.volumeSlider = document.getElementById('volume-slider') as HTMLInputElement;
    this.seekSlider = document.getElementById('seek-slider') as HTMLInputElement;
    this.progressFill = document.getElementById('progress-fill')!;
    this.timeCurrentEl = document.getElementById('time-current')!;
    this.timeTotalEl = document.getElementById('time-total')!;
    this.trackTitleEl = document.getElementById('track-title')!;
    this.trackArtistEl = document.getElementById('track-artist')!;

    this.srcDemoBtn = document.getElementById('src-demo') as HTMLButtonElement;
    this.srcSynthBtn = document.getElementById('src-synth') as HTMLButtonElement;
    this.srcMicBtn = document.getElementById('src-mic') as HTMLButtonElement;
    this.fileInput = document.getElementById('file-input') as HTMLInputElement;

    this.presetButtons = document.querySelectorAll('.btn-preset');

    this.bindEvents();
    this.bindAudioListeners();
  }

  private bindEvents(): void {
    // Play / Pause
    this.playPauseBtn.addEventListener('click', () => {
      this.audioEngine.togglePlayPause();
    });

    // Prev / Next
    this.prevBtn.addEventListener('click', () => this.audioEngine.prevTrack());
    this.nextBtn.addEventListener('click', () => this.audioEngine.nextTrack());

    // Expand / Collapse Orb
    this.collapsedOrbBtn.addEventListener('click', () => this.setState('expanded'));
    this.collapseBtn.addEventListener('click', () => this.setState('collapsed'));

    // Seeking
    this.seekSlider.addEventListener('input', (e) => {
      const val = parseFloat((e.target as HTMLInputElement).value);
      this.progressFill.style.width = `${val}%`;
      this.audioEngine.seek(val / 100);
    });

    // Volume
    this.volumeSlider.addEventListener('input', (e) => {
      const val = parseFloat((e.target as HTMLInputElement).value);
      this.audioEngine.setVolume(val);
    });

    this.volumeBtn.addEventListener('click', () => {
      const muted = this.audioEngine.toggleMute();
      this.volumeSlider.value = muted ? '0' : this.audioEngine.getVolume().toString();
    });

    // Source Switching
    this.srcDemoBtn.addEventListener('click', () => this.setSource('demo'));
    this.srcSynthBtn.addEventListener('click', () => this.setSource('synth'));
    this.srcMicBtn.addEventListener('click', () => this.setSource('mic'));

    this.fileInput.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        this.audioEngine.loadAudioFile(file);
        this.setSource('file');
      }
    });

    // Preset Switching
    this.presetButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const presetId = btn.dataset.preset as VisualPresetId;
        if (presetId) {
          this.setPreset(presetId);
        }
      });
    });
  }

  private bindAudioListeners(): void {
    this.audioEngine.onStateChange((state: PlayerState) => {
      if (state === 'playing') {
        this.iconPlay.classList.add('hidden');
        this.iconPause.classList.remove('hidden');
      } else {
        this.iconPlay.classList.remove('hidden');
        this.iconPause.classList.add('hidden');
      }
    });

    this.audioEngine.onTrackChange((track: TrackInfo) => {
      this.trackTitleEl.textContent = track.title;
      this.trackArtistEl.textContent = track.artist;
      this.timeTotalEl.textContent = this.formatTime(track.duration);
    });

    this.audioEngine.onTimeUpdate((current: number, total: number) => {
      this.timeCurrentEl.textContent = this.formatTime(current);
      if (total > 0) {
        const percent = (current / total) * 100;
        this.seekSlider.value = percent.toString();
        this.progressFill.style.width = `${percent}%`;
        this.timeTotalEl.textContent = this.formatTime(total);
      }
    });
  }

  public setState(state: PiPState): void {
    this.state = state;
    this.playerEl.classList.remove('expanded', 'collapsed', 'hidden');
    this.playerEl.classList.add(state);
  }

  public toggleState(): void {
    if (this.state === 'expanded') {
      this.setState('collapsed');
    } else {
      this.setState('expanded');
    }
  }

  public setSource(source: AudioSourceType): void {
    this.srcDemoBtn.classList.toggle('active', source === 'demo');
    this.srcSynthBtn.classList.toggle('active', source === 'synth');
    this.srcMicBtn.classList.toggle('active', source === 'mic');
    const uploadLabel = document.getElementById('src-file-label');
    uploadLabel?.classList.toggle('active', source === 'file');

    if (source !== 'file') {
      this.audioEngine.setSourceType(source);
    }
  }

  public setPreset(id: VisualPresetId): void {
    this.visualEngine.setPreset(id);
    this.presetButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.preset === id);
    });
  }

  private formatTime(sec: number): string {
    if (isNaN(sec) || sec <= 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }
}
