'use client';

import React from 'react';
import { Timer, AlertTriangle, Edit3, Eraser, RefreshCw } from 'lucide-react';
import { useSudokuStore } from '@/store/useSudokuStore';
import { SUDOKU_MAX_MISTAKES } from '@/lib/constants';

export default function SudokuHUD() {
  const elapsedMs = useSudokuStore((state) => state.elapsedMs);
  const mistakesCount = useSudokuStore((state) => state.mistakesCount);
  const isNotesMode = useSudokuStore((state) => state.isNotesMode);
  const toggleNotesMode = useSudokuStore((state) => state.toggleNotesMode);
  const eraseCell = useSudokuStore((state) => state.eraseCell);
  const resetSudoku = useSudokuStore((state) => state.resetSudoku);

  const totalSeconds = Math.floor(elapsedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="w-full max-w-[460px] mx-auto glass-panel rounded-2xl p-3 border border-white/10 shadow-xl mb-3">
      <div className="flex items-center justify-between gap-2">
        {/* Timer */}
        <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-inner">
          <Timer className="w-4 h-4 text-slate-300" />
          <span className="font-mono font-bold text-sm sm:text-base text-white">
            {pad(minutes)}:{pad(seconds)}
          </span>
        </div>

        {/* Mistakes */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-inner">
          <AlertTriangle
            className={`w-4 h-4 ${mistakesCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}
          />
          <span className="text-xs font-semibold text-slate-300">
            Mistakes:{' '}
            <span
              className={`font-mono font-bold ${mistakesCount > 0 ? 'text-rose-400' : 'text-slate-200'}`}
            >
              {mistakesCount}/{SUDOKU_MAX_MISTAKES}
            </span>
          </span>
        </div>

        {/* Quick Tools */}
        <div className="flex items-center gap-1.5">
          {/* Notes Mode */}
          <button
            onClick={toggleNotesMode}
            title="Toggle pencil draft notes (N)"
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border touch-manipulation ${
              isNotesMode
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="text-[10px] sm:text-xs">Notes</span>
          </button>

          {/* Erase */}
          <button
            onClick={eraseCell}
            title="Erase selected cell"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors touch-manipulation"
          >
            <Eraser className="w-3.5 h-3.5" />
          </button>

          {/* Reset */}
          <button
            onClick={() => {
              if (confirm('Restart today\'s Sudoku puzzle?')) {
                resetSudoku();
              }
            }}
            title="Restart puzzle"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors touch-manipulation"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
