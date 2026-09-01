export interface AudioMetrics {
  energy: number;      // Normalized 0..1 overall smoothed RMS
  bass: number;        // Normalized 0..1 low frequency energy (20-150Hz)
  mids: number;        // Normalized 0..1 mid frequency energy (150-2500Hz)
  treble: number;      // Normalized 0..1 high frequency energy (2500-16000Hz)
  transient: number;   // Normalized 0..1 sharp transient/beat spike
  rawEnergy: number;   // Raw instant energy before heavy damping
  frequencyData: Uint8Array;
  timeDomainData: Uint8Array;
}

export type VisualPresetId = 'fluid' | 'dream' | 'jannah' | 'rave' | 'cat' | 'void';

export interface ColorStop {
  r: number;
  g: number;
  b: number;
}

export interface PresetPalette {
  primary: [number, number, number];
  secondary: [number, number, number];
  accent: [number, number, number];
  background: [number, number, number];
  glow: [number, number, number];
}

export interface VisualPresetConfig {
  id: VisualPresetId;
  name: string;
  subtitle: string;
  description: string;
  palette: PresetPalette;
  fluidScale: number;
  fluidSpeed: number;
  fluidViscosity: number;
  particleCount: number;
  particleSpeed: number;
  particleSize: number;
  semicolonVisibility: number;
  bloomIntensity: number;
  chromaticAberration: number;
  noiseOctaves: number;
  archPresence: number;      // Specific to Jannah architecture caustics
  catPresence: number;       // Specific to Cat Rave
  vortexStrength: number;    // Specific to Void & cosmic vortex
}

export type AudioSourceType = 'file' | 'demo' | 'mic' | 'synth';

export type QualityLevel = 'auto' | 'high' | 'medium' | 'low';

export type PlayerState = 'playing' | 'paused' | 'stopped';

export type PiPState = 'expanded' | 'collapsed' | 'hidden';

export interface TrackInfo {
  id: string;
  title: string;
  artist: string;
  duration: number;
  currentTime: number;
  src?: string;
  sourceType: AudioSourceType;
}
