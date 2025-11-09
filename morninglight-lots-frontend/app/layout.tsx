import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import Navigation from "../components/Navigation";

export const metadata: Metadata = {
  title: "MorningLight Lots - Daily Fortune on FHEVM",
  description: "Draw your daily fortune with full privacy powered by FHEVM encryption",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
            <footer className="border-t border-stone-200 dark:border-slate-700 py-6">
              <div className="container mx-auto px-4 text-center text-sm text-stone-600 dark:text-stone-400">
                <p>
                  Powered by{" "}
                  <a
                    href="https://docs.zama.ai/fhevm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-500 hover:underline"
                  >
                    FHEVM
                  </a>
                  {" • "}
                  Fully Private • Verifiable On-Chain
                </p>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}

