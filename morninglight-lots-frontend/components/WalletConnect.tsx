"use client";

import { useState } from "react";
import { useWallet } from "../hooks/useWallet";
import { useEip6963 } from "../hooks/metamask/useEip6963";

interface WalletConnectProps {
  mobile?: boolean;
}

export default function WalletConnect({ mobile }: WalletConnectProps) {
  const { connected, account, chainId, isCorrectNetwork, connect, disconnect } = useWallet();
  const eip6963Providers = useEip6963();
  const [showProviders, setShowProviders] = useState(false);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkName = (chainId: number | null) => {
    switch (chainId) {
      case 31337:
        return "Hardhat";
      case 11155111:
        return "Sepolia";
      default:
        return "Unknown";
    }
  };

  if (!connected) {
    return (
      <div className="relative">
        <button
          onClick={() => {
            if (eip6963Providers.length > 0) {
              setShowProviders(true);
            } else {
              connect();
            }
          }}
          className={mobile ? "btn-outline text-sm" : "btn-primary hover-glow-amber"}
        >
          <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Connect Wallet
        </button>

        {showProviders && eip6963Providers.length > 0 && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm animate-fadeInUp"
              onClick={() => setShowProviders(false)}
            />
            <div className="absolute right-0 mt-2 w-72 glass-card z-50 p-4 animate-fadeInUp shadow-2xl">
              <h3 className="font-semibold mb-3 text-lg gradient-text">Select Wallet</h3>
              <div className="space-y-2">
                {eip6963Providers.map((provider) => (
                  <button
                    key={provider.info.uuid}
                    onClick={() => {
                      connect(provider);
                      setShowProviders(false);
                    }}
                    className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 dark:hover:from-amber-900/20 dark:hover:to-orange-900/20 transition-all duration-300 hover:scale-105 border border-transparent hover:border-amber-200 dark:hover:border-amber-800"
                  >
                    {provider.info.icon && (
                      <img
                        src={provider.info.icon}
                        alt={provider.info.name}
                        className="w-10 h-10 rounded-lg shadow-md"
                      />
                    )}
                    <span className="font-medium">{provider.info.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {!isCorrectNetwork && (
        <span className="flex items-center space-x-1 px-3 py-2 bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900 dark:to-rose-900 text-red-800 dark:text-red-200 rounded-lg text-sm font-medium border border-red-200 dark:border-red-800 shadow-md">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span>Wrong Network</span>
        </span>
      )}
      
      <div className={`flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl border border-green-200 dark:border-green-800 shadow-md ${mobile ? "text-sm" : ""}`}>
        <div className="flex items-center space-x-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="font-mono text-sm font-semibold">{formatAddress(account!)}</span>
        </div>
        {!mobile && (
          <span className="text-xs font-medium px-2 py-1 bg-white/50 dark:bg-slate-800/50 rounded-md">
            {getNetworkName(chainId)}
          </span>
        )}
      </div>

      <button
        onClick={disconnect}
        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all duration-300 hover:scale-110 group"
        title="Disconnect"
      >
        <svg className="w-5 h-5 text-stone-600 dark:text-stone-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </div>
  );
}

