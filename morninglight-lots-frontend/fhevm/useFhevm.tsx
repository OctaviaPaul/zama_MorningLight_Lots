"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createFhevmInstance } from "./internal/fhevm";
import { FhevmDecryptionSignature } from "./FhevmDecryptionSignature";

interface FhevmContextValue {
  fhevmInstance: any | null; // Use any for now to support both Mock and Relayer SDK
  isInitializing: boolean;
  error: string | null;
  regenerateSignature: () => Promise<void>;
}

const FhevmContext = createContext<FhevmContextValue | null>(null);

interface FhevmProviderProps {
  children: ReactNode;
  chainId: number | null;
  account: string | null;
  provider: any;
}

export function FhevmProvider({ children, chainId, account, provider }: FhevmProviderProps) {
  const [fhevmInstance, setFhevmInstance] = useState<any | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initInstance() {
      if (!chainId || !provider) {
        setFhevmInstance(null);
        return;
      }

      setIsInitializing(true);
      setError(null);

      try {
        const instance = await createFhevmInstance(chainId, provider);
        setFhevmInstance(instance);
      } catch (err: any) {
        console.error("Failed to initialize FHEVM instance:", err);
        setError(err.message || "Failed to initialize FHEVM");
        setFhevmInstance(null);
      } finally {
        setIsInitializing(false);
      }
    }

    initInstance();
  }, [chainId, provider]);

  const regenerateSignature = async () => {
    if (!account) {
      throw new Error("No account connected");
    }
    
    // Clear all signatures for this account from localStorage
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`fhevm.decryptionSignature.${account.toLowerCase()}`)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`🔐 Cleared ${keysToRemove.length} signature(s) for account ${account}`);
    
    // Signature will be regenerated on next decrypt call
  };

  return (
    <FhevmContext.Provider value={{ fhevmInstance, isInitializing, error, regenerateSignature }}>
      {children}
    </FhevmContext.Provider>
  );
}

export function useFhevm() {
  const context = useContext(FhevmContext);
  if (!context) {
    throw new Error("useFhevm must be used within FhevmProvider");
  }
  return context;
}

