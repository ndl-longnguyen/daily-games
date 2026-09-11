'use client';

import React from 'react';
import { CardCell } from './CardCell';
import { useGameStore } from '@/store/useGameStore';

export function GameBoard() {
  const board = useGameStore((state) => state.board);
  const matchedPairIds = useGameStore((state) => state.matchedPairIds);
  const flippedCards = useGameStore((state) => state.flippedCards);
  const flipCard = useGameStore((state) => state.flipCard);

  const matchedSet = new Set(matchedPairIds);
  const flippedSet = new Set(flippedCards.map((c) => c.id));

  return (
    <div className="w-full max-w-[480px] mx-auto p-2 sm:p-3 glass-panel rounded-2xl border border-white/10 shadow-2xl">
      <div className="grid grid-cols-8 gap-1 sm:gap-1.5 w-full">
        {board.map((card) => {
          const isMatched = matchedSet.has(card.pairId);
          const isFlipped = flippedSet.has(card.id);

          return (
            <CardCell
              key={card.id}
              card={card}
              isFlipped={isFlipped}
              isMatched={isMatched}
              onFlip={flipCard}
            />
          );
        })}
      </div>
    </div>
  );
}
