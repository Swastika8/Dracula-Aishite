import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Minimize2 } from 'lucide-react';
import { SongId, SongTimeline } from '../types';
import { DRACULA_TIMELINE, AISHITE_TIMELINE } from '../data/timelineData';

interface ControlsOverlayProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  currentSongId: SongId;
  volume: number;
  isMuted: boolean;
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
  onRestart: () => void;
  onToggleMute: () => void;
  onVolumeChange: (vol: number) => void;
}

export const ControlsOverlay: React.FC<ControlsOverlayProps> = ({
  isPlaying,
  currentTime,
  duration,
  currentSongId,
  volume,
  isMuted,
  onTogglePlay,
  onSeek,
  onRestart,
  onToggleMute,
  onVolumeChange
}) => {
  const [visible, setVisible] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const hideTimer = useRef<number | null>(null);

  const timeline: SongTimeline = currentSongId === 'dracula' ? DRACULA_TIMELINE : AISHITE_TIMELINE;

  // Auto-hide controls quickly during playback so screen is completely clear
  useEffect(() => {
    const handleActivity = () => {
      setVisible(true);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (isPlaying) {
        hideTimer.current = window.setTimeout(() => {
          setVisible(false);
        }, 1800);
      }
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('keydown', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [isPlaying]);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(ratio * duration);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-500 pointer-events-auto select-none ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <div className="mx-auto max-w-2xl mb-4 px-5 py-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.85)] flex flex-col space-y-1.5">
        {/* Scrubber */}
        <div
          onClick={handleScrubberClick}
          className="group relative w-full h-2.5 flex items-center cursor-pointer py-1"
        >
          <div className="w-full h-1 rounded-full bg-white/20 group-hover:h-1.5 transition-all overflow-hidden relative">
            <div
              className={`h-full transition-all duration-75 ${
                currentSongId === 'dracula'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-200'
                  : 'bg-gradient-to-r from-rose-500 to-fuchsia-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div
            className="absolute w-2.5 h-2.5 rounded-full bg-white shadow-md transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `${progressPercent}%` }}
          />

          {timeline.beats.map((beat) => {
            const markerPos = duration > 0 ? (beat.startTime / duration) * 100 : 0;
            return (
              <div
                key={beat.id}
                title={beat.name}
                className="absolute top-1/2 -translate-y-1/2 w-1 h-1.5 bg-white/40 rounded-full"
                style={{ left: `${markerPos}%` }}
              />
            );
          })}
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between text-slate-300 text-xs font-mono px-1">
          <div className="flex items-center space-x-3">
            <button
              onClick={onTogglePlay}
              className="p-1 rounded-full text-slate-100 hover:text-white transition-colors cursor-pointer"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            <button
              onClick={onRestart}
              className="p-1 rounded-full text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
              title="Restart"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <div className="tracking-wider text-slate-400 text-[11px]">
              <span>{formatTime(currentTime)}</span>
              <span className="mx-1 text-slate-600">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5">
              <button
                onClick={onToggleMute}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-16 h-1 rounded-lg bg-slate-800 accent-rose-400 cursor-pointer"
              />
            </div>

            <button
              onClick={toggleFullscreen}
              className="p-1 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Fullscreen (F)"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
