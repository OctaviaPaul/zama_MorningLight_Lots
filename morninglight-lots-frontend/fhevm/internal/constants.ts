/**
 * FHEVM network configurations
 * 
 * ⚠️ IMPORTANT: These addresses are PLACEHOLDERS and MUST be replaced with actual deployed addresses.
 * 
 * For Hardhat local network (31337):
 * - These will be automatically provided by the FHEVM Hardhat node via `fhevm_relayer_metadata` RPC call
 * - No manual configuration needed if using official FHEVM Hardhat plugin
 * 
 * For Sepolia testnet (11155111):
 * - Obtain the correct addresses from https://docs.zama.ai/fhevm
 * - Or from your deployment if you deployed your own FHEVM infrastructure
 * - Update these values before deploying to production
 */
export const FHEVM_CONFIGS = {
  // Local Hardhat network - addresses will be fetched dynamically from node
  31337: {
    chainId: 31337,
    // These are placeholder addresses - actual addresses come from Hardhat node metadata
    aclAddress: "0x2Fb4341027eb1d2aD8B5D9708187df8633cAFA92",
    kmsVerifierAddress: "0x12B064d6C3d0A3C4a5F8d0B6E4E9B7C8A3D2E1F0",
    inputVerifierAddress: "0x23C075e7D4c3e2B5a6F9d1B7E5F0C9B8A4D3E2F1",
    decryptionOracleAddress: "0x34D086f8E5d4f3C6b7G0e2C8F6G1D0C9B5E4F3G2",
  },
  // Sepolia testnet - REPLACE WITH ACTUAL ADDRESSES FROM ZAMA DOCS
  // Visit: https://docs.zama.ai/fhevm for latest addresses
  11155111: {
    chainId: 11155111,
    // ⚠️ TODO: Replace these placeholder addresses with real Sepolia FHEVM addresses
    aclAddress: "0x3f0665f2146843F4a6259b69a0d38c02C0D5B7b0",
    kmsVerifierAddress: "0x9D7f74d0C41E726EC95884E0e97Fa6129e3b5E99",
    inputVerifierAddress: "0xB1c52588D3C9f1C8B9F8B7E6C5D4A3B2C1D0E9F8",
    decryptionOracleAddress: "0xC2d63699E4F1d9B0f9A0C9E8D7F6E5D4C3B2A1B0",
  },
} as const;

export type SupportedChainId = keyof typeof FHEVM_CONFIGS;

export const SUPPORTED_CHAIN_IDS = Object.keys(FHEVM_CONFIGS).map(Number) as SupportedChainId[];

export function isSupportedChain(chainId: number): chainId is SupportedChainId {
  return SUPPORTED_CHAIN_IDS.includes(chainId as SupportedChainId);
}

export function getFhevmConfig(chainId: number) {
  if (!isSupportedChain(chainId)) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }
  return FHEVM_CONFIGS[chainId];
}

