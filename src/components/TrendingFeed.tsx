"use client";

import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Flame,
  Sparkles,
  BarChart3,
  Crosshair,
  ArrowRight,
  Loader2,
  Zap,
} from "lucide-react";
import { useTrendingTokens } from "@/hooks/useTrendingTokens";
import type { TrendingToken, TrendingCategory } from "@/types/trending";
import { trendingToToken, SIGNAL_LABELS } from "@/types/trending";
import { formatPrice } from "@/data/tokens";
import type { Token } from "@/data/tokens";

interface TrendingFeedProps {
  onSelectToken: (token: Token) => void;
  priceData: {
    getPrice: (symbol: string) => number;
    getChange: (symbol: string) => number;
  };
}

const CATEGORIES: { id: TrendingCategory; label: string; icon: React.ReactNode }[] = [
  { id: "hot", label: "Hot", icon: <Flame className="w-3.5 h-3.5" /> },
  { id: "new", label: "New", icon: <Sparkles className="w-3.5 h-3.5" /> },
  { id: "gainers", label: "Gainers", icon: <BarChart3 className="w-3.5 h-3.5" /> },
  { id: "sniper", label: "Sniper", icon: <Crosshair className="w-3.5 h-3.5" /> },
];

export default function TrendingFeed({ onSelectToken, priceData }: TrendingFeedProps) {
  const {
    loading,
    activeCategory,
    setActiveCategory,
    currentTokens,
    sniperActive,
  } = useTrendingTokens();

  // Use live prices from our price feed when Jupiter prices aren't available
  const getDisplayPrice = (token: TrendingToken): number => {
    if (token.price > 0) return token.price;
    return priceData.getPrice(token.symbol);
  };

  const getDisplayChange = (token: TrendingToken): number => {
    if (token.priceChange24h !== 0) return token.priceChange24h;
    return priceData.getChange(token.symbol);
  };

  return (
    <div className="w-full max-w-[380px] animate-fade-in">
      <div className="glass-card rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 pb-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" />
              <h3 className="font-semibold text-sm">Trending</h3>
            </div>
            {sniperActive && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-accent/10 border border-accent/20">
                <Crosshair className="w-3 h-3 text-accent" />
                <span className="text-[10px] text-accent font-medium">Sniper Active</span>
              </div>
            )}
          </div>

          {/* Category tabs */}
          <div className="flex gap-1 bg-bg-input rounded-lg p-1">
            {CATEGORIES.map((cat) => {
              const isSniper = cat.id === "sniper";
              const disabled = isSniper && !sniperActive;
              return (
                <button
                  key={cat.id}
                  onClick={() => !disabled && setActiveCategory(cat.id)}
                  disabled={disabled}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                    activeCategory === cat.id
                      ? "bg-accent text-white shadow-sm"
                      : disabled
                      ? "text-text-muted/40 cursor-not-allowed"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-card-hover"
                  }`}
                >
                  {cat.icon}
                  <span className="hidden sm:inline">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Token list */}
        <div className="p-2 pt-3">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-text-muted">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="text-sm">Loading trending...</span>
            </div>
          ) : activeCategory === "sniper" && !sniperActive ? (
            <div className="py-8 text-center">
              <Crosshair className="w-8 h-8 text-text-muted mx-auto mb-3" />
              <div className="text-sm font-medium text-text-secondary mb-1">
                Sniper Not Connected
              </div>
              <p className="text-xs text-text-muted px-4">
                Connect your sniper software to see real-time token picks and signals here.
              </p>
              <div className="mt-3 px-4">
                <div className="text-[10px] text-text-muted bg-bg-input rounded-lg p-2 font-mono">
                  POST /api/trending {"{"} sniper: TrendingToken[] {"}"}
                </div>
              </div>
            </div>
          ) : currentTokens.length === 0 ? (
            <div className="py-8 text-center text-text-muted text-sm">
              No tokens found
            </div>
          ) : (
            <div className="space-y-1">
              {currentTokens.map((token, i) => (
                <TrendingRow
                  key={token.mint}
                  token={token}
                  rank={i + 1}
                  price={getDisplayPrice(token)}
                  change={getDisplayChange(token)}
                  onSwap={() => onSelectToken(trendingToToken(token))}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border/50">
          <div className="flex items-center justify-between text-[10px] text-text-muted">
            <span>Prices via Jupiter</span>
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
              Auto-refresh 60s
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrendingRow({
  token,
  rank,
  price,
  change,
  onSwap,
}: {
  token: TrendingToken;
  rank: number;
  price: number;
  change: number;
  onSwap: () => void;
}) {
  const isPositive = change >= 0;

  return (
    <div className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-bg-card-hover/70 transition-all">
      {/* Rank */}
      <span className="text-[10px] text-text-muted w-4 text-right font-mono">
        {rank}
      </span>

      {/* Token icon */}
      <img
        src={token.logoURI}
        alt={token.symbol}
        className="w-8 h-8 rounded-full bg-bg-input shrink-0"
        onError={(e) => {
          (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect fill="%236366f1" width="40" height="40" rx="20"/><text x="50%" y="55%" text-anchor="middle" fill="white" font-size="14" font-family="sans-serif" dominant-baseline="middle">${token.symbol[0]}</text></svg>`;
        }}
      />

      {/* Token info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{token.symbol}</span>
          {token.signal && (
            <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-bg-input ${SIGNAL_LABELS[token.signal].color}`}>
              {SIGNAL_LABELS[token.signal].label}
            </span>
          )}
        </div>
        <div className="text-[11px] text-text-muted truncate">{token.name}</div>
      </div>

      {/* Price + change */}
      <div className="text-right shrink-0">
        <div className="text-xs font-medium">
          ${price > 0 ? formatPrice(price) : "—"}
        </div>
        {change !== 0 && (
          <div className={`flex items-center justify-end gap-0.5 text-[10px] font-medium ${isPositive ? "text-green" : "text-red"}`}>
            {isPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>

      {/* Swap button */}
      <button
        onClick={onSwap}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-all shrink-0"
        title={`Swap to ${token.symbol}`}
      >
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
