'use client';

import React from 'react';
import { Timer, AlertTriangle, RefreshCw } from 'lucide-react';
import { useSudokuStore } from '@/store/useSudokuStore';
import { SUDOKU_MAX_MISTAKES } from '@/lib/constants';

export default function SudokuHUD() {
  const elapsedMs = useSudokuStore((state) => state.elapsedMs);
  const mistakesCount = useSudokuStore((state) => state.mistakesCount);
  const resetSudoku = useSudokuStore((state) => state.resetSudoku);

  const totalSeconds = Math.floor(elapsedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="w-full max-w-[460px] mx-auto glass-panel rounded-2xl p-2 sm:p-2.5 border border-white/10 shadow-xl mb-2 sm:mb-2.5 select-none">
      <div className="flex items-center justify-between gap-2">
        {/* Timer */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-slate-700/60 shadow-inner">
          <Timer className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="font-mono font-bold text-xs sm:text-sm md:text-base text-white">
            {pad(minutes)}:{pad(seconds)}
          </span>
        </div>

        {/* Mistakes Counter */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-slate-700/60 shadow-inner">
          <AlertTriangle
            className={'w-3.5 h-3.5 shrink-0 ' + (mistakesCount > 0 ? 'text-rose-400' : 'text-slate-400')}
          />
          <span className="text-xs font-semibold text-slate-300">
            Mistakes:{' '}
            <span
              className={'font-mono font-bold ' + (mistakesCount > 0 ? 'text-rose-400' : 'text-slate-200')}
            >
              {mistakesCount}/{SUDOKU_MAX_MISTAKES}
            </span>
          </span>
        </div>

        {/* Reset */}
        <button
          onClick={() => {
            if (confirm("Restart today's Sudoku puzzle?")) {
              resetSudoku();
            }
          }}
          title="Restart puzzle"
          className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 active:scale-95 transition-all touch-manipulation flex items-center justify-center"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
