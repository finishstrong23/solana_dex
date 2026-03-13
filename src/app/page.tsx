"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import SwapCard from "@/components/SwapCard";
import PoolsTable from "@/components/PoolsTable";
import Dashboard from "@/components/Dashboard";
import OwnerDashboard from "@/components/OwnerDashboard";
import { usePrices } from "@/hooks/usePrices";

export default function Home() {
  const [activeTab, setActiveTab] = useState("swap");
  const priceData = usePrices();

  return (
    <div className="min-h-screen flex flex-col">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        {activeTab === "swap" && (
          <div className="flex flex-col items-center">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold mb-2">
                Swap tokens on <span className="gradient-text">Solana</span>
              </h2>
              <p className="text-text-secondary text-sm sm:text-base">
                Fast, secure, and decentralized token swaps with the best rates
              </p>
            </div>
            <SwapCard priceData={priceData} />
          </div>
        )}

        {activeTab === "pools" && <PoolsTable />}
        {activeTab === "dashboard" && <Dashboard priceData={priceData} />}
        {activeTab === "owner" && <OwnerDashboard />}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-text-muted">
            SolSwap - Decentralized Exchange on Solana
          </div>
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <span>Powered by Solana &amp; Jupiter</span>
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
