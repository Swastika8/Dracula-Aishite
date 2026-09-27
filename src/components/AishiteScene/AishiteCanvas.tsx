import React, { useEffect, useRef } from 'react';
import { framePreloader } from '../../services/framePreloader';
import { Beat } from '../../types';

interface AishiteCanvasProps {
  currentTime: number;
  currentBeat: Beat;
  bassEnergy: number;
  width: number;
  height: number;
}

interface Petal {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  vRot: number;
  color: string;
  opacity: number;
}

export const AishiteCanvas: React.FC<AishiteCanvasProps> = ({
  currentTime,
  currentBeat,
  bassEnergy,
  width,
  height
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const petalsRef = useRef<Petal[]>([]);

  // Initialize swirling camellia petals
  useEffect(() => {
    const petals: Petal[] = [];
    const colors = ['#f43f5e', '#fb7185', '#e11d48', '#be123c', '#fda4af'];
    for (let i = 0; i < 55; i++) {
      petals.push({
        x: Math.random() * 1920,
        y: Math.random() * 1080,
        z: 0.3 + Math.random() * 1.5,
        vx: 15 + Math.random() * 30,
        vy: 20 + Math.random() * 45,
        size: 5 + Math.random() * 9,
        rotation: Math.random() * Math.PI * 2,
        vRot: 0.5 + Math.random() * 2.0,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 0.3 + Math.random() * 0.6
      });
    }
    petalsRef.current = petals;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check for blackout
    if (currentBeat.id === 'a_blackout' || currentTime >= 25.5) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);
      return;
    }

    const beat = currentBeat;
    const sectionDuration = Math.max(0.001, beat.endTime - beat.startTime);
    const progress = Math.max(0, Math.min(1, (currentTime - beat.startTime) / sectionDuration));
    const numberOfFrames = beat.frameEnd - beat.frameStart + 1;

    const rawPos = beat.frameStart + progress * (numberOfFrames - 1);
    let frameIndex = Math.min(beat.frameEnd, Math.floor(rawPos));
    let nextFrameIndex = Math.min(beat.frameEnd, frameIndex + 1);
    const frac = rawPos - Math.floor(rawPos);

    const isClimax = beat.id === 'a_climax';
    const isVoid = beat.id === 'a_ending_void' || beat.id === 'a_blackout';

    // In climax section, rapid frame cycling at 15+ FPS
    if (isClimax) {
      if (bassEnergy > 0.55 || Math.random() < 0.4) {
        frameIndex = Math.max(39, Math.min(47, frameIndex + Math.floor((Math.random() - 0.5) * 4)));
        nextFrameIndex = frameIndex;
      }
    }

    frameIndex = Math.max(1, Math.min(50, frameIndex));
    nextFrameIndex = Math.max(1, Math.min(50, nextFrameIndex));

    // Keep preloader sliding window up to date
    framePreloader.updateWindow('aishite', frameIndex, 25, 8);

    const img = framePreloader.getFrame('aishite', frameIndex);
    const nextImg = (nextFrameIndex !== frameIndex) ? framePreloader.getFrame('aishite', nextFrameIndex) : null;

    ctx.clearRect(0, 0, width, height);

    // Camera motion & breathing
    ctx.save();
    let scale = 1.015 + 0.015 * Math.sin(currentTime * 0.35) + bassEnergy * 0.02;
    let panX = 8 * Math.sin(currentTime * 0.25);
    let panY = 4 * Math.cos(currentTime * 0.2);

    if (isClimax) {
      panX += (Math.random() - 0.5) * (10 + bassEnergy * 18);
      panY += (Math.random() - 0.5) * (10 + bassEnergy * 18);
    }

    ctx.translate(width / 2 + panX, height / 2 + panY);
    ctx.scale(scale, scale);
    ctx.translate(-width / 2, -height / 2);

    // Aspect ratio positioning
    const canvasAspect = width / height;
    const imgAspect = 1920 / 1080;
    let drawW = width;
    let drawH = height;
    let drawX = 0;
    let drawY = 0;

    if (canvasAspect > imgAspect) {
      drawW = width;
      drawH = width / imgAspect;
      drawY = (height - drawH) / 2;
    } else {
      drawH = height;
      drawW = height * imgAspect;
      drawX = (width - drawW) / 2;
    }

    // Render active discrete animation frame
    if (img) {
      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      // Subtle cinematic micro-crossfade during the last 35% of each frame step
      if (nextImg && frac > 0.65 && !isClimax) {
        const blend = ((frac - 0.65) / 0.35) * 0.85;
        ctx.globalAlpha = blend;
        ctx.drawImage(nextImg, drawX, drawY, drawW, drawH);
        ctx.globalAlpha = 1.0;
      }
    } else {
      ctx.fillStyle = '#060005';
      ctx.fillRect(drawX, drawY, drawW, drawH);
    }

    // Climax color pulsing (crimson -> magenta -> black strobe)
    if (isClimax) {
      const pulseProgress = Math.sin(currentTime * 16);
      ctx.fillStyle = pulseProgress > 0 
        ? `rgba(225, 29, 72, ${0.18 + bassEnergy * 0.25})`
        : `rgba(168, 85, 247, ${0.18 + bassEnergy * 0.25})`;
      ctx.globalCompositeOperation = 'color-dodge';
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'source-over';
    }

    // Swirling Camellia Petals (unless in final void)
    if (!isVoid) {
      const petals = petalsRef.current;
      const speedMult = 1.0 + (isClimax ? 2.5 : beat.intensity);

      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        p.x += (p.vx + Math.sin(currentTime * 2 + i) * 15) * 0.016 * speedMult;
        p.y += (p.vy + Math.cos(currentTime * 1.5 + i) * 10) * 0.016 * speedMult;
        p.rotation += p.vRot * 0.016 * speedMult;

        if (p.x > 1920 + 50) p.x = -50;
        if (p.y > 1080 + 50) p.y = -50;

        const screenX = (p.x / 1920) * width;
        const screenY = (p.y / 1080) * height;
        const screenW = p.size * (width / 1920) * p.z;
        const screenH = screenW * (0.6 + 0.4 * Math.cos(p.rotation));

        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.rotate(p.rotation);

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;

        // Draw curved camellia petal
        ctx.beginPath();
        ctx.moveTo(0, -screenH);
        ctx.bezierCurveTo(screenW, -screenH * 0.5, screenW, screenH * 0.5, 0, screenH);
        ctx.bezierCurveTo(-screenW, screenH * 0.5, -screenW, -screenH * 0.5, 0, -screenH);
        ctx.fill();

        ctx.restore();
      }
    }

    // Floating Translucent Silk Ribbon Curves
    if (beat.intensity > 0.35 && !isVoid) {
      ctx.save();
      const ribbonTime = currentTime * 1.2;
      const ribbonCount = isClimax ? 4 : 2;

      for (let r = 0; r < ribbonCount; r++) {
        const offsetR = r * 1.8;
        ctx.beginPath();
        ctx.lineWidth = 14 + Math.sin(ribbonTime + r) * 6;
        ctx.strokeStyle = r % 2 === 0 ? 'rgba(244, 63, 94, 0.22)' : 'rgba(232, 121, 249, 0.18)';
        ctx.lineCap = 'round';

        for (let x = 0; x <= width; x += 30) {
          const y = height * (0.45 + r * 0.25) + 
                    Math.sin(x * 0.003 + ribbonTime + offsetR) * 65 +
                    Math.cos(x * 0.006 - ribbonTime * 0.5) * 35;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.restore();
  }, [currentTime, currentBeat, bassEnergy, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 w-full h-full object-cover"
      style={{ display: 'block' }}
    />
  );
};
