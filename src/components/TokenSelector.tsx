"use client";

import React, { useState } from "react";
import { Search, X } from "lucide-react";
import { Token, TOKENS, formatPrice } from "@/data/tokens";

interface TokenSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (token: Token) => void;
  excludeToken?: Token;
  getPrice: (symbol: string) => number;
  getChange: (symbol: string) => number;
}

export default function TokenSelector({ isOpen, onClose, onSelect, excludeToken, getPrice, getChange }: TokenSelectorProps) {
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  const filtered = TOKENS.filter(
    (t) =>
      t.symbol !== excludeToken?.symbol &&
      (t.symbol.toLowerCase().includes(search.toLowerCase()) ||
        t.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card rounded-2xl w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold">Select Token</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-bg-card-hover transition-colors">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search by name or symbol"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-bg-input border border-border rounded-xl text-sm focus:outline-none focus:border-border-focus transition-colors"
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto px-2 pb-4">
          {filtered.map((token) => {
            const price = getPrice(token.symbol);
            const change = getChange(token.symbol);
            return (
              <button
                key={token.symbol}
                onClick={() => { onSelect(token); onClose(); setSearch(""); }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-bg-card-hover transition-colors"
              >
                <img
                  src={token.logoURI}
                  alt={token.symbol}
                  className="w-8 h-8 rounded-full bg-bg-input"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect fill="%236366f1" width="40" height="40" rx="20"/><text x="50%" y="55%" text-anchor="middle" fill="white" font-size="14" font-family="sans-serif" dominant-baseline="middle">${token.symbol[0]}</text></svg>`;
                  }}
                />
                <div className="flex-1 text-left">
                  <div className="font-medium text-sm">{token.symbol}</div>
                  <div className="text-xs text-text-muted">{token.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">${formatPrice(price)}</div>
                  <div className={`text-xs ${change >= 0 ? "text-green" : "text-red"}`}>
                    {change >= 0 ? "+" : ""}{change.toFixed(2)}%
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
