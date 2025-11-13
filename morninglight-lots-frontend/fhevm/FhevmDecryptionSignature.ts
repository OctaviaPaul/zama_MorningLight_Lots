import { ethers } from "ethers";

/**
 * Manages FHEVM decryption signatures with caching
 * Based on reference implementation from frontend/fhevm/FhevmDecryptionSignature.ts
 */

export interface FhevmDecryptionSignatureData {
  publicKey: string;
  privateKey: string;
  signature: string;
  startTimestamp: number;
  durationDays: number;
  userAddress: `0x${string}`;
  contractAddresses: `0x${string}`[];
}

export class FhevmDecryptionSignature {
  private constructor(private data: FhevmDecryptionSignatureData) {}

  get publicKey() {
    return this.data.publicKey;
  }
  get privateKey() {
    return this.data.privateKey;
  }
  get signature() {
    return this.data.signature;
  }
  get startTimestamp() {
    return this.data.startTimestamp;
  }
  get durationDays() {
    return this.data.durationDays;
  }
  get userAddress() {
    return this.data.userAddress;
  }
  get contractAddresses() {
    return this.data.contractAddresses;
  }

  isValid(): boolean {
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = this.data.startTimestamp + this.data.durationDays * 24 * 60 * 60;
    return now < expiresAt;
  }

  toJSON() {
    return this.data;
  }

  static fromJSON(json: string | FhevmDecryptionSignatureData): FhevmDecryptionSignature | null {
    try {
      const data = typeof json === "string" ? JSON.parse(json) : json;
      return new FhevmDecryptionSignature(data);
    } catch {
      return null;
    }
  }

  /**
   * Generate storage key for this signature
   */
  static getStorageKey(
    userAddress: string,
    contractAddresses: string[]
  ): string {
    const sorted = [...contractAddresses].sort().join(",");
    return `fhevm.decryptionSignature.${userAddress.toLowerCase()}.${sorted}`;
  }

  /**
   * Clear signature from localStorage
   */
  static clearFromStorage(
    userAddress: string,
    contractAddresses: string[]
  ): void {
    try {
      const key = this.getStorageKey(userAddress, contractAddresses);
      localStorage.removeItem(key);
      console.log("🔐 Cleared signature for", userAddress);
    } catch (e) {
      console.error("Failed to clear signature:", e);
    }
  }

  /**
   * Load signature from localStorage
   */
  static loadFromStorage(
    userAddress: string,
    contractAddresses: string[]
  ): FhevmDecryptionSignature | null {
    try {
      const key = this.getStorageKey(userAddress, contractAddresses);
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const sig = FhevmDecryptionSignature.fromJSON(stored);
      if (!sig || !sig.isValid()) {
        localStorage.removeItem(key);
        return null;
      }

      return sig;
    } catch {
      return null;
    }
  }

  /**
   * Save signature to localStorage
   */
  saveToStorage(): void {
    try {
      const key = FhevmDecryptionSignature.getStorageKey(
        this.data.userAddress,
        this.data.contractAddresses
      );
      localStorage.setItem(key, JSON.stringify(this.data));
      console.log(`🔐 Signature saved for ${this.data.contractAddresses.length} contract(s)`);
    } catch (e) {
      console.error("Failed to save signature:", e);
    }
  }

  /**
   * Create new signature by signing EIP712 data
   */
  static async create(
    fhevmInstance: any,
    contractAddresses: string[],
    signer: ethers.Signer
  ): Promise<FhevmDecryptionSignature | null> {
    try {
      const userAddress = (await signer.getAddress()) as `0x${string}`;
      const { publicKey, privateKey } = fhevmInstance.generateKeypair();
      
      const startTimestamp = Math.floor(Date.now() / 1000);
      const durationDays = 365;
      
      const eip712 = fhevmInstance.createEIP712(
        publicKey,
        contractAddresses,
        startTimestamp,
        durationDays
      );
      
      const signature = await signer.signTypedData(
        eip712.domain,
        { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
        eip712.message
      );

      return new FhevmDecryptionSignature({
        publicKey,
        privateKey,
        signature,
        startTimestamp,
        durationDays,
        userAddress,
        contractAddresses: contractAddresses as `0x${string}`[],
      });
    } catch (e) {
      console.error("Failed to create signature:", e);
      return null;
    }
  }

  /**
   * Load cached signature or create new one
   */
  static async loadOrSign(
    fhevmInstance: any,
    contractAddresses: string[],
    signer: ethers.Signer
  ): Promise<FhevmDecryptionSignature | null> {
    const userAddress = await signer.getAddress();
    
    // Try to load from cache
    const cached = FhevmDecryptionSignature.loadFromStorage(userAddress, contractAddresses);
    if (cached) {
      console.log("🔐 Using cached signature");
      return cached;
    }

    // Create new signature
    console.log("🔐 Creating new signature...");
    const sig = await FhevmDecryptionSignature.create(fhevmInstance, contractAddresses, signer);
    if (sig) {
      sig.saveToStorage();
    }

    return sig;
  }
}
