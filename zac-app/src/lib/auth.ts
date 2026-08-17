const SECRET = process.env.SESSION_SECRET || 'zac_default_secret_key_change_me_in_prod_12345';

// Edge-compatible session signing using Web Crypto API
async function getCryptoKey() {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(SECRET);
  return await globalThis.crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function createSessionToken(email: string): Promise<string> {
  const payload = { email, exp: Date.now() + 24 * 60 * 60 * 1000 };
  const payloadStr = JSON.stringify(payload);
  const encoder = new TextEncoder();
  const data = encoder.encode(payloadStr);
  const key = await getCryptoKey();
  const signatureBuffer = await globalThis.crypto.subtle.sign('HMAC', key, data);
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const signatureHex = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
  const base64Payload = btoa(payloadStr);
  return `${base64Payload}.${signatureHex}`;
}

export async function verifySessionToken(token: string): Promise<{ email: string } | null> {
  try {
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return null;
    const payloadStr = atob(payloadB64);
    const payload = JSON.parse(payloadStr);
    if (payload.exp < Date.now()) return null;

    const encoder = new TextEncoder();
    const data = encoder.encode(payloadStr);
    const key = await getCryptoKey();
    
    // Decode signature hex
    const signatureBuffer = new Uint8Array(
      signature.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    );
    const isValid = await globalThis.crypto.subtle.verify('HMAC', key, signatureBuffer, data);
    return isValid ? { email: payload.email } : null;
  } catch (e) {
    return null;
  }
}

