/**
 * Procedural Web Audio API sound synthesizer for PlaceTrack AI 2D Game.
 * Zero external audio assets required. 100% offline-ready, crisp, zero CORS issues.
 * Complies with browser autoplay policies: starts suspended until user interaction.
 */

class GameAudioService {
  private ctx: AudioContext | null = null;
  private isMasterMuted: boolean = true; // Default OFF until user enables
  private isMusicMuted: boolean = true;  // Default OFF
  private isSfxMuted: boolean = false;
  private musicInterval: any = null;
  private currentWorldTheme: string = 'math';
  private masterGain: GainNode | null = null;

  constructor() {
    // Lazy audio context creation upon user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.isMasterMuted ? 0 : 0.8;
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMasterMute(muted: boolean) {
    this.isMasterMuted = muted;
    this.initContext();
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.8, this.ctx.currentTime);
    }
    if (muted) {
      this.stopMusic();
    } else if (!this.isMusicMuted) {
      this.startMusic(this.currentWorldTheme);
    }
  }

  public setMusicMute(muted: boolean) {
    this.isMusicMuted = muted;
    if (muted) {
      this.stopMusic();
    } else if (!this.isMasterMuted) {
      this.initContext();
      this.startMusic(this.currentWorldTheme);
    }
  }

  public setSfxMute(muted: boolean) {
    this.isSfxMuted = muted;
  }

  public getSettings() {
    return {
      masterMuted: this.isMasterMuted,
      musicMuted: this.isMusicMuted,
      sfxMuted: this.isSfxMuted,
    };
  }

  // ----------------------------------------------------
  // SOUND EFFECTS (Synthesized Web Audio Oscillators)
  // ----------------------------------------------------

  public playStep() {
    if (this.isMasterMuted || this.isSfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {
      // Audio fallback silent
    }
  }

  public playInteract() {
    if (this.isMasterMuted || this.isSfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  }

  public playCoin() {
    if (this.isMasterMuted || this.isSfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {}
  }

  public playSuccess() {
    if (this.isMasterMuted || this.isSfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      // Major triad chime: C5, E5, G5, C6
      const notes = [523.25, 659.25, 783.99, 1046.5];
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.45);
      });
    } catch (e) {}
  }

  public playGentleError() {
    if (this.isMasterMuted || this.isSfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      // Gentle non-punitive descending chime (E4 -> C4)
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(329.63, now); // E4
      osc.frequency.exponentialRampToValueAtTime(261.63, now + 0.2); // C4

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }

  public playGateOpen() {
    if (this.isMasterMuted || this.isSfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      // Low mechanical rumble + rising chime
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(90, now);
      osc1.frequency.linearRampToValueAtTime(140, now + 0.5);

      gain1.gain.setValueAtTime(0.06, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc1.connect(gain1);
      gain1.connect(this.masterGain);
      osc1.start(now);
      osc1.stop(now + 0.6);

      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(587.33, now + 0.2);
      osc2.frequency.linearRampToValueAtTime(880, now + 0.6);

      gain2.gain.setValueAtTime(0.1, now + 0.2);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc2.connect(gain2);
      gain2.connect(this.masterGain);
      osc2.start(now + 0.2);
      osc2.stop(now + 0.7);
    } catch (e) {}
  }

  public playChestOpen() {
    if (this.isMasterMuted || this.isSfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880, 1108.73];
      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.08, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.35);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.35);
      });
    } catch (e) {}
  }

  public playBossHit() {
    if (this.isMasterMuted || this.isSfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {}
  }

  public playLevelClear() {
    if (this.isMasterMuted || this.isSfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const fanfare = [
        { f: 523.25, d: 0.15 },
        { f: 659.25, d: 0.15 },
        { f: 783.99, d: 0.15 },
        { f: 1046.5, d: 0.4 },
        { f: 880, d: 0.15 },
        { f: 1046.5, d: 0.6 },
      ];
      let t = now;
      fanfare.forEach((n) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.f, t);

        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + n.d);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + n.d + 0.05);
        t += n.d * 0.9;
      });
    } catch (e) {}
  }

  // ----------------------------------------------------
  // PROCEDURAL BACKGROUND MUSIC (Pleasant Ambient Loops)
  // ----------------------------------------------------

  public startMusic(worldTheme: string = 'math') {
    this.currentWorldTheme = worldTheme;
    this.stopMusic();
    if (this.isMasterMuted || this.isMusicMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    let step = 0;
    // Pleasant chord progressions
    const scales: Record<string, number[][]> = {
      math: [
        [261.63, 329.63, 392.0, 523.25], // C major
        [220.0, 261.63, 329.63, 440.0],  // A minor
        [174.61, 220.0, 261.63, 349.23], // F major
        [196.0, 246.94, 293.66, 392.0],  // G major
      ],
      logic: [
        [220.0, 261.63, 329.63, 440.0],  // Am
        [246.94, 293.66, 369.99, 493.88],// Bm
        [196.0, 246.94, 293.66, 392.0],  // G
        [164.81, 196.0, 246.94, 329.63], // Em
      ],
      space: [
        [130.81, 196.0, 261.63, 392.0],  // C fifths
        [146.83, 220.0, 293.66, 440.0],  // D fifths
        [110.0, 164.81, 220.0, 329.63],  // A fifths
        [123.47, 185.0, 246.94, 369.99], // B fifths
      ],
    };

    const activeScale = scales[worldTheme] || scales.math;

    this.musicInterval = setInterval(() => {
      if (this.isMasterMuted || this.isMusicMuted || !this.ctx || !this.masterGain) return;

      const chord = activeScale[step % activeScale.length];
      const note = chord[Math.floor(Math.random() * chord.length)];
      step++;

      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = worldTheme === 'space' ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(note, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.035, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 1.3);
      } catch (e) {}
    }, 450);
  }

  public stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const GameAudio = new GameAudioService();
