export class SynthGenerator {
  private ctx: AudioContext;
  private masterGain: GainNode;
  private isRunning = false;
  private timer: number | null = null;
  private activeVoices: { osc: OscillatorNode; gain: GainNode }[] = [];

  // Lydian / Pentatonic dreamy chord progressions: Eb, G, Bb, D, F, Ab, C
  private chordProgressions = [
    [155.56, 233.08, 311.13, 392.0, 466.16], // Ebmaj9
    [174.61, 220.0, 261.63, 329.63, 392.0],  // Fsus2 / Fmaj7
    [130.81, 196.0, 261.63, 311.13, 392.0],  // Cm9
    [116.54, 174.61, 233.08, 293.66, 349.23] // Bbadd9
  ];
  private currentChordIndex = 0;

  constructor(ctx: AudioContext, destination: AudioNode) {
    this.ctx = ctx;
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    this.masterGain.connect(destination);
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.scheduleNextChord();
  }

  public stop(): void {
    this.isRunning = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.activeVoices.forEach(voice => {
      try {
        voice.gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
        voice.osc.stop(this.ctx.currentTime + 0.6);
      } catch {
        // already stopped
      }
    });
    this.activeVoices = [];
  }

  private scheduleNextChord(): void {
    if (!this.isRunning) return;

    const chord = this.chordProgressions[this.currentChordIndex];
    this.currentChordIndex = (this.currentChordIndex + 1) % this.chordProgressions.length;

    // Play drone pad
    chord.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = idx === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450 + idx * 200, this.ctx.currentTime);
      filter.Q.setValueAtTime(2.0, this.ctx.currentTime);

      const now = this.ctx.currentTime;
      const duration = 6.0;

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.12 / (idx + 1), now + 1.8);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + duration + 0.1);

      this.activeVoices.push({ osc, gain });
    });

    // Schedule high arpeggiated sparkle notes
    for (let i = 0; i < 4; i++) {
      const noteDelay = 1.0 + i * 0.9;
      const noteFreq = chord[(i + 2) % chord.length] * 2;
      this.playSparkleNote(noteFreq, this.ctx.currentTime + noteDelay);
    }

    this.timer = window.setTimeout(() => {
      this.scheduleNextChord();
    }, 4500);
  }

  private playSparkleNote(freq: number, startTime: number): void {
    if (!this.isRunning) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(0.06, startTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + 1.3);
  }
}
