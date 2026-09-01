import { TrackInfo } from '../types';

export interface DemoTrackItem extends TrackInfo {
  type: 'synth' | 'generated-beat' | 'audio-url';
  tempo?: number;
}

export const DEMO_TRACKS: DemoTrackItem[] = [
  {
    id: 'demo-1',
    title: 'Ethereal Bloom',
    artist: 'Curated Ambient',
    duration: 180,
    currentTime: 0,
    sourceType: 'demo',
    type: 'synth'
  },
  {
    id: 'demo-2',
    title: 'Pastel Horizon',
    artist: 'Chillwave Pulse',
    duration: 210,
    currentTime: 0,
    sourceType: 'demo',
    type: 'generated-beat',
    tempo: 95
  },
  {
    id: 'demo-3',
    title: 'Liquid Serenity',
    artist: 'Deep Semicolon',
    duration: 240,
    currentTime: 0,
    sourceType: 'demo',
    type: 'generated-beat',
    tempo: 120
  }
];

/**
 * Generates an organic electronic chillwave / beat AudioBuffer offline with rich bass,
 * melodic chord stabs, and crisp hi-hat rhythms.
 */
export function generateBeatBuffer(
  ctx: AudioContext,
  durationSec = 24,
  tempo = 100
): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const numSamples = Math.floor(sampleRate * durationSec);
  const buffer = ctx.createBuffer(2, numSamples, sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  const beatSec = 60 / tempo;
  const stepSec = beatSec / 4; // 16th note
  const totalSteps = Math.floor(durationSec / stepSec);

  // Synthesize chord progression: Cmaj9 -> Am9 -> Fmaj7 -> G9
  const chords = [
    [130.81, 164.81, 196.0, 246.94, 293.66], // Cmaj9
    [110.0, 130.81, 164.81, 196.0, 246.94],  // Am9
    [87.31, 130.81, 174.61, 220.0, 261.63],  // Fmaj7
    [98.0, 146.83, 196.0, 246.94, 293.66]   // G9
  ];

  for (let step = 0; step < totalSteps; step++) {
    const time = step * stepSec;
    const startSample = Math.floor(time * sampleRate);
    const chordIndex = Math.floor(step / 32) % chords.length;
    const activeChord = chords[chordIndex];

    // Kick drum on 1 and 3 (every 16 steps)
    const isKick = step % 16 === 0 || step % 16 === 10;
    if (isKick) {
      const kickLen = Math.floor(0.35 * sampleRate);
      for (let i = 0; i < kickLen && startSample + i < numSamples; i++) {
        const t = i / sampleRate;
        const freq = 120 * Math.exp(-t * 22) + 45;
        const env = Math.exp(-t * 12);
        const val = Math.sin(2 * Math.PI * freq * t) * env * 0.7;
        left[startSample + i] += val;
        right[startSample + i] += val;
      }
    }

    // Snare / Clap on 2 and 4 (step 8 and 24)
    const isSnare = step % 16 === 8;
    if (isSnare) {
      const snareLen = Math.floor(0.25 * sampleRate);
      for (let i = 0; i < snareLen && startSample + i < numSamples; i++) {
        const t = i / sampleRate;
        const noise = (Math.random() * 2 - 1) * Math.exp(-t * 20);
        const tone = Math.sin(2 * Math.PI * 180 * t) * Math.exp(-t * 28) * 0.4;
        const val = (noise + tone) * 0.45;
        left[startSample + i] += val;
        right[startSample + i] += val;
      }
    }

    // Crisp hi-hats on 8th / 16th notes
    const isHiHat = step % 2 === 0;
    if (isHiHat) {
      const hatLen = Math.floor((step % 4 === 2 ? 0.08 : 0.04) * sampleRate);
      for (let i = 0; i < hatLen && startSample + i < numSamples; i++) {
        const t = i / sampleRate;
        const noise = (Math.random() * 2 - 1) * Math.exp(-t * 60) * 0.18;
        left[startSample + i] += noise * 0.8;
        right[startSample + i] += noise * 1.1; // stereo width
      }
    }

    // Lush Synth Chords (every 8 steps)
    if (step % 8 === 0) {
      const chordLen = Math.floor(1.8 * sampleRate);
      activeChord.forEach((freq, noteIdx) => {
        for (let i = 0; i < chordLen && startSample + i < numSamples; i++) {
          const t = i / sampleRate;
          const env = Math.sin(Math.min(Math.PI, (t / 1.8) * Math.PI)) * 0.1;
          const pan = noteIdx % 2 === 0 ? 0.8 : 1.2;
          const wave1 = Math.sin(2 * Math.PI * freq * t);
          const wave2 = Math.sin(2 * Math.PI * (freq * 1.003) * t) * 0.5;
          const val = (wave1 + wave2) * env * 0.25;
          left[startSample + i] += val * (2 - pan);
          right[startSample + i] += val * pan;
        }
      });
    }

    // Sub-bass line
    if (step % 4 === 0) {
      const bassLen = Math.floor(0.4 * sampleRate);
      const rootFreq = activeChord[0] * 0.5;
      for (let i = 0; i < bassLen && startSample + i < numSamples; i++) {
        const t = i / sampleRate;
        const env = Math.exp(-t * 4) * 0.35;
        const val = Math.sin(2 * Math.PI * rootFreq * t) * env;
        left[startSample + i] += val;
        right[startSample + i] += val;
      }
    }
  }

  // Normalize buffer to avoid clipping
  let maxAmp = 0;
  for (let i = 0; i < numSamples; i++) {
    maxAmp = Math.max(maxAmp, Math.abs(left[i]), Math.abs(right[i]));
  }
  if (maxAmp > 0.95) {
    const scale = 0.95 / maxAmp;
    for (let i = 0; i < numSamples; i++) {
      left[i] *= scale;
      right[i] *= scale;
    }
  }

  return buffer;
}
