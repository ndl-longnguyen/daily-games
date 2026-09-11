'use client';

import React from 'react';
import { CardItem } from '@/lib/board-generator';

interface CardCellProps {
  card: CardItem;
  isFlipped: boolean;
  isMatched: boolean;
  onFlip: (card: CardItem) => void;
}

function CardCellComponent({
  card,
  isFlipped,
  isMatched,
  onFlip,
}: CardCellProps) {
  const handleClick = () => {
    if (!isMatched && !isFlipped) {
      onFlip(card);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`w-full aspect-square relative perspective-1000 select-none transition-all duration-200 touch-manipulation ${
        isMatched
          ? 'opacity-25 cursor-default pointer-events-none scale-95'
          : 'cursor-pointer hover:scale-[1.04] active:scale-95'
      }`}
    >
      <div
        className={`w-full h-full duration-300 transform-style-3d relative rounded-xl shadow-sm transition-transform ${
          isFlipped || isMatched ? 'rotate-y-180' : ''
        }`}
      >
        {/* CARD FACE DOWN (Unflipped state) */}
        <div className="absolute inset-0 backface-hidden rounded-xl bg-slate-800/90 hover:bg-slate-750 border border-slate-700/80 hover:border-slate-500 flex items-center justify-center overflow-hidden transition-colors shadow-sm">
          <span className="text-slate-500 text-xs sm:text-sm font-mono select-none">
            ✦
          </span>
        </div>

        {/* CARD FACE UP (Flipped or Matched state) */}
        <div
          className={`absolute inset-0 rotate-y-180 backface-hidden rounded-xl flex items-center justify-center border transition-all ${
            isMatched
              ? 'bg-slate-900/60 border-slate-800'
              : 'bg-slate-800 border-slate-400 shadow-md'
          }`}
        >
          <span className="text-xl sm:text-2xl select-none leading-none">
            {card.emoji}
          </span>
        </div>
      </div>
    </div>
  );
}

export const CardCell = React.memo(CardCellComponent, (prev, next) => {
  return (
    prev.card.id === next.card.id &&
    prev.isFlipped === next.isFlipped &&
    prev.isMatched === next.isMatched
  );
});
