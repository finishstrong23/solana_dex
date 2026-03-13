"use client";

import React from "react";
import { TrendingUp, TrendingDown, Activity, Wallet, Clock, Zap } from "lucide-react";
import { TOKENS, POOLS, formatNumber, formatPrice } from "@/data/tokens";
import { PLATFORM_FEE_BPS } from "@/lib/config";

interface DashboardProps {
  priceData: {
    getPrice: (symbol: string) => number;
    getChange: (symbol: string) => number;
    lastUpdated: Date | null;
  };
}

export default function Dashboard({ priceData }: DashboardProps) {
  const totalTVL = POOLS.reduce((sum, p) => sum + p.tvl, 0);
  const totalVolume = POOLS.reduce((sum, p) => sum + p.volume24h, 0);

  const recentTrades = [
    { from: "SOL", to: "USDC", amount: "12.5", time: "2m ago", type: "sell" as const },
    { from: "USDC", to: "JUP", amount: "500", time: "5m ago", type: "buy" as const },
    { from: "SOL", to: "BONK", amount: "3.2", time: "8m ago", type: "buy" as const },
    { from: "RAY", to: "USDC", amount: "200", time: "12m ago", type: "sell" as const },
    { from: "WIF", to: "SOL", amount: "1,500", time: "15m ago", type: "buy" as const },
    { from: "JTO", to: "USDC", amount: "300", time: "22m ago", type: "sell" as const },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in">
      {/* Protocol stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Wallet className="w-5 h-5" />} label="Total Value Locked" value={formatNumber(totalTVL)} change="+4.2%" positive />
        <StatCard icon={<Activity className="w-5 h-5" />} label="24h Volume" value={formatNumber(totalVolume)} change="+12.7%" positive />
        <StatCard icon={<Zap className="w-5 h-5" />} label="Platform Fee" value={`${PLATFORM_FEE_BPS / 100}%`} change="per swap" positive />
        <StatCard icon={<Clock className="w-5 h-5" />} label="Avg. Trade Time" value="0.4s" change="Solana speed" positive />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Token prices — LIVE */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Token Prices</h3>
            {priceData.lastUpdated && (
              <span className="text-xs text-text-muted flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
                Live — {priceData.lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
          <div className="glass-card rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs text-text-muted font-medium px-4 py-3">Token</th>
                  <th className="text-right text-xs text-text-muted font-medium px-4 py-3">Price</th>
                  <th className="text-right text-xs text-text-muted font-medium px-4 py-3">24h</th>
                </tr>
              </thead>
              <tbody>
                {TOKENS.map((token) => {
                  const price = priceData.getPrice(token.symbol);
                  const change = priceData.getChange(token.symbol);
                  return (
                    <tr key={token.symbol} className="border-b border-border/50 hover:bg-bg-card-hover/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={token.logoURI}
                            alt={token.symbol}
                            className="w-7 h-7 rounded-full bg-bg-input"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect fill="%236366f1" width="40" height="40" rx="20"/><text x="50%" y="55%" text-anchor="middle" fill="white" font-size="14" font-family="sans-serif" dominant-baseline="middle">${token.symbol[0]}</text></svg>`;
                            }}
                          />
                          <div>
                            <div className="text-sm font-medium">{token.symbol}</div>
                            <div className="text-xs text-text-muted">{token.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium">
                        ${formatPrice(price)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                            change >= 0 ? "bg-green/10 text-green" : "bg-red/10 text-red"
                          }`}
                        >
                          {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {Math.abs(change).toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent trades */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Recent Trades</h3>
          <div className="glass-card rounded-xl p-4 space-y-3">
            {recentTrades.map((trade, i) => {
              const fromPrice = priceData.getPrice(trade.from);
              const value = parseFloat(trade.amount.replace(",", "")) * fromPrice;
              return (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      trade.type === "buy" ? "bg-green/10" : "bg-red/10"
                    }`}>
                      {trade.type === "buy" ? <TrendingUp className="w-4 h-4 text-green" /> : <TrendingDown className="w-4 h-4 text-red" />}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{trade.from} → {trade.to}</div>
                      <div className="text-xs text-text-muted">{trade.time}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatNumber(value)}</div>
                    <div className="text-xs text-text-muted">{trade.amount} {trade.from}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, change, positive }: {
  icon: React.ReactNode; label: string; value: string; change: string; positive: boolean;
}) {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="text-accent">{icon}</div>
        <span className="text-xs text-text-muted">{label}</span>
      </div>
      <div className="text-xl lg:text-2xl font-bold mb-1">{value}</div>
      <span className={`text-xs font-medium ${positive ? "text-green" : "text-red"}`}>{change}</span>
    </div>
  );
}
