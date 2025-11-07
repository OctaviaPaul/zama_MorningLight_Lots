"use client";

import { ReactNode } from "react";
import { WalletProvider } from "../hooks/useWallet";
import { FhevmProvider } from "../fhevm/useFhevm";
import { useWallet } from "../hooks/useWallet";

function FhevmProviderWrapper({ children }: { children: ReactNode }) {
  const { chainId, account, provider } = useWallet();
  
  return (
    <FhevmProvider chainId={chainId} account={account} provider={provider}>
      {children}
    </FhevmProvider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WalletProvider>
      <FhevmProviderWrapper>{children}</FhevmProviderWrapper>
    </WalletProvider>
  );
}

