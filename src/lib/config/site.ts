export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://games.ndlong.site';
export const MAIN_SITE_URL = process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'https://ndlong.site';

export const SIBLING_SITES = {
  main: MAIN_SITE_URL,
  laisuat: process.env.NEXT_PUBLIC_LAISUAT_URL || 'https://laisuat.ndlong.site',
  tygia: process.env.NEXT_PUBLIC_TYGIA_URL || 'https://tygia.ndlong.site',
  link: process.env.NEXT_PUBLIC_LINK_URL || 'https://link.ndlong.site',
  image: process.env.NEXT_PUBLIC_IMAGE_URL || 'https://image.ndlong.site',
  arcade: process.env.NEXT_PUBLIC_ARCADE_URL || 'https://arcade.ndlong.site',
  click: process.env.NEXT_PUBLIC_CLICK_URL || 'https://click.ndlong.site',
  games: SITE_URL,
};

export const SITE_CONFIG = {
  name: 'Daily Games',
  shortName: 'Daily Games',
  tagline: 'Free Daily Brain Puzzles & Retro Arcade',
  description:
    'Play free daily brain games and retro arcade offline on any device: 8x8 Emoji Match, 9x9 Daily Sudoku, and Tetris Sprint. Compete on global speed leaderboards!',
  author: 'Nguyen Dai Long (NDL)',
  email: 'ndl.long.nguyendai@gmail.com',
  links: {
    mainSite: MAIN_SITE_URL,
    blog: MAIN_SITE_URL + '/blog',
    privacy: '/privacy-policy',
    terms: '/terms',
    linkedin: 'https://www.linkedin.com/in/ndl-longnguyen/',
    github: 'https://github.com/ndl-longnguyen/daily-games',
  },
  adsense: {
    client: 'ca-pub-9166964727480227',
  },
  googleVerification: '2n_hKWDM5r9dlRixMDRAsSCW6hbadPKFb5ccKFfG3i0',
};
