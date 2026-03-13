"use client";

import React from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ArrowLeftRight, Droplets, BarChart3, Shield, Zap } from "lucide-react";
import { OWNER_WALLET } from "@/lib/config";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  const { connected, publicKey } = useWallet();

  const isOwner = publicKey?.toBase58() === OWNER_WALLET;

  const tabs = [
    { id: "swap", label: "Swap", icon: ArrowLeftRight },
    { id: "pools", label: "Pools", icon: Droplets },
    { id: "dashboard", label: "Markets", icon: BarChart3 },
    // Only show owner dashboard to the platform owner
    ...(isOwner ? [{ id: "owner", label: "Revenue", icon: Shield }] : []),
  ];

  return (
    <header className="border-b border-border sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg swap-button-gradient flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text leading-tight">SolSwap</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden sm:flex items-center gap-1 bg-bg-card rounded-xl p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-accent text-white shadow-lg shadow-accent/20"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-card-hover"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Wallet */}
          <div className="flex items-center gap-3">
            {connected && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green/10 border border-green/20">
                <div className="w-2 h-2 rounded-full bg-green animate-pulse" />
                <span className="text-xs text-green font-medium">Mainnet</span>
              </div>
            )}
            <WalletMultiButton
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                borderRadius: "12px",
                fontSize: "14px",
                height: "40px",
                padding: "0 20px",
              }}
            />
          </div>
        </div>

        {/* Mobile nav */}
        <div className="sm:hidden flex items-center gap-1 pb-3 bg-bg-card rounded-xl p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-accent text-white"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
