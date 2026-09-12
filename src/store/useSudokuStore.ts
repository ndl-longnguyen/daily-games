import { create } from 'zustand';
import { SudokuGrid } from '@/lib/games/sudoku/types';
import { generateDailySudoku, isSudokuSolved } from '@/lib/games/sudoku/generator';
import { getTodaySeedString } from '@/lib/prng';
import { queueOfflineScore, getStoredSetting, setStoredSetting, getClientId } from '@/lib/storage';
import { sound } from '@/lib/audio';
import { SUDOKU_MAX_MISTAKES } from '@/lib/constants';

interface SudokuState {
  dateSeed: string;
  grid: SudokuGrid;
  selectedCell: [number, number] | null;
  isNotesMode: boolean;
  mistakesCount: number;
  movesCount: number;
  isCompleted: boolean;
  isGameOver: boolean;
  elapsedMs: number;
  isTimerRunning: boolean;
  startTime: number | null;
  sessionId: string | null;
  nickname: string;
  serverRank: number | null;
  isSubmitting: boolean;

  // Actions
  initSudoku: (forceDateSeed?: string) => Promise<void>;
  setNickname: (name: string) => void;
  selectCell: (row: number, col: number) => void;
  inputNumber: (digit: number) => void;
  eraseCell: () => void;
  toggleNotesMode: () => void;
  tickTimer: () => void;
  submitFinalScore: () => Promise<void>;
  resetSudoku: () => void;
}

let timerInterval: NodeJS.Timeout | null = null;

export const useSudokuStore = create<SudokuState>((set, get) => ({
  dateSeed: getTodaySeedString(),
  grid: [],
  selectedCell: null,
  isNotesMode: false,
  mistakesCount: 0,
  movesCount: 0,
  isCompleted: false,
  isGameOver: false,
  elapsedMs: 0,
  isTimerRunning: false,
  startTime: null,
  sessionId: null,
  nickname: 'Player',
  serverRank: null,
  isSubmitting: false,

  initSudoku: async (forceDateSeed) => {
    const today = forceDateSeed || getTodaySeedString();
    const storedNickname = await getStoredSetting<string>('player_nickname', 'Player');
    const { grid } = generateDailySudoku(today);

    let sessId: string | null = null;
    if (typeof window !== 'undefined' && navigator.onLine) {
      try {
        const res = await fetch('/api/game/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dateSeed: today, gameType: 'sudoku' }),
        });
        const data = await res.json();
        if (data.success) {
          sessId = data.sessionId;
        }
      } catch {
        // offline
      }
    }

    set({
      dateSeed: today,
      grid,
      selectedCell: [0, 0],
      isNotesMode: false,
      mistakesCount: 0,
      movesCount: 0,
      isCompleted: false,
      isGameOver: false,
      elapsedMs: 0,
      isTimerRunning: false,
      startTime: null,
      sessionId: sessId,
      nickname: storedNickname,
      serverRank: null,
      isSubmitting: false,
    });
  },

  setNickname: (name: string) => {
    const trimmed = name.trim().slice(0, 24) || 'Player';
    set({ nickname: trimmed });
    setStoredSetting('player_nickname', trimmed);
  },

  selectCell: (row: number, col: number) => {
    set({ selectedCell: [row, col] });
  },

  toggleNotesMode: () => {
    set((state) => ({ isNotesMode: !state.isNotesMode }));
  },

  inputNumber: (digit: number) => {
    const state = get();
    if (state.isCompleted || state.isGameOver || !state.selectedCell) return;

    const [row, col] = state.selectedCell;
    const cell = state.grid[row][col];
    if (cell.isGiven) return;

    // Start timer on first input
    if (!state.isTimerRunning) {
      set({ isTimerRunning: true, startTime: Date.now() - state.elapsedMs });
      if (timerInterval) clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        get().tickTimer();
      }, 100);
    }

    // New grid copy
    const newGrid = state.grid.map((r) => r.map((c) => ({ ...c, notes: [...c.notes] })));
    const targetCell = newGrid[row][col];

    if (state.isNotesMode) {
      // Toggle note candidate
      const existingIdx = targetCell.notes.indexOf(digit);
      if (existingIdx >= 0) {
        targetCell.notes.splice(existingIdx, 1);
      } else {
        targetCell.notes.push(digit);
        targetCell.notes.sort((a, b) => a - b);
      }
      sound.playPlaceNumber();
      set({ grid: newGrid, movesCount: state.movesCount + 1 });
      return;
    }

    // Direct value placement
    if (targetCell.value === digit) {
      // already placed, erase it
      targetCell.value = 0;
      targetCell.isError = false;
      sound.playErase();
      set({ grid: newGrid, movesCount: state.movesCount + 1 });
      return;
    }

    targetCell.value = digit;
    targetCell.notes = []; // clear notes

    // Check validity against solution
    const isCorrect = digit === targetCell.solution;
    targetCell.isError = !isCorrect;

    let mistakes = state.mistakesCount;
    if (!isCorrect) {
      mistakes += 1;
      sound.playError();
    } else {
      sound.playPlaceNumber();
    }

    const isGameOver = mistakes >= SUDOKU_MAX_MISTAKES;
    const isWon = isSudokuSolved(newGrid);

    if (isGameOver && timerInterval) {
      clearInterval(timerInterval);
    }

    if (isWon) {
      if (timerInterval) clearInterval(timerInterval);
      sound.playVictory();
      get().submitFinalScore();
    }

    set({
      grid: newGrid,
      mistakesCount: mistakes,
      isGameOver,
      isCompleted: isWon,
      movesCount: state.movesCount + 1,
      isTimerRunning: !isWon && !isGameOver,
    });
  },

  eraseCell: () => {
    const state = get();
    if (state.isCompleted || state.isGameOver || !state.selectedCell) return;

    const [row, col] = state.selectedCell;
    const cell = state.grid[row][col];
    if (cell.isGiven) return;

    const newGrid = state.grid.map((r) => r.map((c) => ({ ...c, notes: [...c.notes] })));
    newGrid[row][col].value = 0;
    newGrid[row][col].notes = [];
    newGrid[row][col].isError = false;

    sound.playErase();
    set({ grid: newGrid, movesCount: state.movesCount + 1 });
  },

  tickTimer: () => {
    const state = get();
    if (state.isTimerRunning && state.startTime) {
      const now = Date.now();
      set({ elapsedMs: now - state.startTime });
    }
  },

  submitFinalScore: async () => {
    const state = get();
    if (!state.isCompleted) return;

    const effSessionId = state.sessionId || ('offline-' + crypto.randomUUID());
    const clientId = await getClientId();
    const effNickname = state.nickname || (await getStoredSetting<string>('player_nickname', 'Player')) || 'Player';
    set({ sessionId: effSessionId, isSubmitting: true });

    if (typeof window !== 'undefined' && !navigator.onLine) {
      await queueOfflineScore({
        id: effSessionId,
        gameType: 'sudoku',
        dateSeed: state.dateSeed,
        nickname: effNickname,
        movesCount: Math.max(20, state.movesCount),
        score: 0,
        durationMs: state.elapsedMs,
        completedAt: Date.now(),
        clientId,
      });
      set({ isSubmitting: false });
      return;
    }

    try {
      const res = await fetch('/api/game/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: effSessionId,
          gameType: 'sudoku',
          nickname: effNickname,
          movesCount: Math.max(20, state.movesCount),
          dateSeed: state.dateSeed,
          durationMs: state.elapsedMs,
          clientId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        set({ serverRank: data.rank, isSubmitting: false });
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('scores-synced', { detail: { count: 1 } }));
        }
      } else {
        await queueOfflineScore({
          id: effSessionId,
          gameType: 'sudoku',
          dateSeed: state.dateSeed,
          nickname: effNickname,
          movesCount: Math.max(20, state.movesCount),
          score: 0,
          durationMs: state.elapsedMs,
          completedAt: Date.now(),
        });
        set({ isSubmitting: false });
      }
    } catch {
      await queueOfflineScore({
        id: effSessionId,
        gameType: 'sudoku',
        dateSeed: state.dateSeed,
        nickname: effNickname,
        movesCount: Math.max(20, state.movesCount),
        score: 0,
        durationMs: state.elapsedMs,
        completedAt: Date.now(),
      });
      set({ isSubmitting: false });
    }
  },

  resetSudoku: () => {
    if (timerInterval) clearInterval(timerInterval);
    get().initSudoku(get().dateSeed);
  },
}));
