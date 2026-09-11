/**
 * Web Audio API Sound Synthesizer.
 * Procedurally generated audio: zero external assets, zero network latency, 100% offline reliable.
 */
class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Lazy initialize AudioContext on user interaction
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public triggerHaptic(pattern: number | number[] = 15) {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore haptics errors if permission denied
      }
    }
  }

  // --- GENERAL / EMOJI SOUNDS ---

  public playFlip() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.triggerHaptic(10);

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  public playMatch(combo = 1) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.triggerHaptic([20, 30, 20]);

    const baseFreq = 523.25 * Math.pow(1.06, Math.min(combo - 1, 8));
    const notes = [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2];

    notes.forEach((freq, idx) => {
      const now = ctx.currentTime + idx * 0.05;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.32);
    });
  }

  public playMismatch() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.triggerHaptic([30, 20, 30]);

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playVictory() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.triggerHaptic([80, 40, 80, 40, 160]);

    const melody = [
      { freq: 392.0, time: 0, dur: 0.14 },
      { freq: 523.25, time: 0.14, dur: 0.14 },
      { freq: 659.25, time: 0.28, dur: 0.14 },
      { freq: 783.99, time: 0.42, dur: 0.7 },
      { freq: 1046.5, time: 0.42, dur: 0.7 },
    ];

    melody.forEach((item) => {
      const now = ctx.currentTime + item.time;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(item.freq, now);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + item.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + item.dur + 0.05);
    });
  }

  // --- SUDOKU SOUNDS ---

  public playPlaceNumber() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.triggerHaptic(8);

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.04);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  public playErase() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(360, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.06);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  public playError() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.triggerHaptic([40, 30, 40]);

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.setValueAtTime(120, now + 0.08);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.17);
  }

  // --- TETRIS SOUNDS ---

  public playTetrisMove() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  public playTetrisRotate() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.triggerHaptic(10);

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.04);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  public playTetrisDrop() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.triggerHaptic(25);

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.08);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playTetrisClear(lines = 1) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.triggerHaptic(lines >= 4 ? [40, 30, 40, 30, 60] : [20, 20]);

    const chord = lines >= 4
      ? [523.25, 659.25, 783.99, 1046.5] // C major chord
      : [440, 554.37, 659.25]; // A major

    chord.forEach((freq, idx) => {
      const now = ctx.currentTime + idx * 0.04;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    });
  }

  public playGameOver() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.triggerHaptic([100, 50, 150]);

    const notes = [330, 311.13, 293.66, 277.18];
    notes.forEach((freq, idx) => {
      const now = ctx.currentTime + idx * 0.12;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    });
  }
}

export const sound = new SoundEngine();
