import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('zac_auth');
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[API /auth/logout POST]', error);
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 });
  }
}
