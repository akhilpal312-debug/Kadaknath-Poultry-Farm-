import React, { useEffect, useState } from 'react';
import { BrandEmblem } from './BrandEmblem';

interface PreloaderProps {
  onComplete: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(18);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReduced) {
      onComplete();
      return;
    }

    const t1 = window.setTimeout(() => setProgress(64), 140);
    const t2 = window.setTimeout(() => setProgress(100), 380);
    const t3 = window.setTimeout(() => setFading(true), 680);
    const t4 = window.setTimeout(() => onComplete(), 1020);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center parchment-canvas px-6 transition-opacity duration-300 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      role="status"
      aria-label="Loading Kadaknath Poultry Farm"
    >
      <div className="flex flex-col items-center text-center max-w-sm">
        <div className="w-20 h-20 rounded-full border border-[#C89B3C]/50 bg-[#FAF3E3] flex items-center justify-center shadow-sm mb-4">
          <BrandEmblem variant="dark" className="w-12 h-12" />
        </div>

        <p className="font-script italic text-lg text-[#4A544A] tracking-wide">
          Welcome to
        </p>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1E241E] mt-0.5 tracking-tight">
          Kadaknath Poultry Farm
        </h2>
        <p className="text-xs text-[#4A544A] mt-1 tracking-wide">
          Bhoshana · Shivli Road · Uttar Pradesh
        </p>

        {/* Smooth Progress Track */}
        <div className="w-56 h-1.5 bg-[#DFCCA7] rounded-full overflow-hidden mt-6">
          <div
            className="h-full bg-[#1B3B22] transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <button
          type="button"
          onClick={onComplete}
          className="mt-5 text-xs font-medium text-[#1B3B22] underline underline-offset-4 hover:text-[#C89B3C] transition-colors cursor-pointer"
        >
          Skip Intro
        </button>
      </div>
    </div>
  );
};
