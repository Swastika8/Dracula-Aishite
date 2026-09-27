import React, { useEffect, useState, useRef } from 'react';

interface EyeTrackerOverlayProps {
  width: number;
  height: number;
  active: boolean; // only active in beats where she is facing forward
  intensity?: number;
}

export const EyeTrackerOverlay: React.FC<EyeTrackerOverlayProps> = ({
  width,
  height,
  active,
  intensity = 1.0
}) => {
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: width / 2, y: height / 2 });
  const [smoothOffsetL, setSmoothOffsetL] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [smoothOffsetR, setSmoothOffsetR] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [glowAmount, setGlowAmount] = useState<number>(0);
  const targetOffsetL = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const targetOffsetR = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Track global mouse
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Compute eye coordinates in rendered screen space
  // Base 1920x1080 coordinates:
  // Left eye: (883, 411) -> 883/1920 = 0.4599, 411/1080 = 0.3805
  // Right eye: (1024, 419) -> 1024/1920 = 0.5333, 419/1080 = 0.3880
  const canvasAspect = width / height;
  const imgAspect = 1920 / 1080;
  let renderW = width;
  let renderH = height;
  let offsetX = 0;
  let offsetY = 0;

  if (canvasAspect > imgAspect) {
    renderW = width;
    renderH = width / imgAspect;
    offsetY = (height - renderH) / 2;
  } else {
    renderH = height;
    renderW = height * imgAspect;
    offsetX = (width - renderW) / 2;
  }

  const leftEyeScreenX = offsetX + renderW * 0.4599;
  const leftEyeScreenY = offsetY + renderH * 0.3805;

  const rightEyeScreenX = offsetX + renderW * 0.5333;
  const rightEyeScreenY = offsetY + renderH * 0.3880;

  const pupilRadius = Math.max(12, renderW * (18 / 1920));

  // Compute clamped pupil vector
  useEffect(() => {
    if (!active) return;

    // Left eye vector
    const dxL = mousePos.x - leftEyeScreenX;
    const dyL = mousePos.y - leftEyeScreenY;
    const distL = Math.hypot(dxL, dyL);
    const angleL = Math.atan2(dyL, dxL);
    const maxOffset = Math.max(4, renderW * (6.5 / 1920));
    const clampedDistL = Math.min(maxOffset, distL * 0.025);

    targetOffsetL.current = {
      x: Math.cos(angleL) * clampedDistL,
      y: Math.sin(angleL) * clampedDistL * 0.75 // vertical eye motion is slightly flatter
    };

    // Right eye vector
    const dxR = mousePos.x - rightEyeScreenX;
    const dyR = mousePos.y - rightEyeScreenY;
    const distR = Math.hypot(dxR, dyR);
    const angleR = Math.atan2(dyR, dxR);
    const clampedDistR = Math.min(maxOffset, distR * 0.025);

    targetOffsetR.current = {
      x: Math.cos(angleR) * clampedDistR,
      y: Math.sin(angleR) * clampedDistR * 0.75
    };

    // Glow intensity when mouse is looking directly into her face
    const distToFace = Math.hypot(mousePos.x - (width / 2), mousePos.y - (leftEyeScreenY + rightEyeScreenY) / 2);
    const closeness = Math.max(0, 1 - distToFace / (width * 0.45));
    setGlowAmount(closeness);
  }, [mousePos, active, leftEyeScreenX, leftEyeScreenY, rightEyeScreenX, rightEyeScreenY, width, renderW]);

  // Smooth lerp animation loop
  useEffect(() => {
    let animId: number;
    const tick = () => {
      setSmoothOffsetL(prev => ({
        x: prev.x + (targetOffsetL.current.x - prev.x) * 0.14,
        y: prev.y + (targetOffsetL.current.y - prev.y) * 0.14
      }));
      setSmoothOffsetR(prev => ({
        x: prev.x + (targetOffsetR.current.x - prev.x) * 0.14,
        y: prev.y + (targetOffsetR.current.y - prev.y) * 0.14
      }));
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  if (!active) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {/* Left Pupil Overlay */}
      <div
        className="absolute rounded-full pointer-events-none transition-transform duration-75 ease-out"
        style={{
          width: `${pupilRadius * 2}px`,
          height: `${pupilRadius * 2}px`,
          left: `${leftEyeScreenX - pupilRadius}px`,
          top: `${leftEyeScreenY - pupilRadius}px`,
          transform: `translate3d(${smoothOffsetL.x}px, ${smoothOffsetL.y}px, 0)`,
          background: 'radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.9) 0%, rgba(216, 70, 239, 0.85) 30%, rgba(76, 29, 149, 0.9) 65%, rgba(20, 5, 30, 0.95) 90%)',
          boxShadow: `0 0 ${12 + glowAmount * 16}px rgba(236, 72, 153, ${0.45 + glowAmount * 0.45 * intensity})`,
          mixBlendMode: 'screen',
          opacity: 0.88 * intensity
        }}
      >
        {/* Corneal Specular Glint */}
        <div 
          className="absolute rounded-full bg-white"
          style={{
            width: `${pupilRadius * 0.35}px`,
            height: `${pupilRadius * 0.35}px`,
            top: '25%',
            left: '30%',
            filter: 'blur(0.4px)',
            opacity: 0.95
          }}
        />
      </div>

      {/* Right Pupil Overlay */}
      <div
        className="absolute rounded-full pointer-events-none transition-transform duration-75 ease-out"
        style={{
          width: `${pupilRadius * 2}px`,
          height: `${pupilRadius * 2}px`,
          left: `${rightEyeScreenX - pupilRadius}px`,
          top: `${rightEyeScreenY - pupilRadius}px`,
          transform: `translate3d(${smoothOffsetR.x}px, ${smoothOffsetR.y}px, 0)`,
          background: 'radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.9) 0%, rgba(216, 70, 239, 0.85) 30%, rgba(76, 29, 149, 0.9) 65%, rgba(20, 5, 30, 0.95) 90%)',
          boxShadow: `0 0 ${12 + glowAmount * 16}px rgba(236, 72, 153, ${0.45 + glowAmount * 0.45 * intensity})`,
          mixBlendMode: 'screen',
          opacity: 0.88 * intensity
        }}
      >
        {/* Corneal Specular Glint */}
        <div 
          className="absolute rounded-full bg-white"
          style={{
            width: `${pupilRadius * 0.35}px`,
            height: `${pupilRadius * 0.35}px`,
            top: '25%',
            left: '30%',
            filter: 'blur(0.4px)',
            opacity: 0.95
          }}
        />
      </div>
    </div>
  );
};
