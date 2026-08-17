import crypto from 'crypto';

// Node-only password hashing
export function hashPassword(password: string): string {
  const salt = 'zac_salt_protection_123';
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}
