"use client";

import Link from "next/link";
import { useWallet } from "../hooks/useWallet";

export default function WelcomePage() {
  const { connected, connect } = useWallet();

  const features = [
    {
      title: "What is MorningLight Lots?",
      items: [
        "Draw your daily fortune once per day",
        "64 unique fortunes with Do's, Don'ts, and Inspiration",
        "Results fully encrypted with FHEVM - only you can decrypt",
        "History saved permanently on-chain for review anytime",
      ],
    },
    {
      title: "Powered by FHEVM",
      items: [
        "Fortune numbers generated on-chain as encrypted euint16",
        "Decryption rights granted only to you via FHE.allow",
        "Share fortune cards without revealing plaintext",
        "Verifiable fairness with complete privacy",
      ],
    },
    {
      title: "Rules",
      items: [
        "Each account can draw 1 fortune per day (resets at UTC 0:00)",
        "2-minute cooldown after drawing before you can decrypt",
        "Past fortunes can be viewed anytime in History",
        "No one else can see your fortune, not even validators",
      ],
    },
  ];

  const steps = [
    { num: 1, text: "Connect your wallet" },
    { num: 2, text: "Click 'Shake & Draw'" },
    { num: 3, text: "Wait for blockchain confirmation" },
    { num: 4, text: "Decrypt and view your fortune" },
  ];

  return (
    <div className="relative">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-full blur-3xl -z-10"></div>
          
          <div className="inline-block mb-6 animate-float">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-3xl flex items-center justify-center shadow-2xl glow-amber">
              <span className="text-5xl animate-pulse-slow">☀️</span>
            </div>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 animate-fadeInUp">
            <span className="gradient-text">MorningLight Lots</span>
          </h1>
          <p className="text-2xl md:text-3xl font-semibold text-stone-700 dark:text-stone-300 mb-4 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            Your Daily Fortune Awaits
          </p>
          <p className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto mb-10 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            🔒 64 encrypted fortunes, fully private, verifiable on-chain with FHEVM
          </p>
          
          <div className="animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
            {connected ? (
              <Link href="/draw/" className="inline-block btn-primary text-xl px-8 py-4 hover-glow-amber">
                <svg className="w-6 h-6 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Draw Your Fortune →
              </Link>
            ) : (
              <button onClick={() => connect()} className="btn-primary text-xl px-8 py-4 hover-glow-amber">
                <svg className="w-6 h-6 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Connect Wallet to Start
              </button>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className="card-interactive animate-fadeInUp"
              style={{ animationDelay: `${0.4 + idx * 0.1}s` }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                <span className="text-2xl">
                  {idx === 0 ? '🎴' : idx === 1 ? '🔐' : '📜'}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-4 gradient-text">{feature.title}</h3>
              <ul className="space-y-3">
                {feature.items.map((item, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <div className="mt-1">
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-stone-700 dark:text-stone-300 text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Quick Start Guide */}
        <div className="card max-w-4xl mx-auto glass-card animate-fadeInUp" style={{ animationDelay: '0.7s' }}>
          <h3 className="text-3xl font-bold mb-8 text-center gradient-text">
            Quick Start Guide
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step) => (
              <div key={step.num} className="text-center group">
                <div className="relative inline-block mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110 glow-amber">
                    {step.num}
                  </div>
                  {step.num < 4 && (
                    <div className="hidden md:block absolute top-1/2 left-full w-full h-0.5 bg-gradient-to-r from-amber-300 to-transparent"></div>
                  )}
                </div>
                <p className="text-sm font-medium text-stone-700 dark:text-stone-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

