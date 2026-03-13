import type { Metadata } from "next";
import "./globals.css";
import WalletProvider from "@/context/WalletProvider";

export const metadata: Metadata = {
  title: "SolSwap - Solana DEX",
  description: "A fast, simple decentralized exchange on Solana",
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
