import { NextRequest, NextResponse } from 'next/server';
import { getDailyLeaderboard } from '@/lib/db';
import { getTodaySeedString } from '@/lib/prng';
import { GameType } from '@/lib/constants';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateSeed = searchParams.get('date') || getTodaySeedString();
    const gameType: GameType = (searchParams.get('gameType') as GameType) || 'emoji';
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.min(Math.max(1, parseInt(limitParam, 10)), 100) : 50;

    const entries = await getDailyLeaderboard(dateSeed, gameType, limit);

    return NextResponse.json({
      success: true,
      dateSeed,
      gameType,
      entries,
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tải bảng xếp hạng.' },
      { status: 500 }
    );
  }
}
