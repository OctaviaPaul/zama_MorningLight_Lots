import type { FhevmInstance } from "./fhevmTypes";
import { getFhevmConfig, isSupportedChain } from "./constants";
import { publicKeyStorage } from "./PublicKeyStorage";
import { loadRelayerSDK } from "./RelayerSDKLoader";
import { createMockFhevmInstance } from "./mock/fhevmMock";

/**
 * Check if we should use mock mode
 * Mock mode is for local Hardhat network (chainId 31337)
 */
function shouldUseMockMode(chainId: number): boolean {
  return chainId === 31337;
}

/**
 * Try to fetch FHEVM metadata from Hardhat node
 */
async function tryFetchHardhatMetadata(rpcUrl: string = "http://localhost:8545") {
  try {
    const provider = new (await import("ethers")).JsonRpcProvider(rpcUrl);
    const metadata = await provider.send("fhevm_relayer_metadata", []);
    return metadata;
  } catch (error) {
    console.warn("Could not fetch fhevm_relayer_metadata from Hardhat node:", error);
    return null;
  }
}

/**
 * Check if window.relayerSDK is initialized
 */
function isFhevmInitialized(): boolean {
  if (typeof window === "undefined" || !window.relayerSDK) {
    return false;
  }
  return window.relayerSDK.__initialized__ === true;
}

/**
 * Initialize the Relayer SDK
 */
async function initRelayerSDK(): Promise<boolean> {
  if (typeof window === "undefined" || !window.relayerSDK) {
    throw new Error("window.relayerSDK is not available. Please load the SDK first.");
  }
  
  if (isFhevmInitialized()) {
    return true;
  }
  
  const result = await window.relayerSDK.initSDK();
  window.relayerSDK.__initialized__ = result;
  
  if (!result) {
    throw new Error("window.relayerSDK.initSDK failed.");
  }
  
  return true;
}

/**
 * Get public key and params from storage (simplified version using localStorage)
 */
async function getPublicKeyFromStorage(aclAddress: string): Promise<{
  publicKey?: { id: string | null; data: Uint8Array | null };
  publicParams?: { "2048": { publicParamsId: string; publicParams: Uint8Array } } | null;
}> {
  try {
    const key = `fhevm.publicKey.${aclAddress}`;
    const stored = localStorage.getItem(key);
    if (!stored) {
      return { publicParams: null };
    }
    
    const data = JSON.parse(stored);
    return {
      publicKey: data.publicKey ? {
        id: data.publicKey.id || null,
        data: data.publicKey.data ? new Uint8Array(Object.values(data.publicKey.data)) : null,
      } : undefined,
      publicParams: data.publicParams ? {
        "2048": {
          publicParamsId: data.publicParams.publicParamsId,
          publicParams: new Uint8Array(Object.values(data.publicParams.publicParams)),
        },
      } : null,
    };
  } catch {
    return { publicParams: null };
  }
}

/**
 * Save public key and params to storage
 */
async function savePublicKeyToStorage(
  aclAddress: string,
  publicKey: { id: string; data: Uint8Array } | null,
  publicParams: { publicParamsId: string; publicParams: Uint8Array } | null
): Promise<void> {
  try {
    const key = `fhevm.publicKey.${aclAddress}`;
    const data = {
      publicKey: publicKey ? {
        id: publicKey.id,
        data: Array.from(publicKey.data),
      } : null,
      publicParams: publicParams ? {
        publicParamsId: publicParams.publicParamsId,
        publicParams: Array.from(publicParams.publicParams),
      } : null,
    };
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn("Failed to save public key to storage:", error);
  }
}

/**
 * Create FHEVM instance for production mode using Relayer SDK
 * 
 * Note: This uses @zama-fhe/relayer-sdk which should be loaded via CDN or npm
 */
async function createRelayerFhevmInstance(
  chainId: number,
  provider?: any
): Promise<FhevmInstance> {
  if (chainId !== 11155111) {
    throw new Error(`Unsupported chain ID for Relayer SDK: ${chainId}. Only Sepolia (11155111) is supported.`);
  }

  // Load SDK if not already loaded
  const relayerSDK = await loadRelayerSDK();
  
  if (!relayerSDK || typeof window === "undefined" || !window.relayerSDK) {
    throw new Error("Failed to load Relayer SDK. Please check your internet connection and try again.");
  }

  // Initialize SDK if not already initialized
  await initRelayerSDK();

  const sdk = window.relayerSDK;

  // Get Sepolia config from SDK (SDK has built-in SepoliaConfig)
  if (!sdk.SepoliaConfig) {
    throw new Error("Relayer SDK does not have SepoliaConfig. Please check SDK version.");
  }

  const aclAddress = sdk.SepoliaConfig.aclContractAddress;
  if (!aclAddress || typeof aclAddress !== "string" || !aclAddress.startsWith("0x")) {
    throw new Error(`Invalid ACL address from SDK: ${aclAddress}`);
  }

  // Get public key and params from storage
  const stored = await getPublicKeyFromStorage(aclAddress);

  // Build config for createInstance
  const config: any = {
    ...sdk.SepoliaConfig,
    network: provider || (typeof window !== "undefined" && (window as any).ethereum) || undefined,
  };

  // Add stored public key and params if available
  if (stored.publicKey) {
    config.publicKey = stored.publicKey;
  }
  if (stored.publicParams) {
    config.publicParams = stored.publicParams;
  }

  // Create instance
  const instance = await sdk.createInstance(config);

  // Save public key and params for future use
  try {
    const publicKey = instance.getPublicKey();
    const publicParams = instance.getPublicParams(2048);
    
    if (publicKey && publicParams) {
      await savePublicKeyToStorage(
        aclAddress,
        {
          id: publicKey.id || "",
          data: publicKey.data || new Uint8Array(),
        },
        {
          publicParamsId: publicParams.publicParamsId || "",
          publicParams: publicParams.publicParams || new Uint8Array(),
        }
      );
    }
  } catch (error) {
    console.warn("Failed to save public key after instance creation:", error);
    // Continue anyway, instance is already created
  }

  return instance;
}

/**
 * Main function to create FHEVM instance
 * Automatically selects mock or relayer mode based on chainId and environment
 */
export async function createFhevmInstance(
  chainId: number,
  provider?: any
): Promise<FhevmInstance> {
  if (!isSupportedChain(chainId)) {
    throw new Error(`Unsupported chain ID: ${chainId}. Supported: 31337 (Hardhat), 11155111 (Sepolia)`);
  }

  const useMock = shouldUseMockMode(chainId);

  if (useMock) {
    console.log("🧪 Using FHEVM Mock mode (local development)");
    
    // Try to fetch metadata from Hardhat node
    const rpcUrl = "http://localhost:8545";
    const metadata = await tryFetchHardhatMetadata(rpcUrl);
    
    return createMockFhevmInstance(chainId, rpcUrl, metadata);
  } else {
    console.log("🌐 Using FHEVM Relayer SDK (production)");
    // Pass provider directly to createRelayerFhevmInstance
    // The SDK will use the provider for network interactions
    return createRelayerFhevmInstance(chainId, provider);
  }
}

