import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { GameType } from './constants';

export interface PendingSyncScore {
  id: string; // Unique offline submission ID
  gameType: GameType;
  dateSeed: string;
  nickname: string;
  movesCount: number;
  score: number;
  durationMs: number;
  completedAt: number;
}

interface DailyGamesDBSchema extends DBSchema {
  daily_game: {
    key: string; // dateSeed
    value: {
      dateSeed: string;
      matchedPairIds: number[];
      movesCount: number;
      elapsedMs: number;
      isCompleted: boolean;
      sessionId: string | null;
      updatedAt: number;
    };
  };
  settings: {
    key: string;
    value: unknown;
  };
  pending_sync: {
    key: string; // id
    value: PendingSyncScore;
  };
}

const DB_NAME = 'DailyGames_AppDB';
const DB_VERSION = 3;

let dbPromise: Promise<IDBPDatabase<DailyGamesDBSchema>> | null = null;

function getDB() {
  if (typeof window === 'undefined') return null;
  if (!dbPromise) {
    dbPromise = openDB<DailyGamesDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('daily_game')) {
          db.createObjectStore('daily_game', { keyPath: 'dateSeed' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
        if (!db.objectStoreNames.contains('pending_sync')) {
          db.createObjectStore('pending_sync', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export async function saveGameSession(sessionData: {
  dateSeed: string;
  matchedPairIds: number[];
  movesCount: number;
  elapsedMs: number;
  isCompleted: boolean;
  sessionId: string | null;
}) {
  const db = await getDB();
  if (!db) return;
  await db.put('daily_game', {
    ...sessionData,
    updatedAt: Date.now(),
  });
}

export async function loadGameSession(dateSeed: string) {
  const db = await getDB();
  if (!db) return null;
  return db.get('daily_game', dateSeed);
}

export async function getStoredSetting<T>(key: string, defaultValue: T): Promise<T> {
  const db = await getDB();
  if (!db) return defaultValue;
  const val = (await db.get('settings', key)) as T | undefined;
  return val !== undefined ? val : defaultValue;
}

export async function setStoredSetting(key: string, value: unknown) {
  const db = await getDB();
  if (!db) return;
  await db.put('settings', value, key);
}

/**
 * Queue a score completed offline to be synced when online
 */
export async function queueOfflineScore(score: PendingSyncScore): Promise<void> {
  const db = await getDB();
  if (!db) return;
  await db.put('pending_sync', score);
  console.log('[Storage] Queued offline score for sync:', score.gameType, score.durationMs);
}

/**
 * Retrieve all pending offline scores
 */
export async function getPendingScores(): Promise<PendingSyncScore[]> {
  const db = await getDB();
  if (!db) return [];
  return db.getAll('pending_sync');
}

/**
 * Remove a synced score from queue
 */
export async function removePendingScore(id: string): Promise<void> {
  const db = await getDB();
  if (!db) return;
  await db.delete('pending_sync', id);
}

/**
 * Clear all pending scores
 */
export async function clearPendingScores(): Promise<void> {
  const db = await getDB();
  if (!db) return;
  await db.clear('pending_sync');
}
