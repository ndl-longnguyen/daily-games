import { create } from 'zustand';
import {
  ActivePiece,
  createEmptyMatrix,
  createSeededBag,
  checkCollision,
  getGhostY,
  lockPiece,
  clearFullLines,
} from '@/lib/games/tetris/engine';
import { TetrominoType } from '@/lib/games/tetris/tetrominoes';
import { TETRIS_COLS } from '@/lib/constants';
import { getTodaySeedString } from '@/lib/prng';
import { queueOfflineScore, getStoredSetting } from '@/lib/storage';
import { sound } from '@/lib/audio';

interface TetrisState {
  dateSeed: string;
  matrix: (string | null)[][];
  currentPiece: ActivePiece | null;
  holdPiece: TetrominoType | null;
  canHold: boolean;
  nextQueue: TetrominoType[];
  linesCleared: number;
  level: number;
  score: number;
  isGameOver: boolean;
  isCompleted: boolean;
  isPaused: boolean;
  elapsedMs: number;
  isTimerRunning: boolean;
  startTime: number | null;
  sessionId: string | null;
  nickname: string;
  serverRank: number | null;
  isSubmitting: boolean;

  // Actions
  initTetris: (forceDateSeed?: string) => Promise<void>;
  startGame: () => void;
  moveLeft: () => void;
  moveRight: () => void;
  rotate: () => void;
  softDrop: () => void;
  hardDrop: () => void;
  hold: () => void;
  tick: () => void;
  tickTimer: () => void;
  setNickname: (name: string) => void;
  submitFinalScore: () => Promise<void>;
  resetTetris: () => void;
}

let dropInterval: NodeJS.Timeout | null = null;
let timerInterval: NodeJS.Timeout | null = null;
let getNextBagPiece: (() => TetrominoType) | null = null;

function calculateLineScore(lines: number, level: number): number {
  if (lines === 1) return 100 * level;
  if (lines === 2) return 300 * level;
  if (lines === 3) return 500 * level;
  if (lines === 4) return 800 * level;
  return 0;
}

function getDropIntervalForLevel(level: number): number {
  return Math.max(120, 800 - (level - 1) * 60);
}

export const useTetrisStore = create<TetrisState>((set, get) => ({
  dateSeed: getTodaySeedString(),
  matrix: createEmptyMatrix(),
  currentPiece: null,
  holdPiece: null,
  canHold: true,
  nextQueue: [],
  linesCleared: 0,
  level: 1,
  score: 0,
  isGameOver: false,
  isCompleted: false,
  isPaused: false,
  elapsedMs: 0,
  isTimerRunning: false,
  startTime: null,
  sessionId: null,
  nickname: 'Player',
  serverRank: null,
  isSubmitting: false,

  initTetris: async (forceDateSeed) => {
    const today = forceDateSeed || getTodaySeedString();
    getNextBagPiece = createSeededBag(today);

    // Populate initial queue
    const queue: TetrominoType[] = [];
    for (let i = 0; i < 3; i++) {
      queue.push(getNextBagPiece());
    }

    const firstType = queue.shift()!;
    queue.push(getNextBagPiece());

    const initialPiece: ActivePiece = {
      type: firstType,
      x: Math.floor(TETRIS_COLS / 2) - 2,
      y: 0,
      rotation: 0,
    };

    let sessId: string | null = null;
    if (typeof window !== 'undefined' && navigator.onLine) {
      try {
        const res = await fetch('/api/game/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dateSeed: today, gameType: 'tetris' }),
        });
        const data = await res.json();
        if (data.success) {
          sessId = data.sessionId;
        }
      } catch {
        // offline
      }
    }

    if (dropInterval) clearInterval(dropInterval);
    if (timerInterval) clearInterval(timerInterval);

    set({
      dateSeed: today,
      matrix: createEmptyMatrix(),
      currentPiece: initialPiece,
      holdPiece: null,
      canHold: true,
      nextQueue: queue,
      linesCleared: 0,
      level: 1,
      score: 0,
      isGameOver: false,
      isCompleted: false,
      isPaused: false,
      elapsedMs: 0,
      isTimerRunning: false,
      startTime: null,
      sessionId: sessId,
      serverRank: null,
      isSubmitting: false,
    });
  },

  startGame: () => {
    const state = get();
    if (state.isTimerRunning || state.isGameOver) return;

    const start = Date.now() - state.elapsedMs;
    set({ isTimerRunning: true, startTime: start });

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      get().tickTimer();
    }, 100);

    if (dropInterval) clearInterval(dropInterval);
    dropInterval = setInterval(() => {
      get().tick();
    }, getDropIntervalForLevel(state.level));
  },

  moveLeft: () => {
    const state = get();
    if (!state.currentPiece || state.isGameOver) return;

    if (!state.isTimerRunning) get().startGame();

    const { matrix, currentPiece } = state;
    if (!checkCollision(matrix, currentPiece.type, currentPiece.x - 1, currentPiece.y, currentPiece.rotation)) {
      sound.playTetrisMove();
      set({
        currentPiece: { ...currentPiece, x: currentPiece.x - 1 },
      });
    }
  },

  moveRight: () => {
    const state = get();
    if (!state.currentPiece || state.isGameOver) return;

    if (!state.isTimerRunning) get().startGame();

    const { matrix, currentPiece } = state;
    if (!checkCollision(matrix, currentPiece.type, currentPiece.x + 1, currentPiece.y, currentPiece.rotation)) {
      sound.playTetrisMove();
      set({
        currentPiece: { ...currentPiece, x: currentPiece.x + 1 },
      });
    }
  },

  rotate: () => {
    const state = get();
    if (!state.currentPiece || state.isGameOver) return;

    if (!state.isTimerRunning) get().startGame();

    const { matrix, currentPiece } = state;
    const nextRotation = (currentPiece.rotation + 1) % 4;

    const kicks = [0, -1, 1, -2, 2];
    for (const kick of kicks) {
      if (!checkCollision(matrix, currentPiece.type, currentPiece.x + kick, currentPiece.y, nextRotation)) {
        sound.playTetrisRotate();
        set({
          currentPiece: {
            ...currentPiece,
            x: currentPiece.x + kick,
            rotation: nextRotation,
          },
        });
        return;
      }
    }
  },

  softDrop: () => {
    const state = get();
    if (!state.currentPiece || state.isGameOver) return;

    if (!state.isTimerRunning) get().startGame();

    const { matrix, currentPiece } = state;
    if (!checkCollision(matrix, currentPiece.type, currentPiece.x, currentPiece.y + 1, currentPiece.rotation)) {
      set({
        currentPiece: { ...currentPiece, y: currentPiece.y + 1 },
        score: state.score + 1,
      });
    } else {
      get().tick();
    }
  },

  hardDrop: () => {
    const state = get();
    if (!state.currentPiece || state.isGameOver) return;

    if (!state.isTimerRunning) get().startGame();

    const { matrix, currentPiece } = state;
    const ghostY = getGhostY(matrix, currentPiece.type, currentPiece.x, currentPiece.y, currentPiece.rotation);
    const dropDistance = ghostY - currentPiece.y;

    sound.playTetrisDrop();

    const droppedPiece = { ...currentPiece, y: ghostY };
    const lockedMatrix = lockPiece(matrix, droppedPiece);
    const { matrix: clearedMatrix, linesCleared } = clearFullLines(lockedMatrix);

    const totalLines = state.linesCleared + linesCleared;
    const nextLevel = Math.floor(totalLines / 10) + 1;
    const earnedScore = dropDistance * 2 + calculateLineScore(linesCleared, state.level);
    const newScore = state.score + earnedScore;

    if (linesCleared > 0) {
      sound.playTetrisClear(linesCleared);
    }

    // Adjust drop speed if level changed
    if (nextLevel !== state.level && dropInterval) {
      clearInterval(dropInterval);
      dropInterval = setInterval(() => {
        get().tick();
      }, getDropIntervalForLevel(nextLevel));
    }

    // Spawn next piece
    if (!getNextBagPiece) getNextBagPiece = createSeededBag(state.dateSeed);
    const nextType = state.nextQueue[0];
    const newQueue = [...state.nextQueue.slice(1), getNextBagPiece()];

    const nextPiece: ActivePiece = {
      type: nextType,
      x: Math.floor(TETRIS_COLS / 2) - 2,
      y: 0,
      rotation: 0,
    };

    const isGameOver = checkCollision(clearedMatrix, nextPiece.type, nextPiece.x, nextPiece.y, nextPiece.rotation);

    if (isGameOver) {
      if (dropInterval) clearInterval(dropInterval);
      if (timerInterval) clearInterval(timerInterval);
      sound.playGameOver();
      set({
        matrix: clearedMatrix,
        currentPiece: null,
        linesCleared: totalLines,
        level: nextLevel,
        score: newScore,
        isGameOver: true,
        isTimerRunning: false,
      });
      get().submitFinalScore();
      return;
    }

    set({
      matrix: clearedMatrix,
      currentPiece: nextPiece,
      nextQueue: newQueue,
      canHold: true,
      linesCleared: totalLines,
      level: nextLevel,
      score: newScore,
    });
  },

  hold: () => {
    const state = get();
    if (!state.currentPiece || !state.canHold || state.isGameOver) return;

    if (!state.isTimerRunning) get().startGame();

    const currentType = state.currentPiece.type;
    let nextType: TetrominoType;
    let newQueue = state.nextQueue;

    if (state.holdPiece) {
      nextType = state.holdPiece;
    } else {
      if (!getNextBagPiece) getNextBagPiece = createSeededBag(state.dateSeed);
      nextType = state.nextQueue[0];
      newQueue = [...state.nextQueue.slice(1), getNextBagPiece()];
    }

    sound.playTetrisRotate();

    const newPiece: ActivePiece = {
      type: nextType,
      x: Math.floor(TETRIS_COLS / 2) - 2,
      y: 0,
      rotation: 0,
    };

    set({
      currentPiece: newPiece,
      holdPiece: currentType,
      canHold: false,
      nextQueue: newQueue,
    });
  },

  tick: () => {
    const state = get();
    if (!state.currentPiece || state.isGameOver) return;

    const { matrix, currentPiece } = state;

    if (!checkCollision(matrix, currentPiece.type, currentPiece.x, currentPiece.y + 1, currentPiece.rotation)) {
      set({
        currentPiece: { ...currentPiece, y: currentPiece.y + 1 },
      });
    } else {
      // Lock piece
      sound.playTetrisDrop();
      const lockedMatrix = lockPiece(matrix, currentPiece);
      const { matrix: clearedMatrix, linesCleared } = clearFullLines(lockedMatrix);

      const totalLines = state.linesCleared + linesCleared;
      const nextLevel = Math.floor(totalLines / 10) + 1;
      const earnedScore = calculateLineScore(linesCleared, state.level);
      const newScore = state.score + earnedScore;

      if (linesCleared > 0) {
        sound.playTetrisClear(linesCleared);
      }

      if (nextLevel !== state.level && dropInterval) {
        clearInterval(dropInterval);
        dropInterval = setInterval(() => {
          get().tick();
        }, getDropIntervalForLevel(nextLevel));
      }

      // Spawn next piece
      if (!getNextBagPiece) getNextBagPiece = createSeededBag(state.dateSeed);
      const nextType = state.nextQueue[0];
      const newQueue = [...state.nextQueue.slice(1), getNextBagPiece()];

      const nextPiece: ActivePiece = {
        type: nextType,
        x: Math.floor(TETRIS_COLS / 2) - 2,
        y: 0,
        rotation: 0,
      };

      const isGameOver = checkCollision(clearedMatrix, nextPiece.type, nextPiece.x, nextPiece.y, nextPiece.rotation);

      if (isGameOver) {
        if (dropInterval) clearInterval(dropInterval);
        if (timerInterval) clearInterval(timerInterval);
        sound.playGameOver();
        set({
          matrix: clearedMatrix,
          currentPiece: null,
          linesCleared: totalLines,
          level: nextLevel,
          score: newScore,
          isGameOver: true,
          isTimerRunning: false,
        });
        get().submitFinalScore();
        return;
      }

      set({
        matrix: clearedMatrix,
        currentPiece: nextPiece,
        nextQueue: newQueue,
        canHold: true,
        linesCleared: totalLines,
        level: nextLevel,
        score: newScore,
      });
    }
  },

  tickTimer: () => {
    const state = get();
    if (state.isTimerRunning && state.startTime) {
      const now = Date.now();
      set({ elapsedMs: now - state.startTime });
    }
  },

  setNickname: (name: string) => {
    set({ nickname: name.trim().slice(0, 24) || 'Player' });
  },

  submitFinalScore: async () => {
    const state = get();
    const effSessionId = state.sessionId || ('offline-' + crypto.randomUUID());
    const storedNickname = (await getStoredSetting<string>('player_nickname', state.nickname)) || 'Player';
    set({ sessionId: effSessionId, isSubmitting: true });

    if (typeof window !== 'undefined' && !navigator.onLine) {
      await queueOfflineScore({
        id: effSessionId,
        gameType: 'tetris',
        dateSeed: state.dateSeed,
        nickname: storedNickname,
        movesCount: state.linesCleared,
        score: state.score,
        durationMs: state.elapsedMs,
        completedAt: Date.now(),
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
          gameType: 'tetris',
          nickname: storedNickname,
          movesCount: state.linesCleared,
          score: state.score,
          dateSeed: state.dateSeed,
          durationMs: state.elapsedMs,
        }),
      });

      const data = await res.json();
      if (data.success) {
        set({ serverRank: data.rank, isSubmitting: false });
      } else {
        await queueOfflineScore({
          id: effSessionId,
          gameType: 'tetris',
          dateSeed: state.dateSeed,
          nickname: storedNickname,
          movesCount: state.linesCleared,
          score: state.score,
          durationMs: state.elapsedMs,
          completedAt: Date.now(),
        });
        set({ isSubmitting: false });
      }
    } catch {
      await queueOfflineScore({
        id: effSessionId,
        gameType: 'tetris',
        dateSeed: state.dateSeed,
        nickname: storedNickname,
        movesCount: state.linesCleared,
        score: state.score,
        durationMs: state.elapsedMs,
        completedAt: Date.now(),
      });
      set({ isSubmitting: false });
    }
  },

  resetTetris: () => {
    if (dropInterval) clearInterval(dropInterval);
    if (timerInterval) clearInterval(timerInterval);
    get().initTetris(get().dateSeed);
  },
}));
