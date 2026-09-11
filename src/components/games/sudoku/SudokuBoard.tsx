'use client';

import React, { useEffect, useCallback } from 'react';
import { useSudokuStore } from '@/store/useSudokuStore';

export default function SudokuBoard() {
  const grid = useSudokuStore((state) => state.grid);
  const selectedCell = useSudokuStore((state) => state.selectedCell);
  const selectCell = useSudokuStore((state) => state.selectCell);
  const inputNumber = useSudokuStore((state) => state.inputNumber);
  const eraseCell = useSudokuStore((state) => state.eraseCell);
  const toggleNotesMode = useSudokuStore((state) => state.toggleNotesMode);

  // Keyboard navigation and inputs
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!selectedCell) return;
      const [r, c] = selectedCell;

      if (e.key >= '1' && e.key <= '9') {
        inputNumber(parseInt(e.key, 10));
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        eraseCell();
      } else if (e.key.toLowerCase() === 'n') {
        toggleNotesMode();
      } else if (e.key === 'ArrowUp') {
        selectCell(Math.max(0, r - 1), c);
      } else if (e.key === 'ArrowDown') {
        selectCell(Math.min(8, r + 1), c);
      } else if (e.key === 'ArrowLeft') {
        selectCell(r, Math.max(0, c - 1));
      } else if (e.key === 'ArrowRight') {
        selectCell(r, Math.min(8, c + 1));
      }
    },
    [selectedCell, inputNumber, eraseCell, toggleNotesMode, selectCell]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (grid.length === 0) return null;

  const [selectedR, selectedC] = selectedCell || [-1, -1];
  const selectedValue =
    selectedR >= 0 && selectedC >= 0 ? grid[selectedR][selectedC].value : 0;

  return (
    <div className="w-full max-w-[460px] mx-auto p-1.5 sm:p-3 glass-panel rounded-2xl border border-white/10 shadow-2xl select-none">
      <div className="grid grid-cols-9 bg-slate-900 border-2 border-slate-600 rounded-xl overflow-hidden shadow-inner">
        {grid.map((row, rIdx) =>
          row.map((cell, cIdx) => {
            const isSelected = rIdx === selectedR && cIdx === selectedC;
            const isInSameRow = rIdx === selectedR;
            const isInSameCol = cIdx === selectedC;
            const isInSameBox =
              Math.floor(rIdx / 3) === Math.floor(selectedR / 3) &&
              Math.floor(cIdx / 3) === Math.floor(selectedC / 3);
            const isSameValue =
              selectedValue > 0 && cell.value === selectedValue;

            // Border styling for 3x3 blocks
            const borderRight =
              cIdx % 3 === 2 && cIdx !== 8 ? 'border-r-2 border-r-slate-500' : 'border-r border-r-slate-800';
            const borderBottom =
              rIdx % 3 === 2 && rIdx !== 8 ? 'border-b-2 border-b-slate-500' : 'border-b border-b-slate-800';

            let bgClass = 'bg-slate-900';
            if (isSelected) {
              bgClass = 'bg-indigo-600/40';
            } else if (isSameValue) {
              bgClass = 'bg-indigo-950/70';
            } else if (isInSameRow || isInSameCol || isInSameBox) {
              bgClass = 'bg-slate-800/40';
            }

            return (
              <div
                key={rIdx + '-' + cIdx}
                onClick={() => selectCell(rIdx, cIdx)}
                className={'w-full aspect-square flex items-center justify-center cursor-pointer select-none transition-colors touch-manipulation ' + bgClass + ' ' + borderRight + ' ' + borderBottom}
              >
                {cell.value > 0 ? (
                  <span
                    className={'text-sm sm:text-lg md:text-xl font-mono font-bold leading-none ' + (
                      cell.isError
                        ? 'text-rose-400'
                        : cell.isGiven
                        ? 'text-white'
                        : 'text-indigo-300'
                    )}
                  >
                    {cell.value}
                  </span>
                ) : cell.notes.length > 0 ? (
                  // 3x3 Mini Notes Matrix
                  <div className="grid grid-cols-3 gap-0 w-full h-full p-0.5 text-[7px] sm:text-[9px] font-mono leading-none text-slate-400 text-center items-center">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                      <span key={n} className="flex items-center justify-center">
                        {cell.notes.includes(n) ? n : ''}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
