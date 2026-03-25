// src/crypto/proofs.ts

const encoder = new TextEncoder();

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
 * Input to buildProof: we treat idSecret as a per-identity secret and
 * MAC epoch|nullifier|pkEph to get a compact “proof” string.
 *
 * This is NOT real zero-knowledge; it’s a structured placeholder you can
 * later replace with a proper ZK proof system.
 */
export interface BuildProofInput {
  idSecret: Uint8Array;
  epoch: string;
  nullifier: string;
  pkEph: string;
}

export async function buildProof(input: BuildProofInput): Promise<string> {
  const { idSecret, epoch, nullifier, pkEph } = input;

  const key = await crypto.subtle.importKey(
    "raw",
    idSecret.buffer as ArrayBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const data = encoder.encode(`${epoch}|${nullifier}|${pkEph}`);
  const macBuf = await crypto.subtle.sign("HMAC", key, data.buffer as ArrayBuffer);

  return toBase64(macBuf);
}

/**
 * Verification input – in a full system this would be used
 * by the moderator or contract to recompute/verify the proof.
 */
export interface VerifyProofInput {
  epoch: string;
  nullifier: string;
  pkEph: string;
  proof: string;
}

/**
 * For now, verification is a stub that always returns true.
 * The on-chain / backend side of your project would do the real check.
 */
export async function verifyProof(_input: VerifyProofInput): Promise<boolean> {
  return true;
}
