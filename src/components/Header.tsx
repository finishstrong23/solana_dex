"use client";

import React from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Scan, ArrowLeftRight, BarChart3, Bell, Shield, ShieldCheck, Zap } from "lucide-react";
import { OWNER_WALLET } from "@/lib/config";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  const { connected, publicKey } = useWallet();

  const isOwner = publicKey?.toBase58() === OWNER_WALLET;

  const tabs = [
    { id: "scanner", label: "Scanner", icon: Scan },
    { id: "safety", label: "Safety", icon: ShieldCheck },
    { id: "swap", label: "Swap", icon: ArrowLeftRight },
    { id: "dashboard", label: "Portfolio", icon: BarChart3 },
    { id: "alerts", label: "Alerts", icon: Bell },
    ...(isOwner ? [{ id: "owner", label: "Revenue", icon: Shield }] : []),
  ];

  return (
    <header className="border-b border-border sticky top-0 z-50 bg-bg-primary/90 backdrop-blur-xl">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onTabChange("scanner")}>
            <div className="w-7 h-7 rounded-lg swap-button-gradient flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <h1 className="text-base font-bold gradient-text leading-tight tracking-tight">Alpha DEX</h1>
          </div>

          {/* Navigation */}
          <nav className="hidden sm:flex items-center gap-0.5 bg-bg-card rounded-lg p-0.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                    activeTab === tab.id
                      ? "bg-accent/15 text-accent"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-card-hover"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2.5">
            {connected && (
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md bg-green/10 border border-green/20">
                <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
                <span className="text-[10px] text-green font-medium font-mono">Mainnet</span>
              </div>
            )}
            <WalletMultiButton
              style={{
                background: "linear-gradient(135deg, #00F0FF, #8B5CF6)",
                borderRadius: "8px",
                fontSize: "12px",
                height: "34px",
                padding: "0 16px",
                fontFamily: "Inter, sans-serif",
              }}
            />
          </div>
        </div>

        {/* Mobile nav */}
        <div className="sm:hidden flex items-center gap-0.5 pb-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-[10px] font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-accent/15 text-accent"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <Icon className="w-3 h-3" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
