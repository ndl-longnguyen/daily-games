import { BOARD_SIZE, TOTAL_PAIRS, EMOJI_POOL } from './constants';
import { hashString, mulberry32, seededShuffle } from './prng';

export interface CardItem {
  id: number; // 0..63
  emoji: string;
  pairId: number; // 0..31
  row: number; // 0..7
  col: number; // 0..7
}

/**
 * Pure function: Generates an 8x8 board (64 cards: 32 pairs) based on a date seed.
 * Produces deterministic identical layout across all clients for the same date.
 */
export function generateBoard(dateSeed: string): CardItem[] {
  const seedNum = hashString(`emoji_match_8x8_${dateSeed}`);
  const prng = mulberry32(seedNum);

  // Build the 32 pairs (64 cards)
  const deck: { emoji: string; pairId: number }[] = [];
  for (let i = 0; i < TOTAL_PAIRS; i++) {
    const emoji = EMOJI_POOL[i % EMOJI_POOL.length];
    deck.push({ emoji, pairId: i });
    deck.push({ emoji, pairId: i });
  }

  // Shuffle the 64 cards deterministically
  const shuffledCards = seededShuffle(deck, prng);

  // Construct 8x8 board (64 cells)
  const board: CardItem[] = [];
  for (let index = 0; index < BOARD_SIZE * BOARD_SIZE; index++) {
    const row = Math.floor(index / BOARD_SIZE);
    const col = index % BOARD_SIZE;
    const card = shuffledCards[index];

    board.push({
      id: index,
      emoji: card.emoji,
      pairId: card.pairId,
      row,
      col,
    });
  }

  return board;
}
