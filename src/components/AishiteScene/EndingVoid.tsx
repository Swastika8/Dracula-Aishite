import React, { useEffect, useState } from 'react';
import { framePreloader } from '../../services/framePreloader';

interface EndingVoidProps {
  currentTime: number;
  startTime?: number;
}

export const EndingVoid: React.FC<EndingVoidProps> = ({
  currentTime,
  startTime = 23.5
}) => {
  const elapsed = Math.max(0, currentTime - startTime);
  const [blink, setBlink] = useState<boolean>(false);

  // Trigger natural doll blink around 0.65 - 0.95 seconds into the ending gaze
  useEffect(() => {
    if (elapsed > 0.65 && elapsed < 0.95) {
      setBlink(true);
    } else {
      setBlink(false);
    }
  }, [elapsed]);

  // Frame selection for ending: 48, 49, 50
  let frameIdx = 48;
  if (elapsed > 0.6 && elapsed <= 1.2) frameIdx = 49;
  else if (elapsed > 1.2) frameIdx = 50;

  const frameImg = framePreloader.getFrame('aishite', frameIdx);
  // Fade to black starting at 1.3s and reaching 100% black by 2.1s (at 25.6s of track)
  const fadeToBlack = Math.min(1, Math.max(0, (elapsed - 1.3) / 0.8));

  return (
    <div className="absolute inset-0 z-30 bg-black flex items-center justify-center overflow-hidden">
      {/* Central Face & Glowing Eyes */}
      {frameImg && (
        <div 
          className="relative w-full h-full flex items-center justify-center transition-transform duration-700 ease-out"
          style={{
            transform: `scale(${1.0 + elapsed * 0.02})`,
            opacity: 1 - fadeToBlack
          }}
        >
          <img
            src={frameImg.src}
            alt="Ending Gaze"
            className="w-full h-full object-cover"
          />

          {/* Blink Eyelid Overlay */}
          <div
            className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-150"
            style={{
              opacity: blink ? 0.95 : 0
            }}
          />

          {/* Subtle Haunting Purple Iris Glow */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: '120px',
              height: '35px',
              top: '38%',
              left: '46.8%',
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle, rgba(216, 70, 239, 0.45) 0%, rgba(0, 0, 0, 0) 70%)',
              boxShadow: '0 0 30px rgba(236, 72, 153, 0.5)',
              opacity: blink ? 0 : (1 - fadeToBlack) * 0.85
            }}
          />
        </div>
      )}

      {/* Final Fade to Absolute Black */}
      <div
        className="pointer-events-none absolute inset-0 bg-black transition-opacity duration-700"
        style={{ opacity: fadeToBlack }}
      />
    </div>
  );
};

