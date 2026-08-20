import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import fs from 'fs';
import path from 'path';
import { getDbFilePath } from '@/lib/db-fallback';

export async function POST(request: Request) {
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

    const { lastName, firstName, otherName, role, avatar } = await request.json();

    if (!lastName || !firstName || !role) {
      return NextResponse.json({ error: 'First name, last name, and role are required' }, { status: 400 });
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
        const userIndex = db.findIndex((u: any) => u.email.toLowerCase() === payload.email.toLowerCase());
        if (userIndex !== -1) {
          db[userIndex].lastName = lastName.trim();
          db[userIndex].firstName = firstName.trim();
          db[userIndex].otherName = otherName ? otherName.trim() : '';
          db[userIndex].role = role.trim();
          if (avatar !== undefined) {
            db[userIndex].avatar = avatar;
          }
          fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
        } else {
          return NextResponse.json({ error: 'User not found in local database' }, { status: 404 });
        }
      }
    } else {
      const user = await User.findOne({ email: payload.email });
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      user.lastName = lastName.trim();
      user.firstName = firstName.trim();
      user.otherName = otherName ? otherName.trim() : '';
      user.role = role.trim();
      if (avatar !== undefined) {
        user.avatar = avatar;
      }
      await user.save();
    }

    return NextResponse.json({ 
      success: true, 
      user: { 
        email: payload.email, 
        lastName, 
        firstName, 
        otherName, 
        role, 
        avatar 
      } 
    });
  } catch (error) {
    console.error('[API /auth/profile/update POST]', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
