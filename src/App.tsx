import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SongId } from './types';
import { DRACULA_TIMELINE, AISHITE_TIMELINE } from './data/timelineData';
import { audioEngine } from './services/audioEngine';
import { DraculaScene } from './components/DraculaScene/DraculaScene';
import { AishiteScene } from './components/AishiteScene/AishiteScene';
import { TransitionOverlay } from './components/TransitionOverlay';
import { LandingScreen } from './components/LandingScreen';
import { ControlsOverlay } from './components/ControlsOverlay';

export const App: React.FC = () => {
  const [started, setStarted] = useState<boolean>(false);
  const [currentSongId, setCurrentSongId] = useState<SongId>('dracula');
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(DRACULA_TIMELINE.duration);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [bassEnergy, setBassEnergy] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080
  });

  const rafRef = useRef<number | null>(null);

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Audio subscriptions
  useEffect(() => {
    const unsubTime = audioEngine.subscribeTime((time, dur) => {
      setCurrentTime(time);
      if (dur > 0) setDuration(dur);
    });

    const unsubState = audioEngine.subscribeState((playing) => {
      setIsPlaying(playing);
    });

    const unsubEnd = audioEngine.subscribeEnd(() => {
      if (audioEngine.getCurrentSongId() === 'dracula') {
        // Dracula ended at 01:02 -> begin transition!
        setIsTransitioning(true);
      } else {
        // Aishite ended at 03:28 (26.0s duration)
        // Cleanly stop playback, hold final black, then reset state to landing screen (NO LOOPING)
        setIsPlaying(false);
        setTimeout(() => {
          audioEngine.cleanupCurrentAudio();
          setIsTransitioning(false);
          setStarted(false); // Return to original Play Screen!
          setCurrentSongId('dracula');
          setCurrentTime(0);
          setDuration(DRACULA_TIMELINE.duration);
          setBassEnergy(0);
        }, 1200);
      }
    });

    return () => {
      unsubTime();
      unsubState();
      unsubEnd();
    };
  }, []);

  // Real-time animation loop for bass energy
  useEffect(() => {
    if (!started || !isPlaying) {
      setBassEnergy(0);
      return;
    }
    const loop = () => {
      if (isPlaying) {
        setBassEnergy(audioEngine.getBassEnergy());
        rafRef.current = requestAnimationFrame(loop);
      }
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [started, isPlaying]);

  // Transition completion handler
  const handleTransitionComplete = useCallback(() => {
    setIsTransitioning(false);
    setCurrentSongId('aishite');
    setDuration(AISHITE_TIMELINE.duration);
    setCurrentTime(0);
    audioEngine.initTrack('aishite');
    audioEngine.play().catch(() => {});
  }, []);

  // User enters from landing screen
  const handleEnter = () => {
    setStarted(true);
    setCurrentSongId('dracula');
    setDuration(DRACULA_TIMELINE.duration);
    setCurrentTime(0);
    audioEngine.initTrack('dracula');
    audioEngine.play().catch(() => {});
  };

  const handleTogglePlay = () => {
    audioEngine.togglePlay();
  };

  const handleSeek = (seconds: number) => {
    audioEngine.seek(seconds);
    setCurrentTime(seconds);
  };

  const handleRestart = () => {
    audioEngine.cleanupCurrentAudio();
    setIsPlaying(false);
    setIsTransitioning(false);
    setStarted(false); // Cleanly return to initial Play / Enter screen
    setCurrentSongId('dracula');
    setCurrentTime(0);
    setDuration(DRACULA_TIMELINE.duration);
    setBassEnergy(0);
  };

  const handleToggleMute = () => {
    const muted = audioEngine.toggleMute();
    setIsMuted(muted);
  };

  const handleVolumeChange = (vol: number) => {
    audioEngine.setVolume(vol);
    setVolume(vol);
    if (isMuted && vol > 0) {
      setIsMuted(false);
    }
  };

  // Global Keyboard shortcuts
  useEffect(() => {
    if (!started) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        handleToggleMute();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleSeek(Math.max(0, currentTime - 3));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleSeek(Math.min(duration, currentTime + 3));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [started, currentTime, duration]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">
      {/* Landing Screen */}
      {!started && <LandingScreen onEnter={handleEnter} />}

      {/* Main Experience Visual Worlds */}
      {started && currentSongId === 'dracula' && (
        <DraculaScene
          currentTime={currentTime}
          bassEnergy={bassEnergy}
          width={dimensions.width}
          height={dimensions.height}
        />
      )}

      {started && currentSongId === 'aishite' && (
        <AishiteScene
          currentTime={currentTime}
          bassEnergy={bassEnergy}
          width={dimensions.width}
          height={dimensions.height}
        />
      )}

      {/* Critical Song-to-Song Transition Overlay */}
      <TransitionOverlay
        active={isTransitioning}
        onComplete={handleTransitionComplete}
      />

      {/* Minimal Cinematic Controls HUD */}
      {started && (
        <ControlsOverlay
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          currentSongId={currentSongId}
          volume={volume}
          isMuted={isMuted}
          onTogglePlay={handleTogglePlay}
          onSeek={handleSeek}
          onRestart={handleRestart}
          onToggleMute={handleToggleMute}
          onVolumeChange={handleVolumeChange}
        />
      )}
    </div>
  );
};

export default App;
