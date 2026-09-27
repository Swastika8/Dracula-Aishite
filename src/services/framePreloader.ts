import { SongId } from '../types';
import { DRACULA_TIMELINE, AISHITE_TIMELINE } from '../data/timelineData';

class FramePreloader {
  private cache: Map<string, HTMLImageElement> = new Map();
  private pending: Set<string> = new Set();
  private maxCacheSize: number = 120; // Expanded sliding window memory buffer for 12-15 FPS

  private getTimeline(songId: SongId) {
    return songId === 'dracula' ? DRACULA_TIMELINE : AISHITE_TIMELINE;
  }

  public getFramePath(songId: SongId, frameIndex: number): string {
    const timeline = this.getTimeline(songId);
    const clamped = Math.max(1, Math.min(timeline.frameCount, frameIndex));
    const padIndex = clamped.toString().padStart(3, '0');
    return `${timeline.framePath}/${timeline.framePrefix}${padIndex}.jpg`;
  }

  public getFrameKey(songId: SongId, frameIndex: number): string {
    return `${songId}:${frameIndex}`;
  }

  public getFrame(songId: SongId, frameIndex: number): HTMLImageElement | null {
    const key = this.getFrameKey(songId, frameIndex);
    const img = this.cache.get(key);
    if (img && img.complete && img.naturalWidth > 0) {
      return img;
    }

    // Trigger load if not in cache
    this.preloadFrame(songId, frameIndex);

    // Fallback: look for nearby loaded frame in cache so screen is never blank!
    const timeline = this.getTimeline(songId);
    for (let delta = 1; delta <= 15; delta++) {
      const prevKey = this.getFrameKey(songId, Math.max(1, frameIndex - delta));
      const prevImg = this.cache.get(prevKey);
      if (prevImg && prevImg.complete && prevImg.naturalWidth > 0) return prevImg;

      const nextKey = this.getFrameKey(songId, Math.min(timeline.frameCount, frameIndex + delta));
      const nextImg = this.cache.get(nextKey);
      if (nextImg && nextImg.complete && nextImg.naturalWidth > 0) return nextImg;
    }

    return null;
  }

  public preloadFrame(songId: SongId, frameIndex: number): Promise<HTMLImageElement> {
    const key = this.getFrameKey(songId, frameIndex);
    if (this.cache.has(key)) {
      return Promise.resolve(this.cache.get(key)!);
    }

    const src = this.getFramePath(songId, frameIndex);
    if (this.pending.has(key)) {
      // return a promise that resolves once complete
      return new Promise((resolve) => {
        const check = () => {
          const cached = this.cache.get(key);
          if (cached && cached.complete) resolve(cached);
          else setTimeout(check, 30);
        };
        check();
      });
    }

    this.pending.add(key);
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = src;
      img.onload = () => {
        this.cache.set(key, img);
        this.pending.delete(key);
        resolve(img);
      };
      img.onerror = (err) => {
        this.pending.delete(key);
        console.warn(`[FramePreloader] Failed to load frame ${src}`, err);
        reject(err);
      };
    });
  }

  /**
   * Preload nearby window of frames and prune distant frames
   */
  public updateWindow(songId: SongId, currentFrame: number, lookAhead = 35, lookBehind = 10) {
    const timeline = this.getTimeline(songId);
    const start = Math.max(1, currentFrame - lookBehind);
    const end = Math.min(timeline.frameCount, currentFrame + lookAhead);

    for (let i = start; i <= end; i++) {
      if (!this.cache.has(this.getFrameKey(songId, i))) {
        this.preloadFrame(songId, i).catch(() => {});
      }
    }

    // Prune distant frames if cache grows too large
    if (this.cache.size > this.maxCacheSize) {
      for (const [key] of this.cache) {
        const [kSong, kIndexStr] = key.split(':');
        const kIndex = parseInt(kIndexStr, 10);
        if (kSong !== songId || kIndex < start - 25 || kIndex > end + 45) {
          this.cache.delete(key);
        }
      }
    }
  }

  public clearAll() {
    this.cache.clear();
    this.pending.clear();
  }
}

export const framePreloader = new FramePreloader();
