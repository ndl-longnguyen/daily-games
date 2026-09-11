import { NextRequest, NextResponse } from 'next/server';
import { createGameSession } from '@/lib/db';
import { getTodaySeedString } from '@/lib/prng';
import { GameType } from '@/lib/constants';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const dateSeed = body.dateSeed || getTodaySeedString();
    const gameType: GameType = body.gameType || 'emoji';

    const session = await createGameSession(dateSeed, gameType);

    return NextResponse.json({
      success: true,
      sessionId: session.sessionId,
      startTime: session.startTime,
      dateSeed,
      gameType,
    });
  } catch (error) {
    console.error('Error creating game session:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể khởi tạo phiên chơi.' },
      { status: 500 }
    );
  }
}
