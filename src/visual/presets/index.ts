import { VisualPresetConfig, VisualPresetId } from '../../types';

export const PRESETS: Record<VisualPresetId, VisualPresetConfig> = {
  void: {
    id: 'void',
    name: 'Ring',
    subtitle: 'Glowing Photon Ring & Filament (Gambar 3)',
    description: 'Tilted starlight photon ring with inner lightning tendril in absolute pitch black void.',
    palette: {
      primary: [0.95, 0.96, 1.0],      // Pure starlight silver-white
      secondary: [0.70, 0.75, 0.85],   // Faint nebular silver
      accent: [1.0, 1.0, 1.0],         // Blazing white hot core
      background: [0.0, 0.0, 0.0],     // Pure pitch black
      glow: [0.98, 0.98, 1.0]          // Blinding white additive glow
    },
    fluidScale: 1.0,
    fluidSpeed: 0.3,
    fluidViscosity: 2.5,
    particleCount: 10000,
    particleSpeed: 0.45,
    particleSize: 1.8,
    semicolonVisibility: 0.0,
    bloomIntensity: 0.8,
    chromaticAberration: 0.0,
    noiseOctaves: 2.0,
    archPresence: 0.0,
    catPresence: 0.0,
    vortexStrength: 1.0
  },

  jannah: {
    id: 'jannah',
    name: 'Arch',
    subtitle: 'Arched Cradle with 45° Antenna (Gambar 1 & 2)',
    description: 'Arched saddle bridge with sharp diagonal antenna needle jet shooting towards top-right.',
    palette: {
      primary: [0.96, 0.96, 1.0],      // Pure white starlight
      secondary: [0.75, 0.80, 0.90],   // Fine stardust silver
      accent: [1.0, 1.0, 1.0],         // Blazing white needle core
      background: [0.0, 0.0, 0.0],     // Pure black
      glow: [1.0, 1.0, 1.0]            // Pure white glow
    },
    fluidScale: 1.0,
    fluidSpeed: 0.3,
    fluidViscosity: 2.0,
    particleCount: 10000,
    particleSpeed: 0.4,
    particleSize: 1.8,
    semicolonVisibility: 0.0,
    bloomIntensity: 0.85,
    chromaticAberration: 0.0,
    noiseOctaves: 2.0,
    archPresence: 1.0,
    catPresence: 0.0,
    vortexStrength: 0.7
  },

  fluid: {
    id: 'fluid',
    name: 'Lobe',
    subtitle: 'Double-Lobe Hourglass Caustic (Gambar 4)',
    description: 'Dual kidney lobes with central singularity pinch, dense crescent basin, and tail streamer.',
    palette: {
      primary: [0.95, 0.95, 0.98],     // Pure silver-white
      secondary: [0.65, 0.70, 0.82],   // Soft starlight dust
      accent: [1.0, 1.0, 1.0],         // Blazing crescent white
      background: [0.0, 0.0, 0.0],     // Pitch black
      glow: [0.98, 0.98, 1.0]          // Additive glow
    },
    fluidScale: 1.0,
    fluidSpeed: 0.35,
    fluidViscosity: 2.0,
    particleCount: 10000,
    particleSpeed: 0.4,
    particleSize: 1.8,
    semicolonVisibility: 0.0,
    bloomIntensity: 0.8,
    chromaticAberration: 0.0,
    noiseOctaves: 2.0,
    archPresence: 0.0,
    catPresence: 0.0,
    vortexStrength: 0.75
  },

  rave: {
    id: 'rave',
    name: 'Jets',
    subtitle: 'Dual Polar Relativistic Jets (Gambar Awal)',
    description: 'Two diagonal white needle jets with crescent loops cutting across black space.',
    palette: {
      primary: [0.95, 0.96, 1.0],      // White hot diamond
      secondary: [0.70, 0.75, 0.88],   // Electric stardust
      accent: [1.0, 1.0, 1.0],         // Pure blazing core
      background: [0.0, 0.0, 0.0],     // Pure black
      glow: [1.0, 1.0, 1.0]            // High bloom
    },
    fluidScale: 1.2,
    fluidSpeed: 0.6,
    fluidViscosity: 1.5,
    particleCount: 10000,
    particleSpeed: 0.65,
    particleSize: 2.0,
    semicolonVisibility: 0.0,
    bloomIntensity: 0.9,
    chromaticAberration: 0.05,
    noiseOctaves: 2.0,
    archPresence: 0.0,
    catPresence: 0.0,
    vortexStrength: 0.9
  },

  dream: {
    id: 'dream',
    name: 'Semicolon',
    subtitle: 'Deep Monumental Semicolon ;',
    description: 'Harmonic dot and curved tail formed by fine crystalline starlight particles.',
    palette: {
      primary: [0.92, 0.90, 1.0],      // Soft celestial white
      secondary: [0.65, 0.60, 0.80],   // Twilight silver
      accent: [1.0, 1.0, 1.0],         // Pure white
      background: [0.0, 0.0, 0.0],     // Pitch black
      glow: [0.95, 0.92, 1.0]          // Soft starlight glow
    },
    fluidScale: 1.0,
    fluidSpeed: 0.3,
    fluidViscosity: 2.2,
    particleCount: 10000,
    particleSpeed: 0.35,
    particleSize: 1.8,
    semicolonVisibility: 0.8,
    bloomIntensity: 0.75,
    chromaticAberration: 0.0,
    noiseOctaves: 2.0,
    archPresence: 0.0,
    catPresence: 0.0,
    vortexStrength: 0.6
  },

  cat: {
    id: 'cat',
    name: 'Cat',
    subtitle: 'Starlight Cat Constellation',
    description: 'Geometric 3D starlight cat constellation grooving in deep black space.',
    palette: {
      primary: [0.92, 0.92, 0.98],     // Pure silver starlight
      secondary: [0.60, 0.65, 0.80],   // Cosmic slate
      accent: [1.0, 1.0, 1.0],         // Pure white
      background: [0.0, 0.0, 0.0],     // Pure black
      glow: [0.96, 0.96, 1.0]          // Stardust glow
    },
    fluidScale: 1.0,
    fluidSpeed: 0.45,
    fluidViscosity: 1.8,
    particleCount: 10000,
    particleSpeed: 0.45,
    particleSize: 1.8,
    semicolonVisibility: 0.0,
    bloomIntensity: 0.75,
    chromaticAberration: 0.0,
    noiseOctaves: 2.0,
    archPresence: 0.0,
    catPresence: 1.0,
    vortexStrength: 0.65
  }
};
