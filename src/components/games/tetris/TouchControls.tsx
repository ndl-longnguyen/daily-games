'use client';

import React from 'react';
import { ArrowLeft, ArrowRight, ArrowDown, RotateCw, ChevronsDown, Shield } from 'lucide-react';
import { useTetrisStore } from '@/store/useTetrisStore';

export default function TouchControls() {
  const moveLeft = useTetrisStore((state) => state.moveLeft);
  const moveRight = useTetrisStore((state) => state.moveRight);
  const rotate = useTetrisStore((state) => state.rotate);
  const softDrop = useTetrisStore((state) => state.softDrop);
  const hardDrop = useTetrisStore((state) => state.hardDrop);
  const hold = useTetrisStore((state) => state.hold);

  return (
    <div className="w-full max-w-[340px] mx-auto mt-2 sm:mt-2.5 select-none touch-manipulation px-0.5">
      <div className="flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Left Thumb Cluster: Movement (Left, Soft Drop, Right) */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={moveLeft}
            title="Move left (◄ / A)"
            aria-label="Move left"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-800/90 hover:bg-slate-750 active:bg-slate-700 text-slate-200 active:text-white flex items-center justify-center border border-slate-700/80 shadow-sm active:scale-90 transition-all touch-manipulation"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            onClick={softDrop}
            title="Soft drop (▼ / S)"
            aria-label="Soft drop"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-800/90 hover:bg-slate-750 active:bg-slate-700 text-slate-200 active:text-white flex items-center justify-center border border-slate-700/80 shadow-sm active:scale-90 transition-all touch-manipulation"
          >
            <ArrowDown className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            onClick={moveRight}
            title="Move right (► / D)"
            aria-label="Move right"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-800/90 hover:bg-slate-750 active:bg-slate-700 text-slate-200 active:text-white flex items-center justify-center border border-slate-700/80 shadow-sm active:scale-90 transition-all touch-manipulation"
          >
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Right Thumb Cluster: Actions (Hold, Rotate, Hard Drop) */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={hold}
            title="Hold piece (C)"
            aria-label="Hold piece"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-800/90 hover:bg-slate-750 active:bg-slate-700 text-slate-300 active:text-white flex flex-col items-center justify-center border border-slate-700/80 shadow-sm active:scale-90 transition-all touch-manipulation"
          >
            <Shield className="w-4 h-4" />
            <span className="text-[8px] sm:text-[9px] font-bold leading-none mt-0.5">Hold</span>
          </button>

          <button
            onClick={rotate}
            title="Rotate (▲ / X)"
            aria-label="Rotate block"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/40 active:bg-indigo-600 text-indigo-200 active:text-white flex items-center justify-center border border-indigo-500/50 shadow-sm active:scale-90 transition-all touch-manipulation"
          >
            <RotateCw className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            onClick={hardDrop}
            title="Hard drop (Space / Enter)"
            aria-label="Hard drop instantly"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white flex flex-col items-center justify-center border border-indigo-400 shadow-md active:scale-90 transition-all touch-manipulation font-bold"
          >
            <ChevronsDown className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
