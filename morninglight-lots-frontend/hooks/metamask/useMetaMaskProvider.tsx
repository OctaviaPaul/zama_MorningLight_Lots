"use client";

import { useState, useEffect } from "react";

/**
 * Hook to get MetaMask provider from window.ethereum
 */
export function useMetaMaskProvider() {
  const [provider, setProvider] = useState<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ethereum = (window as any).ethereum;
    if (ethereum) {
      setProvider(ethereum);
    }
  }, []);

  return provider;
}

