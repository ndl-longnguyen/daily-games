'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Sparkles } from 'lucide-react';

interface AdBannerProps {
  slotId?: string;
  format?: 'horizontal' | 'rectangle';
  className?: string;
}

export default function AdBanner({
  slotId = '1234567890',
  format = 'horizontal',
  className = '',
}: AdBannerProps) {
  const isOnline = useGameStore((state) => state.isOnline);

  // If offline, gracefully hide ads to follow clean PWA offline policy
  if (!isOnline) {
    return null;
  }

  return (
    <div
      data-ad-slot={slotId}
      data-ad-format={format}
      className={`w-full my-3 flex flex-col items-center justify-center ${className}`}
    >
      <div className="w-full max-w-4xl min-h-[70px] sm:min-h-[90px] rounded-2xl bg-slate-900/40 border border-white/5 flex flex-col items-center justify-center p-3 text-center overflow-hidden relative group">
        <span className="text-[9px] uppercase tracking-widest text-slate-500 font-semibold mb-1">
          Sponsored
        </span>

        {/* Ad Placeholder */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Daily Games Partner Network</span>
        </div>
      </div>
    </div>
  );
}
