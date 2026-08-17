import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { createSessionToken } from '@/lib/auth';
import { hashPassword } from '@/lib/auth-node';
import { getFallbackUserDb, saveFallbackUser } from '@/lib/db-fallback';

// Strong password regex requirement: 
// Minimum 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special character
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

export async function POST(request: Request) {
  try {
    const { name, role, email, password } = await request.json();

    if (!name || !role || !email || !password) {
      return NextResponse.json({ error: 'Name, role, email, and password are required' }, { status: 400 });
    }

    if (name.trim().length === 0) {
      return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 });
    }

    if (role.trim().length === 0) {
      return NextResponse.json({ error: 'Role cannot be empty' }, { status: 400 });
    }

    if (!PASSWORD_REGEX.test(password)) {
      return NextResponse.json({ 
        error: 'Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character.' 
      }, { status: 400 });
    }

    let isLocalFallback = false;
    try {
      await dbConnect();
    } catch (dbError) {
      console.warn('[API /auth/signup POST] MongoDB connection failed, falling back to local JSON database:', dbError);
      isLocalFallback = true;
    }

    if (isLocalFallback) {
      const db = getFallbackUserDb();
      const existingUser = db.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
      }

      const hashedPassword = hashPassword(password);
      const saved = saveFallbackUser({ name: name.trim(), role: role.trim(), email, password: hashedPassword });
      if (!saved) {
        return NextResponse.json({ error: 'Failed to write to local fallback database' }, { status: 500 });
      }
    } else {
      // Check if user already exists in MongoDB
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
      }

      // Create user in MongoDB
      const hashedPassword = hashPassword(password);
      await User.create({ name: name.trim(), role: role.trim(), email, password: hashedPassword });
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

    return NextResponse.json({ success: true, email }, { status: 201 });
  } catch (error) {
    console.error('[API /auth/signup POST]', error);
    return NextResponse.json({ error: 'Authentication failed during signup' }, { status: 500 });
  }
}

