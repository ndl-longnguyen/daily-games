'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Globe,
  Shield,
  ExternalLink,
  Sparkles,
  Lock,
  Mail,
  Zap,
} from 'lucide-react';
import { SITE_CONFIG, MAIN_SITE_URL, SIBLING_SITES } from '@/lib/config/site';

export default function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full mt-14 border-t border-white/10 bg-slate-950/80 backdrop-blur-md text-slate-400 text-xs py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        {/* Top Grid: 4 Columns matching NDL Network Standard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-white/10">
          {/* Col 1: Brand & Mission */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2.5 group w-fit">
              <Image
                src="/logo-icon.svg"
                alt="Daily Games Logo"
                width={32}
                height={32}
                className="w-8 h-8 rounded-xl shadow-md border border-indigo-500/40 group-hover:border-indigo-400 transition-colors"
              />
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-white tracking-tight group-hover:text-indigo-200 transition-colors">
                  Daily Games
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  PWA
                </span>
              </div>
            </Link>

            <p className="text-slate-400 text-xs leading-relaxed">
              High-performance, offline-first daily puzzle and retro arcade platform created by{' '}
              <a
                href={MAIN_SITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-200 font-semibold hover:text-indigo-400 underline underline-offset-4 decoration-indigo-500/40 transition-colors"
              >
                Nguyen Dai Long (NDL)
              </a>
              . Play same daily seeds worldwide, competing on verified speed leaderboards.
            </p>

            <div className="flex flex-col gap-1.5 pt-1 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Shield className="w-3.5 h-3.5 shrink-0" />
                <span>100% Free &amp; Offline Playable</span>
              </div>
              <div className="flex items-center gap-1.5 text-indigo-300">
                <Zap className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                <span>Deterministic Daily Seed (00:00 UTC)</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Lock className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
                <span>Privacy-First &amp; Zero Tracking</span>
              </div>
            </div>
          </div>

          {/* Col 2: Daily Puzzles */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Daily Challenges</span>
            </h4>
            <ul className="flex flex-col gap-2 text-xs">
              <li>
                <Link
                  href="/"
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors group"
                >
                  <span className="group-hover:scale-110 transition-transform">🧩</span>
                  <span>Emoji Match (8x8 Memory Grid)</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors group"
                >
                  <span className="group-hover:scale-110 transition-transform">🔢</span>
                  <span>Daily Sudoku (9x9 Classic Logic)</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors group"
                >
                  <span className="group-hover:scale-110 transition-transform">🕹️</span>
                  <span>Tetris Sprint (20-Line Speedrun)</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/leaderboard"
                  className="flex items-center gap-1.5 text-slate-400 hover:text-amber-400 transition-colors font-medium"
                >
                  <span>🏆</span>
                  <span>Daily Speed Leaderboard</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/how-to-play"
                  className="flex items-center gap-1.5 text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  <span>📖</span>
                  <span>How to Play &amp; Keyboard Controls</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: NDL Network Ecosystem */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>NDL Network Ecosystem</span>
            </h4>
            <ul className="flex flex-col gap-2 text-xs">
              <li>
                <a
                  href={SIBLING_SITES.laisuat}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-slate-400 hover:text-emerald-400 transition-colors group"
                >
                  <span>🏦 Lãi Suất Ngân Hàng Việt Nam</span>
                  <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <a
                  href={SIBLING_SITES.tygia}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-slate-400 hover:text-amber-400 transition-colors group"
                >
                  <span>📊 Tỷ Giá &amp; Giá Vàng Hub</span>
                  <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <a
                  href={SIBLING_SITES.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-slate-400 hover:text-indigo-400 transition-colors group"
                >
                  <span>🔗 ShortLink – Rút Gọn Link &amp; QR</span>
                  <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <a
                  href={SIBLING_SITES.image}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-slate-400 hover:text-sky-400 transition-colors group"
                >
                  <span>🖼️ Image Tools – Nén Ảnh Riêng Tư</span>
                  <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <a
                  href={SIBLING_SITES.click}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-slate-400 hover:text-rose-400 transition-colors group"
                >
                  <span>🪙 Click 2 Top – Đua Top Bấm Xu</span>
                  <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <a
                  href={SIBLING_SITES.arcade}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-slate-400 hover:text-purple-400 transition-colors group"
                >
                  <span>🎮 NDL Arcade – Trò Chơi Trực Tuyến</span>
                  <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Creator Profile & Legal */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Creator Profile &amp; Legal
            </h4>
            <ul className="flex flex-col gap-2 text-xs">
              <li>
                <a
                  href={MAIN_SITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-slate-200 font-semibold hover:text-indigo-400 transition-colors group"
                >
                  <Globe className="w-3.5 h-3.5 text-indigo-400" />
                  <span>NDL Studio Portfolio</span>
                  <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <a
                  href={SITE_CONFIG.links.blog}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors group"
                >
                  <span>✍️ Engineering Blog</span>
                  <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <a
                  href={SITE_CONFIG.links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.63 1.63 0 1 0 0-3.26 1.63 1.63 0 0 0 0 3.26m1.39 9.74v-8.37H5.07v8.37z" />
                  </svg>
                  <span>LinkedIn Profile</span>
                </a>
              </li>
              <li>
                <a
                  href={'mailto:' + SITE_CONFIG.email}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Contact Creator</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Attribution */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] sm:text-[11px] text-slate-400 pt-2 text-center sm:text-left">
          <p>© {currentYear} Daily Games. All rights reserved.</p>
          <p className="whitespace-nowrap">
            Part of the NDL network. Designed &amp; built by{' '}
            <a
              href={MAIN_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-white hover:text-indigo-400 underline underline-offset-2 transition-colors"
            >
              Nguyen Dai Long (NDL)
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
