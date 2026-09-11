import { NextRequest, NextResponse } from 'next/server';
import { finishGameSession } from '@/lib/db';
import { getTodaySeedString } from '@/lib/prng';
import { GameType } from '@/lib/constants';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, nickname, movesCount, score, dateSeed, durationMs } = body;
    const gameType: GameType = body.gameType || 'emoji';

    if (!sessionId || typeof movesCount !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Missing session ID or moves count.' },
        { status: 400 }
      );
    }

    const effectiveDateSeed = dateSeed || getTodaySeedString();

    const result = finishGameSession({
      sessionId,
      gameType,
      nickname: nickname || 'Player',
      movesCount,
      score: typeof score === 'number' ? score : 0,
      dateSeed: effectiveDateSeed,
      durationMs: typeof durationMs === 'number' ? durationMs : undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      durationMs: result.durationMs,
      rank: result.rank,
    });
  } catch (error) {
    console.error('Error finishing game session:', error);
    return NextResponse.json(
      { success: false, error: 'Server error recording game completion.' },
      { status: 500 }
    );
  }
}
