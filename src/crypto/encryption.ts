// src/crypto/encryption.ts

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/**
 * Convert ArrayBuffer / Uint8Array to base64 string.
 */
function toBase64(data: ArrayBuffer | Uint8Array): string {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert base64 string to Uint8Array.
 */
function fromBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Derive an identity secret from arbitrary wallet-bound material (e.g., address).
 * For now: idSecret = SHA-256(input).
 */
export async function deriveIdentitySecret(input: Uint8Array): Promise<Uint8Array> {
  const hashBuf = await crypto.subtle.digest("SHA-256", input.buffer as ArrayBuffer);
  return new Uint8Array(hashBuf);
}

/**
 * Get a symmetric encryption key used by the moderator.
 *
 * For the prototype we treat the "moderator key" as a symmetric key provided
 * via environment variable VITE_MODERATOR_KEY (base64-encoded 32 bytes).
 */
async function getModeratorKey(): Promise<CryptoKey> {
  const keyB64 = import.meta.env.VITE_MODERATOR_KEY;
  if (!keyB64) {
    throw new Error(
      "VITE_MODERATOR_KEY not configured (expected base64-encoded 32-byte key)."
    );
  }
  const rawKey = fromBase64(keyB64);

  return crypto.subtle.importKey(
    "raw",
    rawKey.buffer as ArrayBuffer,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt a report message for the moderator using AES-GCM.
 *
 * We encode:
 *   ciphertext = base64( nonce || rawCiphertext )
 *
 * - epoch and nullifier are included as associated data (AAD).
 * - pkEph is just random 32 bytes here (placeholder for a real ephemeral pk).
 */
export async function encryptReport(
  message: string,
  epoch: string,
  nullifier: string
): Promise<{ ciphertext: string; pkEph: string }> {
  const key = await getModeratorKey();

  const nonce = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = encoder.encode(message);
  const aad = encoder.encode(`${epoch}|${nullifier}`);

  const rawCipherBuf = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: nonce.buffer as ArrayBuffer,
      additionalData: aad.buffer as ArrayBuffer,
    },
    key,
    plaintext.buffer as ArrayBuffer
  );

  const rawCipher = new Uint8Array(rawCipherBuf);
  const combined = new Uint8Array(nonce.length + rawCipher.length);
  combined.set(nonce, 0);
  combined.set(rawCipher, nonce.length);

  const ciphertextB64 = toBase64(combined);

  // Ephemeral "public key": random bytes (placeholder)
  const pkEphBytes = crypto.getRandomValues(new Uint8Array(32));
  const pkEphB64 = toBase64(pkEphBytes);

  return {
    ciphertext: ciphertextB64,
    pkEph: pkEphB64,
  };
}

/**
 * Decrypt a report message for the moderator.
 * Expects ciphertext in the format nonce || rawCiphertext (base64-encoded).
 */
export async function decryptReport(
  ciphertextB64: string,
  epoch: string,
  nullifier: string
): Promise<string> {
  const key = await getModeratorKey();

  const combined = fromBase64(ciphertextB64);
  if (combined.length < 13) {
    throw new Error("Ciphertext too short");
  }

  const nonce = combined.slice(0, 12);
  const rawCipher = combined.slice(12);
  const aad = encoder.encode(`${epoch}|${nullifier}`);

  const plaintextBuf = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: nonce.buffer as ArrayBuffer,
      additionalData: aad.buffer as ArrayBuffer,
    },
    key,
    rawCipher.buffer as ArrayBuffer
  );

  return decoder.decode(plaintextBuf);
}
