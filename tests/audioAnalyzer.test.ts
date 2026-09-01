import { describe, it, expect } from 'vitest';
import { AudioAnalyzer } from '../src/audio/AudioAnalyzer';

class MockAnalyserNode {
  fftSize = 2048;
  frequencyBinCount = 1024;
  smoothingTimeConstant = 0.8;

  getByteFrequencyData(array: Uint8Array): void {
    // Fill with simulated mock frequency data
    for (let i = 0; i < array.length; i++) {
      if (i < 10) {
        array[i] = 200; // High bass
      } else if (i < 100) {
        array[i] = 120; // Medium mids
      } else {
        array[i] = 60; // Low treble
      }
    }
  }

  getByteTimeDomainData(array: Uint8Array): void {
    // Fill with simulated mock sine wave data (around 128)
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(128 + Math.sin(i * 0.1) * 50);
    }
  }
}

describe('AudioAnalyzer Signal Processing', () => {
  it('should accurately separate bass, mids, treble, and calculate energy', () => {
    const mockAnalyser = new MockAnalyserNode() as unknown as AnalyserNode;
    const analyzer = new AudioAnalyzer(mockAnalyser, 44100);

    const metrics = analyzer.analyze();

    expect(metrics.energy).toBeGreaterThan(0);
    expect(metrics.bass).toBeGreaterThan(0);
    expect(metrics.mids).toBeGreaterThan(0);
    expect(metrics.treble).toBeGreaterThan(0);
    expect(metrics.frequencyData).toBeDefined();
    expect(metrics.timeDomainData).toBeDefined();

    // Bass should have higher smoothed value than treble with our mock data
    expect(metrics.bass).toBeGreaterThan(metrics.treble);
  });

  it('should reset internal smoothed states on reset()', () => {
    const mockAnalyser = new MockAnalyserNode() as unknown as AnalyserNode;
    const analyzer = new AudioAnalyzer(mockAnalyser, 44100);

    analyzer.analyze();
    analyzer.reset();

    // When analyzed after reset with zero data, metrics decay properly
    mockAnalyser.getByteFrequencyData = (arr) => arr.fill(0);
    mockAnalyser.getByteTimeDomainData = (arr) => arr.fill(128);

    const metrics = analyzer.analyze();
    expect(metrics.energy).toBeLessThan(0.01);
  });
});
