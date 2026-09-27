import React, { useMemo } from 'react';
import { DRACULA_TIMELINE } from '../../data/timelineData';
import { DraculaCanvas } from './DraculaCanvas';

interface DraculaSceneProps {
  currentTime: number;
  bassEnergy: number;
  width: number;
  height: number;
}

export const DraculaScene: React.FC<DraculaSceneProps> = ({
  currentTime,
  bassEnergy,
  width,
  height
}) => {
  // Find current beat
  const currentBeat = useMemo(() => {
    const beats = DRACULA_TIMELINE.beats;
    for (let i = beats.length - 1; i >= 0; i--) {
      if (currentTime >= beats[i].startTime) {
        return beats[i];
      }
    }
    return beats[0];
  }, [currentTime]);

  const isCollapse = currentBeat.specialEffect === 'collapse';
  const isManInMoon = currentBeat.specialEffect === 'man_in_moon';

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950 select-none">
      {/* Background & Frame Rendering Canvas */}
      <DraculaCanvas
        currentTime={currentTime}
        currentBeat={currentBeat}
        bassEnergy={bassEnergy}
        width={width}
        height={height}
      />

      {/* Cinematic Paper Grain & Vignette */}
      <div 
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-1000"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 45%, rgba(4, 10, 22, 0.65) 100%)',
          mixBlendMode: 'multiply'
        }}
      />

      {/* Standout Man in the Moon Focus Halo */}
      {isManInMoon && (
        <div 
          className="pointer-events-none absolute inset-0 z-15 animate-pulse"
          style={{
            background: 'radial-gradient(circle at 52% 42%, rgba(245, 230, 180, 0.08) 0%, rgba(0,0,0,0) 60%)',
            animationDuration: '3.5s'
          }}
        />
      )}

      {/* Collapse CRT Scanlines & Screen Jitter */}
      {isCollapse && (
        <div 
          className="pointer-events-none absolute inset-0 z-20 crt-scanlines opacity-40 mix-blend-overlay"
        />
      )}
    </div>
  );
};
