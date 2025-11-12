import { GenericStringStorage } from "../GenericStringStorage";

/**
 * Manages FHEVM public keys per chain
 * Storage key format: fhevm.publicKey.<chainId>
 */
export class PublicKeyStorage extends GenericStringStorage {
  constructor() {
    super("fhevm.publicKey");
  }

  getForChain(chainId: number): string | null {
    return this.get(chainId.toString());
  }

  setForChain(chainId: number, publicKey: string): void {
    this.set(chainId.toString(), publicKey);
  }

  removeForChain(chainId: number): void {
    this.remove(chainId.toString());
  }
}

export const publicKeyStorage = new PublicKeyStorage();

