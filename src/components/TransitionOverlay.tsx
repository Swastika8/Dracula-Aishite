import React, { useEffect, useState } from 'react';
import { framePreloader } from '../services/framePreloader';
import { audioEngine } from '../services/audioEngine';

interface TransitionOverlayProps {
  active: boolean;
  onComplete: () => void;
}

export const TransitionOverlay: React.FC<TransitionOverlayProps> = ({
  active,
  onComplete
}) => {
  const [phase, setPhase] = useState<'idle' | 'stutter' | 'tearing' | 'blackout' | 'pink_spark' | 'bloom' | 'done'>('idle');

  useEffect(() => {
    if (!active) {
      setPhase('idle');
      return;
    }

    // Play user-provided glitch audio
    audioEngine.playGlitchSound();

    // Sequence aligned with 3.1s glitch sound:
    // 0ms: stutter & freeze
    setPhase('stutter');

    // 800ms: tearing & chromatic glitch
    const t1 = setTimeout(() => {
      setPhase('tearing');
    }, 800);

    // 1700ms: complete blackout
    const t2 = setTimeout(() => {
      setPhase('blackout');
    }, 1700);

    // 2300ms: single pink point of light appears
    const t3 = setTimeout(() => {
      setPhase('pink_spark');
    }, 2300);

    // 3000ms: pink light expands into bloom
    const t4 = setTimeout(() => {
      setPhase('bloom');
    }, 3000);

    // 3700ms: transition complete, start Aishite
    const t5 = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 3700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [active, onComplete]);

  if (!active || phase === 'idle' || phase === 'done') return null;

  const sparkFrame = framePreloader.getFrame('aishite', 6);
  const corruptedFrame = framePreloader.getFrame('dracula', 290);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none select-none overflow-hidden bg-black">
      {/* Phase 1: Stutter & Frame Jitter */}
      {phase === 'stutter' && corruptedFrame && (
        <div className="w-full h-full relative animate-pulse" style={{ animationDuration: '0.08s' }}>
          <img
            src={corruptedFrame.src}
            alt="Corrupted Frame"
            className="w-full h-full object-cover filter contrast-125"
          />
          <div className="absolute inset-0 bg-red-500/20 mix-blend-color-dodge" />
        </div>
      )}

      {/* Phase 2: Tearing & Chromatic Static */}
      {phase === 'tearing' && (
        <div className="w-full h-full relative bg-slate-950 flex flex-col justify-between">
          {corruptedFrame && (
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={corruptedFrame.src}
                alt="Glitch Tearing"
                className="w-full h-full object-cover filter contrast-150"
                style={{
                  clipPath: 'polygon(0 15%, 100% 20%, 100% 75%, 0 85%)',
                  transform: 'translateX(25px)'
                }}
              />
            </div>
          )}
          {/* Black flashes */}
          <div className="absolute inset-0 bg-black animate-ping" style={{ animationDuration: '0.2s' }} />
          <div className="absolute inset-0 crt-scanlines opacity-75" />
        </div>
      )}

      {/* Phase 3: Total Blackout */}
      {phase === 'blackout' && (
        <div className="w-full h-full bg-black transition-opacity duration-200" />
      )}

      {/* Phase 4: Single Small Pink Point of Light */}
      {phase === 'pink_spark' && (
        <div className="w-full h-full bg-black relative flex items-center justify-center">
          {sparkFrame ? (
            <img
              src={sparkFrame.src}
              alt="The Pink Spark"
              className="w-full h-full object-cover animate-fade-in"
            />
          ) : (
            <div
              className="rounded-full bg-pink-400 shadow-[0_0_25px_#f43f5e] animate-ping"
              style={{ width: '12px', height: '12px' }}
            />
          )}

          {/* Center glowing flare */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: '18px',
              height: '18px',
              background: '#ffffff',
              boxShadow: '0 0 45px 15px rgba(244, 63, 94, 0.95), 0 0 100px 40px rgba(216, 70, 239, 0.6)'
            }}
          />
        </div>
      )}

      {/* Phase 5: Expanding Light Bloom */}
      {phase === 'bloom' && (
        <div className="w-full h-full bg-black relative flex items-center justify-center">
          <div
            className="absolute rounded-full transition-all duration-700 ease-in-out"
            style={{
              width: '300vw',
              height: '300vh',
              background: 'radial-gradient(circle, rgba(255, 235, 245, 1) 0%, rgba(244, 63, 94, 0.95) 25%, rgba(136, 19, 55, 0.95) 55%, rgba(0, 0, 0, 1) 85%)'
            }}
          />
        </div>
      )}
    </div>
  );
};
