export type GameType = 'emoji' | 'sudoku' | 'tetris';

export interface GameInfo {
  id: GameType;
  name: string;
  shortName: string;
  icon: string;
  tagline: string;
}

export const GAMES_LIST: GameInfo[] = [
  {
    id: 'emoji',
    name: 'Emoji Match',
    shortName: 'Emoji 8x8',
    icon: '🧩',
    tagline: 'Match 32 emoji pairs on an 8x8 grid as fast as you can',
  },
  {
    id: 'sudoku',
    name: 'Daily Sudoku',
    shortName: 'Sudoku',
    icon: '🔢',
    tagline: 'Solve today\'s 9x9 Sudoku with unique solution',
  },
  {
    id: 'tetris',
    name: 'Tetris Sprint',
    shortName: 'Tetris',
    icon: '🕹️',
    tagline: 'Speedrun 20 lines or chase the highest score',
  },
];

// Emoji Match Constants - 8x8 (64 cells = 32 pairs)
export const BOARD_SIZE = 8;
export const TOTAL_CELLS = 64;
export const TOTAL_PAIRS = 32;
export const MISMATCH_DELAY_MS = 600;
export const TIMEZONE_OFFSET_HOURS = 0; // Standard UTC daily rollover

// 32 curated clean emojis for 8x8 grid
export const EMOJI_POOL: string[] = [
  '☀️', '🌙', '⭐', '⚡', '☁️', '❄️', '☕', '⌛',
  '⚓', '✈️', '⚽', '♟️', '🎲', '🎯', '🔔', '🔑',
  '💡', '💎', '🎵', '❤️', '♠️', '♣️', '♦️', '👁️',
  '🔥', '💧', '🌲', '🚀', '🎨', '🎧', '🎸', '🏆',
];

// Sudoku Constants
export const SUDOKU_SIZE = 9;
export const SUDOKU_BOX_SIZE = 3;
export const SUDOKU_MAX_MISTAKES = 3;

// Tetris Constants
export const TETRIS_ROWS = 20;
export const TETRIS_COLS = 10;
export const TETRIS_SPRINT_TARGET_LINES = 20;
