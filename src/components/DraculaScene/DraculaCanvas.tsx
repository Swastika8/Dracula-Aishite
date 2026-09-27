import React, { useEffect, useRef } from 'react';
import { framePreloader } from '../../services/framePreloader';
import { Beat } from '../../types';

interface DraculaCanvasProps {
  currentTime: number;
  currentBeat: Beat;
  bassEnergy: number;
  width: number;
  height: number;
}

interface StarParticle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  twinkleSpeed: number;
}

export const DraculaCanvas: React.FC<DraculaCanvasProps> = ({
  currentTime,
  currentBeat,
  bassEnergy,
  width,
  height
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const starsRef = useRef<StarParticle[]>([]);

  // Initialize atmospheric paper dust / stars
  useEffect(() => {
    const stars: StarParticle[] = [];
    for (let i = 0; i < 45; i++) {
      stars.push({
        x: Math.random() * 1920,
        y: Math.random() * 600, // mostly in the upper sky
        size: 1 + Math.random() * 2.5,
        speed: 0.15 + Math.random() * 0.4,
        opacity: 0.2 + Math.random() * 0.6,
        twinkleSpeed: 1 + Math.random() * 3
      });
    }
    starsRef.current = stars;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check for Section 8 (BLACK)
    if (currentBeat.id === 'd_black' || currentTime >= 43.0) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);
      return;
    }

    // Audio-driven frame index calculation:
    // progress = (audio.currentTime - sectionStart) / (sectionEnd - sectionStart)
    // frameIndex = progress * (numberOfFrames - 1)
    const beat = currentBeat;
    const sectionDuration = Math.max(0.001, beat.endTime - beat.startTime);
    const progress = Math.max(0, Math.min(1, (currentTime - beat.startTime) / sectionDuration));
    const numberOfFrames = beat.frameEnd - beat.frameStart + 1;

    const rawPos = beat.frameStart + progress * (numberOfFrames - 1);
    let frameIndex = Math.min(beat.frameEnd, Math.floor(rawPos));
    let nextFrameIndex = Math.min(beat.frameEnd, frameIndex + 1);
    const frac = rawPos - Math.floor(rawPos);

    const isGlitch = beat.id === 'd_glitch';
    const isManInMoon = beat.id === 'd_moon_man';
    const isSunrise = beat.id === 'd_sunrise';

    // In glitch section, rapid frame jitter and stutter at 15+ FPS
    if (isGlitch) {
      const glitchStrength = Math.min(1, (currentTime - beat.startTime) / (sectionDuration * 0.8));
      if (Math.random() < 0.6 + glitchStrength * 0.3) {
        const jitter = Math.floor((Math.random() - 0.5) * 10);
        frameIndex = Math.max(286, Math.min(300, frameIndex + jitter));
        nextFrameIndex = frameIndex;
      }
    }

    frameIndex = Math.max(1, Math.min(300, frameIndex));
    nextFrameIndex = Math.max(1, Math.min(300, nextFrameIndex));

    // Keep preloader sliding window up to date
    framePreloader.updateWindow('dracula', frameIndex, 35, 10);

    const img = framePreloader.getFrame('dracula', frameIndex);
    const nextImg = (nextFrameIndex !== frameIndex) ? framePreloader.getFrame('dracula', nextFrameIndex) : null;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Black frame flash during glitch
    if (isGlitch && Math.random() < 0.22) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);
      return;
    }

    // Camera drift & zoom (subtle tactile movement, never over-smoothed)
    ctx.save();

    let scale = 1.015 + 0.015 * Math.sin(currentTime * 0.25);
    let panX = 10 * Math.sin(currentTime * 0.18);
    let panY = 5 * Math.cos(currentTime * 0.14);

    // Push-in for the Man in the Moon moment
    if (isManInMoon) {
      const moonProg = Math.max(0, Math.min(1, (currentTime - beat.startTime) / sectionDuration));
      scale = 1.02 + moonProg * 0.08;
      panX += moonProg * -10;
      panY += moonProg * -14;
    }

    // Glitch camera vibration
    if (isGlitch) {
      const shakeAmp = 15 * Math.min(1, (currentTime - beat.startTime) / 4);
      panX += (Math.random() - 0.5) * shakeAmp;
      panY += (Math.random() - 0.5) * shakeAmp;
    }

    ctx.translate(width / 2 + panX, height / 2 + panY);
    ctx.scale(scale, scale);
    ctx.translate(-width / 2, -height / 2);

    // Calculate aspect fill
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

    // Render the active discrete animation frame (12-15 FPS cinematic feel)
    if (img) {
      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      // Subtle cinematic micro-crossfade in the last 35% of each frame step
      // Keeps the world continuously moving without turning it into a blurry 60 FPS dissolve
      if (nextImg && frac > 0.65 && !isGlitch) {
        const blend = ((frac - 0.65) / 0.35) * 0.85;
        ctx.globalAlpha = blend;
        ctx.drawImage(nextImg, drawX, drawY, drawW, drawH);
        ctx.globalAlpha = 1.0;
      }
    } else {
      ctx.fillStyle = '#0a192f';
      ctx.fillRect(drawX, drawY, drawW, drawH);
    }

    // Atmospheric Sunrise warmth
    if (isSunrise) {
      const sunWarmth = Math.max(0, Math.min(1, (currentTime - beat.startTime) / sectionDuration));
      const grad = ctx.createRadialGradient(
        width * 0.5, height * 0.45, 50,
        width * 0.5, height * 0.45, width * 0.7
      );
      grad.addColorStop(0, `rgba(255, 210, 130, ${0.16 * sunWarmth})`);
      grad.addColorStop(0.5, `rgba(240, 160, 80, ${0.08 * sunWarmth})`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    // Cinematic Spotlight during "Man in the Moon"
    if (isManInMoon) {
      const spotGrad = ctx.createRadialGradient(
        width * 0.52, height * 0.42, 60,
        width * 0.52, height * 0.42, width * 0.65
      );
      spotGrad.addColorStop(0, 'rgba(255, 245, 210, 0.12)');
      spotGrad.addColorStop(0.4, 'rgba(210, 225, 245, 0.06)');
      spotGrad.addColorStop(1, 'rgba(10, 15, 30, 0.35)');
      ctx.fillStyle = spotGrad;
      ctx.fillRect(0, 0, width, height);
    }

    // Floating paper dust / sky particles
    if (!isGlitch && starsRef.current.length > 0) {
      ctx.save();
      const stars = starsRef.current;
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.x -= s.speed * (0.8 + bassEnergy * 0.4);
        if (s.x < 0) s.x = 1920;

        const screenX = (s.x / 1920) * width;
        const screenY = (s.y / 1080) * height;
        const twinkle = s.opacity + 0.2 * Math.sin(currentTime * s.twinkleSpeed + i);

        ctx.fillStyle = `rgba(245, 235, 210, ${Math.max(0.1, twinkle)})`;
        ctx.beginPath();
        ctx.arc(screenX, screenY, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Procedural Glitch & Layer Tearing
    if (isGlitch) {
      const collapseProgress = Math.max(0, (currentTime - beat.startTime) / sectionDuration);
      const tearCount = Math.floor(4 + collapseProgress * 10);

      for (let t = 0; t < tearCount; t++) {
        if (Math.random() < 0.7) {
          const sliceY = Math.random() * height;
          const sliceH = 8 + Math.random() * (25 + collapseProgress * 55);
          const sliceShift = (Math.random() - 0.5) * (20 + collapseProgress * 75);

          ctx.drawImage(
            canvas,
            0, sliceY, width, sliceH,
            sliceShift, sliceY, width, sliceH
          );

          if (Math.random() < 0.45) {
            ctx.fillStyle = Math.random() > 0.5 
              ? 'rgba(255, 0, 80, 0.3)' 
              : 'rgba(0, 220, 255, 0.3)';
            ctx.fillRect(0, sliceY, width, sliceH);
          }
        }
      }

      if (Math.random() < 0.5) {
        ctx.globalCompositeOperation = 'screen';
        ctx.drawImage(canvas, -6, 0, width, height);
        ctx.globalCompositeOperation = 'source-over';
      }
    }

    // Subtle paper grain
    ctx.save();
    ctx.globalAlpha = 0.035;
    ctx.fillStyle = '#ffffff';
    for (let g = 0; g < 15; g++) {
      const gy = (g * 71) % height;
      ctx.fillRect(0, gy, width, 1);
    }
    ctx.restore();

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
