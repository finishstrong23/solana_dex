"use client";

import React from "react";
import { TrendingUp, TrendingDown, Activity, Wallet, Zap, PieChart, ArrowRight } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useBalances } from "@/hooks/useBalances";
import { TOKENS, formatNumber, formatPrice } from "@/data/tokens";
import { PLATFORM_FEE_BPS } from "@/lib/config";

interface DashboardProps {
  priceData: {
    getPrice: (symbol: string) => number;
    getChange: (symbol: string) => number;
    lastUpdated: Date | null;
  };
}

export default function Dashboard({ priceData }: DashboardProps) {
  const { connected } = useWallet();
  const { balances, loading: balancesLoading, getBalance } = useBalances();

  const positions = TOKENS.map((token) => {
    const balance = getBalance(token.mint);
    const price = priceData.getPrice(token.symbol);
    const change = priceData.getChange(token.symbol);
    return { token, balance, price, change, value: balance * price };
  }).filter((p) => p.balance > 0);

  const totalValue = positions.reduce((sum, p) => sum + p.value, 0);

  positions.sort((a, b) => b.value - a.value);

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in">
      {/* Portfolio Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1">Portfolio</h2>
        <p className="text-xs text-text-secondary">
          {connected ? "Your on-chain positions across Alpha DEX supported tokens." : "Connect your wallet to view portfolio."}
        </p>
      </div>

      {!connected ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <Wallet className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <h3 className="text-base font-semibold mb-1">Connect Your Wallet</h3>
          <p className="text-xs text-text-muted">
            Connect a Solana wallet to see your token balances and portfolio value.
          </p>
        </div>
      ) : (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatCard
              icon={<Wallet className="w-4 h-4" />}
              label="Portfolio Value"
              value={formatNumber(totalValue)}
            />
            <StatCard
              icon={<PieChart className="w-4 h-4" />}
              label="Positions"
              value={positions.length.toString()}
            />
            <StatCard
              icon={<Zap className="w-4 h-4" />}
              label="Platform Fee"
              value={`${PLATFORM_FEE_BPS / 100}%`}
              sub="per swap"
            />
            <StatCard
              icon={<Activity className="w-4 h-4" />}
              label="SOL Price"
              value={`$${formatPrice(priceData.getPrice("SOL"))}`}
              sub={`${priceData.getChange("SOL") >= 0 ? "+" : ""}${priceData.getChange("SOL").toFixed(2)}%`}
              subPositive={priceData.getChange("SOL") >= 0}
            />
          </div>

          {/* Positions Table */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Wallet className="w-3.5 h-3.5 text-accent" />
                Your Positions
              </h3>
              {priceData.lastUpdated && (
                <span className="text-[10px] text-text-muted flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
                  Live
                </span>
              )}
            </div>

            {positions.length === 0 && !balancesLoading ? (
              <div className="py-12 text-center">
                <PieChart className="w-8 h-8 text-text-muted mx-auto mb-3 opacity-40" />
                <p className="text-sm text-text-secondary font-medium">No token positions found</p>
                <p className="text-xs text-text-muted mt-1">Start trading to build your portfolio</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-bg-secondary/30">
                    <th className="text-left text-[10px] text-text-muted font-semibold uppercase tracking-wider px-4 py-2.5">Token</th>
                    <th className="text-right text-[10px] text-text-muted font-semibold uppercase tracking-wider px-4 py-2.5">Balance</th>
                    <th className="text-right text-[10px] text-text-muted font-semibold uppercase tracking-wider px-4 py-2.5">Price</th>
                    <th className="text-right text-[10px] text-text-muted font-semibold uppercase tracking-wider px-4 py-2.5">24h</th>
                    <th className="text-right text-[10px] text-text-muted font-semibold uppercase tracking-wider px-4 py-2.5">Value</th>
                    <th className="text-right text-[10px] text-text-muted font-semibold uppercase tracking-wider px-4 py-2.5">Alloc</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map(({ token, balance, price, change, value }) => {
                    const allocation = totalValue > 0 ? (value / totalValue) * 100 : 0;
                    return (
                      <tr key={token.mint} className="border-b border-border/50 hover:bg-bg-card-hover/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={token.logoURI}
                              alt={token.symbol}
                              className="w-7 h-7 rounded-full bg-bg-input"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect fill="%238B5CF6" width="40" height="40" rx="20"/><text x="50%" y="55%" text-anchor="middle" fill="white" font-size="14" font-family="sans-serif" dominant-baseline="middle">${encodeURIComponent(token.symbol[0])}</text></svg>`;
                              }}
                            />
                            <div>
                              <div className="text-sm font-semibold">{token.symbol}</div>
                              <div className="text-[10px] text-text-muted">{token.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs">
                          {balance < 0.001 ? balance.toFixed(6)
                            : balance < 1 ? balance.toFixed(4)
                            : balance < 1000 ? balance.toFixed(2)
                            : balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs">
                          ${formatPrice(price)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${
                            change >= 0 ? "text-green" : "text-red"
                          }`}>
                            {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {Math.abs(change).toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs font-medium">
                          {formatNumber(value)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-12 h-1.5 rounded-full bg-bg-primary overflow-hidden">
                              <div
                                className="h-full rounded-full bg-accent"
                                style={{ width: `${Math.min(100, allocation)}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-mono text-text-secondary w-10 text-right">
                              {allocation.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* All Token Prices */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-accent" />
                Market Prices
              </h3>
              {priceData.lastUpdated && (
                <span className="text-[10px] text-text-muted flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
                  Updated {priceData.lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-px bg-border/30">
                {TOKENS.map((token) => {
                  const price = priceData.getPrice(token.symbol);
                  const change = priceData.getChange(token.symbol);
                  return (
                    <div key={token.symbol} className="bg-bg-card p-3 hover:bg-bg-card-hover transition-colors">
                      <div className="flex items-center gap-2 mb-1.5">
                        <img
                          src={token.logoURI}
                          alt={token.symbol}
                          className="w-5 h-5 rounded-full"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                        <span className="text-xs font-semibold">{token.symbol}</span>
                      </div>
                      <div className="text-sm font-bold font-mono">${formatPrice(price)}</div>
                      <div className={`text-[10px] font-medium ${change >= 0 ? "text-green" : "text-red"}`}>
                        {change >= 0 ? "+" : ""}{change.toFixed(2)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, sub, subPositive }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  subPositive?: boolean;
}) {
  return (
    <div className="glass-card rounded-xl p-3.5">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-accent">{icon}</span>
        <span className="text-[10px] text-text-muted">{label}</span>
      </div>
      <div className="text-lg font-bold">{value}</div>
      {sub && (
        <span className={`text-[10px] font-medium ${subPositive === undefined ? "text-text-muted" : subPositive ? "text-green" : "text-red"}`}>
          {sub}
        </span>
      )}
    </div>
  );
}
