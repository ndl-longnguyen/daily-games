import { Metadata } from 'next';
import Link from 'next/link';
import { Shield, ArrowLeft, Lock, Cookie, Database, Mail } from 'lucide-react';
import { SITE_CONFIG, MAIN_SITE_URL } from '@/lib/config/site';

export const metadata: Metadata = {
  title: 'Privacy Policy | Daily Games',
  description:
    'Privacy Policy for Daily Games (games.ndlong.site). Learn about our zero-tracking, offline-first data model, local IndexedDB storage, and Google AdSense compliance.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-8 text-slate-300">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Games</span>
        </Link>
        <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 font-semibold mb-2">
          <Shield className="w-4 h-4" />
          <span>PRIVACY &amp; DATA PROTECTION</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs text-slate-400 mt-1">Last updated: September 2026 • Effective immediately</p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm leading-relaxed glass-panel p-6 sm:p-8 rounded-3xl border border-white/10">
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>1. Our Privacy Philosophy: Offline-First</span>
          </h2>
          <p>
            <strong>Daily Games</strong> (games.ndlong.site), created by <strong>{SITE_CONFIG.author}</strong> as part of the NDL network, is architected around an offline-first Progressive Web App (PWA) paradigm. All puzzle generation (Emoji Match, Sudoku, Tetris) occurs entirely inside your web browser via client-side JavaScript.
          </p>
          <p>
            We do not require user accounts, passwords, or personal email sign-ups to play any game.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-400" />
            <span>2. Local Storage &amp; Leaderboard Submissions</span>
          </h2>
          <p>
            Your game progression, daily completion states, and high scores are saved locally on your device using HTML5 localStorage and IndexedDB.
          </p>
          <p>
            When you complete a game and optionally choose to submit your record to the daily leaderboard, the following anonymous data is sent:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400 text-xs">
            <li>Your chosen public nickname (defaults to &quot;Player&quot;)</li>
            <li>Completion time in milliseconds</li>
            <li>Game move count or line clears</li>
            <li>Date seed and cryptographic session verification hash</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Cookie className="w-4 h-4 text-amber-400" />
            <span>3. Cookies &amp; Google AdSense</span>
          </h2>
          <p>
            We use Google AdSense (Publisher ID: ca-pub-9166964727480227) to serve non-intrusive advertisements to keep our platform 100% free. Google and its third-party advertising partners may use cookies (such as the DoubleClick cookie) to serve ads based on your prior visits to this or other websites.
          </p>
          <p>
            You may opt out of personalized advertising by visiting{' '}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 underline"
            >
              Google Ads Settings
            </a>
            .
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Mail className="w-4 h-4 text-sky-400" />
            <span>4. Contact the Creator</span>
          </h2>
          <p>
            If you have any questions or feedback regarding this Privacy Policy or your data, please contact the developer directly at{' '}
            <a href={'mailto:' + SITE_CONFIG.email} className="text-indigo-400 font-semibold underline">
              {SITE_CONFIG.email}
            </a>{' '}
            or visit the{' '}
            <a href={MAIN_SITE_URL} target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">
              NDL Studio Portal
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
