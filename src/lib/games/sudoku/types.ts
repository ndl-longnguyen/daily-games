export interface SudokuCellData {
  row: number; // 0..8
  col: number; // 0..8
  value: number; // 0..9 (0 = empty)
  solution: number; // 1..9
  isGiven: boolean;
  notes: number[]; // 1..9 candidates
  isError?: boolean;
}

export type SudokuGrid = SudokuCellData[][];
