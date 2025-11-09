"use client";

import Link from "next/link";
import { useState } from "react";
import { useWallet } from "../hooks/useWallet";
import WalletConnect from "./WalletConnect";

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { connected } = useWallet();

  const navLinks = [
    { href: "/", label: "Welcome" },
    { href: "/draw/", label: "Draw" },
    { href: "/history/", label: "History" },
    { href: "/settings/", label: "Settings" },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-white/20 dark:border-slate-700/20 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 glow-amber">
              <span className="text-white font-bold text-xl animate-pulse-slow">☀️</span>
            </div>
            <span className="font-bold text-xl gradient-text hidden sm:inline">
              MorningLight Lots
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-stone-700 dark:text-stone-300 hover:text-amber-500 dark:hover:text-amber-400 font-medium transition-all duration-300 py-2 group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
            <WalletConnect />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <WalletConnect mobile />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-amber-100 dark:hover:bg-slate-700 transition-all duration-300 hover:scale-110"
            >
              <svg
                className="w-6 h-6 text-stone-700 dark:text-stone-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20 dark:border-slate-700/20 animate-fadeInUp">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link, idx) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 dark:hover:from-amber-900/20 dark:hover:to-orange-900/20 text-stone-700 dark:text-stone-300 font-medium transition-all duration-300 hover:translate-x-2"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

