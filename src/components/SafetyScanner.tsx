"use client";

import React, { useState, useCallback, forwardRef, useImperativeHandle } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Search,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Copy,
  ExternalLink,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useSafetyScanner } from "@/hooks/useSafetyScanner";
import type { SafetyCheck, TopHolder } from "@/types/safety";

export interface SafetyScannerRef {
  scanMint: (mint: string) => void;
}

// Well-known tokens for quick scan
const QUICK_SCAN_TOKENS = [
  { symbol: "SOL", mint: "So11111111111111111111111111111111111111112" },
  { symbol: "USDC", mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" },
  { symbol: "JUP", mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN" },
  { symbol: "BONK", mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" },
];

function VerdictBadge({ verdict, score }: { verdict: string; score: number }) {
  const config = {
    safe: { icon: ShieldCheck, color: "text-green", bg: "bg-green/10 border-green/20", label: "Safe" },
    caution: { icon: ShieldAlert, color: "text-amber", bg: "bg-amber/10 border-amber/20", label: "Caution" },
    warning: { icon: ShieldAlert, color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/20", label: "Warning" },
    danger: { icon: ShieldX, color: "text-red", bg: "bg-red/10 border-red/20", label: "Danger" },
  }[verdict] ?? { icon: Shield, color: "text-text-muted", bg: "bg-bg-card", label: "Unknown" };

  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${config.bg}`}>
      <Icon className={`w-8 h-8 ${config.color}`} />
      <div>
        <div className={`text-lg font-bold ${config.color}`}>{score}/100</div>
        <div className={`text-xs font-medium ${config.color}`}>{config.label}</div>
      </div>
    </div>
  );
}

function CheckRow({ check }: { check: SafetyCheck }) {
  const icons = {
    pass: <CheckCircle2 className="w-4 h-4 text-green shrink-0" />,
    warn: <AlertTriangle className="w-4 h-4 text-amber shrink-0" />,
    fail: <XCircle className="w-4 h-4 text-red shrink-0" />,
    info: <Info className="w-4 h-4 text-text-muted shrink-0" />,
  };

  return (
    <div className="flex items-start gap-2.5 py-2.5 border-b border-border/50 last:border-0">
      {icons[check.status]}
      <div className="min-w-0 flex-1">
        <div className="text-xs font-semibold text-text-primary">{check.label}</div>
        <div className="text-[11px] text-text-secondary mt-0.5">{check.description}</div>
        {check.details && (
          <div className="text-[10px] text-text-muted mt-0.5 font-mono break-all">
            {check.details}
          </div>
        )}
      </div>
    </div>
  );
}

function HolderRow({ holder, index }: { holder: TopHolder; index: number }) {
  const shortAddr = `${holder.address.slice(0, 4)}...${holder.address.slice(-4)}`;

  return (
    <div className="flex items-center justify-between py-1.5 text-[11px]">
      <div className="flex items-center gap-2">
        <span className="text-text-muted w-4 text-right">{index + 1}</span>
        <span className="font-mono text-text-secondary">{shortAddr}</span>
        {holder.label && (
          <span className="px-1.5 py-0.5 rounded bg-accent/10 text-accent text-[9px] font-medium">
            {holder.label}
          </span>
        )}
      </div>
      <div className="font-medium text-text-primary">
        {holder.pct.toFixed(1)}%
      </div>
    </div>
  );
}

const SafetyScanner = forwardRef<SafetyScannerRef>(function SafetyScanner(_props, ref) {
  const [input, setInput] = useState("");
  const [showHolders, setShowHolders] = useState(false);
  const { result, loading, error, cached, scan, reset } = useSafetyScanner();

  useImperativeHandle(ref, () => ({
    scanMint: (mint: string) => {
      setInput(mint);
      scan(mint);
    },
  }), [scan]);

  const handleScan = useCallback(() => {
    const mint = input.trim();
    if (mint) scan(mint);
  }, [input, scan]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleScan();
    },
    [handleScan]
  );

  const handleQuickScan = useCallback(
    (mint: string) => {
      setInput(mint);
      scan(mint);
    },
    [scan]
  );

  const handleReset = useCallback(() => {
    setInput("");
    setShowHolders(false);
    reset();
  }, [reset]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-2">
          <Shield className="w-6 h-6 text-accent" />
          <h2 className="text-xl font-bold">Safety Scanner</h2>
        </div>
        <p className="text-text-secondary text-xs">
          Independent on-chain analysis. Paste any Solana token mint to scan.
        </p>
      </div>

      {/* Search Input */}
      <div className="bg-bg-card rounded-xl border border-border p-4 mb-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste token mint address..."
              className="w-full bg-bg-primary rounded-lg border border-border pl-9 pr-3 py-2.5 text-xs font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
              disabled={loading}
            />
          </div>
          <button
            onClick={handleScan}
            disabled={loading || !input.trim()}
            className="px-5 py-2.5 rounded-lg text-xs font-semibold text-white swap-button-gradient disabled:opacity-40 disabled:cursor-not-allowed transition-opacity flex items-center gap-1.5"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Shield className="w-3.5 h-3.5" />
                Scan
              </>
            )}
          </button>
        </div>

        {/* Quick scan buttons */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[10px] text-text-muted">Quick scan:</span>
          {QUICK_SCAN_TOKENS.map((token) => (
            <button
              key={token.symbol}
              onClick={() => handleQuickScan(token.mint)}
              disabled={loading}
              className="px-2 py-1 rounded-md bg-bg-primary border border-border text-[10px] font-medium text-text-secondary hover:text-accent hover:border-accent/30 transition-colors disabled:opacity-40"
            >
              {token.symbol}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-bg-card rounded-xl border border-border p-8 text-center">
          <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-text-primary">Scanning on-chain data...</p>
          <p className="text-[11px] text-text-secondary mt-1">
            Checking mint authority, holders, liquidity, metadata
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red/5 rounded-xl border border-red/20 p-4">
          <div className="flex items-start gap-2">
            <XCircle className="w-4 h-4 text-red shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red">Scan Failed</p>
              <p className="text-xs text-text-secondary mt-0.5">{error}</p>
              <button
                onClick={handleReset}
                className="text-xs text-accent hover:underline mt-2 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-4">
          {/* Token Info + Verdict */}
          <div className="bg-bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-text-primary">
                  {result.name}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-text-secondary font-medium">
                    {result.symbol}
                  </span>
                  <button
                    onClick={() => copyToClipboard(result.mint)}
                    className="flex items-center gap-1 text-[10px] font-mono text-text-muted hover:text-accent transition-colors"
                  >
                    {result.mint.slice(0, 8)}...{result.mint.slice(-4)}
                    <Copy className="w-2.5 h-2.5" />
                  </button>
                  <a
                    href={`https://solscan.io/token/${result.mint}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-muted hover:text-accent transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <VerdictBadge verdict={result.verdict} score={result.overallScore} />
            </div>

            {/* Supply info */}
            <div className="flex items-center gap-4 text-[11px] text-text-secondary">
              <span>
                Supply: <span className="font-medium text-text-primary">{formatNumber(result.supply.total)}</span>
              </span>
              <span>
                Decimals: <span className="font-medium text-text-primary">{result.supply.decimals}</span>
              </span>
              {cached && (
                <span className="px-1.5 py-0.5 rounded bg-accent/10 text-accent text-[9px]">
                  cached
                </span>
              )}
              <span className="ml-auto text-text-muted">
                Scanned {new Date(result.scannedAt).toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* Safety Checks */}
          <div className="bg-bg-card rounded-xl border border-border p-4">
            <h4 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-accent" />
              Safety Checks
            </h4>
            <div className="divide-y divide-border/30">
              {result.checks.map((check) => (
                <CheckRow key={check.id} check={check} />
              ))}
            </div>

            {/* Summary bar */}
            <div className="mt-3 flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1 text-green">
                <CheckCircle2 className="w-3 h-3" />
                {result.checks.filter((c) => c.status === "pass").length} passed
              </span>
              <span className="flex items-center gap-1 text-amber">
                <AlertTriangle className="w-3 h-3" />
                {result.checks.filter((c) => c.status === "warn").length} warnings
              </span>
              <span className="flex items-center gap-1 text-red">
                <XCircle className="w-3 h-3" />
                {result.checks.filter((c) => c.status === "fail").length} failed
              </span>
            </div>
          </div>

          {/* Top Holders */}
          <div className="bg-bg-card rounded-xl border border-border p-4">
            <button
              onClick={() => setShowHolders(!showHolders)}
              className="w-full flex items-center justify-between"
            >
              <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <Shield className="w-4 h-4 text-accent" />
                Top Holders
                <span className="text-[10px] font-normal text-text-secondary">
                  ({result.holders.concentration})
                </span>
              </h4>
              {showHolders ? (
                <ChevronUp className="w-4 h-4 text-text-muted" />
              ) : (
                <ChevronDown className="w-4 h-4 text-text-muted" />
              )}
            </button>

            {showHolders && (
              <div className="mt-3">
                {/* Concentration bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-[10px] text-text-secondary mb-1">
                    <span>Top 10: {result.holders.top10Pct.toFixed(1)}%</span>
                    <span>Top 20: {result.holders.top20Pct.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-bg-primary overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        result.holders.top10Pct > 60
                          ? "bg-red"
                          : result.holders.top10Pct > 30
                            ? "bg-amber"
                            : "bg-green"
                      }`}
                      style={{ width: `${Math.min(100, result.holders.top10Pct)}%` }}
                    />
                  </div>
                </div>

                {/* Holder list */}
                {result.holders.topHolders.map((holder, i) => (
                  <HolderRow key={holder.address} holder={holder} index={i} />
                ))}
              </div>
            )}
          </div>

          {/* Rescan button */}
          <div className="text-center">
            <button
              onClick={handleReset}
              className="text-xs text-text-secondary hover:text-accent transition-colors flex items-center gap-1 mx-auto"
            >
              <RefreshCw className="w-3 h-3" />
              Scan another token
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default SafetyScanner;

function formatNumber(n: number): string {
  if (n >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
  return n.toFixed(2);
}
