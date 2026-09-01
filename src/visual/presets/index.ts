import { VisualPresetConfig, VisualPresetId } from '../../types';

export const PRESETS: Record<VisualPresetId, VisualPresetConfig> = {
  void: {
    id: 'void',
    name: 'Void',
    subtitle: 'Cosmic Caustic Rings & Polar Jets',
    description: 'Pure astrophysical monochrome void with fine starlight rings, dual polar jets, and gravitational caustics.',
    palette: {
      primary: [0.92, 0.94, 0.98],     // Pure starlight silver-white
      secondary: [0.65, 0.70, 0.80],   // Faint nebular silver
      accent: [1.0, 1.0, 1.0],         // Blazing white hot core
      background: [0.0, 0.0, 0.0],     // Pitch black absolute void
      glow: [0.95, 0.98, 1.0]          // Clean photon glow
    },
    fluidScale: 1.0,
    fluidSpeed: 0.35,
    fluidViscosity: 2.5,
    particleCount: 5500,
    particleSpeed: 0.5,
    particleSize: 1.6,                 // Delicate micro-stardust
    semicolonVisibility: 0.6,
    bloomIntensity: 0.7,
    chromaticAberration: 0.08,
    noiseOctaves: 2.0,
    archPresence: 0.0,
    catPresence: 0.0,
    vortexStrength: 1.0
  },

  fluid: {
    id: 'fluid',
    name: 'Fluid',
    subtitle: 'Starlight Caustic Atmosphere',
    description: 'Subtle warm silver stardust with gravitational orbital rings and flowing caustics.',
    palette: {
      primary: [0.95, 0.90, 0.82],     // Subtle warm champagne starlight
      secondary: [0.60, 0.65, 0.75],   // Deep cosmic slate
      accent: [1.0, 0.98, 0.92],       // Pure hot white core
      background: [0.0, 0.0, 0.0],     // Pure pitch black
      glow: [0.98, 0.95, 0.90]          // Soft champagne photon glow
    },
    fluidScale: 1.2,
    fluidSpeed: 0.45,
    fluidViscosity: 2.0,
    particleCount: 4800,
    particleSpeed: 0.45,
    particleSize: 1.8,
    semicolonVisibility: 0.55,
    bloomIntensity: 0.65,
    chromaticAberration: 0.1,
    noiseOctaves: 3.0,
    archPresence: 0.0,
    catPresence: 0.0,
    vortexStrength: 0.75
  },

  dream: {
    id: 'dream',
    name: 'Dream',
    subtitle: 'Whispering Celestial Rings',
    description: 'Ethereal whisper of lavender-tinted starlight dust orbiting in deep black space.',
    palette: {
      primary: [0.85, 0.80, 0.95],     // Whisper of pale lavender
      secondary: [0.55, 0.60, 0.75],   // Dark twilight silver
      accent: [1.0, 1.0, 1.0],         // Pure white
      background: [0.0, 0.0, 0.0],     // Pitch black
      glow: [0.90, 0.88, 1.0]          // Soft celestial glow
    },
    fluidScale: 1.1,
    fluidSpeed: 0.3,
    fluidViscosity: 2.2,
    particleCount: 4200,
    particleSpeed: 0.35,
    particleSize: 1.6,
    semicolonVisibility: 0.7,
    bloomIntensity: 0.6,
    chromaticAberration: 0.08,
    noiseOctaves: 2.0,
    archPresence: 0.0,
    catPresence: 0.0,
    vortexStrength: 0.6
  },

  jannah: {
    id: 'jannah',
    name: 'Jannah',
    subtitle: 'Celestial Arch Caustics',
    description: 'Delicate arches of starlight caustics and orbital photon loops.',
    palette: {
      primary: [0.96, 0.92, 0.80],     // Subtle pale gold starlight
      secondary: [0.65, 0.75, 0.78],   // Pale emerald mist
      accent: [1.0, 1.0, 1.0],         // Blazing starlight
      background: [0.0, 0.0, 0.0],     // Pure black
      glow: [0.98, 0.95, 0.88]          // Luminous arch light
    },
    fluidScale: 1.3,
    fluidSpeed: 0.4,
    fluidViscosity: 1.8,
    particleCount: 5000,
    particleSpeed: 0.4,
    particleSize: 1.8,
    semicolonVisibility: 0.65,
    bloomIntensity: 0.7,
    chromaticAberration: 0.12,
    noiseOctaves: 3.0,
    archPresence: 1.0,
    catPresence: 0.0,
    vortexStrength: 0.7
  },

  rave: {
    id: 'rave',
    name: 'Rave',
    subtitle: 'High Energy Pulsar Jets',
    description: 'Intense dual relativistic jets and rapid caustic shockwaves in black space.',
    palette: {
      primary: [0.85, 0.90, 1.0],      // Ice diamond white-blue
      secondary: [0.60, 0.40, 0.70],   // Muted deep violet
      accent: [1.0, 1.0, 1.0],         // Pure blazing core
      background: [0.0, 0.0, 0.0],     // Pitch black
      glow: [0.90, 0.95, 1.0]          // High bloom electric starlight
    },
    fluidScale: 1.5,
    fluidSpeed: 0.85,
    fluidViscosity: 1.2,
    particleCount: 6000,
    particleSpeed: 0.8,
    particleSize: 2.0,
    semicolonVisibility: 0.5,
    bloomIntensity: 0.85,
    chromaticAberration: 0.2,
    noiseOctaves: 3.0,
    archPresence: 0.0,
    catPresence: 0.0,
    vortexStrength: 0.95
  },

  cat: {
    id: 'cat',
    name: 'Cat Rave',
    subtitle: 'Starlight Cat Silhouette',
    description: 'Fine stardust cat constellation grooving in deep space.',
    palette: {
      primary: [0.90, 0.85, 0.95],     // Silver orchid starlight
      secondary: [0.55, 0.65, 0.80],   // Cosmic slate
      accent: [1.0, 1.0, 1.0],         // Pure white
      background: [0.0, 0.0, 0.0],     // Pure black
      glow: [0.95, 0.90, 1.0]          // Stardust glow
    },
    fluidScale: 1.2,
    fluidSpeed: 0.6,
    fluidViscosity: 1.6,
    particleCount: 4500,
    particleSpeed: 0.55,
    particleSize: 1.8,
    semicolonVisibility: 0.5,
    bloomIntensity: 0.65,
    chromaticAberration: 0.1,
    noiseOctaves: 3.0,
    archPresence: 0.0,
    catPresence: 1.0,
    vortexStrength: 0.65
  }
};
