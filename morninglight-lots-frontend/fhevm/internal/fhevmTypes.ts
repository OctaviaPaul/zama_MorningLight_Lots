/**
 * FHEVM instance types - using SDK types when available
 */

// Import from SDK (type-only, won't be in bundle)
export type { FhevmInstance } from "@zama-fhe/relayer-sdk/bundle";

export interface TokenParams {
  verifyingContract: string;
  account?: string;
}

export interface FhevmConfig {
  chainId: number;
  aclAddress: string;
  kmsVerifierAddress: string;
  inputVerifierAddress: string;
  decryptionOracleAddress: string;
}

