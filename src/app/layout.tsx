import type { Metadata } from "next";
import "./globals.css";
import WalletProvider from "@/context/WalletProvider";

export const metadata: Metadata = {
  title: "Alpha DEX | Discovery. Analysis. Execution.",
  description: "The only Solana DEX where you find alpha, validate it, and trade it — all without switching tabs. Real-time risk scores, MEV protection, and smart token discovery.",
  keywords: "solana dex, alpha scanner, solana trading, rug risk, token scanner, jupiter aggregator, defi, mev protection",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen">
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
