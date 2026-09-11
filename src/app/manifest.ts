import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Daily Games — Free Daily Brain Puzzles & Retro Arcade',
    short_name: 'Daily Games',
    description:
      'Play free daily brain games and retro arcade offline: 8x8 Emoji Match, 9x9 Daily Sudoku, and Tetris Sprint with synchronized daily leaderboards.',
    start_url: '/',
    display: 'standalone',
    background_color: '#090d16',
    theme_color: '#090d16',
    orientation: 'portrait-primary',
    categories: ['games', 'puzzle', 'arcade'],
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
