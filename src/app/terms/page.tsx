import { Metadata } from 'next';
import Link from 'next/link';
import { FileText, ArrowLeft, CheckCircle2, ShieldCheck, Mail } from 'lucide-react';
import { SITE_CONFIG, MAIN_SITE_URL } from '@/lib/config/site';

export const metadata: Metadata = {
  title: 'Terms of Service | Daily Games',
  description:
    'Terms of Service for Daily Games (games.ndlong.site). Rules for fair gameplay, leaderboard integrity, intellectual property, and service availability.',
};

export default function TermsOfServicePage() {
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
          <FileText className="w-4 h-4" />
          <span>TERMS OF USE</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Terms of Service
        </h1>
        <p className="text-xs text-slate-400 mt-1">Last updated: September 2026 • Effective immediately</p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm leading-relaxed glass-panel p-6 sm:p-8 rounded-3xl border border-white/10">
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>1. Agreement to Terms</span>
          </h2>
          <p>
            By accessing or playing games on <strong>Daily Games</strong> (games.ndlong.site), you agree to be bound by these Terms of Service. If you do not agree with any of these terms, you may cease playing immediately.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>2. Fair Play &amp; Leaderboard Integrity</span>
          </h2>
          <p>
            Daily Games is intended to be a fun, challenging, and fair platform for players worldwide. To maintain ranking integrity:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400 text-xs">
            <li>Automated scripts, bots, or unnatural memory injection to manipulate completion speed are strictly prohibited.</li>
            <li>Inappropriate, offensive, or defamatory nicknames are filtered and subject to deletion without notice.</li>
            <li>All leaderboard submissions are mathematically verified server-side.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-white">3. Intellectual Property</h2>
          <p>
            The game design, visual assets, algorithms, and branding of Daily Games are property of <strong>{SITE_CONFIG.author}</strong> and the NDL Network. All classic puzzle mechanics (Tetris, Sudoku, Memory Match) respect original public concepts.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Mail className="w-4 h-4 text-sky-400" />
            <span>4. Contact</span>
          </h2>
          <p>
            For any inquiries concerning these terms, please contact{' '}
            <a href={'mailto:' + SITE_CONFIG.email} className="text-indigo-400 font-semibold underline">
              {SITE_CONFIG.email}
            </a>{' '}
            or visit{' '}
            <a href={MAIN_SITE_URL} target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">
              {MAIN_SITE_URL}
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
