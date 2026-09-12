import { NextRequest, NextResponse } from 'next/server';
import { checkNicknameAvailable } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nickname, clientId } = body;

    if (!nickname || typeof nickname !== 'string') {
      return NextResponse.json(
        { success: false, available: false, error: 'Vui lòng nhập nickname hợp lệ.' },
        { status: 400 }
      );
    }

    const result = await checkNicknameAvailable(nickname, clientId);

    return NextResponse.json({
      success: true,
      available: result.available,
      error: result.error,
    });
  } catch (error) {
    console.error('Error checking nickname:', error);
    return NextResponse.json(
      { success: false, available: true, error: null },
      { status: 200 }
    );
  }
}
