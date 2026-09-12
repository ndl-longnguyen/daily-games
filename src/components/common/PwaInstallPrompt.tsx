'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import Image from 'next/image';
import {
  X,
  Share,
  PlusSquare,
  Download,
  Monitor,
  Smartphone,
  MoreVertical,
  Wifi,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'daily_games_pwa_dismissed';

function getDeviceType(): 'ios' | 'android' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua) && !('MSStream' in window)) return 'ios';
  if (/android/i.test(ua)) return 'android';
  return 'desktop';
}

function getIsStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && (navigator as unknown as { standalone: boolean }).standalone === true)
  );
}

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [manuallyInstalled, setManuallyInstalled] = useState(false);

  const deviceType = useSyncExternalStore(
    () => () => { },
    getDeviceType,
    () => 'desktop' as const
  );

  const isStandalone = useSyncExternalStore(
    (callback) => {
      if (typeof window === 'undefined') return () => { };
      const mql = window.matchMedia('(display-mode: standalone)');
      mql.addEventListener('change', callback);
      return () => mql.removeEventListener('change', callback);
    },
    getIsStandalone,
    () => false
  );

  useEffect(() => {
    if (typeof window === 'undefined' || isStandalone || manuallyInstalled) return;

    // 1. Listen for manual open request (e.g. clicked Header 'Install PWA' badge or footer)
    const handleOpenGuide = () => {
      setShowPrompt(true);
      setShowGuide(true);
    };
    window.addEventListener('open-pwa-install-guide', handleOpenGuide);

    // 2. Check if user recently dismissed auto-popup
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    const isDismissed = dismissedAt && Date.now() - Number(dismissedAt) < 24 * 60 * 60 * 1000;

    // 3. iOS devices (Safari on iPhone / iPad)
    if (deviceType === 'ios' && !isDismissed) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2500);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('open-pwa-install-guide', handleOpenGuide);
      };
    }

    // 4. Android & Chromium beforeinstallprompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!isDismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // 5. Fallback timer if event hasn't fired after 3.5s
    let fallbackTimer: NodeJS.Timeout | null = null;
    if (!isDismissed) {
      fallbackTimer = setTimeout(() => {
        setShowPrompt(true);
      }, 3500);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('open-pwa-install-guide', handleOpenGuide);
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, [isStandalone, manuallyInstalled, deviceType]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setShowPrompt(false);
          setManuallyInstalled(true);
        }
        setDeferredPrompt(null);
      } catch {
        setShowGuide(true);
      }
    } else {
      setShowGuide((prev) => !prev);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowGuide(false);
    try {
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
    } catch { }
  };

  if (isStandalone || manuallyInstalled || !showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-lg z-50 glass-panel rounded-3xl p-3.5 sm:p-4 border border-amber-500/40 shadow-2xl flex flex-col gap-2.5 animate-in fade-in slide-in-from-bottom-4 duration-300 bg-slate-950/95 backdrop-blur-xl select-none">
      {/* Top Banner Row */}
      <div className="flex items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl overflow-hidden border border-amber-500/40 shrink-0 bg-slate-900 shadow-[0_0_15px_rgba(245,158,11,0.25)] flex items-center justify-center">
            <Image
              src="/logo-icon.svg"
              alt="Daily Games App"
              width={44}
              height={44}
              className="w-full h-full object-cover p-1.5"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
              <span className="truncate">Install Daily Games</span>
              {deviceType === 'desktop' ? (
                <Monitor className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              ) : (
                <Smartphone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              )}
            </div>
            <div className="text-[11px] text-slate-300 truncate mt-0.5">
              Play 100% offline & fullscreen
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer touch-manipulation whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>
              {deferredPrompt ? (
                <>
                  <span className="hidden sm:inline">Install App</span>
                  <span className="sm:hidden">Install</span>
                </>
              ) : showGuide ? (
                <>
                  <span className="hidden sm:inline">Hide Guide</span>
                  <span className="sm:hidden">Hide</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">How to Install</span>
                  <span className="sm:hidden">Install</span>
                </>
              )}
            </span>
            {!deferredPrompt && (
              showGuide ? <ChevronUp className="w-3 h-3 ml-0.5 shrink-0" /> : <ChevronDown className="w-3 h-3 ml-0.5 shrink-0" />
            )}
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 cursor-pointer transition-colors touch-manipulation"
            aria-label="Dismiss install prompt"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Step-by-Step Installation Guide (Tailored to Device / Browser) */}
      {showGuide && (
        <div className="pt-2.5 border-t border-white/10 text-xs text-slate-200 space-y-2.5 animate-in fade-in duration-200 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
          {deviceType === 'ios' && (
            <>
              <div className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Install on iPhone / iPad (Safari):</span>
              </div>
              <div className="flex items-start gap-2 text-[11px] text-slate-300">
                <span className="flex items-center justify-center w-5 h-5 rounded-md bg-white/10 text-white font-bold shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  Tap the <strong>Share</strong> button{' '}
                  <Share className="w-3.5 h-3.5 inline text-sky-400 mx-0.5" /> in Safari&apos;s bottom bar.
                </span>
              </div>
              <div className="flex items-start gap-2 text-[11px] text-slate-300">
                <span className="flex items-center justify-center w-5 h-5 rounded-md bg-white/10 text-white font-bold shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong>{' '}
                  <PlusSquare className="w-3.5 h-3.5 inline text-amber-400 mx-0.5" />.
                </span>
              </div>
              <div className="flex items-start gap-2 text-[11px] text-slate-300">
                <span className="flex items-center justify-center w-5 h-5 rounded-md bg-white/10 text-white font-bold shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  Tap <strong>&quot;Add&quot;</strong> in top-right. Launch directly from your home screen anytime without internet!
                </span>
              </div>
            </>
          )}

          {deviceType === 'android' && (
            <>
              <div className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Install on Android (Google Chrome):</span>
              </div>
              <div className="flex items-start gap-2 text-[11px] text-slate-300">
                <span className="flex items-center justify-center w-5 h-5 rounded-md bg-white/10 text-white font-bold shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  Tap the <strong>3-dots menu</strong>{' '}
                  <MoreVertical className="w-3.5 h-3.5 inline text-sky-400 mx-0.5" /> in the top-right corner of Chrome.
                </span>
              </div>
              <div className="flex items-start gap-2 text-[11px] text-slate-300">
                <span className="flex items-center justify-center w-5 h-5 rounded-md bg-white/10 text-white font-bold shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Select <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.
                </span>
              </div>
              <div className="flex items-start gap-2 text-[11px] text-slate-300">
                <span className="flex items-center justify-center w-5 h-5 rounded-md bg-white/10 text-white font-bold shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  Tap <strong>Install</strong>. Play all 3 games completely offline with automatic leaderboard syncing!
                </span>
              </div>
            </>
          )}

          {deviceType === 'desktop' && (
            <>
              <div className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Install on Desktop (Chrome / Edge / Brave):</span>
              </div>
              <div className="flex items-start gap-2 text-[11px] text-slate-300">
                <span className="flex items-center justify-center w-5 h-5 rounded-md bg-white/10 text-white font-bold shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  In the browser address bar, click the <strong>Install App icon</strong>{' '}
                  <Download className="w-3.5 h-3.5 inline text-sky-400 mx-0.5" /> on the right side.
                </span>
              </div>
              <div className="flex items-start gap-2 text-[11px] text-slate-300">
                <span className="flex items-center justify-center w-5 h-5 rounded-md bg-white/10 text-white font-bold shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Or click Chrome menu <MoreVertical className="w-3.5 h-3.5 inline text-slate-400 mx-0.5" /> ➔{' '}
                  <strong>&quot;Save and share&quot;</strong> ➔ <strong>&quot;Install Daily Games&quot;</strong>.
                </span>
              </div>
            </>
          )}

          {/* Offline benefit notice */}
          <div className="pt-2 border-t border-white/5 flex items-start gap-2 text-[10px] text-emerald-300/90 leading-tight">
            <Wifi className="w-3.5 h-3.5 shrink-0 text-emerald-400 mt-0.5" />
            <span>
              <strong>Offline Mode Guarantee:</strong> Daily Games saves your game state and scores to local IndexedDB. Even without WiFi or mobile data on a flight or subway, you can solve puzzles and your high score will sync automatically when you reconnect!
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
