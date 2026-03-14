"use client";

import React, { useState, useMemo, useCallback } from "react";
import { ArrowUpDown, ArrowRight, Filter, X, Scan, Search, Loader2, RefreshCw, ChevronDown } from "lucide-react";
import type { ScannerToken } from "@/types/scanner";
import type { ScannerFilters as Filters, ScannerPreset } from "@/types/scanner";
import { DEFAULT_FILTERS, SCANNER_PRESETS } from "@/types/scanner";
import { useScanner } from "@/hooks/useScanner";
import ScoreBadge from "@/components/shared/ScoreBadge";
import Sparkline from "@/components/shared/Sparkline";
import ScannerFilters from "./ScannerFilters";
import { formatPrice } from "@/data/tokens";

interface ScannerTableProps {
  onTradeToken: (token: ScannerToken) => void;
}

type SortKey = "momentum" | "rugRisk" | "volume24h" | "priceChange24h" | "liquidity" | "holders" | "price" | "marketCap";

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
  const { tokens: apiTokens, total, loading, loadingMore, hasMore, error, search, setSearch, loadMore, refetch } = useScanner({ limit: 100 });

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [activePreset, setActivePreset] = useState<ScannerPreset | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("momentum");
  const [sortAsc, setSortAsc] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState("");

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

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  }, [searchInput, setSearch]);

  const handleSearchClear = useCallback(() => {
    setSearchInput("");
    setSearch("");
  }, [setSearch]);

  const filteredTokens = useMemo(() => applyFilters(apiTokens, filters), [apiTokens, filters]);

  const sortedTokens = useMemo(() => {
    return [...filteredTokens].sort((a, b) => {
      const aVal = a[sortKey] as number;
      const bVal = b[sortKey] as number;
      return sortAsc ? aVal - bVal : bVal - aVal;
    });
  }, [filteredTokens, sortKey, sortAsc]);

  const SortHeader = ({ label, sortId }: { label: string; sortId: SortKey }) => (
    <button
      onClick={() => handleSort(sortId)}
      className={`flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold transition-colors ${
        sortKey === sortId ? "text-accent" : "text-text-muted hover:text-text-secondary"
      }`}
    >
      {label}
      <ArrowUpDown className="w-2.5 h-2.5" />
    </button>
  );

  return (
    <div className="flex gap-4 animate-fade-in">
      {/* Filters sidebar */}
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
              totalCount={apiTokens.length}
            />
          </div>
        </div>
      )}

      {/* Main table */}
      <div className="flex-1 min-w-0">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Scan className="w-4 h-4 text-accent" />
              <h2 className="text-lg font-bold">Alpha Scanner</h2>
            </div>
            <span className="text-[10px] font-mono text-text-muted bg-bg-card px-2 py-0.5 rounded">
              {loading ? "..." : `${filteredTokens.length} of ${total.toLocaleString()}`} tokens
            </span>
            <button
              onClick={refetch}
              disabled={loading}
              className="text-text-muted hover:text-accent transition-colors disabled:opacity-30"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search */}
            <form onSubmit={handleSearch} className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
              <input
                type="text"
                placeholder="Search any token, symbol, or mint..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-8 pr-8 py-1.5 rounded-lg bg-bg-input border border-border text-xs focus:outline-none focus:border-border-focus transition-colors"
              />
              {searchInput && (
                <button type="button" onClick={handleSearchClear} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  <X className="w-3 h-3 text-text-muted hover:text-text-secondary" />
                </button>
              )}
            </form>

            {/* Quick presets */}
            <div className="hidden md:flex gap-1">
              {(["blue_chips", "early_alpha", "trending_now"] as ScannerPreset[]).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePreset(p)}
                  className={`px-2.5 py-1.5 rounded-md text-[10px] font-medium transition-all whitespace-nowrap ${
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
          <div className="grid grid-cols-[1fr_85px_75px_80px_80px_90px_60px_60px_44px] gap-2 px-4 py-2.5 border-b border-border bg-bg-secondary/50">
            <div className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">Token</div>
            <SortHeader label="Price" sortId="price" />
            <SortHeader label="24h" sortId="priceChange24h" />
            <SortHeader label="Volume" sortId="volume24h" />
            <SortHeader label="MCap" sortId="marketCap" />
            <SortHeader label="Holders" sortId="holders" />
            <SortHeader label="Risk" sortId="rugRisk" />
            <SortHeader label="Mom" sortId="momentum" />
            <div />
          </div>

          {/* Loading state */}
          {loading && (
            <div className="py-16 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-accent mx-auto mb-3" />
              <div className="text-sm text-text-secondary font-medium">Scanning Solana tokens...</div>
              <div className="text-[10px] text-text-muted mt-1">Fetching from Jupiter + computing risk scores</div>
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="py-12 text-center">
              <div className="text-sm text-red font-medium mb-2">Scanner Error</div>
              <div className="text-xs text-text-muted mb-4">{error}</div>
              <button onClick={refetch} className="px-4 py-1.5 rounded-lg bg-accent/15 text-accent text-xs font-medium hover:bg-accent/25 transition-colors">
                Retry
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && sortedTokens.length === 0 && (
            <div className="py-12 text-center text-text-muted">
              <Filter className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <div className="text-sm font-medium">No tokens match your filters</div>
              <div className="text-xs mt-1">
                {search ? `No results for "${search}". ` : ""}
                Try adjusting your risk tier or liquidity minimum
              </div>
            </div>
          )}

          {/* Token rows */}
          {!loading && !error && sortedTokens.length > 0 && (
            <div>
              {sortedTokens.map((token) => (
                <TokenRow key={token.mint} token={token} onTrade={() => onTradeToken(token)} />
              ))}
            </div>
          )}

          {/* Load more */}
          {hasMore && !loading && (
            <div className="py-3 text-center border-t border-border/50">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-bg-card hover:bg-bg-card-hover text-xs font-medium text-text-secondary transition-colors disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" /> Loading more...
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" /> Load more tokens
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Data source info */}
        <div className="mt-2 flex items-center justify-between text-[10px] text-text-muted">
          <span>Data: Jupiter Verified Token List + Jupiter Price API</span>
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
            Auto-refresh 30s
          </span>
        </div>
      </div>
    </div>
  );
}

function TokenRow({ token, onTrade }: { token: ScannerToken; onTrade: () => void }) {
  const isPositive24h = token.priceChange24h >= 0;

  return (
    <div className="scanner-row grid grid-cols-[1fr_85px_75px_80px_80px_90px_60px_60px_44px] gap-2 px-4 py-2.5 border-b border-border/50 items-center">
      {/* Token */}
      <div className="flex items-center gap-2.5 min-w-0">
        <img
          src={token.logoURI}
          alt={token.symbol}
          className="w-7 h-7 rounded-full bg-bg-input shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect fill="%238B5CF6" width="40" height="40" rx="20"/><text x="50%" y="55%" text-anchor="middle" fill="white" font-size="14" font-family="sans-serif" dominant-baseline="middle">${encodeURIComponent(token.symbol[0])}</text></svg>`;
          }}
        />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm">{token.symbol}</span>
            <span className="text-[9px] text-text-muted font-mono">{token.age}</span>
          </div>
          <div className="text-[10px] text-text-muted truncate max-w-[140px]">{token.name}</div>
        </div>
      </div>

      {/* Price */}
      <div className="font-mono text-xs font-medium">${formatPrice(token.price)}</div>

      {/* 24h Change + sparkline */}
      <div className="flex items-center gap-1">
        <span className={`font-mono text-[11px] font-medium ${isPositive24h ? "text-green" : "text-red"}`}>
          {isPositive24h ? "+" : ""}{token.priceChange24h.toFixed(1)}%
        </span>
        <Sparkline data={token.sparkline} width={28} height={12} positive={isPositive24h} />
      </div>

      {/* Volume */}
      <div className="font-mono text-[11px] text-text-secondary">{formatCompact(token.volume24h)}</div>

      {/* Market Cap */}
      <div className="font-mono text-[11px] text-text-secondary">{formatCompact(token.marketCap)}</div>

      {/* Holders */}
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-[11px] text-text-secondary">
          {token.holders >= 1_000_000 ? `${(token.holders / 1_000_000).toFixed(1)}M`
            : token.holders >= 1000 ? `${(token.holders / 1000).toFixed(0)}K`
            : token.holders}
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
