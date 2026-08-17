import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'users_db.json');

export interface FallbackUser {
  email: string;
  lastName: string;
  firstName: string;
  otherName?: string;
  role: string;
  avatar?: string;
  password?: string;
  createdAt?: string;
}

export function getFallbackUserDb(): FallbackUser[] {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return [];
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading fallback DB:', error);
    return [];
  }
}

export function saveFallbackUser(user: FallbackUser): boolean {
  try {
    const db = getFallbackUserDb();
    // Check if user already exists
    if (db.some(u => u.email.toLowerCase() === user.email.toLowerCase())) {
      return false;
    }
    db.push({
      ...user,
      createdAt: new Date().toISOString()
    });
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving to fallback DB:', error);
    return false;
  }
}
