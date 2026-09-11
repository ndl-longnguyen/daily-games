'use client';

import React from 'react';
import { Globe, Shield, ExternalLink, Heart } from 'lucide-react';
import { SITE_CONFIG, MAIN_SITE_URL } from '@/lib/config/site';

export default function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full mt-12 border-t border-white/10 bg-slate-950/70 backdrop-blur-md text-slate-400 text-xs py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        {/* Top: Brand info and Ecosystem */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-white/5">
          {/* Col 1: About */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <span>⚡</span>
              <span>Daily Games</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                PWA
              </span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              {SITE_CONFIG.description}
            </p>
          </div>

          {/* Col 2: Games */}
          <div className="flex flex-col gap-2">
            <span className="text-slate-200 font-semibold text-xs tracking-wide uppercase">
              Daily Challenges
            </span>
            <ul className="flex flex-col gap-1.5 text-[11px]">
              <li className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors">
                <span>🧩</span>
                <span>Emoji Match (8x8 Memory Grid)</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors">
                <span>🔢</span>
                <span>Daily Sudoku (9x9 Classic)</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors">
                <span>🕹️</span>
                <span>Tetris Sprint (20-Line Speedrun)</span>
              </li>
            </ul>
          </div>

          {/* Col 3: NDL Network & Links */}
          <div className="flex flex-col gap-2">
            <span className="text-slate-200 font-semibold text-xs tracking-wide uppercase flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              NDL Ecosystem
            </span>
            <ul className="flex flex-col gap-1.5 text-[11px]">
              <li>
                <a
                  href={MAIN_SITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors group"
                >
                  <span>NDL Studio Portal</span>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-slate-300" />
                </a>
              </li>
              <li>
                <a
                  href="https://click.ndlong.site"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors group"
                >
                  <span>Click 2 Top (Arcade Nations Cup)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-slate-300" />
                </a>
              </li>
              <li className="flex items-center gap-1 text-emerald-400/90 text-[10px] mt-1">
                <Shield className="w-3 h-3" />
                <span>100% Free • No Download • Offline Capable</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom: Copyright & Legal */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© {currentYear} Daily Games. Part of the NDL network. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-400">
              Built with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for Puzzle Lovers
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
