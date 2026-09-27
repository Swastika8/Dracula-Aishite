import React from 'react';
import { Play } from 'lucide-react';

interface LandingScreenProps {
  onEnter: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onEnter }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-slate-100 select-none overflow-hidden">
      {/* Ambient Deep Space / Glow */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 animate-pulse"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(30, 20, 45, 0.7) 0%, rgba(5, 5, 10, 1) 75%)',
          animationDuration: '6s'
        }}
      />

      {/* Floating subtle stardust */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-1.5 h-1.5 rounded-full bg-amber-200/50 top-1/4 left-1/5 animate-ping" style={{ animationDuration: '4s' }} />
        <div className="absolute w-2 h-2 rounded-full bg-rose-400/40 bottom-1/3 right-1/4 animate-ping" style={{ animationDuration: '5s' }} />
      </div>

      {/* Center Content */}
      <div className="relative z-10 flex flex-col items-center max-w-xl px-8 text-center">
        {/* Title */}
        <h1 className="font-serif text-4xl sm:text-6xl font-light tracking-[0.25em] uppercase text-slate-100 mb-8 drop-shadow-[0_2px_15px_rgba(255,255,255,0.15)]">
          Dracula <span className="text-rose-500 font-normal">&bull;</span> 愛して
        </h1>

        {/* Enter Button - Single Clean Control */}
        <button
          id="enter-button"
          onClick={onEnter}
          className="group relative flex items-center justify-center space-x-3 px-12 py-5 rounded-full border border-slate-600/70 bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-lg hover:border-rose-400/80 transition-all duration-500 hover:scale-105 shadow-[0_0_25px_rgba(0,0,0,0.8)] hover:shadow-[0_0_35px_rgba(244,63,94,0.35)] cursor-pointer"
        >
          <Play className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform fill-current" />
          <span className="font-serif tracking-[0.3em] text-base uppercase text-slate-100 group-hover:text-rose-100 transition-colors">
            ENTER
          </span>
        </button>
      </div>
    </div>
  );
};
