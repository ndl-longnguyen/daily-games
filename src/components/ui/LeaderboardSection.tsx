'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Trophy, RefreshCw, Calendar, Sparkles, User, Timer } from 'lucide-react';
import { getTodaySeedString } from '@/lib/prng';
import { LeaderboardEntry } from '@/lib/db';
import { GAMES_LIST, GameType } from '@/lib/constants';
import { useGameStore } from '@/store/useGameStore';

export default function LeaderboardSection() {
  const today = getTodaySeedString();
  const activeGame = useGameStore((state) => state.activeGame);
  const setActiveGame = useGameStore((state) => state.setActiveGame);

  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [selectedGame, setSelectedGame] = useState<GameType>(activeGame);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchLeaderboard = useCallback((date: string, game: GameType) => {
    fetch(`/api/leaderboard?date=${date}&gameType=${game}&limit=50`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setEntries(data.entries || []);
        }
      })
      .catch(() => {})
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Fetch when selection changes
  useEffect(() => {
    let ignore = false;
    fetch(`/api/leaderboard?date=${selectedDate}&gameType=${selectedGame}&limit=50`)
      .then((res) => res.json())
      .then((data) => {
        if (!ignore && data.success) {
          setEntries(data.entries || []);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [selectedDate, selectedGame]);

  // Listen to offline sync event to refresh rankings
  useEffect(() => {
    const handleSync = () => {
      fetchLeaderboard(selectedDate, selectedGame);
    };
    window.addEventListener('scores-synced', handleSync);
    return () => window.removeEventListener('scores-synced', handleSync);
  }, [selectedDate, selectedGame, fetchLeaderboard]);

  const formatDuration = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const tenths = Math.floor((ms % 1000) / 100);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(mins)}:${pad(secs)}.${tenths}`;
  };

  const currentGameInfo = GAMES_LIST.find((g) => g.id === selectedGame) || GAMES_LIST[0];

  return (
    <div className="w-full max-w-xl mx-auto glass-panel rounded-3xl p-4 sm:p-6 border border-white/10 shadow-2xl animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Daily Leaderboard</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified speed & score rankings for {selectedDate}
          </p>
        </div>

        {/* Date Selector & Refresh */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1.5 rounded-xl border border-slate-700/80 text-xs text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value || today)}
              max={today}
              className="bg-transparent text-white focus:outline-none cursor-pointer text-xs font-mono"
            />
          </div>

          <button
            onClick={() => fetchLeaderboard(selectedDate, selectedGame)}
            disabled={isLoading}
            title="Refresh ranking"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Game Selector Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 mb-5">
        {GAMES_LIST.map((game) => {
          const isSelected = selectedGame === game.id;
          return (
            <button
              key={game.id}
              onClick={() => {
                setSelectedGame(game.id);
                setActiveGame(game.id);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all touch-manipulation ${
                isSelected
                  ? 'bg-slate-800 text-white border border-slate-650 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <span>{game.icon}</span>
              <span className="truncate">{game.shortName}</span>
            </button>
          );
        })}
      </div>

      {/* Leaderboard Table List */}
      <div className="flex flex-col gap-2 min-h-[300px]">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
            <p className="text-xs">Loading rankings...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-slate-400 gap-2">
            <Sparkles className="w-8 h-8 text-slate-600 mb-1" />
            <p className="text-sm font-semibold text-slate-300">No records yet today</p>
            <p className="text-xs text-slate-500 max-w-xs">
              Be the first champion to complete {currentGameInfo.name} for {selectedDate}!
            </p>
          </div>
        ) : (
          entries.map((entry, index) => {
            const isTop1 = index === 0;
            const isTop2 = index === 1;
            const isTop3 = index === 2;

            let rankBadge = (
              <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-mono font-bold text-slate-400">
                {index + 1}
              </span>
            );

            if (isTop1) {
              rankBadge = (
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center text-xs font-bold">
                  🥇
                </span>
              );
            } else if (isTop2) {
              rankBadge = (
                <span className="w-6 h-6 rounded-full bg-slate-300/20 text-slate-200 border border-slate-300/40 flex items-center justify-center text-xs font-bold">
                  🥈
                </span>
              );
            } else if (isTop3) {
              rankBadge = (
                <span className="w-6 h-6 rounded-full bg-amber-700/20 text-amber-500 border border-amber-700/40 flex items-center justify-center text-xs font-bold">
                  🥉
                </span>
              );
            }

            return (
              <div
                key={entry.nickname + index + entry.createdAt}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  isTop1
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : isTop2
                    ? 'bg-slate-300/5 border-slate-300/20'
                    : isTop3
                    ? 'bg-amber-700/5 border-amber-700/20'
                    : 'bg-slate-900/50 border-white/5 hover:border-white/10'
                }`}
              >
                {/* Rank & Nickname */}
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  {rankBadge}
                  <div className="flex items-center gap-1.5 truncate">
                    <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="font-semibold text-xs sm:text-sm text-slate-200 truncate">
                      {entry.nickname}
                    </span>
                  </div>
                </div>

                {/* Performance Stats */}
                <div className="flex items-center gap-3 shrink-0 text-right">
                  {/* For Tetris: Highlight Score */}
                  {selectedGame === 'tetris' && entry.score !== undefined && (
                    <div className="flex flex-col items-end">
                      <span className="font-mono font-bold text-xs sm:text-sm text-amber-300">
                        {entry.score.toLocaleString()} pts
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {entry.movesCount} lines
                      </span>
                    </div>
                  )}

                  {/* Primary Time */}
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 font-mono font-bold text-xs sm:text-sm text-emerald-400">
                      <Timer className="w-3 h-3" />
                      <span>{formatDuration(entry.durationMs)}</span>
                    </div>
                    {selectedGame !== 'tetris' && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        {entry.movesCount} {selectedGame === 'emoji' ? 'moves' : 'fills'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
