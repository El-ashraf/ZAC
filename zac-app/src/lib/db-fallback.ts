import fs from 'fs';
import path from 'path';

const REPO_DB_FILE = path.join(process.cwd(), 'users_db.json');
const TMP_DB_FILE = path.join('/tmp', 'users_db.json');

export function getDbFilePath(): string {
  try {
    // If running in an environment with a writable /tmp directory (like Vercel serverless)
    if (fs.existsSync('/tmp')) {
      if (!fs.existsSync(TMP_DB_FILE)) {
        if (fs.existsSync(REPO_DB_FILE)) {
          fs.copyFileSync(REPO_DB_FILE, TMP_DB_FILE);
        } else {
          fs.writeFileSync(TMP_DB_FILE, '[]', 'utf-8');
        }
      }
      return TMP_DB_FILE;
    }
  } catch (error) {
    console.warn('Failed to access /tmp directory, falling back to repository file:', error);
  }
  return REPO_DB_FILE;
}

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
    const dbFile = getDbFilePath();
    if (!fs.existsSync(dbFile)) {
      return [];
    }
    const data = fs.readFileSync(dbFile, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading fallback DB:', error);
    return [];
  }
}

export function saveFallbackUser(user: FallbackUser): { success: boolean; error?: string } {
  try {
    const dbFile = getDbFilePath();
    const db = getFallbackUserDb();
    // Check if user already exists
    if (db.some(u => u.email.toLowerCase() === user.email.toLowerCase())) {
      return { success: false, error: 'User already exists' };
    }
    db.push({
      ...user,
      createdAt: new Date().toISOString()
    });
    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2), 'utf-8');
    return { success: true };
  } catch (error: any) {
    console.error('Error saving to fallback DB:', error);
    return { success: false, error: error.message || String(error) };
  }
}
