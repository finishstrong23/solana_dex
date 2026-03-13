import type { Metadata } from "next";
import "./globals.css";
import WalletProvider from "@/context/WalletProvider";

export const metadata: Metadata = {
  title: "SolSwap | Trade Any Token on Solana",
  description: "The fastest decentralized exchange on Solana. Swap 16+ tokens with the best rates, aggregated across all Solana DEXs via Jupiter. Non-custodial, no account needed.",
  keywords: "solana dex, solana swap, solana trading, jupiter aggregator, defi, decentralized exchange, solswap",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen">
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
