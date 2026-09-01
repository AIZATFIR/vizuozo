import { VisualPresetConfig, VisualPresetId } from '../../types';

export const PRESETS: Record<VisualPresetId, VisualPresetConfig> = {
  fluid: {
    id: 'fluid',
    name: 'Fluid',
    subtitle: 'Organic Liquid Honey',
    description: 'Deep obsidian void with warm bioluminescent honey and amber fluid ribbons.',
    palette: {
      primary: [0.85, 0.45, 0.20],     // Deep amber honey
      secondary: [0.30, 0.45, 0.75],   // Luminous deep sapphire
      accent: [0.95, 0.65, 0.25],      // Warm golden glow
      background: [0.015, 0.012, 0.02],// Deep obsidian black
      glow: [0.90, 0.55, 0.25]          // Warm amber bioluminescence
    },
    fluidScale: 1.8,
    fluidSpeed: 0.75,
    fluidViscosity: 1.4,
    particleCount: 2000,
    particleSpeed: 0.6,
    particleSize: 2.8,
    semicolonVisibility: 0.65,
    bloomIntensity: 0.7,
    chromaticAberration: 0.25,
    noiseOctaves: 4.0,
    archPresence: 0.0,
    catPresence: 0.0,
    vortexStrength: 0.15
  },

  dream: {
    id: 'dream',
    name: 'Dream',
    subtitle: 'Cosmic Lavender Drift',
    description: 'Slow-drifting ethereal bioluminescent ribbons in deep velvet midnight.',
    palette: {
      primary: [0.55, 0.35, 0.85],     // Deep mystical violet
      secondary: [0.20, 0.65, 0.55],   // Bioluminescent teal/mint
      accent: [0.75, 0.40, 0.70],      // Soft orchid
      background: [0.01, 0.01, 0.018], // Pitch velvet midnight
      glow: [0.65, 0.45, 0.90]          // Soft lavender aura
    },
    fluidScale: 1.4,
    fluidSpeed: 0.4,
    fluidViscosity: 1.8,
    particleCount: 1500,
    particleSpeed: 0.35,
    particleSize: 2.5,
    semicolonVisibility: 0.8,
    bloomIntensity: 0.8,
    chromaticAberration: 0.2,
    noiseOctaves: 3.0,
    archPresence: 0.0,
    catPresence: 0.0,
    vortexStrength: 0.05
  },

  jannah: {
    id: 'jannah',
    name: 'Jannah',
    subtitle: 'Celestial Light Caustics',
    description: 'Translucent architectural arches of golden light and emerald caustics across deep space.',
    palette: {
      primary: [0.85, 0.60, 0.20],     // Warm celestial gold
      secondary: [0.15, 0.60, 0.50],   // Deep emerald turquoise
      accent: [0.80, 0.35, 0.45],      // Twilight rose
      background: [0.01, 0.015, 0.02], // Deep celestial void
      glow: [0.90, 0.70, 0.30]          // Soft golden arch light
    },
    fluidScale: 1.6,
    fluidSpeed: 0.55,
    fluidViscosity: 1.2,
    particleCount: 2800,
    particleSpeed: 0.55,
    particleSize: 3.0,
    semicolonVisibility: 0.75,
    bloomIntensity: 0.9,
    chromaticAberration: 0.3,
    noiseOctaves: 4.0,
    archPresence: 1.0,
    catPresence: 0.0,
    vortexStrength: 0.2
  },

  rave: {
    id: 'rave',
    name: 'Rave',
    subtitle: 'Neon Pulse Atmosphere',
    description: 'High-contrast electric magenta and cyan laser currents in deep black space.',
    palette: {
      primary: [0.90, 0.12, 0.50],     // Neon magenta
      secondary: [0.10, 0.70, 0.90],   // Laser cyan
      accent: [0.85, 0.65, 0.10],      // Neon amber
      background: [0.015, 0.01, 0.025],// Deep void
      glow: [0.80, 0.20, 0.75]          // Electric magenta glow
    },
    fluidScale: 2.2,
    fluidSpeed: 1.2,
    fluidViscosity: 0.9,
    particleCount: 3800,
    particleSpeed: 1.1,
    particleSize: 3.2,
    semicolonVisibility: 0.55,
    bloomIntensity: 1.0,
    chromaticAberration: 0.5,
    noiseOctaves: 5.0,
    archPresence: 0.0,
    catPresence: 0.0,
    vortexStrength: 0.5
  },

  cat: {
    id: 'cat',
    name: 'Cat Rave',
    subtitle: 'Neon Silhouette Groove',
    description: 'Bioluminescent cybernetic cat grooving to the bass in deep space.',
    palette: {
      primary: [0.85, 0.35, 0.65],     // Neon orchid
      secondary: [0.25, 0.65, 0.90],   // Cyber blue
      accent: [0.90, 0.70, 0.25],      // Warm amber
      background: [0.012, 0.01, 0.018],// Deep velvet space
      glow: [0.80, 0.40, 0.70]          // Soft neon aura
    },
    fluidScale: 1.6,
    fluidSpeed: 0.8,
    fluidViscosity: 1.1,
    particleCount: 1800,
    particleSpeed: 0.7,
    particleSize: 2.8,
    semicolonVisibility: 0.6,
    bloomIntensity: 0.8,
    chromaticAberration: 0.25,
    noiseOctaves: 4.0,
    archPresence: 0.0,
    catPresence: 1.0,
    vortexStrength: 0.25
  },

  void: {
    id: 'void',
    name: 'Void',
    subtitle: 'Cosmic Caustics & Semicolon',
    description: 'Pitch black abyss with subtle starlight filaments, twin jet vortices, and deep semicolon.',
    palette: {
      primary: [0.45, 0.50, 0.65],     // Deep starlight steel
      secondary: [0.20, 0.25, 0.35],   // Dark nebular blue
      accent: [0.80, 0.85, 0.95],      // Starlight accent
      background: [0.005, 0.005, 0.008],// Pure pitch black
      glow: [0.60, 0.70, 0.85]          // Subtle caustic luminescence
    },
    fluidScale: 1.2,
    fluidSpeed: 0.4,
    fluidViscosity: 2.2,
    particleCount: 4200,
    particleSpeed: 0.7,
    particleSize: 2.4,
    semicolonVisibility: 0.85,
    bloomIntensity: 0.9,
    chromaticAberration: 0.15,
    noiseOctaves: 3.0,
    archPresence: 0.0,
    catPresence: 0.0,
    vortexStrength: 1.0
  }
};
