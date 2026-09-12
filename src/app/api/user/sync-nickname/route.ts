import { NextRequest, NextResponse } from 'next/server';
import { syncUserNickname } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientId, nickname, dateSeed } = body;

    if (!clientId || !nickname) {
      return NextResponse.json(
        { success: false, error: 'Thiếu client ID hoặc nickname.' },
        { status: 400 }
      );
    }

    const result = await syncUserNickname(clientId, nickname, dateSeed);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      updatedCount: result.updatedCount,
    });
  } catch (error) {
    console.error('Error syncing nickname:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi server khi đồng bộ nickname.' },
      { status: 500 }
    );
  }
}
