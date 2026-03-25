// src/services/transactionService.ts

import { deriveIdentitySecret, encryptReport } from "../crypto/encryption";
import { computeEpoch, computeNullifier } from "../crypto/rln";
import { buildProof } from "../crypto/proofs";
import { ReportStorageService } from "./reportStorageService";

export type TxHash = string;

/**
 * Plaintext report shape as constructed in App.tsx
 */
export interface PlainReportData {
  title: string;
  content: string;
  attachment: string | null;
  attachmentName: string | null;
  timestamp: string;
  submitterAddress: string;
}

/**
 * On-“chain” payload for the cryptographic protocol.
 * We keep this type for your writeup, even though the
 * current prototype doesn’t send it to a real chain.
 */
export interface ReportTransaction {
  ciphertext: string;
  pkEph: string;
  nullifier: string;
  epoch: string;
  proof: string;
  version: number;
}

class TransactionService {
  private static readonly REPORT_VERSION = 1;

  /**
   * Accepts plaintext report data (from App.tsx),
   * runs the crypto protocol, and simulates submission.
   */
  async submitReport(report: PlainReportData): Promise<TxHash> {
    // 1. Derive idSecret from submitter address
    const idMaterial = new TextEncoder().encode(report.submitterAddress);
    const idSecret = await deriveIdentitySecret(idMaterial);

    // 2. Epoch + nullifier
    const epoch = computeEpoch(new Date(report.timestamp));
    const nullifier = await computeNullifier(idSecret, epoch);

    // 3. Encrypt full report JSON; only ciphertext would go “on chain”
    const reportJson = JSON.stringify(report);
    const { ciphertext, pkEph } = await encryptReport(
      reportJson,
      epoch,
      nullifier
    );

    // 4. Build MAC-based proof (placeholder for real ZK)
    const proof = await buildProof({ idSecret, epoch, nullifier, pkEph });

    // 5. Assemble protocol payload (for documentation / potential future use)
    const payload: ReportTransaction = {
      ciphertext,
      pkEph,
      nullifier,
      epoch,
      proof,
      version: TransactionService.REPORT_VERSION,
    };
    console.log("🔐 Protocol payload (not sent to chain in this prototype):", payload);

    // 6. Generate a pseudo tx hash (for UI + ModeratorPage)
    const txHashBytes = crypto.getRandomValues(new Uint8Array(16));
    const txHash = Array.from(txHashBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // 7. Simulate “on-chain” commit by storing the report locally
    ReportStorageService.storeReport(report, txHash);

    return txHash;
  }
}

export const transactionService = new TransactionService();
