'use client';

import React from 'react';
import { useSudokuStore } from '@/store/useSudokuStore';

export default function NumberPad() {
  const inputNumber = useSudokuStore((state) => state.inputNumber);
  const grid = useSudokuStore((state) => state.grid);

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
    <div className="w-full max-w-[460px] mx-auto mt-3 select-none touch-manipulation">
      <div className="grid grid-cols-9 gap-1 sm:gap-1.5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
          const isFull = counts[num] >= 9;
          const remaining = 9 - counts[num];
          return (
            <button
              key={num}
              onClick={() => inputNumber(num)}
              disabled={isFull}
              aria-label={`Input ${num}, ${remaining} remaining`}
              className={`w-full aspect-square rounded-xl flex flex-col items-center justify-center font-mono font-bold text-base sm:text-lg transition-all shadow-sm border touch-manipulation ${
                isFull
                  ? 'bg-slate-900/40 text-slate-600 border-slate-800 cursor-not-allowed'
                  : 'bg-slate-800/90 hover:bg-slate-750 text-slate-200 hover:text-white border-slate-700/80 active:scale-95'
              }`}
            >
              <span>{num}</span>
              <span className="text-[9px] font-normal text-slate-400 -mt-1">
                {remaining}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
