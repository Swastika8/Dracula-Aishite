import React from 'react';
import { framePreloader } from '../../services/framePreloader';

interface DollClonesOverlayProps {
  width: number;
  height: number;
  active: boolean;
  currentTime: number;
  bassEnergy: number;
}

export const DollClonesOverlay: React.FC<DollClonesOverlayProps> = ({
  width,
  height,
  active,
  currentTime,
  bassEnergy
}) => {
  if (!active) return null;

  // Render ghost duplicates on flanks
  const clone1Img = framePreloader.getFrame('aishite', 35);
  const clone2Img = framePreloader.getFrame('aishite', 36);

  if (!clone1Img || !clone2Img) return null;

  const floatL = Math.sin(currentTime * 0.7) * 10;
  const floatR = Math.cos(currentTime * 0.65) * 10;

  return (
    <div className="pointer-events-none absolute inset-0 z-18 overflow-hidden">
      {/* Distant Left Doll Clone (Downcast gaze) */}
      <div
        className="absolute transition-opacity duration-1000"
        style={{
          left: `${width * 0.05}px`,
          top: `${height * 0.15 + floatL}px`,
          width: `${width * 0.35}px`,
          height: `${height * 0.75}px`,
          opacity: 0.38 + bassEnergy * 0.15,
          filter: 'blur(2px) contrast(1.1) brightness(0.85)',
          transform: 'scale(0.85)'
        }}
      >
        <img
          src={clone1Img.src}
          alt="Doll Clone Left"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Distant Right Doll Clone (Subtle direct gaze) */}
      <div
        className="absolute transition-opacity duration-1000"
        style={{
          right: `${width * 0.05}px`,
          top: `${height * 0.15 + floatR}px`,
          width: `${width * 0.35}px`,
          height: `${height * 0.75}px`,
          opacity: 0.38 + bassEnergy * 0.15,
          filter: 'blur(2px) contrast(1.1) brightness(0.85)',
          transform: 'scale(0.85) scaleX(-1)'
        }}
      >
        <img
          src={clone2Img.src}
          alt="Doll Clone Right"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Far Background Ethereal Duplicate Array */}
      <div
        className="absolute inset-0 flex justify-around items-center opacity-25 pointer-events-none"
        style={{
          filter: 'blur(4px) hue-rotate(290deg) brightness(0.7)',
          transform: `scale(0.7) translateY(${Math.sin(currentTime * 0.5) * 8}px)`
        }}
      >
        <div className="w-1/4 h-1/2 opacity-60">
          <img src={clone1Img.src} alt="Echo Clone 1" className="w-full h-full object-contain" />
        </div>
        <div className="w-1/4 h-1/2 opacity-60">
          <img src={clone2Img.src} alt="Echo Clone 2" className="w-full h-full object-contain" />
        </div>
      </div>
    </div>
  );
};
