"use client";

import { useMemo } from "react";
import { ethers } from "ethers";

/**
 * Hook to create ethers signer from MetaMask provider
 */
export function useMetaMaskEthersSigner(provider: any, account: string | null) {
  const signer = useMemo(() => {
    if (!provider || !account) return null;

    try {
      const ethersProvider = new ethers.BrowserProvider(provider);
      return ethersProvider.getSigner(account);
    } catch (error) {
      console.error("Failed to create signer:", error);
      return null;
    }
  }, [provider, account]);

  return signer;
}

