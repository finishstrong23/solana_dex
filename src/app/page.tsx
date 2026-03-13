"use client";

import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import Header from "@/components/Header";
import SwapCard from "@/components/SwapCard";
import PoolsTable from "@/components/PoolsTable";
import Dashboard from "@/components/Dashboard";
import OwnerDashboard from "@/components/OwnerDashboard";
import { usePrices } from "@/hooks/usePrices";
import { OWNER_WALLET } from "@/lib/config";
import { Shield, Zap, Globe, Lock } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("swap");
  const priceData = usePrices();
  const { publicKey } = useWallet();

  const isOwner = publicKey?.toBase58() === OWNER_WALLET;

  return (
    <div className="min-h-screen flex flex-col">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        {activeTab === "swap" && (
          <div className="flex flex-col items-center">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold mb-2">
                Trade any token on <span className="gradient-text">Solana</span>
              </h2>
              <p className="text-text-secondary text-sm sm:text-base mb-6">
                Best rates across all Solana DEXs. Fast, secure, zero slippage.
              </p>

              {/* Trust signals */}
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-2">
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <Zap className="w-3.5 h-3.5 text-accent" />
                  <span>400ms trades</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <Globe className="w-3.5 h-3.5 text-accent" />
                  <span>Jupiter aggregated</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <Lock className="w-3.5 h-3.5 text-accent" />
                  <span>Non-custodial</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <Shield className="w-3.5 h-3.5 text-accent" />
                  <span>No account needed</span>
                </div>
              </div>
            </div>
            <SwapCard priceData={priceData} />
          </div>
        )}

        {activeTab === "pools" && <PoolsTable />}
        {activeTab === "dashboard" && <Dashboard priceData={priceData} />}
        {activeTab === "owner" && isOwner && <OwnerDashboard />}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-text-muted">
            SolSwap — Decentralized Trading on Solana
          </div>
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <span>Powered by Jupiter</span>
            {priceData.lastUpdated && (
              <span className="text-text-muted">
                Prices: {priceData.lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
              Live
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
