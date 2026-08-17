import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { createSessionToken } from '@/lib/auth';
import { hashPassword } from '@/lib/auth-node';
import { getFallbackUserDb } from '@/lib/db-fallback';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    let isLocalFallback = false;
    try {
      await dbConnect();
    } catch (dbError) {
      console.warn('[API /auth/login POST] MongoDB connection failed, falling back to local JSON database:', dbError);
      isLocalFallback = true;
    }

    let user: any = null;
    if (isLocalFallback) {
      const db = getFallbackUserDb();
      user = db.find(u => u.email.toLowerCase() === email.toLowerCase());
    } else {
      // Find user in MongoDB
      user = await User.findOne({ email });
    }

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 });
    }

    // Verify password
    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 });
    }

    // Create session token
    const token = await createSessionToken(email);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('zac_auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });

    return NextResponse.json({ success: true, email }, { status: 200 });
  } catch (error) {
    console.error('[API /auth/login POST]', error);
    return NextResponse.json({ error: 'Authentication failed during login' }, { status: 500 });
  }
}

