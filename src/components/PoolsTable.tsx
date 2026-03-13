"use client";

import React, { useState } from "react";
import { TrendingUp, Droplets, Plus, ExternalLink, Search } from "lucide-react";
import { POOLS, formatNumber } from "@/data/tokens";

export default function PoolsTable() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"tvl" | "volume24h" | "apr">("tvl");

  const filtered = POOLS.filter(
    (p) =>
      p.tokenA.symbol.toLowerCase().includes(search.toLowerCase()) ||
      p.tokenB.symbol.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => b[sortBy] - a[sortBy]);

  const totalTVL = POOLS.reduce((sum, p) => sum + p.tvl, 0);
  const totalVolume = POOLS.reduce((sum, p) => sum + p.volume24h, 0);

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="glass-card rounded-xl p-4">
          <div className="text-xs text-text-muted mb-1">Total Value Locked</div>
          <div className="text-2xl font-bold gradient-text">{formatNumber(totalTVL)}</div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="text-xs text-text-muted mb-1">24h Volume</div>
          <div className="text-2xl font-bold text-text-primary">{formatNumber(totalVolume)}</div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="text-xs text-text-muted mb-1">Active Pools</div>
          <div className="text-2xl font-bold text-text-primary">{POOLS.length}</div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h2 className="text-xl font-bold">Liquidity Pools</h2>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search pools..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-56 pl-9 pr-4 py-2 bg-bg-input border border-border rounded-xl text-sm focus:outline-none focus:border-border-focus transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl swap-button-gradient text-white text-sm font-medium hover:opacity-90 transition-opacity shrink-0">
            <Plus className="w-4 h-4" />
            New Position
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs text-text-muted font-medium px-5 py-3">Pool</th>
                <th
                  className="text-right text-xs text-text-muted font-medium px-5 py-3 cursor-pointer hover:text-text-primary transition-colors"
                  onClick={() => setSortBy("tvl")}
                >
                  TVL {sortBy === "tvl" && <TrendingUp className="w-3 h-3 inline ml-1" />}
                </th>
                <th
                  className="text-right text-xs text-text-muted font-medium px-5 py-3 cursor-pointer hover:text-text-primary transition-colors"
                  onClick={() => setSortBy("volume24h")}
                >
                  24h Volume {sortBy === "volume24h" && <TrendingUp className="w-3 h-3 inline ml-1" />}
                </th>
                <th
                  className="text-right text-xs text-text-muted font-medium px-5 py-3 cursor-pointer hover:text-text-primary transition-colors"
                  onClick={() => setSortBy("apr")}
                >
                  APR {sortBy === "apr" && <TrendingUp className="w-3 h-3 inline ml-1" />}
                </th>
                <th className="text-right text-xs text-text-muted font-medium px-5 py-3">Fee</th>
                <th className="text-right text-xs text-text-muted font-medium px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((pool) => (
                <tr
                  key={pool.id}
                  className="border-b border-border/50 hover:bg-bg-card-hover/50 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        <img
                          src={pool.tokenA.logoURI}
                          alt={pool.tokenA.symbol}
                          className="w-7 h-7 rounded-full border-2 border-bg-card bg-bg-input"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect fill="%236366f1" width="40" height="40" rx="20"/><text x="50%" y="55%" text-anchor="middle" fill="white" font-size="12" font-family="sans-serif" dominant-baseline="middle">${pool.tokenA.symbol[0]}</text></svg>`;
                          }}
                        />
                        <img
                          src={pool.tokenB.logoURI}
                          alt={pool.tokenB.symbol}
                          className="w-7 h-7 rounded-full border-2 border-bg-card bg-bg-input"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect fill="%238b5cf6" width="40" height="40" rx="20"/><text x="50%" y="55%" text-anchor="middle" fill="white" font-size="12" font-family="sans-serif" dominant-baseline="middle">${pool.tokenB.symbol[0]}</text></svg>`;
                          }}
                        />
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {pool.tokenA.symbol}/{pool.tokenB.symbol}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right text-sm font-medium">
                    {formatNumber(pool.tvl)}
                  </td>
                  <td className="px-5 py-4 text-right text-sm text-text-secondary">
                    {formatNumber(pool.volume24h)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="text-sm font-semibold text-green">{pool.apr.toFixed(1)}%</span>
                  </td>
                  <td className="px-5 py-4 text-right text-sm text-text-muted">{pool.fee}%</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-medium hover:bg-accent/20 transition-colors">
                        <Droplets className="w-3 h-3 inline mr-1" />
                        Add
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-bg-card-hover transition-colors text-text-muted">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
