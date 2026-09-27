import React, { useEffect, useState, useRef } from 'react';
import { framePreloader } from '../../services/framePreloader';

interface CursedMirrorOverlayProps {
  width: number;
  height: number;
  active: boolean;
  currentTime: number;
}

export const CursedMirrorOverlay: React.FC<CursedMirrorOverlayProps> = ({
  width,
  height,
  active,
  currentTime
}) => {
  const [laggedMouse, setLaggedMouse] = useState<{ x: number; y: number }>({ x: width / 2, y: height / 2 });
  const realMouse = useRef<{ x: number; y: number }>({ x: width / 2, y: height / 2 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      realMouse.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  // Extremely lagged motion for the mirror's reflection
  useEffect(() => {
    if (!active) return;
    let animId: number;
    const loop = () => {
      setLaggedMouse(prev => ({
        x: prev.x + (realMouse.current.x - prev.x) * 0.025, // Notice very slow lerp: continues after mouse stops!
        y: prev.y + (realMouse.current.y - prev.y) * 0.025
      }));
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [active]);

  if (!active) return null;

  // Mirror floating parameters
  const mirrorX = width * 0.18 + Math.sin(currentTime * 0.4) * 12;
  const mirrorY = height * 0.22 + Math.cos(currentTime * 0.3) * 16;
  const mirrorW = Math.max(160, width * 0.15);
  const mirrorH = mirrorW * 1.55;

  const mirrorFrameImg = framePreloader.getFrame('aishite', 30);

  return (
    <div className="pointer-events-none absolute inset-0 z-21 overflow-hidden">
      {/* Floating Ornate Mirror Frame */}
      <div
        className="absolute rounded-[50%/35%] transition-all duration-300 ease-out shadow-2xl"
        style={{
          left: `${mirrorX}px`,
          top: `${mirrorY}px`,
          width: `${mirrorW}px`,
          height: `${mirrorH}px`,
          border: '4px solid rgba(220, 180, 140, 0.45)',
          boxShadow: '0 0 35px rgba(244, 63, 94, 0.35), inset 0 0 25px rgba(0, 0, 0, 0.8)',
          background: 'rgba(10, 4, 12, 0.85)',
          transform: `rotate(${Math.sin(currentTime * 0.3) * 4}deg)`,
          overflow: 'hidden'
        }}
      >
        {/* Reflection Inside the Mirror */}
        {mirrorFrameImg && (
          <div
            className="w-full h-full relative"
            style={{
              filter: 'sepia(0.3) hue-rotate(300deg) contrast(1.15) brightness(0.9)',
              transform: `scaleX(-1) translate3d(${(laggedMouse.x - width / 2) * -0.04}px, ${(laggedMouse.y - height / 2) * -0.03}px, 0)`,
              transition: 'transform 0.1s ease-out'
            }}
          >
            <img
              src={mirrorFrameImg.src}
              alt="Cursed Reflection"
              className="w-full h-full object-cover scale-150 -translate-y-4"
              style={{ objectPosition: 'center 35%' }}
            />
            
            {/* Rebellious Red Pupil Glint inside mirror */}
            <div
              className="absolute rounded-full"
              style={{
                width: '6px',
                height: '6px',
                left: '48%',
                top: '41%',
                background: '#ff0055',
                boxShadow: '0 0 8px #ff0055',
                opacity: 0.85
              }}
            />
          </div>
        )}

        {/* Mirror Glass Glare / Sheen */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 45%, rgba(244,63,94,0.15) 100%)'
          }}
        />
      </div>
    </div>
  );
};
