'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { useTetrisStore } from '@/store/useTetrisStore';
import { TETRIS_ROWS, TETRIS_COLS } from '@/lib/constants';
import { TETROMINOES } from '@/lib/games/tetris/tetrominoes';
import { getGhostY } from '@/lib/games/tetris/engine';
import { RefreshCw, Trophy, UserCheck, Zap } from 'lucide-react';

export default function TetrisBoard() {
  const matrix = useTetrisStore((state) => state.matrix);
  const currentPiece = useTetrisStore((state) => state.currentPiece);
  const isGameOver = useTetrisStore((state) => state.isGameOver);
  const score = useTetrisStore((state) => state.score);
  const linesCleared = useTetrisStore((state) => state.linesCleared);
  const level = useTetrisStore((state) => state.level);
  const serverRank = useTetrisStore((state) => state.serverRank);
  const isSubmitting = useTetrisStore((state) => state.isSubmitting);
  const nickname = useTetrisStore((state) => state.nickname);
  const setNickname = useTetrisStore((state) => state.setNickname);
  const submitFinalScore = useTetrisStore((state) => state.submitFinalScore);
  const resetTetris = useTetrisStore((state) => state.resetTetris);

  const moveLeft = useTetrisStore((state) => state.moveLeft);
  const moveRight = useTetrisStore((state) => state.moveRight);
  const rotate = useTetrisStore((state) => state.rotate);
  const softDrop = useTetrisStore((state) => state.softDrop);
  const hardDrop = useTetrisStore((state) => state.hardDrop);
  const hold = useTetrisStore((state) => state.hold);

  const [inputName, setInputName] = useState(nickname);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't intercept typing in nickname input
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

  const handleSubmitScore = (e: React.FormEvent) => {
    e.preventDefault();
    setNickname(inputName);
    submitFinalScore();
  };

  // Construct render grid (combining matrix, ghost piece, and active piece)
  const renderGrid: { color: string | null; isGhost?: boolean }[][] = matrix.map((row) =>
    row.map((color) => ({ color }))
  );

  if (currentPiece) {
    const shape = TETROMINOES[currentPiece.type].shapes[currentPiece.rotation];
    const ghostY = getGhostY(
      matrix,
      currentPiece.type,
      currentPiece.x,
      currentPiece.y,
      currentPiece.rotation
    );

    // Render ghost piece
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

    // Render active piece
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
    <div className="w-full max-w-[340px] mx-auto p-2 sm:p-2.5 glass-panel rounded-2xl border border-white/10 shadow-2xl relative select-none">
      <div
        className="grid gap-[2px] bg-slate-950 p-1.5 rounded-xl border border-slate-800 relative overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(${TETRIS_COLS}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${TETRIS_ROWS}, minmax(0, 1fr))`,
          height: '420px',
        }}
      >
        {renderGrid.map((row, r) =>
          row.map((cell, c) => {
            const bgStyle = 'bg-slate-900/60';
            let inlineStyle: React.CSSProperties = {};

            if (cell.color) {
              if (cell.isGhost) {
                inlineStyle = {
                  borderColor: cell.color,
                  borderWidth: '1.5px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
                key={`${r}-${c}`}
                className={`w-full h-full rounded-[2px] ${bgStyle}`}
                style={inlineStyle}
              />
            );
          })
        )}

        {/* Game Over / Result Overlay */}
        {isGameOver && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center z-20 animate-in fade-in">
            <span className="text-3xl mb-1">🎮</span>
            <h3 className="text-lg font-black text-white mb-0.5">KẾT THÚC VÁN ĐẤU</h3>

            {/* Score Showcase */}
            <div className="flex flex-col items-center my-2.5 bg-slate-800/90 px-4 py-2 rounded-2xl border border-amber-500/30 w-full">
              <span className="text-[10px] uppercase font-bold text-slate-400">Điểm Đạt Được</span>
              <span className="font-mono text-2xl font-black text-amber-300 flex items-center gap-1">
                <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
                {score.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                {linesCleared} hàng • Cấp {level}
              </span>
            </div>

            {/* Rank display */}
            {serverRank && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold mb-3">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Hạng #{serverRank} Hôm Nay!</span>
              </div>
            )}

            {/* Nickname submission */}
            <form onSubmit={handleSubmitScore} className="flex gap-1.5 w-full mb-3">
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                maxLength={20}
                placeholder="Tên của bạn..."
                className="flex-1 bg-slate-900 px-3 py-1.5 rounded-xl text-xs text-white border border-slate-700 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={isSubmitting || !inputName.trim()}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-md"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{isSubmitting ? '...' : 'Lưu'}</span>
              </button>
            </form>

            <button
              onClick={resetTetris}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-200 hover:bg-white text-slate-900 font-bold text-xs transition-colors shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Chơi lại ván hôm nay</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
