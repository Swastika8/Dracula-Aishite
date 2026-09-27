import { SongId } from '../types';
import { DRACULA_TIMELINE, AISHITE_TIMELINE } from '../data/timelineData';

type AudioCallback = (relTime: number, duration: number, progress: number) => void;
type StateCallback = (isPlaying: boolean) => void;
type EndCallback = () => void;

class AudioEngine {
  private audio: HTMLAudioElement | null = null;
  private glitchAudio: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private freqData: Uint8Array<ArrayBuffer> = new Uint8Array(new ArrayBuffer(64));

  private currentSongId: SongId = 'dracula';
  private isSynthetic: boolean = false;
  private syntheticTime: number = 0;
  private syntheticDuration: number = 44.0;
  private lastRafTime: number = 0;
  private syntheticRafId: number | null = null;
  private timeRafId: number | null = null;

  private onTimeListeners: Set<AudioCallback> = new Set();
  private onStateListeners: Set<StateCallback> = new Set();
  private onEndListeners: Set<EndCallback> = new Set();

  private volume: number = 0.85;
  private isMuted: boolean = false;
  private isPlaying: boolean = false;

  constructor() {
    // Lazily initialized
  }

  private initAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 128;
        this.analyser.smoothingTimeConstant = 0.8;
        this.freqData = new Uint8Array(new ArrayBuffer(this.analyser.frequencyBinCount));
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  private getTimeline(songId: SongId) {
    return songId === 'dracula' ? DRACULA_TIMELINE : AISHITE_TIMELINE;
  }

  public initTrack(songId: SongId): void {
    this.cleanupCurrentAudio();
    this.currentSongId = songId;
    const timeline = this.getTimeline(songId);
    this.syntheticDuration = timeline.duration;
    this.isSynthetic = false;

    try {
      this.audio = new Audio(timeline.audioSrc);
      this.audio.preload = 'auto';
      this.audio.volume = this.isMuted ? 0 : this.volume;

      // Start at designated offset (0:18 for Dracula, 03:02 for Aishite)
      this.audio.currentTime = timeline.audioStartOffset;

      this.audio.addEventListener('timeupdate', this.handleTimeUpdate);
      this.audio.addEventListener('ended', this.handleEnded);
      this.audio.addEventListener('play', () => this.setPlayingState(true));
      this.audio.addEventListener('pause', () => this.setPlayingState(false));
      this.audio.addEventListener('error', this.handleAudioError);

      this.initAudioContext();
      if (this.audioCtx && this.analyser && this.audio) {
        try {
          this.sourceNode = this.audioCtx.createMediaElementSource(this.audio);
          this.sourceNode.connect(this.analyser);
          this.analyser.connect(this.audioCtx.destination);
        } catch {}
      }
    } catch {
      this.fallbackToSynthetic();
    }
  }

  private handleTimeUpdate = () => {
    if (!this.audio || this.isSynthetic) return;
    const timeline = this.getTimeline(this.currentSongId);
    const rawTime = this.audio.currentTime;

    // Check if reached segment end
    if (rawTime >= timeline.audioEndOffset) {
      this.audio.pause();
      this.notifyTime(timeline.duration, timeline.duration, 1.0);
      this.handleEnded();
      return;
    }

    const relTime = Math.max(0, Math.min(timeline.duration, rawTime - timeline.audioStartOffset));
    const prog = timeline.duration > 0 ? relTime / timeline.duration : 0;
    this.notifyTime(relTime, timeline.duration, prog);
  };

  private handleEnded = () => {
    this.setPlayingState(false);
    this.onEndListeners.forEach(cb => cb());
  };

  private handleAudioError = () => {
    console.warn(`[AudioEngine] Falling back to synthetic clock for ${this.currentSongId}.`);
    this.fallbackToSynthetic();
  };

  private fallbackToSynthetic() {
    this.isSynthetic = true;
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
    if (this.isPlaying) {
      this.startSyntheticClock();
    }
  }

  private startSyntheticClock() {
    if (this.syntheticRafId) cancelAnimationFrame(this.syntheticRafId);
    this.lastRafTime = performance.now();
    const loop = (now: number) => {
      if (!this.isPlaying) return;
      const dt = (now - this.lastRafTime) / 1000;
      this.lastRafTime = now;
      this.syntheticTime += dt;
      if (this.syntheticTime >= this.syntheticDuration) {
        this.syntheticTime = this.syntheticDuration;
        this.notifyTime(this.syntheticTime, this.syntheticDuration, 1.0);
        this.handleEnded();
        return;
      }
      const prog = this.syntheticTime / this.syntheticDuration;
      this.notifyTime(this.syntheticTime, this.syntheticDuration, prog);
      this.syntheticRafId = requestAnimationFrame(loop);
    };
    this.syntheticRafId = requestAnimationFrame(loop);
  }

  private stopSyntheticClock() {
    if (this.syntheticRafId) {
      cancelAnimationFrame(this.syntheticRafId);
      this.syntheticRafId = null;
    }
  }

  private notifyTime(time: number, duration: number, progress: number) {
    this.onTimeListeners.forEach(cb => cb(time, duration, progress));
  }

  private startTimeLoop() {
    this.stopTimeLoop();
    const tick = () => {
      if (!this.isPlaying) return;
      if (this.audio && !this.isSynthetic) {
        this.handleTimeUpdate();
      }
      this.timeRafId = requestAnimationFrame(tick);
    };
    this.timeRafId = requestAnimationFrame(tick);
  }

  private stopTimeLoop() {
    if (this.timeRafId !== null) {
      cancelAnimationFrame(this.timeRafId);
      this.timeRafId = null;
    }
  }

  private setPlayingState(state: boolean) {
    this.isPlaying = state;
    if (state && !this.isSynthetic) {
      this.startTimeLoop();
    } else {
      this.stopTimeLoop();
    }
    this.onStateListeners.forEach(cb => cb(state));
  }

  public async play(): Promise<void> {
    this.initAudioContext();
    if (!this.audio && !this.isSynthetic) {
      this.initTrack(this.currentSongId);
    }

    if (this.isSynthetic) {
      this.setPlayingState(true);
      this.startSyntheticClock();
      return;
    }

    if (this.audio) {
      try {
        const timeline = this.getTimeline(this.currentSongId);
        // Ensure starting time is in bounds
        if (this.audio.currentTime < timeline.audioStartOffset - 0.5 || this.audio.currentTime >= timeline.audioEndOffset) {
          this.audio.currentTime = timeline.audioStartOffset;
        }
        await this.audio.play();
        this.setPlayingState(true);
      } catch (err) {
        console.warn('[AudioEngine] Play failed or autoplay prevented, using synthetic fallback:', err);
        this.fallbackToSynthetic();
        this.setPlayingState(true);
      }
    }
  }

  public pause(): void {
    if (this.audio) {
      this.audio.pause();
    }
    this.stopSyntheticClock();
    this.setPlayingState(false);
  }

  public togglePlay(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public seek(relativeSeconds: number): void {
    const timeline = this.getTimeline(this.currentSongId);
    const clampedRel = Math.max(0, Math.min(timeline.duration, relativeSeconds));
    if (this.isSynthetic) {
      this.syntheticTime = clampedRel;
      const prog = timeline.duration > 0 ? clampedRel / timeline.duration : 0;
      this.notifyTime(clampedRel, timeline.duration, prog);
    } else if (this.audio) {
      this.audio.currentTime = timeline.audioStartOffset + clampedRel;
      const prog = timeline.duration > 0 ? clampedRel / timeline.duration : 0;
      this.notifyTime(clampedRel, timeline.duration, prog);
    }
  }

  public playGlitchSound(): void {
    try {
      if (this.glitchAudio) {
        this.glitchAudio.pause();
        this.glitchAudio = null;
      }
      this.glitchAudio = new Audio('./audio/glitch.mp3');
      this.glitchAudio.volume = this.isMuted ? 0 : this.volume;
      this.glitchAudio.play().catch(() => {});
    } catch {}
  }

  public setVolume(v: number): void {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.audio) {
      this.audio.volume = this.isMuted ? 0 : this.volume;
    }
    if (this.glitchAudio) {
      this.glitchAudio.volume = this.isMuted ? 0 : this.volume;
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.audio) {
      this.audio.volume = this.isMuted ? 0 : this.volume;
    }
    if (this.glitchAudio) {
      this.glitchAudio.volume = this.isMuted ? 0 : this.volume;
    }
    return this.isMuted;
  }

  public getCurrentTime(): number {
    if (this.isSynthetic) return this.syntheticTime;
    if (this.audio) {
      const timeline = this.getTimeline(this.currentSongId);
      return Math.max(0, this.audio.currentTime - timeline.audioStartOffset);
    }
    return 0;
  }

  public getDuration(): number {
    return this.getTimeline(this.currentSongId).duration;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getVolumeLevel(): number {
    return this.volume;
  }

  public getCurrentSongId(): SongId {
    return this.currentSongId;
  }

  public getBassEnergy(): number {
    if (!this.analyser) {
      if (!this.isPlaying) return 0;
      const t = this.getCurrentTime();
      return 0.3 + 0.3 * Math.sin(t * 8);
    }
    this.analyser.getByteFrequencyData(this.freqData);
    let sum = 0;
    for (let i = 0; i < 8; i++) {
      sum += this.freqData[i];
    }
    return (sum / 8) / 255;
  }

  public subscribeTime(cb: AudioCallback): () => void {
    this.onTimeListeners.add(cb);
    return () => this.onTimeListeners.delete(cb);
  }

  public subscribeState(cb: StateCallback): () => void {
    this.onStateListeners.add(cb);
    return () => this.onStateListeners.delete(cb);
  }

  public subscribeEnd(cb: EndCallback): () => void {
    this.onEndListeners.add(cb);
    return () => this.onEndListeners.delete(cb);
  }

  public cleanupCurrentAudio() {
    this.stopTimeLoop();
    this.stopSyntheticClock();
    if (this.audio) {
      this.audio.pause();
      this.audio.removeEventListener('timeupdate', this.handleTimeUpdate);
      this.audio.removeEventListener('ended', this.handleEnded);
      this.audio.removeEventListener('error', this.handleAudioError);
      this.audio.src = '';
      this.audio = null;
    }
    if (this.glitchAudio) {
      this.glitchAudio.pause();
      this.glitchAudio = null;
    }
    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect();
      } catch {}
      this.sourceNode = null;
    }
    this.syntheticTime = 0;
    this.isPlaying = false;
  }
}

export const audioEngine = new AudioEngine();
