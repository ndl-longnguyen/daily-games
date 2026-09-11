import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '@/components/ui/Header';
import Script from 'next/script';
import { SITE_URL, SITE_CONFIG } from '@/lib/config/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Daily Games – Free Daily Brain Puzzles & Retro Arcade: Emoji Match, Sudoku, Tetris',
    template: '%s | Daily Games',
  },
  description:
    'Play free daily brain games and retro arcade offline on any device: 8x8 Emoji Match, 9x9 Daily Sudoku, and Tetris Sprint. Same daily puzzle worldwide, compete on global speed leaderboards!',
  keywords: [
    'daily games',
    'daily brain puzzles',
    'free online games',
    'emoji match 8x8',
    'daily sudoku',
    'sudoku online',
    'tetris sprint',
    'tetris 20 lines',
    'pwa games',
    'offline games',
    'daily puzzle challenge',
    'brain training',
    'unblocked games',
    'retro arcade',
    'ndl games',
  ],
  authors: [{ name: SITE_CONFIG.author, url: SITE_CONFIG.links.mainSite }],
  creator: SITE_CONFIG.author,
  publisher: SITE_CONFIG.name,
  category: 'games',
  classification: 'Daily Puzzle & Retro Arcade Game Platform',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Daily Games – Free Daily Brain Puzzles: Emoji Match, Sudoku, Tetris',
    description:
      'Challenge your brain with 3 daily puzzle games: Emoji Match 8x8, Sudoku 9x9, and Tetris Sprint. Play offline anywhere, compete on the daily leaderboard!',
    url: SITE_URL,
    siteName: 'Daily Games',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daily Games – Free Daily Brain Puzzles & Retro Arcade',
    description:
      'Challenge your brain with 3 daily puzzle games: Emoji Match 8x8, Sudoku 9x9, and Tetris Sprint. Play offline anywhere, compete on the global leaderboard!',
  },
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#090d16',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Rich Structured Data (JSON-LD) for Search Engines
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: 'Daily Games',
        description: SITE_CONFIG.description,
        publisher: {
          '@type': 'Organization',
          name: SITE_CONFIG.author,
          url: SITE_CONFIG.links.mainSite,
        },
      },
      {
        '@type': 'WebApplication',
        '@id': `${SITE_URL}/#app`,
        name: 'Daily Games',
        url: SITE_URL,
        description:
          'Daily puzzle platform featuring 8x8 Emoji Match, 9x9 Classic Sudoku, and 20-Line Tetris Sprint with synchronized daily seeds, offline PWA gameplay, and competitive speed leaderboards.',
        applicationCategory: 'GameApplication',
        operatingSystem: 'All',
        browserRequirements: 'Requires HTML5 support',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      },
      {
        '@type': 'VideoGame',
        name: 'Emoji Match 8x8',
        gamePlatform: ['Web Browser', 'Mobile PWA', 'Tablet', 'Desktop'],
        genre: ['Memory Game', 'Puzzle', 'Brain Training'],
        description: 'Memory match puzzle with 32 emoji pairs on an 8x8 board, seeded daily for fair global competition.',
      },
      {
        '@type': 'VideoGame',
        name: 'Daily Sudoku 9x9',
        gamePlatform: ['Web Browser', 'Mobile PWA', 'Tablet', 'Desktop'],
        genre: ['Number Puzzle', 'Logic Game'],
        description: 'Classic 9x9 Sudoku puzzle generated daily with unique solution, note taking, and mistake detection.',
      },
      {
        '@type': 'VideoGame',
        name: 'Tetris 20-Line Sprint',
        gamePlatform: ['Web Browser', 'Mobile PWA', 'Tablet', 'Desktop'],
        genre: ['Arcade', 'Block Drop', 'Speedrun'],
        description: 'Speed-based 20-line Tetris sprint seeded daily for pure arcade skill comparison.',
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Are Daily Games free to play offline?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes! Daily Games is an offline-first Progressive Web App (PWA). You can install it on your mobile device or desktop and play all three games without an active internet connection. When you reconnect, your scores automatically sync to the daily leaderboard.',
            },
          },
          {
            '@type': 'Question',
            name: 'When do the daily puzzles reset?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'All daily puzzles (Emoji Match, Sudoku, and Tetris) reset every day at 00:00 UTC so players across the globe compete on the exact same board setup simultaneously.',
            },
          },
          {
            '@type': 'Question',
            name: 'How does the speed leaderboard work?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Leaderboard rankings for Emoji Match and Sudoku are ranked by lowest completion time (and moves as tiebreaker). Tetris Sprint ranks by highest score and fastest line clears. All times are verified server-side.',
            },
          },
        ],
      },
    ],
  };

  return (
    <html lang="en" className="dark">
      <head>
        <meta name="google-site-verification" content={SITE_CONFIG.googleVerification} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Daily Games" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Google AdSense */}
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${SITE_CONFIG.adsense.client}`}
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased text-slate-100 selection:bg-indigo-500 selection:text-white bg-[#090d16]">
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>

        {/* PWA Service Worker Registration */}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').catch(function(err) {
                  console.log('SW registration failed: ', err);
                });
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
