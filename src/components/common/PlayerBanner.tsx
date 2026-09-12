'use client';

import React, { useState, useEffect } from 'react';
import { User, Pencil, Check, X, Calendar, AlertCircle } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { useSudokuStore } from '@/store/useSudokuStore';
import { useTetrisStore } from '@/store/useTetrisStore';
import { getClientId, updatePendingScoresNickname, setStoredSetting } from '@/lib/storage';

export default function PlayerBanner() {
  const activeGame = useGameStore((state) => state.activeGame);
  const dateSeed = useGameStore((state) => state.dateSeed);

  // Nicknames & setters from stores
  const emojiNickname = useGameStore((state) => state.nickname);
  const setEmojiNickname = useGameStore((state) => state.setNickname);
  const sudokuNickname = useSudokuStore((state) => state.nickname);
  const setSudokuNickname = useSudokuStore((state) => state.setNickname);
  const tetrisNickname = useTetrisStore((state) => state.nickname);
  const setTetrisNickname = useTetrisStore((state) => state.setNickname);

  const currentNickname =
    (activeGame === 'tetris'
      ? tetrisNickname
      : activeGame === 'sudoku'
      ? sudokuNickname
      : emojiNickname) || 'Player';

  const [isEditing, setIsEditing] = useState(false);
  const [inputVal, setInputVal] = useState(currentNickname);
  const [isChecking, setIsChecking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Listen to external trigger (e.g. clicked Player chip in Header)
  useEffect(() => {
    const handleTriggerEdit = () => {
      setInputVal(currentNickname);
      setErrorMessage(null);
      setIsEditing(true);
    };
    window.addEventListener('open-edit-nickname', handleTriggerEdit);
    return () => window.removeEventListener('open-edit-nickname', handleTriggerEdit);
  }, [currentNickname]);

  const handleStartEdit = () => {
    setInputVal(currentNickname);
    setErrorMessage(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setInputVal(currentNickname);
    setErrorMessage(null);
    setIsEditing(false);
  };

  const saveOffline = async (clean: string) => {
    setEmojiNickname(clean);
    setSudokuNickname(clean);
    setTetrisNickname(clean);
    await updatePendingScoresNickname(clean);
    await setStoredSetting('pending_nickname_sync', clean);
    setIsEditing(false);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = inputVal.trim().slice(0, 20) || 'Player';
    setErrorMessage(null);

    // If unchanged, simply exit
    if (clean.toLowerCase() === currentNickname.toLowerCase()) {
      setIsEditing(false);
      return;
    }

    setIsChecking(true);
    const clientId = await getClientId();

    if (typeof window !== 'undefined' && navigator.onLine && clean.toLowerCase() !== 'player') {
      try {
        const res = await fetch('/api/user/check-nickname', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nickname: clean, clientId }),
        });
        const data = await res.json();
        if (!data.available) {
          setErrorMessage(data.error || 'Nickname is already taken. Please choose another!');
          setIsChecking(false);
          return;
        }

        // Available! Save locally & sync to server
        setEmojiNickname(clean);
        setSudokuNickname(clean);
        setTetrisNickname(clean);

        // Update existing server records for this client today
        await fetch('/api/user/sync-nickname', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId, nickname: clean, dateSeed }),
        }).catch(() => {});

        window.dispatchEvent(new CustomEvent('scores-synced', { detail: { count: 1 } }));
        setIsEditing(false);
      } catch {
        // Network error during check: save offline
        await saveOffline(clean);
      }
    } else {
      // Offline mode
      await saveOffline(clean);
    }
    setIsChecking(false);
  };

  return (
    <div className="w-full max-w-[480px] mx-auto glass-panel rounded-2xl px-3 py-1.5 border border-white/10 shadow-md mb-2 sm:mb-2.5 flex flex-col gap-1 select-none animate-in fade-in duration-150">
      <div className="flex items-center justify-between gap-2 w-full">
        {isEditing ? (
          <form onSubmit={handleSave} className="flex items-center gap-2 w-full">
            <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0">
              <User className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => {
                setInputVal(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              maxLength={20}
              placeholder="Enter unique nickname..."
              autoFocus
              className={`flex-1 bg-slate-900/90 px-2.5 py-1 rounded-xl text-xs text-white border focus:outline-none font-semibold ${
                errorMessage ? 'border-rose-500 focus:border-rose-400' : 'border-indigo-500/60 focus:border-indigo-400'
              }`}
            />
            <button
              type="submit"
              disabled={isChecking || !inputVal.trim()}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs transition-all active:scale-95 shadow-sm touch-manipulation cursor-pointer shrink-0"
            >
              <Check className="w-3 h-3" />
              <span>{isChecking ? '...' : 'Save'}</span>
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer touch-manipulation shrink-0"
              title="Cancel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <>
            {/* Left: User Avatar & Name */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shadow-sm shrink-0">
                <User className="w-3.5 h-3.5 text-indigo-400" />
              </div>

              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[11px] text-slate-400 font-medium shrink-0">Player:</span>
                <span className="font-bold text-xs sm:text-sm text-slate-100 truncate max-w-[130px] sm:max-w-[180px]">
                  {currentNickname}
                </span>
              </div>

              <button
                type="button"
                onClick={handleStartEdit}
                title="Click to change your nickname"
                className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-400 hover:text-amber-300 bg-slate-800/80 hover:bg-slate-750 px-2 py-0.5 rounded-lg border border-slate-700/60 transition-all cursor-pointer touch-manipulation active:scale-95 shrink-0"
              >
                <Pencil className="w-2.5 h-2.5 text-slate-400 hover:text-amber-400" />
                <span>Edit</span>
              </button>
            </div>

            {/* Right: Date Badge */}
            <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded-lg border border-slate-800 shrink-0">
              <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
              <span>{dateSeed}</span>
            </div>
          </>
        )}
      </div>

      {/* Duplicate / Validation Error Alert */}
      {errorMessage && (
        <p className="text-[10px] text-rose-400 flex items-center gap-1 pl-8 pb-0.5 animate-in fade-in duration-150 font-medium">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{errorMessage}</span>
        </p>
      )}
    </div>
  );
}
