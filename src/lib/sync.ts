import { getPendingScores, removePendingScore } from './storage';

let isSyncing = false;

/**
 * Synchronize all locally queued offline game scores to the central leaderboard
 */
export async function syncPendingScores(): Promise<{ syncedCount: number; errors: string[] }> {
  if (typeof window === 'undefined' || !navigator.onLine || isSyncing) {
    return { syncedCount: 0, errors: [] };
  }

  isSyncing = true;
  const pending = await getPendingScores();
  let syncedCount = 0;
  const errors: string[] = [];

  if (pending.length === 0) {
    isSyncing = false;
    return { syncedCount: 0, errors: [] };
  }

  console.log(`[Sync] Found ${pending.length} offline score(s) to synchronize...`);

  for (const item of pending) {
    try {
      const res = await fetch('/api/game/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: item.id,
          gameType: item.gameType,
          nickname: item.nickname,
          movesCount: item.movesCount,
          score: item.score,
          dateSeed: item.dateSeed,
          durationMs: item.durationMs,
        }),
      });

      const data = await res.json();
      if (data.success) {
        await removePendingScore(item.id);
        syncedCount++;
        console.log(`[Sync] Successfully uploaded offline score for ${item.gameType} (Rank: #${data.rank})`);
      } else {
        errors.push(data.error || 'Failed to sync score');
      }
    } catch (err) {
      console.error('[Sync] Network error during score sync:', err);
      errors.push('Network connection error during sync');
      break; // Stop attempting if network fails
    }
  }

  isSyncing = false;

  if (syncedCount > 0) {
    // Notify components (like Leaderboard) to reload fresh rankings
    window.dispatchEvent(
      new CustomEvent('scores-synced', {
        detail: { count: syncedCount },
      })
    );
  }

  return { syncedCount, errors };
}

/**
 * Initialize automatic sync listeners
 */
export function initOfflineSync() {
  if (typeof window === 'undefined') return;

  // Sync whenever network reconnects
  window.addEventListener('online', () => {
    console.log('[Sync] Network reconnected. Triggering sync...');
    syncPendingScores();
  });

  // Check on load if online
  if (navigator.onLine) {
    setTimeout(syncPendingScores, 2000);
  }
}
