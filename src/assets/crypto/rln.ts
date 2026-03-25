// src/crypto/rln.ts

const encoder = new TextEncoder();

/**
 * Compute an epoch string from a Date.
 * For now: YYYY-MM-DD (one report per day).
 */
export function computeEpoch(date: Date): string {
  const y = date.getUTCFullYear();
  const m = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const d = date.getUTCDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Compute a rate-limiting nullifier from idSecret and epoch.
 * For now: nullifier = hex(SHA-256( idSecret || epoch )).
 */
export async function computeNullifier(
  idSecret: Uint8Array,
  epoch: string
): Promise<string> {
  const epochBytes = encoder.encode(epoch);
  const combined = new Uint8Array(idSecret.length + epochBytes.length);
  combined.set(idSecret, 0);
  combined.set(epochBytes, idSecret.length);

  const hashBuf = await crypto.subtle.digest(
    "SHA-256",
    combined.buffer as ArrayBuffer
  );
  const hashBytes = new Uint8Array(hashBuf);

  return [...hashBytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}
