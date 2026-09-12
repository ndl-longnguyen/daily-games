import { create } from 'zustand';
import { CardItem, generateBoard } from '@/lib/board-generator';
import { getTodaySeedString } from '@/lib/prng';
import { MISMATCH_DELAY_MS, TOTAL_PAIRS, GameType } from '@/lib/constants';
import { sound } from '@/lib/audio';
import { saveGameSession, loadGameSession, getStoredSetting, setStoredSetting, queueOfflineScore, getClientId } from '@/lib/storage';

interface GameState {
  // Board & Daily Seed
  dateSeed: string;
  board: CardItem[];
  matchedPairIds: number[];
  flippedCards: CardItem[];
  isChecking: boolean;

  // Metrics
  movesCount: number;
  comboCount: number;
  isCompleted: boolean;
  startTime: number | null;
  elapsedMs: number;
  isTimerRunning: boolean;

  // Session & Leaderboard
  sessionId: string | null;
  isOnline: boolean;
  nickname: string;
  serverRank: number | null;
  finalDurationMs: number | null;
  isSubmittingScore: boolean;
  submitError: string | null;

  // UI state
  activeTab: 'game' | 'leaderboard';
  activeGame: GameType;
  soundMuted: boolean;

  // Actions
  initGame: (forceDateSeed?: string) => Promise<void>;
  flipCard: (card: CardItem) => void;
  setActiveTab: (tab: 'game' | 'leaderboard') => void;
  setActiveGame: (game: GameType) => void;
  toggleSound: () => void;
  setNickname: (name: string) => void;
  tickTimer: () => void;
  submitFinalScore: () => Promise<void>;
  setIsOnline: (online: boolean) => void;
  resetGame: () => void;
}

let timerInterval: NodeJS.Timeout | null = null;

export const useGameStore = create<GameState>((set, get) => ({
  dateSeed: getTodaySeedString(),
  board: [],
  matchedPairIds: [],
  flippedCards: [],
  isChecking: false,

  movesCount: 0,
  comboCount: 0,
  isCompleted: false,
  startTime: null,
  elapsedMs: 0,
  isTimerRunning: false,

  sessionId: null,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  nickname: 'Player',
  serverRank: null,
  finalDurationMs: null,
  isSubmittingScore: false,
  submitError: null,

  activeTab: 'game',
  activeGame: 'emoji',
  soundMuted: false,

  initGame: async (forceDateSeed) => {
    const today = forceDateSeed || getTodaySeedString();
    const storedMuted = await getStoredSetting<boolean>('sound_muted', false);
    const storedNickname = await getStoredSetting<string>('player_nickname', 'Player');
    sound.setMuted(storedMuted);

    const saved = await loadGameSession(today);
    const initialBoard = generateBoard(today);

    let matched: number[] = [];
    let moves = 0;
    let elapsed = 0;
    let completed = false;
    let sessId: string | null = null;

    if (saved && saved.matchedPairIds.length > 0) {
      matched = saved.matchedPairIds;
      moves = saved.movesCount;
      elapsed = saved.elapsedMs;
      completed = saved.isCompleted;
      sessId = saved.sessionId;
    }

    if (!sessId && !completed) {
      try {
        const res = await fetch('/api/game/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dateSeed: today }),
        });
        const data = await res.json();
        if (data.success) {
          sessId = data.sessionId;
        }
      } catch {
        sessId = 'offline-' + crypto.randomUUID();
      }
    }
    if (!sessId) {
      sessId = 'offline-' + crypto.randomUUID();
    }

    set({
      dateSeed: today,
      board: initialBoard,
      matchedPairIds: matched,
      flippedCards: [],
      isChecking: false,
      movesCount: moves,
      comboCount: 0,
      isCompleted: completed,
      startTime: null,
      elapsedMs: elapsed,
      isTimerRunning: false,
      sessionId: sessId,
      soundMuted: storedMuted,
      nickname: storedNickname,
      serverRank: null,
      finalDurationMs: completed ? elapsed : null,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    });
  },

  flipCard: (card: CardItem) => {
    const state = get();

    // Guards: don't flip already matched cards or during check
    if (state.isChecking || state.isCompleted) return;
    if (state.matchedPairIds.includes(card.pairId)) return;
    if (state.flippedCards.some((c) => c.id === card.id)) return;

    // Start timer on first flip
    if (!state.isTimerRunning && !state.isCompleted) {
      set({ isTimerRunning: true, startTime: Date.now() - state.elapsedMs });
      if (timerInterval) clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        get().tickTimer();
      }, 100);
    }

    sound.playFlip();

    const newFlipped = [...state.flippedCards, card];

    // First card of the pair
    if (newFlipped.length === 1) {
      set({ flippedCards: newFlipped });
      return;
    }

    // Second card flipped: compare
    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      const nextMovesCount = state.movesCount + 1;

      if (first.pairId === second.pairId) {
        // MATCH!
        const nextCombo = state.comboCount + 1;
        sound.playMatch(nextCombo);

        const nextMatched = [...state.matchedPairIds, first.pairId];
        const isGameWon = nextMatched.length >= TOTAL_PAIRS;

        set({
          flippedCards: [],
          matchedPairIds: nextMatched,
          movesCount: nextMovesCount,
          comboCount: nextCombo,
          isCompleted: isGameWon,
        });

        saveGameSession({
          dateSeed: state.dateSeed,
          matchedPairIds: nextMatched,
          movesCount: nextMovesCount,
          elapsedMs: state.elapsedMs,
          isCompleted: isGameWon,
          sessionId: state.sessionId,
        });

        if (isGameWon) {
          if (timerInterval) clearInterval(timerInterval);
          sound.playVictory();
          set({
            isTimerRunning: false,
            finalDurationMs: state.elapsedMs,
          });
          get().submitFinalScore();
        }
      } else {
        // MISMATCH
        sound.playMismatch();
        set({
          flippedCards: newFlipped,
          isChecking: true,
          movesCount: nextMovesCount,
          comboCount: 0,
        });

        setTimeout(() => {
          set({
            flippedCards: [],
            isChecking: false,
          });
        }, MISMATCH_DELAY_MS);
      }
    }
  },

  setActiveTab: (tab: 'game' | 'leaderboard') => {
    set({ activeTab: tab });
  },

  setActiveGame: (game: GameType) => {
    set({ activeGame: game });
  },

  toggleSound: () => {
    const nextMuted = !get().soundMuted;
    sound.setMuted(nextMuted);
    set({ soundMuted: nextMuted });
    setStoredSetting('sound_muted', nextMuted);
  },

  setNickname: (name: string) => {
    const trimmed = name.trim().slice(0, 24) || 'Player';
    set({ nickname: trimmed });
    setStoredSetting('player_nickname', trimmed);
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
    set({ sessionId: effSessionId, isSubmittingScore: true, submitError: null });

    if (typeof window !== 'undefined' && !navigator.onLine) {
      await queueOfflineScore({
        id: effSessionId,
        gameType: 'emoji',
        dateSeed: state.dateSeed,
        nickname: state.nickname || 'Player',
        movesCount: state.movesCount,
        score: 0,
        durationMs: state.elapsedMs,
        completedAt: Date.now(),
        clientId,
      });
      set({ isSubmittingScore: false, submitError: null });
      return;
    }

    try {
      const res = await fetch('/api/game/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: effSessionId,
          gameType: 'emoji',
          nickname: state.nickname || 'Player',
          movesCount: state.movesCount,
          dateSeed: state.dateSeed,
          durationMs: state.elapsedMs,
          clientId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        set({
          serverRank: data.rank,
          finalDurationMs: data.durationMs,
          isSubmittingScore: false,
        });
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('scores-synced', { detail: { count: 1 } }));
        }
      } else {
        // Queue offline fallback
        await queueOfflineScore({
          id: effSessionId,
          gameType: 'emoji',
          dateSeed: state.dateSeed,
          nickname: state.nickname || 'Player',
          movesCount: state.movesCount,
          score: 0,
          durationMs: state.elapsedMs,
          completedAt: Date.now(),
        });
        set({
          submitError: null,
          isSubmittingScore: false,
        });
      }
    } catch {
      await queueOfflineScore({
        id: effSessionId,
        gameType: 'emoji',
        dateSeed: state.dateSeed,
        nickname: state.nickname || 'Player',
        movesCount: state.movesCount,
        score: 0,
        durationMs: state.elapsedMs,
        completedAt: Date.now(),
      });
      set({
        submitError: null,
        isSubmittingScore: false,
      });
    }
  },

  setIsOnline: (online: boolean) => {
    set({ isOnline: online });
  },

  resetGame: () => {
    if (timerInterval) clearInterval(timerInterval);
    const today = getTodaySeedString();
    const board = generateBoard(today);
    set({
      board,
      matchedPairIds: [],
      flippedCards: [],
      isChecking: false,
      movesCount: 0,
      comboCount: 0,
      isCompleted: false,
      startTime: null,
      elapsedMs: 0,
      isTimerRunning: false,
      serverRank: null,
      finalDurationMs: null,
      submitError: null,
    });
  },
}));
