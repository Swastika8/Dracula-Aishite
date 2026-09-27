import React, { useEffect, useRef } from 'react';
import { FLOATING_KANJI_STRINGS } from '../../data/timelineData';

interface FloatingTypographyCanvasProps {
  width: number;
  height: number;
  currentTime: number;
  intensity: number;      // 0.0 to 1.0 based on beat
  bassEnergy: number;
  isClimax: boolean;
}

interface TypographyParticle {
  id: number;
  text: string;
  x: number;          // -width/2 to width/2
  y: number;          // -height/2 to height/2
  z: number;          // 50 to 1200
  vx: number;
  vy: number;
  vz: number;
  rotation: number;
  vRot: number;
  baseSize: number;
  opacity: number;
  color: string;
  isFragment: boolean;
}

export const FloatingTypographyCanvas: React.FC<FloatingTypographyCanvasProps> = ({
  width,
  height,
  currentTime,
  intensity,
  bassEnergy,
  isClimax
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<TypographyParticle[]>([]);
  const nextId = useRef<number>(0);
  const lastSpawnTime = useRef<number>(0);

  // Initialize and spawn particles based on intensity
  useEffect(() => {
    // If intensity is very low (awakening), keep empty
    if (intensity < 0.25) {
      particlesRef.current = [];
      return;
    }

    const maxParticles = isClimax ? 48 : Math.floor(6 + intensity * 26);
    const spawnInterval = isClimax ? 0.25 : Math.max(0.6, 2.2 - intensity * 1.5);

    if (currentTime - lastSpawnTime.current > spawnInterval && particlesRef.current.length < maxParticles) {
      lastSpawnTime.current = currentTime;

      // Pick string based on intensity
      let textPool = [FLOATING_KANJI_STRINGS[0].text];
      if (intensity > 0.4) textPool.push(FLOATING_KANJI_STRINGS[1].text, FLOATING_KANJI_STRINGS[2].text);
      if (intensity > 0.6) textPool.push(FLOATING_KANJI_STRINGS[3].text, FLOATING_KANJI_STRINGS[4].text);
      if (intensity > 0.8) textPool.push(FLOATING_KANJI_STRINGS[5].text, FLOATING_KANJI_STRINGS[6].text);

      const chosenText = textPool[Math.floor(Math.random() * textPool.length)];

      const colors = isClimax
        ? ['#ff1744', '#f50057', '#d500f9', '#ffffff', '#ff80ab']
        : ['#f43f5e', '#fb7185', '#fda4af', '#fdf2f8', '#e11d48'];

      particlesRef.current.push({
        id: nextId.current++,
        text: chosenText,
        x: (Math.random() - 0.5) * width * 1.2,
        y: (Math.random() - 0.5) * height * 1.2,
        z: 900 + Math.random() * 300,
        vx: (Math.random() - 0.5) * (15 + intensity * 35),
        vy: (Math.random() - 0.5) * (15 + intensity * 35),
        vz: -(70 + intensity * 160 + (isClimax ? 200 : 0)),
        rotation: (Math.random() - 0.5) * 0.4,
        vRot: (Math.random() - 0.5) * (0.1 + intensity * 0.3),
        baseSize: 32 + Math.random() * 36,
        opacity: 0,
        color: colors[Math.floor(Math.random() * colors.length)],
        isFragment: false
      });
    }
  }, [currentTime, intensity, isClimax, width, height]);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    const fov = 450;
    const cx = width / 2;
    const cy = height / 2;
    const particles = particlesRef.current;

    // Sort by Z for true depth ordering
    particles.sort((a, b) => b.z - a.z);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      // Update positions
      p.z += p.vz * 0.016;
      p.x += p.vx * 0.016;
      p.y += p.vy * 0.016;
      p.rotation += p.vRot * 0.016;

      // Fade in smoothly when far, fade out when very close to camera
      if (p.z > 800) {
        p.opacity = Math.min(0.9, p.opacity + 0.04);
      } else if (p.z < 150) {
        p.opacity = Math.max(0, p.opacity - 0.05);
      } else {
        p.opacity = Math.min(0.92, p.opacity + 0.02);
      }

      // Despawn if passed camera
      if (p.z <= 30 || p.opacity <= 0.01) {
        // If climax, burst into characters
        if (isClimax && !p.isFragment && p.text.length > 1 && particles.length < 55) {
          const chars = p.text.split('');
          for (let c = 0; c < chars.length; c++) {
            particles.push({
              id: nextId.current++,
              text: chars[c],
              x: p.x + (c - chars.length / 2) * 50,
              y: p.y,
              z: p.z + 100,
              vx: (Math.random() - 0.5) * 180,
              vy: (Math.random() - 0.5) * 180,
              vz: -(150 + Math.random() * 150),
              rotation: (Math.random() - 0.5) * 1.5,
              vRot: (Math.random() - 0.5) * 2.0,
              baseSize: p.baseSize * 0.8,
              opacity: 0.9,
              color: '#ff0055',
              isFragment: true
            });
          }
        }
        particles.splice(i, 1);
        continue;
      }

      // 3D Perspective Projection
      const scale = fov / (fov + p.z);
      const screenX = cx + p.x * scale;
      const screenY = cy + p.y * scale;
      const renderSize = p.baseSize * scale * (1.0 + bassEnergy * 0.18);

      if (screenX < -150 || screenX > width + 150 || screenY < -150 || screenY > height + 150) {
        continue;
      }

      ctx.save();
      ctx.translate(screenX, screenY);
      ctx.rotate(p.rotation);

      ctx.font = `900 ${renderSize}px 'Shippori Mincho', 'Noto Serif JP', serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Ethereal outer glow
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10 + bassEnergy * 20;

      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;
      ctx.fillText(p.text, 0, 0);

      // Climax stroke highlight
      if (isClimax) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(1, 2 * scale);
        ctx.strokeText(p.text, 0, 0);
      }

      ctx.restore();
    }
  }, [width, height, currentTime, intensity, bassEnergy, isClimax]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="pointer-events-none absolute inset-0 z-22 w-full h-full object-cover"
      style={{ display: 'block' }}
    />
  );
};
