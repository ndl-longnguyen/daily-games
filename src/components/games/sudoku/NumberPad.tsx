'use client';

import React from 'react';
import { useSudokuStore } from '@/store/useSudokuStore';
import { Edit3, Eraser, RefreshCw } from 'lucide-react';

export default function NumberPad() {
  const inputNumber = useSudokuStore((state) => state.inputNumber);
  const grid = useSudokuStore((state) => state.grid);
  const isNotesMode = useSudokuStore((state) => state.isNotesMode);
  const toggleNotesMode = useSudokuStore((state) => state.toggleNotesMode);
  const eraseCell = useSudokuStore((state) => state.eraseCell);
  const resetSudoku = useSudokuStore((state) => state.resetSudoku);

  // Count occurrences of each number (1 to 9)
  const counts: Record<number, number> = {};
  for (let i = 1; i <= 9; i++) counts[i] = 0;

  grid.forEach((row) => {
    row.forEach((cell) => {
      if (cell.value > 0 && !cell.isError) {
        counts[cell.value] = (counts[cell.value] || 0) + 1;
      }
    });
  });

  return (
    <div className="w-full max-w-[460px] mx-auto mt-2.5 sm:mt-3 select-none touch-manipulation flex flex-col gap-2">
      {/* Quick Action Bar directly above number pad for thumb ergonomics */}
      <div className="flex items-center justify-between gap-2 px-1">
        {/* Notes Mode Toggle */}
        <button
          onClick={toggleNotesMode}
          title="Toggle pencil draft notes (N)"
          className={'flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition-all border touch-manipulation active:scale-95 ' + (
            isNotesMode
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
              : 'bg-slate-850 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-800'
          )}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Notes {isNotesMode ? '(ON)' : '(OFF)'}</span>
        </button>

        {/* Erase button */}
        <button
          onClick={eraseCell}
          title="Erase selected cell"
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 active:scale-95 transition-all touch-manipulation text-xs font-semibold"
        >
          <Eraser className="w-3.5 h-3.5" />
          <span>Erase</span>
        </button>

        {/* Restart puzzle */}
        <button
          onClick={() => {
            if (confirm("Restart today's Sudoku puzzle?")) {
              resetSudoku();
            }
          }}
          title="Restart puzzle"
          className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 active:scale-95 transition-all touch-manipulation flex items-center justify-center"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 9 Numbers Grid: Optimized thumb height (>44px) on mobile */}
      <div className="grid grid-cols-9 gap-1 sm:gap-1.5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
          const isFull = counts[num] >= 9;
          const remaining = 9 - counts[num];
          return (
            <button
              key={num}
              onClick={() => inputNumber(num)}
              disabled={isFull}
              aria-label={'Input ' + num + ', ' + remaining + ' remaining'}
              className={'w-full h-11 sm:h-13 rounded-xl flex flex-col items-center justify-center font-mono font-bold text-base sm:text-lg transition-all shadow-sm border touch-manipulation ' + (
                isFull
                  ? 'bg-slate-900/40 text-slate-600 border-slate-800 cursor-not-allowed'
                  : 'bg-slate-800/90 hover:bg-slate-750 text-slate-200 hover:text-white border-slate-700/80 active:scale-90 active:bg-indigo-600 active:text-white'
              )}
            >
              <span className="leading-none">{num}</span>
              <span className="text-[8px] sm:text-[9px] font-normal text-slate-400 leading-none mt-1">
                {remaining}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
