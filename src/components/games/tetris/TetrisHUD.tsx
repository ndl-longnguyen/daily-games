'use client';

import React from 'react';
import { Timer, Zap, RefreshCw } from 'lucide-react';
import { useTetrisStore } from '@/store/useTetrisStore';
import { TETROMINOES, TetrominoType } from '@/lib/games/tetris/tetrominoes';

function MiniPiece({ type }: { type: TetrominoType | null }) {
  if (!type) return <div className="w-6 h-6 sm:w-7 sm:h-7" />;
  const shape = TETROMINOES[type].shapes[0];
  const color = TETROMINOES[type].color;

  return (
    <div
      className="grid gap-0.5 p-1 bg-slate-900/60 rounded-lg border border-slate-800"
      style={{
        gridTemplateColumns: 'repeat(' + shape[0].length + ', 6px)',
      }}
    >
      {shape.map((row, r) =>
        row.map((cell, c) => (
          <div
            key={r + '-' + c}
            className="w-1.5 h-1.5 rounded-[1px]"
            style={{
              backgroundColor: cell ? color : 'transparent',
            }}
          />
        ))
      )}
    </div>
  );
}

export default function TetrisHUD() {
  const score = useTetrisStore((state) => state.score);
  const linesCleared = useTetrisStore((state) => state.linesCleared);
  const level = useTetrisStore((state) => state.level);
  const elapsedMs = useTetrisStore((state) => state.elapsedMs);
  const holdPiece = useTetrisStore((state) => state.holdPiece);
  const nextQueue = useTetrisStore((state) => state.nextQueue);
  const resetTetris = useTetrisStore((state) => state.resetTetris);

  const totalSeconds = Math.floor(elapsedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="w-full max-w-[340px] mx-auto glass-panel rounded-2xl p-2 sm:p-2.5 border border-white/10 shadow-xl mb-2 sm:mb-2.5 select-none">
      <div className="flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Hold preview */}
        <div className="flex flex-col items-center">
          <span className="text-[8px] sm:text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Hold</span>
          <MiniPiece type={holdPiece} />
        </div>

        {/* Score Display (Primary Metric) */}
        <div className="flex flex-col items-center bg-slate-800/80 px-2.5 sm:px-3 py-1 rounded-xl border border-slate-700/60 shadow-inner">
          <span className="text-[8px] sm:text-[9px] uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1">
            <Zap className="w-2.5 h-2.5 text-amber-400 fill-amber-400" /> Score
          </span>
          <span className="font-mono font-black text-sm sm:text-base text-amber-300">
            {score.toLocaleString()}
          </span>
        </div>

        {/* Lines & Level */}
        <div className="flex flex-col items-center bg-slate-800/80 px-2 sm:px-2.5 py-1 rounded-xl border border-slate-700/60 shadow-inner">
          <span className="text-[8px] sm:text-[9px] uppercase font-bold text-slate-400 tracking-wider">
            Lv {level}
          </span>
          <span className="font-mono font-bold text-xs text-emerald-400">
            {linesCleared} lines
          </span>
        </div>

        {/* Next preview */}
        <div className="flex flex-col items-center">
          <span className="text-[8px] sm:text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Next</span>
          <MiniPiece type={nextQueue[0] || null} />
        </div>

        {/* Reset */}
        <button
          onClick={() => {
            if (confirm("Restart today's Tetris sprint?")) {
              resetTetris();
            }
          }}
          title="Restart game"
          className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 active:scale-95 transition-all touch-manipulation flex items-center justify-center"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Timer bar */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1.5 px-1 border-t border-white/5 pt-1">
        <span className="flex items-center gap-1">
          <Timer className="w-3 h-3 text-slate-400" />
          {pad(minutes)}:{pad(seconds)}
        </span>
        <span className="text-[9px] text-slate-500">Sprint: 20 Lines</span>
      </div>
    </div>
  );
}
