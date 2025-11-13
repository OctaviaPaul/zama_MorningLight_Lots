"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";

interface WalletState {
  connected: boolean;
  account: string | null;
  chainId: number | null;
  connectorId: string | null;
  isCorrectNetwork: boolean;
}

interface WalletContextValue extends WalletState {
  provider: any;
  connect: (providerDetail?: any) => Promise<void>;
  disconnect: () => void;
  switchNetwork: (targetChainId: number) => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | null>(null);

const SUPPORTED_CHAIN_IDS = [31337, 11155111]; // Hardhat, Sepolia

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [state, setState] = useState<WalletState>({
    connected: false,
    account: null,
    chainId: null,
    connectorId: null,
    isCorrectNetwork: false,
  });
  const [provider, setProvider] = useState<any>(null);

  // Restore connection on mount (silent reconnect)
  useEffect(() => {
    async function restoreConnection() {
      if (typeof window === "undefined") return;

      const wasConnected = localStorage.getItem("wallet.connected") === "true";
      const lastConnectorId = localStorage.getItem("wallet.lastConnectorId");

      if (!wasConnected) return;

      const ethereum = (window as any).ethereum;
      if (!ethereum) return;

      try {
        // Use eth_accounts (silent, no popup)
        const accounts = await ethereum.request({ method: "eth_accounts" });
        if (accounts.length === 0) {
          // No accounts, clear connection state
          localStorage.removeItem("wallet.connected");
          return;
        }

        const chainIdHex = await ethereum.request({ method: "eth_chainId" });
        const chainId = parseInt(chainIdHex, 16);

        setProvider(ethereum);
        setState({
          connected: true,
          account: accounts[0],
          chainId,
          connectorId: lastConnectorId,
          isCorrectNetwork: SUPPORTED_CHAIN_IDS.includes(chainId),
        });

        // Update localStorage
        localStorage.setItem("wallet.lastAccounts", JSON.stringify(accounts));
        localStorage.setItem("wallet.lastChainId", chainId.toString());
      } catch (error) {
        console.error("Failed to restore wallet connection:", error);
        localStorage.removeItem("wallet.connected");
      }
    }

    restoreConnection();
  }, []);

  // Listen to provider events
  useEffect(() => {
    if (!provider) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        const newAccount = accounts[0];
        setState((prev) => ({ ...prev, account: newAccount }));
        localStorage.setItem("wallet.lastAccounts", JSON.stringify(accounts));

        // Clear old account's FHEVM signature
        // (handled by FhevmProvider listening to account changes)
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      const chainId = parseInt(chainIdHex, 16);
      setState((prev) => ({
        ...prev,
        chainId,
        isCorrectNetwork: SUPPORTED_CHAIN_IDS.includes(chainId),
      }));
      localStorage.setItem("wallet.lastChainId", chainId.toString());
    };

    const handleDisconnect = () => {
      disconnect();
    };

    provider.on("accountsChanged", handleAccountsChanged);
    provider.on("chainChanged", handleChainChanged);
    provider.on("disconnect", handleDisconnect);

    return () => {
      provider.removeListener("accountsChanged", handleAccountsChanged);
      provider.removeListener("chainChanged", handleChainChanged);
      provider.removeListener("disconnect", handleDisconnect);
    };
  }, [provider]);

  const connect = useCallback(async (providerDetail?: any) => {
    if (typeof window === "undefined") return;

    const targetProvider = providerDetail?.provider || (window as any).ethereum;
    if (!targetProvider) {
      throw new Error("No Ethereum provider found");
    }

    try {
      // Use eth_requestAccounts (shows wallet popup)
      const accounts = await targetProvider.request({ method: "eth_requestAccounts" });
      const chainIdHex = await targetProvider.request({ method: "eth_chainId" });
      const chainId = parseInt(chainIdHex, 16);

      const connectorId = providerDetail?.info?.uuid || "default";

      setProvider(targetProvider);
      setState({
        connected: true,
        account: accounts[0],
        chainId,
        connectorId,
        isCorrectNetwork: SUPPORTED_CHAIN_IDS.includes(chainId),
      });

      // Persist connection
      localStorage.setItem("wallet.connected", "true");
      localStorage.setItem("wallet.lastConnectorId", connectorId);
      localStorage.setItem("wallet.lastAccounts", JSON.stringify(accounts));
      localStorage.setItem("wallet.lastChainId", chainId.toString());
    } catch (error: any) {
      console.error("Failed to connect wallet:", error);
      throw error;
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      connected: false,
      account: null,
      chainId: null,
      connectorId: null,
      isCorrectNetwork: false,
    });
    setProvider(null);

    // Clear localStorage
    localStorage.removeItem("wallet.connected");
    localStorage.removeItem("wallet.lastConnectorId");
    localStorage.removeItem("wallet.lastAccounts");
    localStorage.removeItem("wallet.lastChainId");
  }, []);

  const switchNetwork = useCallback(
    async (targetChainId: number) => {
      if (!provider) throw new Error("No provider");

      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${targetChainId.toString(16)}` }],
        });
      } catch (error: any) {
        if (error.code === 4902) {
          // Chain not added, need to add it first
          throw new Error(`Chain ${targetChainId} not added to wallet`);
        }
        throw error;
      }
    },
    [provider]
  );

  return (
    <WalletContext.Provider value={{ ...state, provider, connect, disconnect, switchNetwork }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return context;
}

