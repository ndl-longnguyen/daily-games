'use client';

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Share2, Check, UserCheck, AlertCircle, RefreshCw, WifiOff, Sparkles, Frown } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { useSudokuStore } from '@/store/useSudokuStore';
import { useTetrisStore } from '@/store/useTetrisStore';
import { GAMES_LIST } from '@/lib/constants';

export default function GameResultModal() {
  const activeGame = useGameStore((state) => state.activeGame);
  const isOnline = useGameStore((state) => state.isOnline);
  const dateSeed = useGameStore((state) => state.dateSeed);

  // Emoji Store
  const emojiCompleted = useGameStore((state) => state.isCompleted);
  const emojiElapsed = useGameStore((state) => state.elapsedMs);
  const emojiMoves = useGameStore((state) => state.movesCount);
  const emojiRank = useGameStore((state) => state.serverRank);
  const emojiNickname = useGameStore((state) => state.nickname);
  const setEmojiNickname = useGameStore((state) => state.setNickname);
  const submitEmojiScore = useGameStore((state) => state.submitFinalScore);
  const resetEmoji = useGameStore((state) => state.resetGame);
  const isEmojiSubmitting = useGameStore((state) => state.isSubmittingScore);
  const emojiError = useGameStore((state) => state.submitError);

  // Sudoku Store
  const sudokuCompleted = useSudokuStore((state) => state.isCompleted);
  const sudokuGameOver = useSudokuStore((state) => state.isGameOver);
  const sudokuElapsed = useSudokuStore((state) => state.elapsedMs);
  const sudokuMistakes = useSudokuStore((state) => state.mistakesCount);
  const sudokuRank = useSudokuStore((state) => state.serverRank);
  const sudokuNickname = useSudokuStore((state) => state.nickname);
  const setSudokuNickname = useSudokuStore((state) => state.setNickname);
  const isSudokuSubmitting = useSudokuStore((state) => state.isSubmitting);
  const resetSudoku = useSudokuStore((state) => state.resetSudoku);
  const submitSudokuScore = useSudokuStore((state) => state.submitFinalScore);

  // Tetris Store
  const tetrisGameOver = useTetrisStore((state) => state.isGameOver);
  const tetrisCompleted = useTetrisStore((state) => state.isCompleted);
  const tetrisElapsed = useTetrisStore((state) => state.elapsedMs);
  const tetrisScore = useTetrisStore((state) => state.score);
  const tetrisLines = useTetrisStore((state) => state.linesCleared);
  const tetrisRank = useTetrisStore((state) => state.serverRank);
  const tetrisNickname = useTetrisStore((state) => state.nickname);
  const setTetrisNickname = useTetrisStore((state) => state.setNickname);
  const isTetrisSubmitting = useTetrisStore((state) => state.isSubmitting);
  const resetTetris = useTetrisStore((state) => state.resetTetris);
  const submitTetrisScore = useTetrisStore((state) => state.submitFinalScore);

  const activeNickname =
    activeGame === 'tetris'
      ? tetrisNickname
      : activeGame === 'sudoku'
      ? sudokuNickname
      : emojiNickname;

  const isSubmitting = isEmojiSubmitting || isSudokuSubmitting || isTetrisSubmitting;

  const [copied, setCopied] = useState(false);
  const [customName, setCustomName] = useState<string | null>(null);
  const inputName = customName !== null ? customName : (activeNickname || 'Player');

  // Determine modal active state
  let isOpen = false;
  let isVictory = true;
  let title = 'PUZZLE COMPLETED!';
  let elapsedMs = 0;
  let movesCount = 0;
  let score = 0;
  let serverRank: number | null = null;
  let handleReset = resetEmoji;
  let handleSubmit = submitEmojiScore;

  if (activeGame === 'emoji') {
    isOpen = emojiCompleted;
    isVictory = true;
    title = 'EXCELLENT MATCH!';
    elapsedMs = emojiElapsed;
    movesCount = emojiMoves;
    serverRank = emojiRank;
    handleReset = resetEmoji;
    handleSubmit = submitEmojiScore;
  } else if (activeGame === 'sudoku') {
    isOpen = sudokuCompleted || sudokuGameOver;
    isVictory = sudokuCompleted && !sudokuGameOver;
    title = isVictory ? 'SUDOKU MASTERED!' : 'GAME OVER';
    elapsedMs = sudokuElapsed;
    movesCount = sudokuMistakes;
    serverRank = sudokuRank;
    handleReset = resetSudoku;
    handleSubmit = submitSudokuScore;
  } else if (activeGame === 'tetris') {
    isOpen = tetrisGameOver || tetrisCompleted;
    isVictory = tetrisCompleted || tetrisLines >= 20;
    title = isVictory ? 'SPRINT FINISHED!' : 'TETRIS OVER';
    elapsedMs = tetrisElapsed;
    movesCount = tetrisLines;
    score = tetrisScore;
    serverRank = tetrisRank;
    handleReset = resetTetris;
    handleSubmit = submitTetrisScore;
  }

  useEffect(() => {
    if (isOpen && isVictory) {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  }, [isOpen, isVictory]);



  if (!isOpen) return null;

  const totalSecs = Math.floor(elapsedMs / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  const tenths = Math.floor((elapsedMs % 1000) / 100);
  const pad = (n: number) => String(n).padStart(2, '0');
  const timeFormatted = `${pad(mins)}:${pad(secs)}.${tenths}`;

  const currentGame = GAMES_LIST.find((g) => g.id === activeGame) || GAMES_LIST[0];

  const handleShare = async () => {
    let statText = `⏱️ Time: ${timeFormatted}`;
    if (activeGame === 'tetris') {
      statText += ` | ⚡ Score: ${score.toLocaleString()} | 🧱 Lines: ${movesCount}`;
    } else if (activeGame === 'emoji') {
      statText += ` | 🎯 Moves: ${movesCount}`;
    } else if (activeGame === 'sudoku') {
      statText += ` | ❌ Mistakes: ${movesCount}`;
    }

    const shareText = `${currentGame.icon} ${currentGame.name} — Daily Games (${dateSeed})\n${statText}\n${
      serverRank ? `🏆 Rank: #${serverRank} on global leaderboard\n` : ''
    }Can you beat my record? Play free at Daily Games!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${currentGame.name} — Daily Games`,
          text: shareText,
          url: window.location.origin,
        });
        return;
      } catch {
        // Fallback
      }
    }

    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveNickname = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputName.trim().slice(0, 24) || 'Player';
    setEmojiNickname(clean);
    setSudokuNickname(clean);
    setTetrisNickname(clean);
    setCustomName(clean);
    await handleSubmit();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-sm glass-panel rounded-3xl p-6 border border-white/20 shadow-2xl text-center relative overflow-hidden">
        {/* Badge Icon */}
        <div
          className={`w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center border ${
            isVictory
              ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
              : 'bg-rose-500/20 border-rose-500/30 text-rose-400'
          }`}
        >
          {isVictory ? <Trophy className="w-8 h-8" /> : <Frown className="w-8 h-8" />}
        </div>

        <h2 className="text-xl font-black text-white tracking-wide mb-1">
          {title}
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          {currentGame.name} daily puzzle for {dateSeed}
        </p>

        {/* Stats Grid */}
        <div className={`grid ${activeGame === 'tetris' ? 'grid-cols-3' : 'grid-cols-2'} gap-2 mb-4`}>
          <div className="bg-slate-800/90 p-2.5 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Time</span>
            <div className="text-base sm:text-lg font-mono font-bold text-white mt-0.5">
              {timeFormatted}
            </div>
          </div>

          <div className="bg-slate-800/90 p-2.5 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              {activeGame === 'tetris' ? 'Lines' : activeGame === 'sudoku' ? 'Mistakes' : 'Moves'}
            </span>
            <div className="text-base sm:text-lg font-mono font-bold text-emerald-400 mt-0.5">
              {movesCount}
            </div>
          </div>

          {activeGame === 'tetris' && (
            <div className="bg-slate-800/90 p-2.5 rounded-xl border border-slate-700/60">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Score</span>
              <div className="text-base sm:text-lg font-mono font-bold text-amber-400 mt-0.5 truncate">
                {score.toLocaleString()}
              </div>
            </div>
          )}
        </div>

        {/* Nickname & Leaderboard Upload Form */}
        {isOnline ? (
          <div className="mb-4 p-3 rounded-2xl bg-slate-850 border border-slate-700/60 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-300 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Leaderboard Entry
              </span>
              {serverRank && (
                <span className="text-xs font-bold text-amber-400">
                  Rank #{serverRank} Today!
                </span>
              )}
            </div>

            <form onSubmit={handleSaveNickname} className="flex gap-2">
              <input
                type="text"
                value={inputName}
                onChange={(e) => setCustomName(e.target.value)}
                maxLength={20}
                placeholder="Your nickname..."
                className="flex-1 bg-slate-900 px-3 py-1.5 rounded-xl text-xs text-white border border-slate-700 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={isSubmitting || !inputName.trim()}
                className="px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-white text-slate-900 font-bold text-xs transition-colors flex items-center gap-1 shadow-sm touch-manipulation"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{isSubmitting ? '...' : 'Save'}</span>
              </button>
            </form>

            {emojiError && (
              <p className="text-[10px] text-rose-400 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{emojiError}</span>
              </p>
            )}
          </div>
        ) : (
          /* Offline Saved Banner */
          <div className="mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left flex items-start gap-2.5 text-amber-300 text-xs">
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-200 text-xs">Played in Offline Mode</p>
              <p className="text-[11px] text-amber-300/80 mt-0.5 leading-tight">
                Your score is saved locally! It will automatically sync to the global leaderboard once your device reconnects.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleShare}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-200 hover:bg-white text-slate-900 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 touch-manipulation"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Share Result'}</span>
          </button>

          <button
            onClick={() => { setCustomName(null); handleReset(); }}
            className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs border border-slate-700 transition-colors flex items-center justify-center gap-1.5 touch-manipulation"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Play Again</span>
          </button>
        </div>
      </div>
    </div>
  );
}
