"use client";

import React, { useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import Header from "@/components/Header";
import SwapCard from "@/components/SwapCard";
import ScannerTable from "@/components/Scanner/ScannerTable";
import PoolsTable from "@/components/PoolsTable";
import Dashboard from "@/components/Dashboard";
import OwnerDashboard from "@/components/OwnerDashboard";
import SafetyScanner from "@/components/SafetyScanner";
import StatusBar from "@/components/StatusBar";
import { usePrices } from "@/hooks/usePrices";
import { OWNER_WALLET } from "@/lib/config";
import { TOKENS, type Token } from "@/data/tokens";
import type { ScannerToken } from "@/types/scanner";
import { Bell, Construction } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("scanner");
  const priceData = usePrices();
  const { publicKey, connected } = useWallet();
  const [externalTokenTo, setExternalTokenTo] = useState<Token | null>(null);
  const [showSwapPanel, setShowSwapPanel] = useState(true);

  const isOwner = publicKey?.toBase58() === OWNER_WALLET;
  const solPrice = priceData.getPrice("SOL");

  // When user clicks "Trade" on a scanner row, set the token in swap panel
  const handleTradeFromScanner = useCallback((scannerToken: ScannerToken) => {
    const existing = TOKENS.find((t) => t.mint === scannerToken.mint);
    const token: Token = existing ?? {
      symbol: scannerToken.symbol,
      name: scannerToken.name,
      mint: scannerToken.mint,
      decimals: scannerToken.decimals,
      logoURI: scannerToken.logoURI,
      coingeckoId: "",
    };
    setExternalTokenTo(token);
    setShowSwapPanel(true);
    // Switch to scanner view if not already there
    if (activeTab !== "scanner") {
      setActiveTab("scanner");
    }
  }, [activeTab]);

  const handleExternalTokenConsumed = useCallback(() => {
    setExternalTokenTo(null);
  }, []);

  // Scanner + Swap panel layout (the main view)
  const renderScannerLayout = () => (
    <div className="flex gap-4 h-full">
      {/* Scanner — main content area */}
      <div className="flex-1 min-w-0">
        <ScannerTable onTradeToken={handleTradeFromScanner} />
      </div>

      {/* Persistent swap panel — right side on desktop */}
      {showSwapPanel && (
        <div className="hidden lg:block w-[380px] shrink-0">
          <div className="sticky top-[72px]">
            <SwapCard
              priceData={priceData}
              externalTokenTo={externalTokenTo}
              onExternalTokenConsumed={handleExternalTokenConsumed}
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 py-4 px-4 sm:px-6">
        <div className="max-w-[1600px] mx-auto">
          {activeTab === "scanner" && renderScannerLayout()}

          {activeTab === "swap" && (
            <div className="flex flex-col items-center pt-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold mb-1">
                  Trade any token on <span className="gradient-text">Solana</span>
                </h2>
                <p className="text-text-secondary text-sm">
                  Best rates via Jupiter. MEV-protected. Non-custodial.
                </p>
              </div>
              <SwapCard
                priceData={priceData}
                externalTokenTo={externalTokenTo}
                onExternalTokenConsumed={handleExternalTokenConsumed}
              />
            </div>
          )}

          {activeTab === "safety" && (
            <div className="pt-6">
              <SafetyScanner />
            </div>
          )}

          {activeTab === "pools" && <PoolsTable />}
          {activeTab === "dashboard" && <Dashboard priceData={priceData} />}

          {activeTab === "alerts" && (
            <div className="flex flex-col items-center justify-center py-20">
              <Bell className="w-12 h-12 text-text-muted mb-4" />
              <h2 className="text-xl font-bold mb-2">Alerts Coming Soon</h2>
              <p className="text-text-secondary text-sm text-center max-w-md">
                Configurable alerts for risk score changes, whale activity, price targets,
                and stop-loss triggers. Available in the next update.
              </p>
              <div className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20">
                <Construction className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs text-accent font-medium">In Development</span>
              </div>
            </div>
          )}

          {activeTab === "owner" && isOwner && <OwnerDashboard />}
        </div>
      </main>

      <StatusBar solPrice={solPrice} connected={connected} />
    </div>
  );
}
