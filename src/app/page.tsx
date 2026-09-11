'use client';

import React, { useEffect, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useSudokuStore } from '@/store/useSudokuStore';
import { useTetrisStore } from '@/store/useTetrisStore';

// Emoji Match 8x8
import GameHUD from '@/components/game/GameHUD';
import { GameBoard } from '@/components/game/GameBoard';

// Sudoku 9x9
import SudokuHUD from '@/components/games/sudoku/SudokuHUD';
import SudokuBoard from '@/components/games/sudoku/SudokuBoard';
import NumberPad from '@/components/games/sudoku/NumberPad';

// Tetris Sprint
import TetrisHUD from '@/components/games/tetris/TetrisHUD';
import TetrisBoard from '@/components/games/tetris/TetrisBoard';
import TouchControls from '@/components/games/tetris/TouchControls';

// Unified Result & Leaderboard
import GameResultModal from '@/components/game/GameResultModal';
import LeaderboardSection from '@/components/ui/LeaderboardSection';
import SiteFooter from '@/components/ui/SiteFooter';

import { Sparkles, Trophy, HelpCircle, ChevronDown, Keyboard, Smartphone, Wifi, Zap, ShieldCheck } from 'lucide-react';
import { initOfflineSync } from '@/lib/sync';

export default function HomePage() {
  const activeGame = useGameStore((state) => state.activeGame);
  const activeTab = useGameStore((state) => state.activeTab);
  const setActiveTab = useGameStore((state) => state.setActiveTab);
  const initEmoji = useGameStore((state) => state.initGame);
  const emojiBoard = useGameStore((state) => state.board);

  const initSudoku = useSudokuStore((state) => state.initSudoku);
  const sudokuGrid = useSudokuStore((state) => state.grid);

  const initTetris = useTetrisStore((state) => state.initTetris);

  // Initialize offline sync on client mount
  useEffect(() => {
    initOfflineSync();
  }, []);

  // Initialize active game on mount or game change
  useEffect(() => {
    if (activeGame === 'emoji') {
      initEmoji();
    } else if (activeGame === 'sudoku') {
      initSudoku();
    } else if (activeGame === 'tetris') {
      initTetris();
    }
  }, [activeGame, initEmoji, initSudoku, initTetris]);

  // Accordion state for FAQ
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-start max-w-4xl mx-auto w-full px-2 sm:px-4 pt-1.5 sm:pt-3 pb-safe">
      {/* Semantic H1 for Search Engines */}
      <h1 className="sr-only">
        Daily Games – Free Daily Brain Puzzles & Retro Arcade: Emoji Match 8x8, Sudoku 9x9, Tetris Sprint
      </h1>

      {/* Main Interactive Game or Leaderboard Tab */}
      {activeTab === 'game' ? (
        <section
          aria-label="Active Game Arena"
          className="w-full flex flex-col items-center animate-in fade-in duration-200 max-w-xl mx-auto"
        >
          {/* 1. EMOJI MATCH 8x8 */}
          {activeGame === 'emoji' && (
            <>
              <GameHUD />
              {emojiBoard.length > 0 ? (
                <GameBoard />
              ) : (
                <div className="w-full h-80 flex flex-col items-center justify-center glass-panel rounded-2xl border border-white/10">
                  <div className="w-8 h-8 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin mb-3" />
                  <p className="text-xs text-slate-400">Generating today&apos;s 8x8 Emoji grid...</p>
                </div>
              )}
              <div className="flex items-center justify-between w-full max-w-[480px] mt-3 px-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  8x8 Board (32 Emoji Pairs)
                </span>
                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className="hover:text-slate-200 underline underline-offset-2 transition-colors flex items-center gap-1 touch-manipulation"
                >
                  <Trophy className="w-3 h-3 text-amber-400" />
                  View Leaderboard
                </button>
              </div>
            </>
          )}

          {/* 2. SUDOKU 9x9 */}
          {activeGame === 'sudoku' && (
            <>
              <SudokuHUD />
              {sudokuGrid.length > 0 ? (
                <>
                  <SudokuBoard />
                  <NumberPad />
                </>
              ) : (
                <div className="w-full h-80 flex flex-col items-center justify-center glass-panel rounded-2xl border border-white/10">
                  <div className="w-8 h-8 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin mb-3" />
                  <p className="text-xs text-slate-400">Loading today&apos;s 9x9 Sudoku challenge...</p>
                </div>
              )}
              <div className="flex items-center justify-between w-full max-w-[460px] mt-3 px-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  Daily Sudoku 9x9 with Notes Mode
                </span>
                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className="hover:text-slate-200 underline underline-offset-2 transition-colors flex items-center gap-1 touch-manipulation"
                >
                  <Trophy className="w-3 h-3 text-amber-400" />
                  View Leaderboard
                </button>
              </div>
            </>
          )}

          {/* 3. TETRIS SPRINT */}
          {activeGame === 'tetris' && (
            <>
              <TetrisHUD />
              <TetrisBoard />
              <TouchControls />
              <div className="flex items-center justify-between w-full max-w-[340px] mt-3 px-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1" title="Arrow keys, Space/Enter hard drop, C hold">
                  <Sparkles className="w-3 h-3 text-sky-400" />
                  Sprint 20 Lines • Space Drop
                </span>
                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className="hover:text-slate-200 underline underline-offset-2 transition-colors flex items-center gap-1 touch-manipulation"
                >
                  <Trophy className="w-3 h-3 text-amber-400" />
                  View Leaderboard
                </button>
              </div>
            </>
          )}
        </section>
      ) : (
        /* LEADERBOARD VIEW */
        <section aria-label="Daily Rankings" className="w-full animate-in fade-in duration-200">
          <LeaderboardSection />
        </section>
      )}

      {/* Unified Result Celebration Modal */}
      <GameResultModal />

      {/* Crawlable SEO Article & Game Guides */}
      <article className="w-full max-w-2xl mt-12 px-2 sm:px-0 flex flex-col gap-8 text-slate-300">
        {/* Intro Card */}
        <section className="glass-panel rounded-3xl p-5 sm:p-7 border border-white/10">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-2 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <span>Daily Brain Puzzles & Retro Arcade Hub</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Welcome to <strong className="text-slate-200">Daily Games</strong> — an offline-first Progressive Web App
            (PWA) designed for puzzle lovers and competitive minds. Every day at 00:00 UTC, a unique deterministic
            daily seed generates the exact same puzzles for players across the world:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1">
              <div className="text-xl">🧩</div>
              <strong className="text-white">Emoji Match 8x8</strong>
              <p className="text-slate-400 text-[11px]">
                Flip and pair 32 emoji twins across 64 cards. Trains visual memory, pattern recognition, and focus.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1">
              <div className="text-xl">🔢</div>
              <strong className="text-white">Daily Sudoku 9x9</strong>
              <p className="text-slate-400 text-[11px]">
                Pure deductive logic. Fill the 9x9 grid with numbers 1–9 without repeating in any row, column, or 3x3 block.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1">
              <div className="text-xl">🕹️</div>
              <strong className="text-white">Tetris 20-Line Sprint</strong>
              <p className="text-slate-400 text-[11px]">
                Arcade speedrun challenge. Drop, rotate, and clear 20 lines as fast as possible to dominate global scores.
              </p>
            </div>
          </div>
        </section>

        {/* Features & PWA Offline Sync */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="glass-panel rounded-3xl p-5 border border-white/10 flex flex-col gap-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Wifi className="w-4 h-4 text-emerald-400" />
              <span>100% Offline PWA Playability</span>
            </h3>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Install Daily Games to your home screen on iOS, Android, or Desktop. All board generators and game engines run locally in your browser without needing an internet connection.
            </p>
          </div>

          <div className="glass-panel rounded-3xl p-5 border border-white/10 flex flex-col gap-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Automatic Leaderboard Sync</span>
            </h3>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Completed a puzzle while offline on the subway or plane? Your score is stored safely in IndexedDB and automatically uploads to the global leaderboard the instant you reconnect.
            </p>
          </div>
        </section>

        {/* Controls Guide */}
        <section className="glass-panel rounded-3xl p-5 sm:p-6 border border-white/10">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-amber-400" />
            <span>Controls & Shortcuts</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex flex-col gap-1.5">
              <span className="text-slate-200 font-semibold flex items-center gap-1.5">
                <Keyboard className="w-3.5 h-3.5 text-slate-400" />
                Keyboard (Desktop)
              </span>
              <ul className="flex flex-col gap-1 text-[11px] text-slate-400">
                <li>• <strong>Sudoku:</strong> Keys 1–9 to input, Backspace to erase, N for Notes, Arrow keys to navigate.</li>
                <li>• <strong>Tetris:</strong> Left/Right arrows to move, Up arrow to rotate, Space or Enter to Hard Drop, C to Hold piece.</li>
              </ul>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-slate-200 font-semibold flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                Touch (Mobile & Tablet)
              </span>
              <ul className="flex flex-col gap-1 text-[11px] text-slate-400">
                <li>• Responsive on-screen numberpad and D-pad controls optimized with zero tap latency.</li>
                <li>• PWA full-screen display without address bars on mobile.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="glass-panel rounded-3xl p-5 sm:p-6 border border-white/10">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            <span>Frequently Asked Questions</span>
          </h3>

          <div className="flex flex-col divide-y divide-white/5">
            {[
              {
                q: 'Are Daily Games completely free to play?',
                a: 'Yes, 100% free with no paywalls or app store download required. Daily Games runs directly in any modern browser on mobile, tablet, and desktop.',
              },
              {
                q: 'When do the daily puzzles reset?',
                a: 'Puzzles reset every day at 00:00 UTC (Universal Time Coordinated). The remaining countdown is displayed live in the top header.',
              },
              {
                q: 'How does the offline score sync work?',
                a: 'If you finish a challenge without internet, your time and moves are saved securely into local IndexedDB storage. As soon as your device regains internet connection, the app automatically uploads your record to the live daily leaderboard.',
              },
              {
                q: 'Can I play previous days\' puzzles?',
                a: 'You can browse historical leaderboards by choosing any past date on the Leaderboard tab to inspect past champions and times.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="py-2.5">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between text-left text-xs font-semibold text-slate-200 hover:text-white transition-colors py-1 touch-manipulation"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                      openFaqIndex === idx ? 'rotate-180 text-amber-400' : ''
                    }`}
                  />
                </button>
                {openFaqIndex === idx && (
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed pl-1 pr-4 animate-in fade-in duration-150">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      </article>

      {/* Standard NDL Ecosystem Footer */}
      <SiteFooter />
    </div>
  );
}
