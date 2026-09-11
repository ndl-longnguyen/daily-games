'use client';

import React from 'react';
import { Timer, CheckCircle2, Flame, RefreshCw } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { TOTAL_PAIRS } from '@/lib/constants';

export default function GameHUD() {
  const elapsedMs = useGameStore((state) => state.elapsedMs);
  const matchedPairIds = useGameStore((state) => state.matchedPairIds);
  const movesCount = useGameStore((state) => state.movesCount);
  const comboCount = useGameStore((state) => state.comboCount);
  const resetGame = useGameStore((state) => state.resetGame);

  const matchedCount = matchedPairIds.length;
  const progressPercent = Math.min(100, Math.round((matchedCount / TOTAL_PAIRS) * 100));

  const totalSeconds = Math.floor(elapsedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((elapsedMs % 1000) / 100);
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="w-full max-w-[480px] mx-auto glass-panel rounded-2xl p-2 sm:p-3 border border-white/10 shadow-xl mb-2 sm:mb-3 select-none">
      <div className="flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Timer */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-slate-700/60 shadow-inner">
          <Timer className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="font-mono font-bold text-xs sm:text-sm md:text-base text-white">
            {pad(minutes)}:{pad(seconds)}
            <span className="text-[10px] sm:text-xs text-slate-400">.{tenths}</span>
          </span>
        </div>

        {/* Matched Count */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-slate-700/60 shadow-inner">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="font-mono font-bold text-xs sm:text-sm md:text-base text-white">
            {matchedCount} <span className="text-[10px] sm:text-xs text-slate-400 font-normal">/ {TOTAL_PAIRS}</span>
          </span>
        </div>

        {/* Moves & Combo & Restart */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-700/60 shadow-inner text-xs">
            <span className="text-slate-400 text-[11px] hidden xs:inline">Moves:</span>
            <span className="font-mono font-bold text-slate-200 text-xs sm:text-sm">{movesCount}</span>
          </div>

          {comboCount > 1 && (
            <div className="flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 sm:px-2 py-1 rounded-xl text-[11px] font-bold animate-bounce shadow-sm">
              <Flame className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
              <span>x{comboCount}</span>
            </div>
          )}

          {/* Restart */}
          <button
            onClick={() => {
              if (confirm("Restart today's Emoji Match challenge?")) {
                resetGame();
              }
            }}
            title="Restart puzzle"
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 active:scale-95 transition-all touch-manipulation flex items-center justify-center"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden border border-slate-700/40">
        <div
          className="h-full bg-emerald-400 transition-all duration-300 ease-out"
          style={{ width: progressPercent + '%' }}
        />
      </div>
    </div>
  );
}
