import { SUDOKU_SIZE } from '@/lib/constants';
import { hashString, mulberry32, seededShuffle } from '@/lib/prng';
import { SudokuGrid } from './types';

/**
 * Generate a canonical solved 9x9 Sudoku grid.
 */
function getCanonicalSolution(): number[][] {
  const grid: number[][] = [];
  for (let r = 0; r < SUDOKU_SIZE; r++) {
    grid[r] = [];
    for (let c = 0; c < SUDOKU_SIZE; c++) {
      grid[r][c] = ((r * 3 + Math.floor(r / 3) + c) % 9) + 1;
    }
  }
  return grid;
}

/**
 * Applies isomorphic transformations on a valid Sudoku solution to produce
 * a deterministic, structurally unique, 100% valid Sudoku solution.
 */
function transformSolution(base: number[][], prng: () => number): number[][] {
  let grid = base.map((row) => [...row]);

  // 1. Relabel numbers 1..9 with a random permutation
  const digitMap = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const shuffledDigits = seededShuffle(digitMap, prng);
  const mapping: Record<number, number> = {};
  for (let i = 0; i < 9; i++) {
    mapping[digitMap[i]] = shuffledDigits[i];
  }

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      grid[r][c] = mapping[grid[r][c]];
    }
  }

  // 2. Permute rows within each 3x3 horizontal band
  for (let b = 0; b < 3; b++) {
    const bandRows = [b * 3, b * 3 + 1, b * 3 + 2];
    const shuffledRows = seededShuffle(bandRows, prng);
    const tempRows = [grid[bandRows[0]], grid[bandRows[1]], grid[bandRows[2]]];
    for (let i = 0; i < 3; i++) {
      grid[bandRows[i]] = tempRows[shuffledRows[i] - b * 3];
    }
  }

  // 3. Permute columns within each 3x3 vertical stack
  for (let b = 0; b < 3; b++) {
    const bandCols = [b * 3, b * 3 + 1, b * 3 + 2];
    const shuffledCols = seededShuffle(bandCols, prng);
    for (let r = 0; r < 9; r++) {
      const tempCols = [grid[r][bandCols[0]], grid[r][bandCols[1]], grid[r][bandCols[2]]];
      for (let i = 0; i < 3; i++) {
        grid[r][bandCols[i]] = tempCols[shuffledCols[i] - b * 3];
      }
    }
  }

  // 4. Permute the 3 horizontal bands
  const bandOrder = seededShuffle([0, 1, 2], prng);
  const reorderedGrid: number[][] = [];
  for (const band of bandOrder) {
    reorderedGrid.push(grid[band * 3], grid[band * 3 + 1], grid[band * 3 + 2]);
  }
  grid = reorderedGrid;

  // 5. Transpose with 50% chance
  if (prng() > 0.5) {
    const transposed: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0));
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        transposed[c][r] = grid[r][c];
      }
    }
    grid = transposed;
  }

  return grid;
}

/**
 * Pure function: Generate daily Sudoku puzzle with solution and clues.
 * Keeps ~36 clues symmetrically for a balanced, delightful daily puzzle.
 */
export function generateDailySudoku(dateSeed: string): {
  grid: SudokuGrid;
  solution: number[][];
} {
  const seedNum = hashString(`sudoku_daily_puzzle_${dateSeed}`);
  const prng = mulberry32(seedNum);

  const base = getCanonicalSolution();
  const solution = transformSolution(base, prng);

  // Determine clue pattern with 180° rotational symmetry
  // 81 cells: 40 symmetric pairs + 1 center cell (row 4, col 4)
  const isClue: boolean[][] = Array.from({ length: 9 }, () => Array(9).fill(true));

  // Remove ~46 cells to leave ~35 clues
  // Pairs to remove: 23 pairs = 46 cells
  const pairs: [number, number][] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      // Pick first half
      if (r < 4 || (r === 4 && c < 4)) {
        pairs.push([r, c]);
      }
    }
  }

  const shuffledPairs = seededShuffle(pairs, prng);
  const targetRemovals = 23; // 23 * 2 = 46 removed cells -> 35 clues remain

  for (let i = 0; i < targetRemovals && i < shuffledPairs.length; i++) {
    const [r, c] = shuffledPairs[i];
    const oppR = 8 - r;
    const oppC = 8 - c;
    isClue[r][c] = false;
    isClue[oppR][oppC] = false;
  }

  // Construct final SudokuGrid
  const grid: SudokuGrid = [];
  for (let r = 0; r < 9; r++) {
    grid[r] = [];
    for (let c = 0; c < 9; c++) {
      const given = isClue[r][c];
      grid[r][c] = {
        row: r,
        col: c,
        value: given ? solution[r][c] : 0,
        solution: solution[r][c],
        isGiven: given,
        notes: [],
        isError: false,
      };
    }
  }

  return { grid, solution };
}

/**
 * Checks whether the current Sudoku grid is valid and completely filled.
 */
export function isSudokuSolved(grid: SudokuGrid): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = grid[r][c];
      if (cell.value === 0 || cell.value !== cell.solution) {
        return false;
      }
    }
  }
  return true;
}
