"use client";

import React, { useState, useMemo } from "react";
import { ArrowUpDown, ArrowRight, Filter, X, Scan } from "lucide-react";
import type { ScannerToken } from "@/types/scanner";
import type { ScannerFilters as Filters, ScannerPreset } from "@/types/scanner";
import { DEFAULT_FILTERS, SCANNER_PRESETS } from "@/types/scanner";
import { MOCK_SCANNER_TOKENS } from "@/data/scannerTokens";
import ScoreBadge from "@/components/shared/ScoreBadge";
import Sparkline from "@/components/shared/Sparkline";
import ScannerFilters from "./ScannerFilters";
import { formatPrice } from "@/data/tokens";

interface ScannerTableProps {
  onTradeToken: (token: ScannerToken) => void;
}

type SortKey = "momentum" | "rugRisk" | "volume24h" | "priceChange24h" | "liquidity" | "holders" | "price";

function formatCompact(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function applyFilters(tokens: ScannerToken[], filters: Filters): ScannerToken[] {
  return tokens.filter((t) => {
    if (filters.riskTier === "safe" && t.rugRisk > 30) return false;
    if (filters.riskTier === "moderate" && (t.rugRisk <= 30 || t.rugRisk > 60)) return false;
    if (filters.riskTier === "degen" && t.rugRisk <= 60) return false;
    if (t.liquidity < filters.minLiquidity) return false;
    if (t.holders < filters.minHolders) return false;
    if (filters.maxAge !== null && t.ageHours > filters.maxAge) return false;
    if (t.volume24h < filters.minVolume) return false;
    if (t.momentum < filters.minMomentum) return false;
    if (filters.hideHoneypots && t.isHoneypot) return false;
    if (filters.hideFrozenMint && !t.freezeAuthorityDisabled) return false;
    return true;
  });
}

export default function ScannerTable({ onTradeToken }: ScannerTableProps) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [activePreset, setActivePreset] = useState<ScannerPreset | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("momentum");
  const [sortAsc, setSortAsc] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const handlePreset = (preset: ScannerPreset) => {
    if (activePreset === preset) {
      setActivePreset(null);
      setFilters(DEFAULT_FILTERS);
    } else {
      setActivePreset(preset);
      setFilters({ ...DEFAULT_FILTERS, ...SCANNER_PRESETS[preset].filters });
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const filteredTokens = useMemo(() => applyFilters(MOCK_SCANNER_TOKENS, filters), [filters]);

  const sortedTokens = useMemo(() => {
    const sorted = [...filteredTokens].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
    return sorted;
  }, [filteredTokens, sortKey, sortAsc]);

  const SortHeader = ({ label, sortId, className = "" }: { label: string; sortId: SortKey; className?: string }) => (
    <button
      onClick={() => handleSort(sortId)}
      className={`flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold transition-colors ${
        sortKey === sortId ? "text-accent" : "text-text-muted hover:text-text-secondary"
      } ${className}`}
    >
      {label}
      <ArrowUpDown className="w-2.5 h-2.5" />
    </button>
  );

  return (
    <div className="flex gap-4 animate-fade-in">
      {/* Filters sidebar — desktop */}
      {showFilters && (
        <div className="hidden lg:block w-56 shrink-0">
          <div className="glass-card rounded-xl p-4 sticky top-20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Filter className="w-3.5 h-3.5 text-accent" />
                Filters
              </div>
              <button onClick={() => setShowFilters(false)} className="text-text-muted hover:text-text-secondary">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <ScannerFilters
              filters={filters}
              onChange={setFilters}
              activePreset={activePreset}
              onPreset={handlePreset}
              tokenCount={filteredTokens.length}
              totalCount={MOCK_SCANNER_TOKENS.length}
            />
          </div>
        </div>
      )}

      {/* Main table */}
      <div className="flex-1 min-w-0">
        {/* Table header bar */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Scan className="w-4 h-4 text-accent" />
              <h2 className="text-lg font-bold">Alpha Scanner</h2>
            </div>
            <span className="text-[10px] font-mono text-text-muted bg-bg-card px-2 py-0.5 rounded">
              {filteredTokens.length} tokens
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick presets */}
            <div className="hidden md:flex gap-1">
              {(["blue_chips", "early_alpha", "trending_now"] as ScannerPreset[]).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePreset(p)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
                    activePreset === p
                      ? "bg-accent/15 text-accent border border-accent/20"
                      : "bg-bg-card text-text-muted border border-border hover:text-text-secondary"
                  }`}
                >
                  {SCANNER_PRESETS[p].label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                showFilters
                  ? "bg-accent/15 text-accent border border-accent/20"
                  : "bg-bg-card text-text-secondary border border-border hover:text-text-primary"
              }`}
            >
              <Filter className="w-3 h-3" />
              Filters
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="glass-card rounded-xl overflow-hidden">
          {/* Column headers */}
          <div className="grid grid-cols-[1fr_90px_80px_80px_80px_90px_65px_65px_50px] gap-2 px-4 py-2.5 border-b border-border bg-bg-secondary/50">
            <div className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">Token</div>
            <SortHeader label="Price" sortId="price" />
            <SortHeader label="24h" sortId="priceChange24h" />
            <SortHeader label="Volume" sortId="volume24h" />
            <SortHeader label="Liq" sortId="liquidity" />
            <SortHeader label="Holders" sortId="holders" />
            <SortHeader label="Risk" sortId="rugRisk" />
            <SortHeader label="Mom" sortId="momentum" />
            <div className="text-[10px] uppercase tracking-wider text-text-muted font-semibold text-center">Trade</div>
          </div>

          {/* Rows */}
          <div>
            {sortedTokens.length === 0 ? (
              <div className="py-12 text-center text-text-muted">
                <Filter className="w-8 h-8 mx-auto mb-3 opacity-40" />
                <div className="text-sm font-medium">No tokens match your filters</div>
                <div className="text-xs mt-1">Try adjusting your risk tier or liquidity minimum</div>
              </div>
            ) : (
              sortedTokens.map((token) => (
                <TokenRow key={token.mint} token={token} onTrade={() => onTradeToken(token)} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TokenRow({ token, onTrade }: { token: ScannerToken; onTrade: () => void }) {
  const isPositive24h = token.priceChange24h >= 0;

  return (
    <div className="scanner-row grid grid-cols-[1fr_90px_80px_80px_80px_90px_65px_65px_50px] gap-2 px-4 py-3 border-b border-border/50 items-center cursor-pointer">
      {/* Token */}
      <div className="flex items-center gap-2.5 min-w-0">
        <img
          src={token.logoURI}
          alt={token.symbol}
          className="w-7 h-7 rounded-full bg-bg-input shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect fill="%238B5CF6" width="40" height="40" rx="20"/><text x="50%" y="55%" text-anchor="middle" fill="white" font-size="14" font-family="sans-serif" dominant-baseline="middle">${token.symbol[0]}</text></svg>`;
          }}
        />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm">{token.symbol}</span>
            <span className="text-[9px] text-text-muted font-mono">{token.age}</span>
          </div>
          <div className="text-[10px] text-text-muted truncate">{token.name}</div>
        </div>
      </div>

      {/* Price */}
      <div className="font-mono text-xs font-medium">
        ${formatPrice(token.price)}
      </div>

      {/* 24h Change + sparkline */}
      <div className="flex items-center gap-1.5">
        <span className={`font-mono text-xs font-medium ${isPositive24h ? "text-green" : "text-red"}`}>
          {isPositive24h ? "+" : ""}{token.priceChange24h.toFixed(1)}%
        </span>
        <Sparkline data={token.sparkline} width={32} height={14} positive={isPositive24h} />
      </div>

      {/* Volume */}
      <div className="font-mono text-xs text-text-secondary">
        {formatCompact(token.volume24h)}
      </div>

      {/* Liquidity */}
      <div className="font-mono text-xs text-text-secondary">
        {formatCompact(token.liquidity)}
      </div>

      {/* Holders */}
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-xs text-text-secondary">
          {token.holders >= 1000 ? `${(token.holders / 1000).toFixed(0)}K` : token.holders}
        </span>
        <span className={`text-[9px] font-semibold px-1 py-0.5 rounded ${
          token.holderGrade === "A" ? "text-green bg-green/10"
          : token.holderGrade === "B" ? "text-accent bg-accent/10"
          : token.holderGrade === "C" ? "text-amber bg-amber/10"
          : "text-red bg-red/10"
        }`}>
          {token.holderGrade}
        </span>
      </div>

      {/* Rug Risk */}
      <ScoreBadge score={token.rugRisk} type="risk" />

      {/* Momentum */}
      <ScoreBadge score={token.momentum} type="momentum" />

      {/* Trade button */}
      <div className="flex justify-center">
        <button
          onClick={(e) => { e.stopPropagation(); onTrade(); }}
          className="p-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-all"
          title={`Trade ${token.symbol}`}
        >
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
