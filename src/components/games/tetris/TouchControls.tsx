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
    <div className="w-full max-w-[340px] mx-auto mt-2.5 select-none touch-manipulation">
      <div className="flex items-center justify-between gap-2">
        {/* Left Side: Hold & Rotate */}
        <div className="flex gap-2">
          <button
            onClick={hold}
            title="Hold piece (C)"
            aria-label="Hold piece"
            className="w-12 h-12 rounded-xl bg-slate-800/90 active:bg-slate-700 text-slate-300 active:text-white flex flex-col items-center justify-center border border-slate-700/80 shadow-sm touch-manipulation"
          >
            <Shield className="w-4 h-4" />
            <span className="text-[9px] font-bold mt-0.5">Hold</span>
          </button>

          <button
            onClick={rotate}
            title="Rotate (Up / W)"
            aria-label="Rotate block"
            className="w-12 h-12 rounded-xl bg-slate-800/90 active:bg-slate-700 text-slate-200 active:text-white flex flex-col items-center justify-center border border-slate-700/80 shadow-sm touch-manipulation"
          >
            <RotateCw className="w-5 h-5" />
          </button>
        </div>

        {/* Center: Drop buttons */}
        <div className="flex gap-2">
          <button
            onClick={softDrop}
            title="Soft drop (Down / S)"
            aria-label="Soft drop"
            className="w-12 h-12 rounded-xl bg-slate-800/90 active:bg-slate-700 text-slate-300 active:text-white flex flex-col items-center justify-center border border-slate-700/80 shadow-sm touch-manipulation"
          >
            <ArrowDown className="w-5 h-5" />
          </button>

          <button
            onClick={hardDrop}
            title="Hard drop (Space / Enter)"
            aria-label="Hard drop instantly"
            className="w-12 h-12 rounded-xl bg-indigo-600 active:bg-indigo-500 text-white flex flex-col items-center justify-center border border-indigo-500 shadow-md touch-manipulation"
          >
            <ChevronsDown className="w-5 h-5" />
          </button>
        </div>

        {/* Right Side: Left & Right */}
        <div className="flex gap-2">
          <button
            onClick={moveLeft}
            title="Move left (Left / A)"
            aria-label="Move left"
            className="w-12 h-12 rounded-xl bg-slate-800/90 active:bg-slate-700 text-slate-200 active:text-white flex flex-col items-center justify-center border border-slate-700/80 shadow-sm touch-manipulation"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button
            onClick={moveRight}
            title="Move right (Right / D)"
            aria-label="Move right"
            className="w-12 h-12 rounded-xl bg-slate-800/90 active:bg-slate-700 text-slate-200 active:text-white flex flex-col items-center justify-center border border-slate-700/80 shadow-sm touch-manipulation"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
