import React, { useMemo } from 'react';
import { AISHITE_TIMELINE } from '../../data/timelineData';
import { AishiteCanvas } from './AishiteCanvas';
import { EyeTrackerOverlay } from './EyeTrackerOverlay';
import { CursedMirrorOverlay } from './CursedMirrorOverlay';
import { DollClonesOverlay } from './DollClonesOverlay';
import { EndingVoid } from './EndingVoid';

interface AishiteSceneProps {
  currentTime: number;
  bassEnergy: number;
  width: number;
  height: number;
}

export const AishiteScene: React.FC<AishiteSceneProps> = ({
  currentTime,
  bassEnergy,
  width,
  height
}) => {
  // Find current beat
  const currentBeat = useMemo(() => {
    const beats = AISHITE_TIMELINE.beats;
    for (let i = beats.length - 1; i >= 0; i--) {
      if (currentTime >= beats[i].startTime) {
        return beats[i];
      }
    }
    return beats[0];
  }, [currentTime]);

  const isEndingVoid = currentBeat.specialEffect === 'void_eyes' || currentBeat.id === 'a_blackout' || currentTime >= 23.5;
  const isClimax = currentBeat.specialEffect === 'climax';
  const showMirror = currentBeat.specialEffect === 'mirror' || (currentBeat.intensity >= 0.75 && !isEndingVoid);
  const showClones = (currentBeat.specialEffect === 'duplicates' || isClimax) && !isEndingVoid;
  const eyeTrackingActive = !isEndingVoid && currentBeat.intensity >= 0.35;

  return (
    <div className="relative w-full h-full overflow-hidden bg-black select-none">
      {/* Base Canvas Animation */}
      {!isEndingVoid && (
        <AishiteCanvas
          currentTime={currentTime}
          currentBeat={currentBeat}
          bassEnergy={bassEnergy}
          width={width}
          height={height}
        />
      )}

      {/* Rebellious Cursed Mirror */}
      <CursedMirrorOverlay
        width={width}
        height={height}
        active={showMirror}
        currentTime={currentTime}
      />

      {/* Multiplied Doll Copies */}
      <DollClonesOverlay
        width={width}
        height={height}
        active={showClones}
        currentTime={currentTime}
        bassEnergy={bassEnergy}
      />

      {/* Eye Tracking Pupil Layer */}
      <EyeTrackerOverlay
        width={width}
        height={height}
        active={eyeTrackingActive}
        intensity={currentBeat.intensity}
      />

      {/* Ending Void Sequence */}
      {isEndingVoid && (
        <EndingVoid
          currentTime={currentTime}
          startTime={23.5}
        />
      )}

      {/* Theatrical Vignette */}
      <div 
        className="pointer-events-none absolute inset-0 z-24 transition-opacity duration-1000"
        style={{
          background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 40%, rgba(12, 0, 8, 0.75) 100%)',
          mixBlendMode: 'multiply'
        }}
      />
    </div>
  );
};
