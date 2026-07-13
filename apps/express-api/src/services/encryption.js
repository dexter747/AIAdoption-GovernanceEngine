/**
 * Encryption Service
 * AES-256-GCM encryption for API keys and sensitive data
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;

// Get encryption key from environment
const getEncryptionKey = () => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is required');
  }
  // Ensure key is 32 bytes for AES-256
  return crypto.scryptSync(key, 'velanova-salt', 32);
};

/**
 * Encrypt a string using AES-256-GCM
 * @param {string} plaintext - The text to encrypt
 * @returns {string} - Base64 encoded encrypted data (iv + authTag + ciphertext)
 */
export function encrypt(plaintext) {
  if (!plaintext) {
    throw new Error('Plaintext is required for encryption');
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  const authTag = cipher.getAuthTag();

  // Combine iv + authTag + encrypted data
  const combined = Buffer.concat([iv, authTag, Buffer.from(encrypted, 'base64')]);

  return combined.toString('base64');
}

/**
 * Decrypt a string using AES-256-GCM
 * @param {string} encryptedData - Base64 encoded encrypted data
 * @returns {string} - Decrypted plaintext
 */
export function decrypt(encryptedData) {
  if (!encryptedData) {
    throw new Error('Encrypted data is required for decryption');
  }

  const key = getEncryptionKey();
  const combined = Buffer.from(encryptedData, 'base64');

  // Extract iv, authTag, and encrypted data
  const iv = combined.subarray(0, IV_LENGTH);
  const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, undefined, 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Hash an API key for storage (for comparison without decryption)
 * @param {string} apiKey - The API key to hash
 * @returns {string} - SHA-256 hash of the key
 */
export function hashKey(apiKey) {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

/**
 * Get key preview (last 4 characters)
 * @param {string} apiKey - The API key
 * @returns {string} - Preview like "...abc1"
 */
export function getKeyPreview(apiKey) {
  if (!apiKey || apiKey.length < 4) {
    return '****';
  }
  return '...' + apiKey.slice(-4);
}

/**
 * Validate encryption key is configured
 * @returns {boolean}
 */
export function isEncryptionConfigured() {
  return !!process.env.ENCRYPTION_KEY;
}

/**
 * Encrypt JSON object
 * @param {object} data - Object to encrypt
 * @returns {string} - Encrypted base64 string
 */
export function encryptJSON(data) {
  return encrypt(JSON.stringify(data));
}

/**
 * Decrypt to JSON object
 * @param {string} encryptedData - Encrypted base64 string
 * @returns {object} - Decrypted object
 */
export function decryptJSON(encryptedData) {
  const decrypted = decrypt(encryptedData);
  return JSON.parse(decrypted);
}

export default {
  encrypt,
  decrypt,
  hashKey,
  getKeyPreview,
  isEncryptionConfigured,
  encryptJSON,
  decryptJSON,
};
