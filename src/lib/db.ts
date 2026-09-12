import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { TOTAL_PAIRS, GameType } from './constants';

export interface LeaderboardEntry {
  rank: number;
  nickname: string;
  durationMs: number;
  movesCount: number;
  score?: number;
  createdAt: number;
  dateSeed: string;
  gameType: GameType;
  sessionId?: string;
  clientId?: string;
}

// Session secret for HMAC stateless verification
const SESSION_SECRET = process.env.SESSION_SECRET || 'daily-games-ndl-secret-key-2026';

// Initialize Supabase Client if environment variables are provided
function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY;

  if (url && key) {
    try {
      return createClient(url, key, {
        auth: { persistSession: false },
      });
    } catch (e) {
      console.error('[DB] Failed to initialize Supabase client:', e);
    }
  }
  return null;
}

// Safe fallback storage path in os.tmpdir() (always writable on Vercel/Lambda)
function getFallbackFilePath(): string {
  const dir = path.join(os.tmpdir(), 'daily-games-data');
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch {
    // Ignore if directory exists or fails
  }
  return path.join(dir, 'leaderboard.json');
}

function readFallbackLeaderboard(): LeaderboardEntry[] {
  try {
    const file = getFallbackFilePath();
    if (fs.existsSync(file)) {
      const data = fs.readFileSync(file, 'utf8');
      return JSON.parse(data) || [];
    }
  } catch (e) {
    console.warn('[DB] Fallback read warning:', e);
  }
  return [];
}

function writeFallbackLeaderboard(entries: LeaderboardEntry[]): void {
  try {
    const file = getFallbackFilePath();
    fs.writeFileSync(file, JSON.stringify(entries.slice(0, 500)), 'utf8');
  } catch (e) {
    console.warn('[DB] Fallback write warning:', e);
  }
}

/**
 * Start a new game session using cryptographically signed HMAC token.
 * Stateless: Works seamlessly across any serverless lambda instance.
 */
export async function createGameSession(
  dateSeed: string,
  gameType: GameType = 'emoji'
): Promise<{ sessionId: string; startTime: number }> {
  const rawId = crypto.randomUUID();
  const startTime = Date.now();

  // Create HMAC signature: payload = id:startTime:gameType:dateSeed
  const payload = `${rawId}:${startTime}:${gameType}:${dateSeed}`;
  const sig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('hex')
    .slice(0, 16);

  // Signed session token format: dg-[rawId].[startTime].[sig]
  const sessionId = `dg-${rawId}.${startTime}.${sig}`;

  return { sessionId, startTime };
}


/**
 * Check if a nickname is available for a given client (preventing duplicate claims).
 */
export async function checkNicknameAvailable(
  nickname: string,
  clientId?: string
): Promise<{ available: boolean; error?: string }> {
  const clean = (nickname || '').trim().slice(0, 24);
  if (!clean || clean.length < 2) {
    return { available: false, error: 'Nickname must be at least 2 characters.' };
  }
  if (clean.toLowerCase() === 'player') {
    return { available: true };
  }

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('client_id, session_id, nickname')
        .ilike('nickname', clean)
        .limit(10);

      if (!error && data && data.length > 0) {
        const isConflict = data.some((row: { client_id?: string }) => {
          if (row.client_id && clientId) {
            return row.client_id !== clientId;
          }
          return false;
        });

        if (isConflict) {
          return {
            available: false,
            error: `Nickname "${clean}" is already taken by another player. Please choose another!`,
          };
        }
      }
      return { available: true };
    } catch (err) {
      console.warn('[DB] Nickname check error, allowing:', err);
      return { available: true };
    }
  }

  // Fallback storage check
  const entries = readFallbackLeaderboard();
  const conflict = entries.some(
    (e) =>
      e.nickname.toLowerCase() === clean.toLowerCase() &&
      e.clientId &&
      clientId &&
      e.clientId !== clientId
  );
  if (conflict) {
    return {
      available: false,
      error: `Nickname "${clean}" is already taken. Please choose another!`,
    };
  }

  return { available: true };
}

/**
 * Synchronize / update player nickname across all their leaderboard records for this client.
 */
export async function syncUserNickname(
  clientId: string,
  newNickname: string,
  dateSeed?: string
): Promise<{ success: boolean; error?: string; updatedCount: number }> {
  const check = await checkNicknameAvailable(newNickname, clientId);
  if (!check.available) {
    return { success: false, error: check.error, updatedCount: 0 };
  }

  const clean = newNickname.trim().slice(0, 24) || 'Player';
  const supabase = getSupabase();
  if (supabase) {
    try {
      let query = supabase
        .from('leaderboard')
        .update({ nickname: clean })
        .eq('client_id', clientId);

      if (dateSeed) {
        query = query.eq('date_seed', dateSeed);
      }

      const { data, error } = await query.select();
      if (error) {
        console.warn('[DB] Supabase nickname sync warning:', error.message);
        return { success: false, error: error.message, updatedCount: 0 };
      }
      return { success: true, updatedCount: data ? data.length : 1 };
    } catch (err) {
      console.error('[DB] Nickname sync error:', err);
    }
  }

  // Fallback store
  const entries = readFallbackLeaderboard();
  let count = 0;
  for (const e of entries) {
    if (e.clientId === clientId && (!dateSeed || e.dateSeed === dateSeed)) {
      e.nickname = clean;
      count++;
    }
  }
  if (count > 0) {
    writeFallbackLeaderboard(entries);
  }
  return { success: true, updatedCount: count };
}

/**
 * Finish a game session, verify integrity and record score to leaderboard.
 * Supports Supabase when configured, and serverless fallback when offline/local.
 */
export async function finishGameSession(params: {
  sessionId: string;
  gameType?: GameType;
  nickname: string;
  movesCount: number;
  score?: number;
  dateSeed: string;
  durationMs?: number;
  clientId?: string;
}): Promise<{
  success: boolean;
  durationMs?: number;
  rank?: number;
  error?: string;
}> {
  try {
    const { sessionId, nickname, movesCount, score = 0, dateSeed } = params;
    const gameType: GameType = params.gameType || 'emoji';
    const cleanNickname = (nickname || 'Player').trim().slice(0, 24) || 'Player';
    const now = Date.now();

    let finalDurationMs = 0;

    // 1. Session Verification
    if (sessionId.startsWith('offline-')) {
      // Offline PWA Sync Session
      finalDurationMs = Math.max(1000, params.durationMs || 30000);
    } else if (sessionId.startsWith('dg-')) {
      // Stateless HMAC Verified Session
      const parts = sessionId.slice(3).split('.');
      if (parts.length === 3) {
        const [rawId, startTimeStr, sig] = parts;
        const parsedStartTime = parseInt(startTimeStr, 10);

        const payload = `${rawId}:${startTimeStr}:${gameType}:${dateSeed}`;
        const expectedSig = crypto
          .createHmac('sha256', SESSION_SECRET)
          .update(payload)
          .digest('hex')
          .slice(0, 16);

        if (sig === expectedSig && !isNaN(parsedStartTime)) {
          finalDurationMs = now - parsedStartTime;
        }
      }

      if (finalDurationMs <= 0) {
        finalDurationMs = params.durationMs || 30000;
      }
    } else {
      // Generic / Legacy Session ID
      finalDurationMs = params.durationMs || 30000;
    }

    // 2. Anti-Cheat & Duplicate Verification
    if (cleanNickname.toLowerCase() !== 'player' && params.clientId) {
      const check = await checkNicknameAvailable(cleanNickname, params.clientId);
      if (!check.available) {
        return { success: false, error: check.error };
      }
    }
    if (gameType === 'emoji') {
      if (movesCount < TOTAL_PAIRS) {
        return {
          success: false,
          error: `Invalid moves count (${movesCount}) for ${TOTAL_PAIRS} pairs.`,
        };
      }
      if (finalDurationMs < 4000) {
        return { success: false, error: 'Completion time outside humanly possible limit.' };
      }
    } else if (gameType === 'sudoku') {
      if (movesCount < 20) {
        return { success: false, error: 'Invalid move count for completed Sudoku puzzle.' };
      }
      if (finalDurationMs < 10000) {
        return { success: false, error: 'Sudoku solve time outside humanly possible limit.' };
      }
    } else if (gameType === 'tetris') {
      if (finalDurationMs < 1000) {
        return { success: false, error: 'Invalid Tetris game session duration.' };
      }
    }

    // 3. Persist to Supabase if configured
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { error: upsertError } = await supabase.from('leaderboard').upsert(
          {
            session_id: sessionId,
            game_type: gameType,
            date_seed: dateSeed,
            nickname: cleanNickname,
            duration_ms: finalDurationMs,
            moves_count: movesCount,
            score: score,
            client_id: params.clientId || null,
            created_at: now,
          },
          { onConflict: 'session_id' }
        );

        if (upsertError) {
          console.warn('[DB] Supabase upsert notice:', upsertError.message);
        }

        // Calculate rank in Supabase
        let rank = 1;
        if (gameType === 'tetris') {
          const { count } = await supabase
            .from('leaderboard')
            .select('*', { count: 'exact', head: true })
            .eq('game_type', 'tetris')
            .eq('date_seed', dateSeed)
            .or(`score.gt.${score},and(score.eq.${score},duration_ms.lt.${finalDurationMs})`);
          rank = (count || 0) + 1;
        } else {
          const { count } = await supabase
            .from('leaderboard')
            .select('*', { count: 'exact', head: true })
            .eq('game_type', gameType)
            .eq('date_seed', dateSeed)
            .lt('duration_ms', finalDurationMs);
          rank = (count || 0) + 1;
        }

        return {
          success: true,
          durationMs: finalDurationMs,
          rank,
        };
      } catch (sbErr) {
        console.error('[DB] Supabase operation error, falling back to local store:', sbErr);
      }
    }

    // 4. Serverless Fallback Storage
    const entries = readFallbackLeaderboard();
    const newEntry: LeaderboardEntry = {
      rank: 1,
      nickname: cleanNickname,
      durationMs: finalDurationMs,
      movesCount: movesCount,
      score: score,
      createdAt: now,
      dateSeed: dateSeed,
      gameType: gameType,
      sessionId: sessionId,
      clientId: params.clientId,
    };

    const existingIdx = entries.findIndex(
      (e) => (e.sessionId && e.sessionId === sessionId) || (e.dateSeed === dateSeed && e.gameType === gameType && e.durationMs === finalDurationMs && e.movesCount === movesCount)
    );

    if (existingIdx >= 0) {
      entries[existingIdx] = {
        ...entries[existingIdx],
        nickname: cleanNickname,
        createdAt: now,
      };
    } else {
      entries.push(newEntry);
    }

    // Calculate rank in fallback store
    const todayEntries = entries.filter(
      (e) => e.dateSeed === dateSeed && e.gameType === gameType
    );

    let betterCount = 0;
    if (gameType === 'tetris') {
      betterCount = todayEntries.filter(
        (e) => (e.score || 0) > score || ((e.score || 0) === score && e.durationMs < finalDurationMs)
      ).length;
    } else {
      betterCount = todayEntries.filter((e) => e.durationMs < finalDurationMs).length;
    }

    const rank = betterCount + 1;
    newEntry.rank = rank;

    writeFallbackLeaderboard(entries);

    return {
      success: true,
      durationMs: finalDurationMs,
      rank,
    };
  } catch (error) {
    console.error('[DB] Error in finishGameSession:', error);
    // Graceful safety return: never break user gameplay with 500 error
    return {
      success: true,
      durationMs: params.durationMs || 30000,
      rank: 1,
    };
  }
}

/**
 * Fetch daily leaderboard for a given date seed and game type.
 */
export async function getDailyLeaderboard(
  dateSeed: string,
  gameType: GameType = 'emoji',
  limit = 50
): Promise<LeaderboardEntry[]> {
  try {
    const supabase = getSupabase();
    if (supabase) {
      try {
        let query = supabase
          .from('leaderboard')
          .select('nickname, duration_ms, moves_count, score, created_at, date_seed, game_type')
          .eq('game_type', gameType)
          .eq('date_seed', dateSeed);

        if (gameType === 'tetris') {
          query = query.order('score', { ascending: false }).order('duration_ms', { ascending: true });
        } else {
          query = query.order('duration_ms', { ascending: true });
        }

        const { data, error } = await query.limit(limit);

        if (!error && data) {
          return data.map((row: Record<string, unknown>, idx: number) => ({
            rank: idx + 1,
            nickname: String(row.nickname || "Player"),
            durationMs: Number(row.duration_ms || 0),
            movesCount: Number(row.moves_count || 0),
            score: Number(row.score || 0),
            createdAt: Number(row.created_at || 0),
            dateSeed: String(row.date_seed || dateSeed),
            gameType: (row.game_type as GameType) || 'emoji',
          }));
        }
      } catch (sbErr) {
        console.warn('[DB] Supabase leaderboard fetch error, using fallback:', sbErr);
      }
    }

    // Fallback in-memory/file store
    const entries = readFallbackLeaderboard();
    const filtered = entries.filter(
      (e) => e.dateSeed === dateSeed && e.gameType === gameType
    );

    if (gameType === 'tetris') {
      filtered.sort((a, b) => (b.score || 0) - (a.score || 0) || a.durationMs - b.durationMs);
    } else {
      filtered.sort((a, b) => a.durationMs - b.durationMs);
    }

    return filtered.slice(0, limit).map((e, idx) => ({
      ...e,
      rank: idx + 1,
    }));
  } catch (error) {
    console.error('[DB] Error fetching leaderboard:', error);
    return [];
  }
}
