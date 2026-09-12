'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { Volume2, VolumeX, Clock, Trophy, Grid, Wifi, WifiOff } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { getRemainingTimeUntilReset } from '@/lib/prng';
import { GAMES_LIST } from '@/lib/constants';

const emptySubscribe = () => () => {};

export default function Header() {
  const soundMuted = useGameStore((state) => state.soundMuted);
  const toggleSound = useGameStore((state) => state.toggleSound);
  const activeTab = useGameStore((state) => state.activeTab);
  const setActiveTab = useGameStore((state) => state.setActiveTab);
  const activeGame = useGameStore((state) => state.activeGame);
  const setActiveGame = useGameStore((state) => state.setActiveGame);
  const isOnline = useGameStore((state) => state.isOnline);
  const setIsOnline = useGameStore((state) => state.setIsOnline);

  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });

  // Listen to browser online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setIsOnline]);

  useEffect(() => {
    const updateCountdown = () => {
      const remaining = getRemainingTimeUntilReset(0);
      setCountdown(remaining);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <header className="w-full glass-panel border-b border-white/10 px-2.5 sm:px-6 py-2 sm:py-2.5 pt-safe sticky top-0 z-40 transition-all select-none">
      <div className="max-w-xl mx-auto flex flex-col gap-1.5 sm:gap-2">
        {/* Top bar: Brand + View Switcher + Status & Sound */}
        <div className="flex items-center justify-between gap-1.5 sm:gap-2">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 min-w-0 group">
            <Image
              src="/logo-icon.svg"
              alt="Daily Games Logo"
              width={32}
              height={32}
              priority
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl shadow-md border border-indigo-500/40 group-hover:border-indigo-400 shrink-0 transition-colors"
            />
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-bold text-xs sm:text-base text-white tracking-tight truncate group-hover:text-indigo-200 transition-colors">
                Daily Games
              </span>
              {/* Online/Offline Badge & Install Trigger */}
              {isMounted && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.dispatchEvent(new CustomEvent('open-pwa-install-guide'));
                  }}
                  title={isOnline ? 'Online & Synchronized • Click to Install PWA' : 'Offline Mode • Click for Install Guide'}
                  className={'flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded border shrink-0 transition-all hover:scale-105 active:scale-95 cursor-pointer ' + (
                    isOnline
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30 animate-pulse'
                  )}
                >
                  {isOnline ? <Wifi className="w-2.5 h-2.5" /> : <WifiOff className="w-2.5 h-2.5" />}
                  <span>{isOnline ? 'PWA' : 'Offline'}</span>
                </button>
              )}
            </div>
          </Link>

          {/* Tab switch (Play vs Leaderboard) */}
          <div className="flex items-center bg-slate-800/80 p-0.5 rounded-xl border border-slate-700/60 shrink-0">
            <button
              onClick={() => setActiveTab('game')}
              className={'flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-medium transition-all touch-manipulation ' + (
                activeTab === 'game'
                  ? 'bg-slate-200 text-slate-900 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              <Grid className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Play</span>
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={'flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-medium transition-all touch-manipulation ' + (
                activeTab === 'leaderboard'
                  ? 'bg-slate-200 text-slate-900 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Ranks</span>
            </button>
          </div>

          {/* Right: Daily Countdown & Sound */}
          <div className="flex items-center gap-1 shrink-0">
            {isMounted && (
              <div
                title="Time remaining until daily puzzles reset"
                className="hidden md:flex items-center gap-1 text-[11px] text-slate-400 font-mono bg-slate-900/60 px-2 py-1 rounded-lg border border-slate-800"
              >
                <Clock className="w-3 h-3 text-amber-400" />
                <span>
                  {pad(countdown.hours)}:{pad(countdown.minutes)}:{pad(countdown.seconds)}
                </span>
              </div>
            )}

            <button
              onClick={toggleSound}
              aria-label={soundMuted ? 'Unmute audio' : 'Mute audio'}
              title={soundMuted ? 'Unmute audio' : 'Mute audio'}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition-all touch-manipulation flex items-center justify-center"
            >
              {soundMuted ? (
                <VolumeX className="w-4 h-4 text-slate-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-slate-200" />
              )}
            </button>
          </div>
        </div>

        {/* Game Switcher Pills */}
        <div className="grid grid-cols-3 gap-1 sm:gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
          {GAMES_LIST.map((game) => {
            const isActive = activeGame === game.id;
            return (
              <button
                key={game.id}
                onClick={() => {
                  setActiveGame(game.id);
                  if (activeTab !== 'game') setActiveTab('game');
                }}
                className={'flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 px-1.5 sm:px-2 rounded-lg text-[11px] sm:text-xs font-semibold transition-all touch-manipulation active:scale-95 ' + (
                  isActive
                    ? 'bg-slate-800 text-white border border-slate-600 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                )}
              >
                <span className="shrink-0 text-xs sm:text-sm">{game.icon}</span>
                <span className="truncate">{game.shortName}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
