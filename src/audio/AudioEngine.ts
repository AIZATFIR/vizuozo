import { AudioAnalyzer } from './AudioAnalyzer';
import { SynthGenerator } from './SynthGenerator';
import { DEMO_TRACKS, generateBeatBuffer } from './DemoTracks';
import { AudioMetrics, AudioSourceType, PlayerState, TrackInfo } from '../types';

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private analyzer: AudioAnalyzer | null = null;
  private synth: SynthGenerator | null = null;

  // Active audio nodes
  private audioElement: HTMLAudioElement | null = null;
  private audioBufferSource: AudioBufferSourceNode | null = null;
  private audioBuffer: AudioBuffer | null = null;
  private micStream: MediaStream | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;

  // Track & State
  private currentSourceType: AudioSourceType = 'demo';
  private currentDemoIndex = 0;
  private playerState: PlayerState = 'stopped';
  private currentTrack: TrackInfo = { ...DEMO_TRACKS[0] };
  private volume = 0.8;
  private isMuted = false;

  // Timing tracking for AudioBuffer playback
  private bufferStartTime = 0;
  private bufferPauseOffset = 0;

  // Event Listeners
  private onStateChangeListeners: ((state: PlayerState) => void)[] = [];
  private onTrackChangeListeners: ((track: TrackInfo) => void)[] = [];
  private onTimeUpdateListeners: ((current: number, total: number) => void)[] = [];

  constructor() {
    // Lazy AudioContext initialization on first user interaction
  }

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);

      this.analyserNode = this.ctx.createAnalyser();
      this.analyserNode.fftSize = 2048;

      // Connect Gain -> Analyser -> Output
      this.gainNode.connect(this.analyserNode);
      this.analyserNode.connect(this.ctx.destination);

      this.analyzer = new AudioAnalyzer(this.analyserNode, this.ctx.sampleRate);
      this.synth = new SynthGenerator(this.ctx, this.gainNode);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    return this.ctx;
  }

  public getMetrics(): AudioMetrics {
    if (!this.analyzer) {
      const emptyArray = new Uint8Array(1024);
      return {
        energy: 0,
        bass: 0,
        mids: 0,
        treble: 0,
        transient: 0,
        rawEnergy: 0,
        frequencyData: emptyArray,
        timeDomainData: emptyArray
      };
    }
    return this.analyzer.analyze();
  }

  public async play(): Promise<void> {
    const ctx = this.ensureContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    if (this.currentSourceType === 'synth') {
      this.synth?.start();
      this.setPlayerState('playing');
      return;
    }

    if (this.currentSourceType === 'demo') {
      const demo = DEMO_TRACKS[this.currentDemoIndex];
      if (demo.type === 'synth') {
        this.synth?.start();
        this.setPlayerState('playing');
        return;
      }

      if (demo.type === 'generated-beat') {
        if (!this.audioBuffer) {
          this.audioBuffer = generateBeatBuffer(ctx, 24, demo.tempo || 100);
        }
        this.playBuffer(this.audioBuffer, this.bufferPauseOffset);
        this.setPlayerState('playing');
        return;
      }
    }

    if (this.currentSourceType === 'file') {
      if (this.audioElement) {
        await this.audioElement.play();
        this.setPlayerState('playing');
      } else if (this.audioBuffer) {
        this.playBuffer(this.audioBuffer, this.bufferPauseOffset);
        this.setPlayerState('playing');
      }
      return;
    }

    if (this.currentSourceType === 'mic') {
      this.setPlayerState('playing');
    }
  }

  public pause(): void {
    if (this.currentSourceType === 'synth' || (this.currentSourceType === 'demo' && DEMO_TRACKS[this.currentDemoIndex].type === 'synth')) {
      this.synth?.stop();
    } else if (this.audioElement) {
      this.audioElement.pause();
    } else if (this.audioBufferSource) {
      try {
        if (this.ctx) {
          this.bufferPauseOffset = (this.ctx.currentTime - this.bufferStartTime) % (this.audioBuffer?.duration || 1);
        }
        this.audioBufferSource.stop();
        this.audioBufferSource.disconnect();
      } catch {
        // source already stopped
      }
      this.audioBufferSource = null;
    }

    this.setPlayerState('paused');
  }

  public togglePlayPause(): void {
    if (this.playerState === 'playing') {
      this.pause();
    } else {
      this.play();
    }
  }

  private playBuffer(buffer: AudioBuffer, offsetSec = 0): void {
    if (!this.ctx || !this.gainNode) return;

    if (this.audioBufferSource) {
      try {
        this.audioBufferSource.stop();
        this.audioBufferSource.disconnect();
      } catch {
        // ignore
      }
      this.audioBufferSource = null;
    }

    this.audioBufferSource = this.ctx.createBufferSource();
    this.audioBufferSource.buffer = buffer;
    this.audioBufferSource.loop = true;
    this.audioBufferSource.connect(this.gainNode);

    const safeOffset = offsetSec % buffer.duration;
    this.bufferStartTime = this.ctx.currentTime - safeOffset;
    this.audioBufferSource.start(0, safeOffset);
  }

  public async loadDemoTrack(index: number): Promise<void> {
    this.stopAll();
    this.currentSourceType = 'demo';
    this.currentDemoIndex = (index + DEMO_TRACKS.length) % DEMO_TRACKS.length;
    const demo = DEMO_TRACKS[this.currentDemoIndex];

    this.currentTrack = { ...demo };
    this.notifyTrackChange();

    this.audioBuffer = null;
    this.bufferPauseOffset = 0;

    await this.play();
  }

  public nextTrack(): void {
    this.loadDemoTrack(this.currentDemoIndex + 1);
  }

  public prevTrack(): void {
    this.loadDemoTrack(this.currentDemoIndex - 1);
  }

  public async setSourceType(type: AudioSourceType): Promise<void> {
    if (type === this.currentSourceType && this.playerState === 'playing') return;
    this.stopAll();
    this.currentSourceType = type;

    if (type === 'demo') {
      await this.loadDemoTrack(this.currentDemoIndex);
    } else if (type === 'synth') {
      this.currentTrack = {
        id: 'synth-drone',
        title: 'Procedural Dream Synth',
        artist: 'Living Harmonics',
        duration: 3600,
        currentTime: 0,
        sourceType: 'synth'
      };
      this.notifyTrackChange();
      await this.play();
    } else if (type === 'mic') {
      await this.startMicrophone();
    }
  }

  public async loadAudioFile(file: File): Promise<void> {
    this.stopAll();
    this.currentSourceType = 'file';
    const ctx = this.ensureContext();

    const title = file.name.replace(/\.[^/.]+$/, '');
    this.currentTrack = {
      id: 'file-' + Date.now(),
      title: title,
      artist: 'Local Audio File',
      duration: 0,
      currentTime: 0,
      sourceType: 'file'
    };
    this.notifyTrackChange();

    try {
      const arrayBuffer = await file.arrayBuffer();
      const decodedBuffer = await ctx.decodeAudioData(arrayBuffer);
      this.audioBuffer = decodedBuffer;
      this.currentTrack.duration = decodedBuffer.duration;
      this.notifyTrackChange();
      this.playBuffer(decodedBuffer, 0);
      this.setPlayerState('playing');
    } catch (err) {
      console.warn('Fallback to HTMLAudioElement for file decode', err);
      const url = URL.createObjectURL(file);
      this.setupAudioElement(url);
      await this.play();
    }
  }

  private setupAudioElement(url: string): void {
    if (!this.gainNode) return;
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
    }

    this.audioElement = new Audio(url);
    this.audioElement.crossOrigin = 'anonymous';

    const sourceNode = this.ctx?.createMediaElementSource(this.audioElement);
    sourceNode?.connect(this.gainNode);

    this.audioElement.addEventListener('loadedmetadata', () => {
      if (this.audioElement) {
        this.currentTrack.duration = this.audioElement.duration;
        this.notifyTrackChange();
      }
    });

    this.audioElement.addEventListener('timeupdate', () => {
      if (this.audioElement) {
        this.currentTrack.currentTime = this.audioElement.currentTime;
        this.notifyTimeUpdate(this.audioElement.currentTime, this.audioElement.duration);
      }
    });

    this.audioElement.addEventListener('ended', () => {
      this.nextTrack();
    });
  }

  public async startMicrophone(): Promise<void> {
    this.stopAll();
    this.currentSourceType = 'mic';
    const ctx = this.ensureContext();

    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      this.micSource = ctx.createMediaStreamSource(this.micStream);
      
      // For mic, we connect only to analyser (NOT to ctx.destination or speakers to prevent feedback loop!)
      if (this.analyserNode) {
        this.micSource.connect(this.analyserNode);
      }

      this.currentTrack = {
        id: 'live-mic',
        title: 'Live Audio Input',
        artist: 'Microphone Stream',
        duration: 0,
        currentTime: 0,
        sourceType: 'mic'
      };
      this.notifyTrackChange();
      this.setPlayerState('playing');
    } catch (err) {
      console.error('Microphone access denied or error:', err);
      this.setSourceType('demo');
    }
  }

  public stopAll(): void {
    this.synth?.stop();
    if (this.audioBufferSource) {
      try {
        this.audioBufferSource.stop();
        this.audioBufferSource.disconnect();
      } catch {
        // ignore
      }
      this.audioBufferSource = null;
    }
    if (this.audioElement) {
      this.audioElement.pause();
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach(t => t.stop());
      this.micStream = null;
      this.micSource?.disconnect();
      this.micSource = null;
    }
    this.analyzer?.reset();
    this.setPlayerState('stopped');
  }

  public seek(progressRatio: number): void {
    const ratio = Math.max(0, Math.min(1, progressRatio));
    if (this.audioElement && this.audioElement.duration) {
      this.audioElement.currentTime = ratio * this.audioElement.duration;
    } else if (this.audioBuffer) {
      const targetSec = ratio * this.audioBuffer.duration;
      this.bufferPauseOffset = targetSec;
      if (this.playerState === 'playing') {
        this.playBuffer(this.audioBuffer, targetSec);
      }
    }
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.gainNode && this.ctx && !this.isMuted) {
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getVolume(): number {
    return this.volume;
  }

  public getPlayerState(): PlayerState {
    return this.playerState;
  }

  public getCurrentTrack(): TrackInfo {
    return this.currentTrack;
  }

  public getCurrentSourceType(): AudioSourceType {
    return this.currentSourceType;
  }

  private setPlayerState(state: PlayerState): void {
    this.playerState = state;
    this.onStateChangeListeners.forEach(cb => cb(state));
  }

  public onStateChange(cb: (state: PlayerState) => void): void {
    this.onStateChangeListeners.push(cb);
  }

  public onTrackChange(cb: (track: TrackInfo) => void): void {
    this.onTrackChangeListeners.push(cb);
  }

  public onTimeUpdate(cb: (current: number, total: number) => void): void {
    this.onTimeUpdateListeners.push(cb);
  }

  private notifyTrackChange(): void {
    this.onTrackChangeListeners.forEach(cb => cb(this.currentTrack));
  }

  private notifyTimeUpdate(current: number, total: number): void {
    this.onTimeUpdateListeners.forEach(cb => cb(current, total));
  }
}
