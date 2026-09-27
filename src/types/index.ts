export type SongId = 'dracula' | 'aishite';

export interface Beat {
  id: string;
  name: string;
  startTime: number;       // In seconds
  endTime: number;         // In seconds
  startProgress: number;   // 0.0 to 1.0
  endProgress: number;     // 0.0 to 1.0
  frameStart: number;      // 1-based frame index
  frameEnd: number;        // 1-based frame index
  description: string;
  intensity: number;       // 0.0 to 1.0
  specialEffect?: 'drift' | 'sunrise' | 'daylight' | 'sunset' | 'moonrise' | 'man_in_moon' | 'collapse' | 'spark' | 'ribbons' | 'typography' | 'mirror' | 'duplicates' | 'climax' | 'void_eyes';
}

export interface LyricLine {
  time: number;
  text: string;
  subtext?: string;
  glitchLevel?: number;    // 0 = clean, 1 = moderate, 2 = heavy
}

export interface SongTimeline {
  id: SongId;
  title: string;
  artist: string;
  audioSrc: string;
  audioStartOffset: number; // In seconds into the source MP3
  audioEndOffset: number;   // In seconds into the source MP3
  duration: number;         // Segment duration in seconds
  frameCount: number;
  framePrefix: string;
  framePath: string;
  beats: Beat[];
  lyrics: LyricLine[];
}

export interface FloatingTypographyItem {
  id: string;
  text: string;
  translation?: string;
  x: number;
  y: number;
  z: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  vx: number;
  vy: number;
  color: string;
  burst?: boolean;
}

export interface PetalParticle {
  x: number;
  y: number;
  z: number;
  size: number;
  vx: number;
  vy: number;
  angle: number;
  vAngle: number;
  color: string;
  opacity: number;
  petalType: 'camellia' | 'sakura' | 'dust';
}

export interface EyeState {
  x: number;
  y: number;
  angle: number;
  distance: number;
  isHovering: boolean;
  pupilOffsetL: { x: number; y: number };
  pupilOffsetR: { x: number; y: number };
}
