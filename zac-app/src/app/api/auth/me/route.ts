import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getFallbackUserDb } from '@/lib/db-fallback';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('zac_auth')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const payload = await verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    let isLocalFallback = false;
    try {
      await dbConnect();
    } catch (dbError) {
      isLocalFallback = true;
    }

    let user: any = null;
    if (isLocalFallback) {
      const db = getFallbackUserDb();
      user = db.find(u => u.email.toLowerCase() === payload.email.toLowerCase());
    } else {
      user = await User.findOne({ email: payload.email });
    }

    const lastName = user ? user.lastName : '';
    const firstName = user ? user.firstName : payload.email.split('@')[0];
    const otherName = user ? user.otherName : '';
    const role = user ? user.role : 'Wildlife Naturalist';
    const avatar = user ? user.avatar : '';

    return NextResponse.json({ 
      authenticated: true, 
      email: payload.email, 
      lastName, 
      firstName, 
      otherName, 
      role, 
      avatar 
    }, { status: 200 });
  } catch (error) {
    console.error('[API /auth/me GET]', error);
    return NextResponse.json({ authenticated: false, error: 'Failed to verify session' }, { status: 500 });
  }
}

