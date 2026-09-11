import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { TOTAL_PAIRS, GameType } from './constants';

let databaseInstance: DatabaseSync | null = null;

function getDatabase(): DatabaseSync {
  if (!databaseInstance) {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const dbPath = path.join(dataDir, 'emojimatch.db');
    databaseInstance = new DatabaseSync(dbPath);

    // Initialize base tables
    databaseInstance.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        session_id TEXT PRIMARY KEY,
        game_type TEXT NOT NULL DEFAULT 'emoji',
        date_seed TEXT NOT NULL,
        start_time INTEGER NOT NULL,
        finish_time INTEGER,
        duration_ms INTEGER,
        moves_count INTEGER DEFAULT 0,
        score INTEGER DEFAULT 0,
        status TEXT DEFAULT 'ACTIVE'
      );

      CREATE TABLE IF NOT EXISTS leaderboard (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT UNIQUE,
        game_type TEXT NOT NULL DEFAULT 'emoji',
        date_seed TEXT NOT NULL,
        nickname TEXT NOT NULL,
        duration_ms INTEGER NOT NULL,
        moves_count INTEGER NOT NULL,
        score INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_leaderboard_game_date_duration 
      ON leaderboard (game_type, date_seed, duration_ms ASC);
    `);

    // Ensure game_type column exists if table was created previously
    try {
      databaseInstance.exec(`ALTER TABLE sessions ADD COLUMN game_type TEXT NOT NULL DEFAULT 'emoji'`);
    } catch {
      // Column already exists
    }
    try {
      databaseInstance.exec(`ALTER TABLE sessions ADD COLUMN score INTEGER DEFAULT 0`);
    } catch {
      // Column already exists
    }
    try {
      databaseInstance.exec(`ALTER TABLE leaderboard ADD COLUMN game_type TEXT NOT NULL DEFAULT 'emoji'`);
    } catch {
      // Column already exists
    }
    try {
      databaseInstance.exec(`ALTER TABLE leaderboard ADD COLUMN score INTEGER DEFAULT 0`);
    } catch {
      // Column already exists
    }
  }
  return databaseInstance;
}

export interface LeaderboardEntry {
  rank?: number;
  nickname: string;
  durationMs: number;
  movesCount: number;
  score?: number;
  createdAt: number;
  dateSeed: string;
  gameType: GameType;
}

/**
 * Start a new game session with server-side timestamp
 */
export function createGameSession(
  dateSeed: string,
  gameType: GameType = 'emoji'
): { sessionId: string; startTime: number } {
  const db = getDatabase();
  const sessionId = crypto.randomUUID();
  const startTime = Date.now();

  const stmt = db.prepare(`
    INSERT INTO sessions (session_id, game_type, date_seed, start_time, status)
    VALUES (?, ?, ?, ?, 'ACTIVE')
  `);
  stmt.run(sessionId, gameType, dateSeed, startTime);

  return { sessionId, startTime };
}

/**
 * Finish a game session, verify integrity and record score to leaderboard
 */
export function finishGameSession(params: {
  sessionId: string;
  gameType?: GameType;
  nickname: string;
  movesCount: number;
  score?: number;
  dateSeed: string;
  durationMs?: number;
}): {
  success: boolean;
  durationMs?: number;
  rank?: number;
  error?: string;
} {
  const db = getDatabase();
  const { sessionId, nickname, movesCount, score = 0, dateSeed } = params;
  const gameType: GameType = params.gameType || 'emoji';

  const cleanNickname = (nickname || 'Player').trim().slice(0, 24) || 'Player';

  // Retrieve session
  const getStmt = db.prepare(`
    SELECT session_id, game_type, date_seed, start_time, finish_time, status 
    FROM sessions 
    WHERE session_id = ?
  `);
  let session = getStmt.get(sessionId) as
    | {
        session_id: string;
        game_type: string;
        date_seed: string;
        start_time: number;
        finish_time: number | null;
        status: string;
      }
    | undefined;

  // Handle Offline Sessions (generated without initial network connectivity)
  if (!session) {
    if (sessionId.startsWith('offline-')) {
      const clientDuration = Math.max(1000, params.durationMs || 30000);
      const now = Date.now();
      const clientStartTime = now - clientDuration;

      const createOfflineStmt = db.prepare(`
        INSERT INTO sessions (session_id, game_type, date_seed, start_time, finish_time, duration_ms, moves_count, score, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
      `);
      createOfflineStmt.run(
        sessionId,
        gameType,
        dateSeed,
        clientStartTime,
        now,
        clientDuration,
        movesCount,
        score
      );

      session = {
        session_id: sessionId,
        game_type: gameType,
        date_seed: dateSeed,
        start_time: clientStartTime,
        finish_time: null,
        status: 'ACTIVE',
      };
    } else {
      return { success: false, error: 'Session does not exist or has expired.' };
    }
  }

  if (session.status === 'COMPLETED') {
    return { success: false, error: 'This game session has already been recorded.' };
  }

  if (session.date_seed !== dateSeed) {
    return { success: false, error: 'Daily puzzle date seed mismatch.' };
  }

  const finishTime = Date.now();
  const rawDuration = params.durationMs && sessionId.startsWith('offline-')
    ? params.durationMs
    : finishTime - session.start_time;

  // Anti-cheat verification depending on game type
  if (gameType === 'emoji') {
    if (movesCount < TOTAL_PAIRS) {
      return {
        success: false,
        error: `Invalid moves count (${movesCount}) for ${TOTAL_PAIRS} pairs.`,
      };
    }
    if (rawDuration < 4000) {
      return { success: false, error: 'Completion time outside humanly possible limit.' };
    }
  } else if (gameType === 'sudoku') {
    if (movesCount < 20) {
      return { success: false, error: 'Invalid move count for completed Sudoku puzzle.' };
    }
    if (rawDuration < 10000) {
      return { success: false, error: 'Sudoku solve time outside humanly possible limit.' };
    }
  } else if (gameType === 'tetris') {
    if (rawDuration < 1000) {
      return { success: false, error: 'Invalid Tetris game session.' };
    }
  }

  const finalDurationMs = rawDuration;

  // Update session
  const updateStmt = db.prepare(`
    UPDATE sessions
    SET finish_time = ?, duration_ms = ?, moves_count = ?, score = ?, status = 'COMPLETED'
    WHERE session_id = ?
  `);
  updateStmt.run(finishTime, finalDurationMs, movesCount, score, sessionId);

  // Insert into leaderboard
  const insertLeaderboard = db.prepare(`
    INSERT INTO leaderboard (session_id, game_type, date_seed, nickname, duration_ms, moves_count, score, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertLeaderboard.run(
    sessionId,
    gameType,
    dateSeed,
    cleanNickname,
    finalDurationMs,
    movesCount,
    score,
    finishTime
  );

  // Calculate rank for this game_type and date_seed
  let rank = 1;
  if (gameType === 'tetris') {
    const rankStmt = db.prepare(`
      SELECT COUNT(*) as better_count 
      FROM leaderboard 
      WHERE game_type = 'tetris' AND date_seed = ? AND (score > ? OR (score = ? AND duration_ms < ?))
    `);
    const rankResult = rankStmt.get(dateSeed, score, score, finalDurationMs) as
      | { better_count: number }
      | undefined;
    rank = (rankResult?.better_count || 0) + 1;
  } else {
    const rankStmt = db.prepare(`
      SELECT COUNT(*) as better_count 
      FROM leaderboard 
      WHERE game_type = ? AND date_seed = ? AND duration_ms < ?
    `);
    const rankResult = rankStmt.get(gameType, dateSeed, finalDurationMs) as
      | { better_count: number }
      | undefined;
    rank = (rankResult?.better_count || 0) + 1;
  }

  return {
    success: true,
    durationMs: finalDurationMs,
    rank,
  };
}

export function getDailyLeaderboard(
  dateSeed: string,
  gameType: GameType = 'emoji',
  limit = 50
): LeaderboardEntry[] {
  const db = getDatabase();
  const orderBy =
    gameType === 'tetris'
      ? 'score DESC, duration_ms ASC, created_at ASC'
      : 'duration_ms ASC, created_at ASC';

  const stmt = db.prepare(`
    SELECT nickname, duration_ms, moves_count, score, created_at, date_seed, game_type
    FROM leaderboard
    WHERE game_type = ? AND date_seed = ?
    ORDER BY ${orderBy}
    LIMIT ?
  `);

  const rows = stmt.all(gameType, dateSeed, limit) as {
    nickname: string;
    duration_ms: number;
    moves_count: number;
    score: number;
    created_at: number;
    date_seed: string;
    game_type: string;
  }[];

  return rows.map((row, index) => ({
    rank: index + 1,
    nickname: row.nickname,
    durationMs: row.duration_ms,
    movesCount: row.moves_count,
    score: row.score || 0,
    createdAt: row.created_at,
    dateSeed: row.date_seed,
    gameType: (row.game_type as GameType) || 'emoji',
  }));
}
