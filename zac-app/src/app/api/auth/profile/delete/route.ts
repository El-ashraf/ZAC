import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import fs from 'fs';
import path from 'path';
import { getDbFilePath } from '@/lib/db-fallback';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('zac_auth')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let isLocalFallback = false;
    try {
      await dbConnect();
    } catch (dbError) {
      isLocalFallback = true;
    }

    if (isLocalFallback) {
      const DB_FILE = getDbFilePath();
      if (fs.existsSync(DB_FILE)) {
        const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
        const filteredDb = db.filter((u: any) => u.email.toLowerCase() !== payload.email.toLowerCase());
        fs.writeFileSync(DB_FILE, JSON.stringify(filteredDb, null, 2), 'utf-8');
      }
    } else {
      await User.deleteOne({ email: payload.email });
    }

    // Delete auth cookie
    cookieStore.delete('zac_auth');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API /auth/profile/delete POST]', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
