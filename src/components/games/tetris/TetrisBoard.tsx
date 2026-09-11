'use client';

import React, { useEffect, useCallback } from 'react';
import { useTetrisStore } from '@/store/useTetrisStore';
import { TETRIS_ROWS, TETRIS_COLS } from '@/lib/constants';
import { TETROMINOES } from '@/lib/games/tetris/tetrominoes';
import { getGhostY } from '@/lib/games/tetris/engine';

export default function TetrisBoard() {
  const matrix = useTetrisStore((state) => state.matrix);
  const currentPiece = useTetrisStore((state) => state.currentPiece);
  const moveLeft = useTetrisStore((state) => state.moveLeft);
  const moveRight = useTetrisStore((state) => state.moveRight);
  const rotate = useTetrisStore((state) => state.rotate);
  const softDrop = useTetrisStore((state) => state.softDrop);
  const hardDrop = useTetrisStore((state) => state.hardDrop);
  const hold = useTetrisStore((state) => state.hold);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Enter'].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'ArrowLeft') {
        moveLeft();
      } else if (e.key === 'ArrowRight') {
        moveRight();
      } else if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'x') {
        rotate();
      } else if (e.key === 'ArrowDown') {
        softDrop();
      } else if (e.key === ' ' || e.key === 'Enter') {
        hardDrop();
      } else if (e.key.toLowerCase() === 'c' || e.key === 'Shift') {
        hold();
      }
    },
    [moveLeft, moveRight, rotate, softDrop, hardDrop, hold]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Construct display matrix
  const renderGrid: { color: string | null; isGhost: boolean }[][] = matrix.map((row) =>
    row.map((color) => ({ color, isGhost: false }))
  );

  // Overlay Ghost piece and Current active piece
  if (currentPiece) {
    const shape = TETROMINOES[currentPiece.type].shapes[currentPiece.rotation];
    const ghostY = getGhostY(
      matrix,
      currentPiece.type,
      currentPiece.x,
      currentPiece.y,
      currentPiece.rotation
    );

    // Ghost piece
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          const gy = ghostY + r;
          const gx = currentPiece.x + c;
          if (gy >= 0 && gy < TETRIS_ROWS && gx >= 0 && gx < TETRIS_COLS) {
            if (!renderGrid[gy][gx].color) {
              renderGrid[gy][gx] = {
                color: TETROMINOES[currentPiece.type].color,
                isGhost: true,
              };
            }
          }
        }
      }
    }

    // Active piece
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          const py = currentPiece.y + r;
          const px = currentPiece.x + c;
          if (py >= 0 && py < TETRIS_ROWS && px >= 0 && px < TETRIS_COLS) {
            renderGrid[py][px] = {
              color: TETROMINOES[currentPiece.type].color,
              isGhost: false,
            };
          }
        }
      }
    }
  }

  return (
    <div className="w-full max-w-[340px] mx-auto p-1.5 sm:p-2 glass-panel rounded-2xl border border-white/10 shadow-2xl relative select-none flex justify-center">
      <div
        className="grid gap-[1px] sm:gap-[2px] bg-slate-950 p-1 sm:p-1.5 rounded-xl border border-slate-800 relative overflow-hidden mx-auto"
        style={{
          gridTemplateColumns: 'repeat(' + TETRIS_COLS + ', minmax(0, 1fr))',
          gridTemplateRows: 'repeat(' + TETRIS_ROWS + ', minmax(0, 1fr))',
          height: 'clamp(280px, 46vh, 420px)',
          aspectRatio: '1 / 2',
        }}
      >
        {renderGrid.map((row, r) =>
          row.map((cell, c) => {
            let inlineStyle: React.CSSProperties = {};

            if (cell.color) {
              if (cell.isGhost) {
                inlineStyle = {
                  borderColor: cell.color,
                  borderWidth: '1.5px',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                };
              } else {
                inlineStyle = {
                  backgroundColor: cell.color,
                  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.4)',
                };
              }
            }

            return (
              <div
                key={r + '-' + c}
                className="w-full h-full rounded-[2px] bg-slate-900/60"
                style={inlineStyle}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
