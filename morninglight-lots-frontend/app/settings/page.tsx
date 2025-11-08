"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "../../hooks/useWallet";
import { useFhevm } from "../../fhevm/useFhevm";

export default function SettingsPage() {
  const router = useRouter();
  const { connected, account, chainId, disconnect, switchNetwork } = useWallet();
  const { regenerateSignature } = useFhevm();
  
  const [showCopyNotice, setShowCopyNotice] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setShowCopyNotice(true);
    setTimeout(() => setShowCopyNotice(false), 2000);
  };

  const clearCache = () => {
    if (confirm("Are you sure you want to clear all cached fortune data? This will not affect your on-chain records.")) {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith("fortune_")) {
          localStorage.removeItem(key);
        }
      });
      alert("Cache cleared successfully!");
    }
  };

  const handleRegenerateSignature = async () => {
    try {
      await regenerateSignature();
      alert("Decryption signature regenerated successfully!");
    } catch (err: any) {
      alert(`Failed to regenerate signature: ${err.message}`);
    }
  };

  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto glass-card text-center py-16 border-2 border-amber-200/50 dark:border-amber-800/50 animate-fadeInUp">
          <div className="text-8xl mb-6 animate-float">⚙️</div>
          <h2 className="text-3xl font-bold gradient-text mb-4">Settings</h2>
          <p className="text-stone-600 dark:text-stone-400 mb-8 text-lg">
            Please connect your wallet to access settings
          </p>
          <button onClick={() => router.push("/")} className="btn-primary text-lg px-8 py-4 hover-glow-amber">
            <svg className="w-6 h-6 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go to Welcome Page
          </button>
        </div>
      </div>
    );
  }

  const getNetworkName = (chainId: number) => {
    switch (chainId) {
      case 31337:
        return "Hardhat Local";
      case 11155111:
        return "Sepolia Testnet";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10 animate-fadeInUp">
          <h1 className="text-4xl font-bold gradient-text mb-3 flex items-center">
            <svg className="w-10 h-10 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </h1>
          <p className="text-stone-600 dark:text-stone-400 text-lg">
            ⚙️ Configure your fortune drawing experience
          </p>
        </div>

        {/* Draw Rules */}
        <div className="glass-card mb-6 border-2 border-amber-200/50 dark:border-amber-800/50 animate-fadeInUp">
          <h2 className="text-2xl font-bold mb-6 gradient-text flex items-center">
            <svg className="w-7 h-7 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Drawing Rules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border-2 border-purple-200 dark:border-purple-800 shadow-md">
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">Daily Limit</p>
              <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">1 draw</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-xl border-2 border-blue-200 dark:border-blue-800 shadow-md">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Cooldown Time</p>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">5 seconds</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 rounded-xl border-2 border-amber-200 dark:border-amber-800 shadow-md">
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-1">Fortune Pool</p>
              <p className="text-2xl font-bold text-amber-800 dark:text-amber-200">64 fortunes</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border-2 border-green-200 dark:border-green-800 shadow-md">
              <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">Reset Time</p>
              <p className="text-2xl font-bold text-green-800 dark:text-green-200">UTC 00:00</p>
            </div>
          </div>
        </div>

        {/* Account & Network */}
        <div className="glass-card mb-6 border-2 border-green-200/50 dark:border-green-800/50 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-2xl font-bold mb-6 gradient-text flex items-center">
            <svg className="w-7 h-7 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Account & Network
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-3 text-green-600 dark:text-green-400">Current Account</label>
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={account || ""}
                  readOnly
                  className="input-field flex-1 font-mono text-sm"
                />
                <button
                  onClick={() => copyToClipboard(account!)}
                  className="btn-outline hover:scale-105"
                >
                  <svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </button>
              </div>
              {showCopyNotice && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-2 font-medium animate-fadeInUp">
                  ✓ Copied to clipboard!
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold mb-3 text-green-600 dark:text-green-400">Current Network</label>
              <input
                type="text"
                value={`${getNetworkName(chainId!)} (Chain ID: ${chainId})`}
                readOnly
                className="input-field w-full font-medium"
              />
            </div>

            <button onClick={disconnect} className="btn-outline w-full hover:bg-red-500 hover:text-white hover:border-red-500">
              <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Disconnect Wallet
            </button>
          </div>
        </div>

        {/* Privacy & Storage */}
        <div className="glass-card mb-6 border-2 border-blue-200/50 dark:border-blue-800/50 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-2xl font-bold mb-6 gradient-text flex items-center">
            <svg className="w-7 h-7 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Privacy & Storage
          </h2>
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-5 rounded-xl border-2 border-blue-200 dark:border-blue-800">
              <h3 className="font-bold mb-2 text-blue-700 dark:text-blue-300 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                Local Cache
              </h3>
              <p className="text-sm text-stone-600 dark:text-stone-400 mb-4">
                Decrypted fortunes are cached locally. Clear cache to remove all stored plaintext fortunes.
              </p>
              <button onClick={clearCache} className="btn-outline w-full">
                <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear Local Cache
              </button>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-5 rounded-xl border-2 border-purple-200 dark:border-purple-800">
              <h3 className="font-bold mb-2 text-purple-700 dark:text-purple-300 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                FHEVM Decryption Signature
              </h3>
              <p className="text-sm text-stone-600 dark:text-stone-400 mb-4">
                Regenerate your decryption signature if you're experiencing issues.
              </p>
              <button onClick={handleRegenerateSignature} className="btn-outline w-full">
                <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Re-sign Decryption Signature
              </button>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="glass-card border-2 border-purple-200/50 dark:border-purple-800/50 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-2xl font-bold mb-6 gradient-text-purple flex items-center">
            <svg className="w-7 h-7 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            About
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
              <span className="font-medium">Version:</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">1.0.0</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
              <span className="font-medium">Contract:</span>
              <a
                href={`https://sepolia.etherscan.io/address/0x...`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center"
              >
                View on Explorer
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg">
              <span className="font-medium">Documentation:</span>
              <a
                href="https://docs.zama.ai/fhevm"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center"
              >
                FHEVM Docs
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

