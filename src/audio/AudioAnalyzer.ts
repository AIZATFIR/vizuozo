import { AudioMetrics } from '../types';

export class AudioAnalyzer {
  private analyser: AnalyserNode;
  private frequencyBuffer: Uint8Array<ArrayBuffer>;
  private timeDomainBuffer: Uint8Array<ArrayBuffer>;
  private sampleRate: number;

  // Smoothed metric states for physical mass and inertia
  private smoothedEnergy = 0;
  private smoothedBass = 0;
  private smoothedMids = 0;
  private smoothedTreble = 0;
  private smoothedTransient = 0;

  // Transient history for beat detection
  private energyHistory: number[] = [];
  private historySize = 40;
  private beatCooldown = 0;

  constructor(analyser: AnalyserNode, sampleRate = 44100) {
    this.analyser = analyser;
    this.sampleRate = sampleRate;
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;
    this.frequencyBuffer = new Uint8Array(new ArrayBuffer(this.analyser.frequencyBinCount));
    this.timeDomainBuffer = new Uint8Array(new ArrayBuffer(this.analyser.fftSize));
  }

  public setSmoothing(smoothing: number): void {
    this.analyser.smoothingTimeConstant = Math.max(0, Math.min(0.95, smoothing));
  }

  public analyze(): AudioMetrics {
    this.analyser.getByteFrequencyData(this.frequencyBuffer);
    this.analyser.getByteTimeDomainData(this.timeDomainBuffer);

    const binCount = this.frequencyBuffer.length;
    const nyquist = this.sampleRate / 2;
    const hzPerBin = nyquist / binCount;

    // 1. RMS Energy from time domain
    let sumSquares = 0;
    for (let i = 0; i < this.timeDomainBuffer.length; i++) {
      const normalized = (this.timeDomainBuffer[i] - 128) / 128;
      sumSquares += normalized * normalized;
    }
    const rms = Math.sqrt(sumSquares / this.timeDomainBuffer.length);
    const rawEnergy = Math.min(1, rms * 3.0);

    // 2. Frequency Band Averages
    const getBandAverage = (minHz: number, maxHz: number): number => {
      const startBin = Math.max(0, Math.floor(minHz / hzPerBin));
      const endBin = Math.min(binCount - 1, Math.ceil(maxHz / hzPerBin));
      if (startBin >= endBin) return this.frequencyBuffer[startBin] / 255;

      let sum = 0;
      for (let i = startBin; i <= endBin; i++) {
        sum += this.frequencyBuffer[i];
      }
      return sum / ((endBin - startBin + 1) * 255);
    };

    const rawBass = Math.pow(getBandAverage(20, 160), 1.2) * 1.5;
    const rawMids = Math.pow(getBandAverage(160, 2600), 1.1) * 1.3;
    const rawTreble = Math.pow(getBandAverage(2600, 16000), 1.1) * 1.6;

    // 3. Transient & Beat Detection
    this.energyHistory.push(rawEnergy);
    if (this.energyHistory.length > this.historySize) {
      this.energyHistory.shift();
    }

    const avgHistoricalEnergy =
      this.energyHistory.reduce((a, b) => a + b, 0) / this.energyHistory.length;
    const energyVariance =
      this.energyHistory.reduce((sum, val) => sum + Math.pow(val - avgHistoricalEnergy, 2), 0) /
      this.energyHistory.length;

    // Dynamic threshold based on energy variance
    const threshold = avgHistoricalEnergy + Math.sqrt(energyVariance) * 1.2 + 0.05;
    let instantTransient = 0;

    if (this.beatCooldown > 0) {
      this.beatCooldown--;
    } else if (rawEnergy > threshold && rawEnergy > 0.12) {
      instantTransient = Math.min(1, (rawEnergy - threshold) * 4.0 + (rawBass > 0.3 ? 0.3 : 0));
      this.beatCooldown = 6; // debounce frames
    }

    // 4. Physical Exponential Damping & Inertia
    // Large bass has more mass (slower decay, quick attack)
    const bassAttack = 0.65;
    const bassDecay = 0.15;
    this.smoothedBass +=
      (rawBass - this.smoothedBass) * (rawBass > this.smoothedBass ? bassAttack : bassDecay);

    // Mids have fluid momentum
    const midsAttack = 0.55;
    const midsDecay = 0.2;
    this.smoothedMids +=
      (rawMids - this.smoothedMids) * (rawMids > this.smoothedMids ? midsAttack : midsDecay);

    // Treble has snappy responsiveness
    const trebleAttack = 0.75;
    const trebleDecay = 0.3;
    this.smoothedTreble +=
      (rawTreble - this.smoothedTreble) *
      (rawTreble > this.smoothedTreble ? trebleAttack : trebleDecay);

    // Overall energy smoothing
    this.smoothedEnergy += (rawEnergy - this.smoothedEnergy) * 0.3;

    // Transient decay
    this.smoothedTransient = Math.max(
      instantTransient,
      this.smoothedTransient * 0.82 - 0.01
    );

    return {
      energy: Math.max(0, Math.min(1, this.smoothedEnergy)),
      bass: Math.max(0, Math.min(1, this.smoothedBass)),
      mids: Math.max(0, Math.min(1, this.smoothedMids)),
      treble: Math.max(0, Math.min(1, this.smoothedTreble)),
      transient: Math.max(0, Math.min(1, this.smoothedTransient)),
      rawEnergy: Math.max(0, Math.min(1, rawEnergy)),
      frequencyData: this.frequencyBuffer,
      timeDomainData: this.timeDomainBuffer
    };
  }

  public reset(): void {
    this.smoothedEnergy = 0;
    this.smoothedBass = 0;
    this.smoothedMids = 0;
    this.smoothedTreble = 0;
    this.smoothedTransient = 0;
    this.energyHistory = [];
    this.beatCooldown = 0;
  }
}
