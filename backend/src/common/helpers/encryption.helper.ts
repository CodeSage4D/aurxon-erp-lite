import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

function getKey(): Buffer {
  const rawKey = process.env.BACKEND_ENCRYPTION_KEY;
  if (!rawKey) {
    throw new Error('BACKEND_ENCRYPTION_KEY is not defined in environment variables');
  }
  // Convert string to bytes
  const keyBuf = Buffer.from(rawKey, 'utf8');
  if (keyBuf.length !== 32) {
    throw new Error(`BACKEND_ENCRYPTION_KEY must be exactly 32 bytes (256 bits). Current length: ${keyBuf.length} bytes`);
  }
  return keyBuf;
}

export function encrypt(text: string | null | undefined): string | null {
  if (text === null || text === undefined || text === '') return null;
  try {
    const key = getKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag();
    
    // Output formatted as iv_hex:tag_hex:ciphertext_hex
    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Cryptographic operation failed');
  }
}

export function decrypt(encryptedData: string | null | undefined): string | null {
  if (encryptedData === null || encryptedData === undefined || encryptedData === '') return null;
  try {
    const parts = encryptedData.split(':');
    // If not matching our GCM envelope pattern, assume it's unencrypted legacy data for compatibility
    if (parts.length !== 3) {
      return encryptedData;
    }
    
    const [ivHex, tagHex, encryptedHex] = parts;
    const key = getKey();
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return 'DECRYPTION_ERROR';
  }
}

export function maskSensitiveData(val: string | null | undefined, visibleDigits: number = 4): string {
  if (!val) return '';
  const cleanVal = val.replace(/\s/g, '');
  if (cleanVal.length <= visibleDigits) return val;
  const maskedPart = 'X'.repeat(cleanVal.length - visibleDigits);
  // Return masked value (e.g. XXXXXXXXXX1234)
  return maskedPart + cleanVal.slice(-visibleDigits);
}
