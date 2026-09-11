import { TETRIS_ROWS, TETRIS_COLS } from '@/lib/constants';
import { TETROMINOES, TetrominoType } from './tetrominoes';
import { hashString, mulberry32, seededShuffle } from '@/lib/prng';

export interface ActivePiece {
  type: TetrominoType;
  x: number;
  y: number;
  rotation: number; // 0..3
}

export function createEmptyMatrix(): (string | null)[][] {
  return Array.from({ length: TETRIS_ROWS }, () => Array(TETRIS_COLS).fill(null));
}

/**
 * 7-Bag random generator seeded by day string
 */
export function createSeededBag(dateSeed: string) {
  const seedNum = hashString(`tetris_daily_bag_${dateSeed}`);
  const prng = mulberry32(seedNum);

  const bagTypes: TetrominoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
  let currentBag: TetrominoType[] = [];

  return function nextPiece(): TetrominoType {
    if (currentBag.length === 0) {
      currentBag = seededShuffle([...bagTypes], prng);
    }
    return currentBag.pop()!;
  };
}

export function checkCollision(
  matrix: (string | null)[][],
  type: TetrominoType,
  x: number,
  y: number,
  rotation: number
): boolean {
  const shape = TETROMINOES[type].shapes[rotation];
  const size = shape.length;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (shape[r][c] !== 0) {
        const targetX = x + c;
        const targetY = y + r;

        // Out of bounds
        if (targetX < 0 || targetX >= TETRIS_COLS || targetY >= TETRIS_ROWS) {
          return true;
        }

        // Space already occupied (only if within visible board)
        if (targetY >= 0 && matrix[targetY][targetX] !== null) {
          return true;
        }
      }
    }
  }

  return false;
}

export function getGhostY(
  matrix: (string | null)[][],
  type: TetrominoType,
  x: number,
  y: number,
  rotation: number
): number {
  let ghostY = y;
  while (!checkCollision(matrix, type, x, ghostY + 1, rotation)) {
    ghostY += 1;
  }
  return ghostY;
}

export function lockPiece(
  matrix: (string | null)[][],
  piece: ActivePiece
): (string | null)[][] {
  const newMatrix = matrix.map((row) => [...row]);
  const shape = TETROMINOES[piece.type].shapes[piece.rotation];
  const size = shape.length;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (shape[r][c] !== 0) {
        const targetY = piece.y + r;
        const targetX = piece.x + c;
        if (targetY >= 0 && targetY < TETRIS_ROWS && targetX >= 0 && targetX < TETRIS_COLS) {
          newMatrix[targetY][targetX] = TETROMINOES[piece.type].color;
        }
      }
    }
  }

  return newMatrix;
}

export function clearFullLines(
  matrix: (string | null)[][]
): { matrix: (string | null)[][]; linesCleared: number } {
  const filtered = matrix.filter((row) => row.some((cell) => cell === null));
  const linesCleared = TETRIS_ROWS - filtered.length;

  if (linesCleared === 0) {
    return { matrix, linesCleared: 0 };
  }

  const newRows = Array.from({ length: linesCleared }, () => Array(TETRIS_COLS).fill(null));
  return {
    matrix: [...newRows, ...filtered],
    linesCleared,
  };
}
