import { JsonRpcProvider, Contract } from "ethers";

/**
 * Create FHEVM instance for local development using mock-utils
 * v0.3.0 Update: Added properties parameter and EIP712 domain query
 */
export async function createMockFhevmInstance(
  chainId: number,
  rpcUrl: string = "http://localhost:8545",
  metadata?: {
    ACLAddress: string;
    InputVerifierAddress: string;
    KMSVerifierAddress: string;
  }
) {
  // Dynamically import mock-utils (only in client component)
  const { MockFhevmInstance } = await import("@fhevm/mock-utils");

  const provider = new JsonRpcProvider(rpcUrl);
  
  // Use metadata from Hardhat node if available, otherwise use defaults
  const aclAddress = (metadata?.ACLAddress || "0x2Fb4341027eb1d2aD8B5D9708187df8633cAFA92") as `0x${string}`;
  const inputVerifierAddress = (metadata?.InputVerifierAddress || "0x23C075e7D4c3e2B5a6F9d1B7E5F0C9B8A4D3E2F1") as `0x${string}`;
  const kmsAddress = (metadata?.KMSVerifierAddress || "0x12B064d6C3d0A3C4a5F8d0B6E4E9B7C8A3D2E1F0") as `0x${string}`;
  
  // Query InputVerifier EIP712 domain for verifyingContractAddressInputVerification
  let verifyingContractAddressInputVerification = "0x812b06e1CDCE800494b79fFE4f925A504a9A9810" as `0x${string}`;
  let gatewayChainId = 55815;
  
  try {
    const inputVerifierContract = new Contract(
      inputVerifierAddress,
      ["function eip712Domain() external view returns (bytes1, string, string, uint256, address, bytes32, uint256[])"],
      provider
    );
    const domain = await inputVerifierContract.eip712Domain();
    verifyingContractAddressInputVerification = domain[4] as `0x${string}`; // index 4 is verifyingContract
    gatewayChainId = Number(domain[3]); // index 3 is chainId
    console.log("[fhevmMockCreateInstance] InputVerifier EIP712 domain chainId:", gatewayChainId);
    console.log("[fhevmMockCreateInstance] verifyingContractAddressInputVerification:", verifyingContractAddressInputVerification);
  } catch (error) {
    console.warn("[fhevmMockCreateInstance] Could not query InputVerifier EIP712 domain, using defaults:", error);
  }
  
  const config = {
    chainId,
    gatewayChainId,
    aclContractAddress: aclAddress,
    inputVerifierContractAddress: inputVerifierAddress,
    kmsContractAddress: kmsAddress,
    verifyingContractAddressDecryption: "0x5ffdaAB0373E62E2ea2944776209aEf29E631A64" as `0x${string}`,
    verifyingContractAddressInputVerification,
  };

  // v0.3.0: Add properties parameter (4th argument)
  const properties = {
    inputVerifierProperties: {},
    kmsVerifierProperties: {},
  };

  const instance = await MockFhevmInstance.create(provider, provider, config, properties);
  
  console.log("[fhevmMockCreateInstance] ✅ Mock FHEVM instance created successfully");
  
  // Return instance directly
  return instance;
}

