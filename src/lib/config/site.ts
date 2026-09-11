export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://games.ndlong.site';
export const MAIN_SITE_URL = process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'https://ndlong.site';

export const SITE_CONFIG = {
  name: 'Daily Games',
  shortName: 'Daily Games',
  tagline: 'Free Daily Brain Puzzles & Retro Arcade',
  description:
    'Play free daily brain games and retro arcade offline on any device: 8x8 Emoji Match, 9x9 Daily Sudoku, and Tetris Sprint. Compete on global daily speed leaderboards!',
  author: 'Daily Games Team (NDL)',
  links: {
    mainSite: MAIN_SITE_URL,
    click2top: 'https://click.ndlong.site',
    github: 'https://github.com/ndl-longnguyen/daily-games',
  },
  adsense: {
    client: 'ca-pub-9166964727480227',
  },
  googleVerification: '2n_hKWDM5r9dlRixMDRAsSCW6hbadPKFb5ccKFfG3i0',
};
