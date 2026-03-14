"use client";

import React from "react";
import { Filter, RotateCcw } from "lucide-react";
import type { ScannerFilters as Filters, ScannerPreset } from "@/types/scanner";
import { SCANNER_PRESETS, DEFAULT_FILTERS } from "@/types/scanner";

interface ScannerFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  activePreset: ScannerPreset | null;
  onPreset: (preset: ScannerPreset) => void;
  tokenCount: number;
  totalCount: number;
}

export default function ScannerFilters({
  filters,
  onChange,
  activePreset,
  onPreset,
  tokenCount,
  totalCount,
}: ScannerFiltersProps) {
  const update = (partial: Partial<Filters>) => onChange({ ...filters, ...partial });

  return (
    <div className="space-y-4">
      {/* Presets */}
      <div>
        <div className="text-[10px] uppercase tracking-wider text-text-muted mb-2 font-semibold">
          Presets
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {(Object.entries(SCANNER_PRESETS) as [ScannerPreset, typeof SCANNER_PRESETS[ScannerPreset]][])
            .filter(([key]) => key !== "custom")
            .map(([key, preset]) => (
              <button
                key={key}
                onClick={() => onPreset(key)}
                className={`px-2.5 py-2 rounded-lg text-left transition-all ${
                  activePreset === key
                    ? "bg-accent/15 border border-accent/30 text-accent"
                    : "bg-bg-input border border-border text-text-secondary hover:border-border-focus/30 hover:text-text-primary"
                }`}
              >
                <div className="text-xs font-medium">{preset.label}</div>
                <div className="text-[9px] text-text-muted mt-0.5 leading-tight">{preset.description}</div>
              </button>
            ))}
        </div>
      </div>

      {/* Risk Tier */}
      <div>
        <div className="text-[10px] uppercase tracking-wider text-text-muted mb-2 font-semibold">
          Risk Tier
        </div>
        <div className="flex gap-1">
          {([
            { id: "all", label: "All" },
            { id: "safe", label: "Safe" },
            { id: "moderate", label: "Mod" },
            { id: "degen", label: "Degen" },
          ] as const).map((tier) => (
            <button
              key={tier.id}
              onClick={() => update({ riskTier: tier.id })}
              className={`flex-1 py-1.5 rounded-md text-[10px] font-medium transition-all ${
                filters.riskTier === tier.id
                  ? tier.id === "safe" ? "bg-green/15 text-green border border-green/20"
                  : tier.id === "moderate" ? "bg-amber/15 text-amber border border-amber/20"
                  : tier.id === "degen" ? "bg-red/15 text-red border border-red/20"
                  : "bg-accent/15 text-accent border border-accent/20"
                  : "bg-bg-input text-text-muted border border-border hover:text-text-secondary"
              }`}
            >
              {tier.label}
            </button>
          ))}
        </div>
      </div>

      {/* Min Liquidity */}
      <div>
        <div className="text-[10px] uppercase tracking-wider text-text-muted mb-2 font-semibold">
          Min Liquidity
        </div>
        <div className="flex gap-1 flex-wrap">
          {[
            { val: 0, label: "Any" },
            { val: 10_000, label: "$10K" },
            { val: 50_000, label: "$50K" },
            { val: 100_000, label: "$100K" },
            { val: 500_000, label: "$500K" },
          ].map((opt) => (
            <button
              key={opt.val}
              onClick={() => update({ minLiquidity: opt.val })}
              className={`px-2.5 py-1.5 rounded-md text-[10px] font-medium transition-all ${
                filters.minLiquidity === opt.val
                  ? "bg-accent/15 text-accent border border-accent/20"
                  : "bg-bg-input text-text-muted border border-border hover:text-text-secondary"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Min Holders */}
      <div>
        <div className="text-[10px] uppercase tracking-wider text-text-muted mb-2 font-semibold">
          Min Holders
        </div>
        <div className="flex gap-1 flex-wrap">
          {[
            { val: 0, label: "Any" },
            { val: 100, label: "100+" },
            { val: 500, label: "500+" },
            { val: 1000, label: "1K+" },
            { val: 5000, label: "5K+" },
          ].map((opt) => (
            <button
              key={opt.val}
              onClick={() => update({ minHolders: opt.val })}
              className={`px-2.5 py-1.5 rounded-md text-[10px] font-medium transition-all ${
                filters.minHolders === opt.val
                  ? "bg-accent/15 text-accent border border-accent/20"
                  : "bg-bg-input text-text-muted border border-border hover:text-text-secondary"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Token Age */}
      <div>
        <div className="text-[10px] uppercase tracking-wider text-text-muted mb-2 font-semibold">
          Token Age
        </div>
        <div className="flex gap-1 flex-wrap">
          {[
            { val: null, label: "All" },
            { val: 1, label: "< 1h" },
            { val: 24, label: "< 24h" },
            { val: 168, label: "< 7d" },
          ].map((opt) => (
            <button
              key={String(opt.val)}
              onClick={() => update({ maxAge: opt.val })}
              className={`px-2.5 py-1.5 rounded-md text-[10px] font-medium transition-all ${
                filters.maxAge === opt.val
                  ? "bg-accent/15 text-accent border border-accent/20"
                  : "bg-bg-input text-text-muted border border-border hover:text-text-secondary"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div>
        <div className="text-[10px] uppercase tracking-wider text-text-muted mb-2 font-semibold">
          Safety
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.hideHoneypots}
              onChange={(e) => update({ hideHoneypots: e.target.checked })}
              className="accent-accent w-3.5 h-3.5"
            />
            <span className="text-xs text-text-secondary">Hide honeypots</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.hideFrozenMint}
              onChange={(e) => update({ hideFrozenMint: e.target.checked })}
              className="accent-accent w-3.5 h-3.5"
            />
            <span className="text-xs text-text-secondary">Hide frozen mint</span>
          </label>
        </div>
      </div>

      {/* Result count + reset */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="text-[10px] text-text-muted">
          <span className="font-mono text-text-secondary">{tokenCount}</span> / {totalCount} tokens
        </div>
        <button
          onClick={() => onChange(DEFAULT_FILTERS)}
          className="flex items-center gap-1 text-[10px] text-text-muted hover:text-accent transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>
    </div>
  );
}
