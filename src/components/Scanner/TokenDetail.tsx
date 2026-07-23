"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  X,
  ExternalLink,
  Copy,
  Check,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Users,
  Droplets,
  Lock,
  Unlock,
  Snowflake,
  Activity,
  BarChart3,
  Clock,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import type { ScannerToken } from "@/types/scanner";
import ScoreBadge from "@/components/shared/ScoreBadge";
import { formatPrice } from "@/data/tokens";

interface TokenDetailProps {
  token: ScannerToken;
  onClose: () => void;
  onTrade: (token: ScannerToken) => void;
  onSafetyScan: (mint: string) => void;
}

function formatCompact(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function PriceChart({ data, width, height }: { data: number[]; width: number; height: number }) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 4;

  const points = data
    .map((val, i) => {
      const x = padding + (i / (data.length - 1)) * (width - padding * 2);
      const y = padding + (height - padding * 2) - ((val - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const isPositive = data[data.length - 1] >= data[0];
  const color = isPositive ? "#22C55E" : "#EF4444";

  const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

  const gridLines = [0.25, 0.5, 0.75].map((pct) => {
    const y = padding + (height - padding * 2) * (1 - pct);
    const value = min + range * pct;
    return { y, value };
  });

  return (
    <svg width={width} height={height} className="w-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      {gridLines.map((line, i) => (
        <line
          key={i}
          x1={0}
          y1={line.y}
          x2={width}
          y2={line.y}
          stroke="rgba(30, 30, 46, 0.8)"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
      ))}
      <polygon
        points={areaPoints}
        fill={`url(#chartGradient-${isPositive ? "up" : "down"})`}
        opacity={0.3}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="chartGradient-up" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22C55E" stopOpacity={0.4} />
          <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="chartGradient-down" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EF4444" stopOpacity={0.4} />
          <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
        </linearGradient>
      </defs>
    </svg>
  );
}

function RiskMeter({ score, label }: { score: number; label: string }) {
  const getColor = () => {
    if (score <= 30) return { bar: "bg-green", text: "text-green", label: "Low Risk" };
    if (score <= 60) return { bar: "bg-amber", text: "text-amber", label: "Moderate" };
    return { bar: "bg-red", text: "text-red", label: "High Risk" };
  };
  const colors = getColor();

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-text-muted">{label}</span>
        <span className={`text-xs font-mono font-bold ${colors.text}`}>{score}/100</span>
      </div>
      <div className="h-1.5 rounded-full bg-bg-primary overflow-hidden">
        <div
          className={`h-full rounded-full ${colors.bar} transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
      <div className={`text-[9px] mt-0.5 ${colors.text}`}>{colors.label}</div>
    </div>
  );
}

export default function TokenDetail({ token, onClose, onTrade, onSafetyScan }: TokenDetailProps) {
  const [copied, setCopied] = useState(false);

  const copyMint = useCallback(() => {
    navigator.clipboard.writeText(token.mint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [token.mint]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const isPositive24h = token.priceChange24h >= 0;
  const isPositive1h = token.priceChange1h >= 0;
  const isPositive4h = token.priceChange4h >= 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-12 pb-8 px-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl bg-bg-primary border border-border rounded-2xl shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <img
              src={token.logoURI}
              alt={token.symbol}
              className="w-10 h-10 rounded-full bg-bg-input"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect fill="%238B5CF6" width="40" height="40" rx="20"/><text x="50%" y="55%" text-anchor="middle" fill="white" font-size="14" font-family="sans-serif" dominant-baseline="middle">${encodeURIComponent(token.symbol[0])}</text></svg>`;
              }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">{token.symbol}</h2>
                <span className="text-xs text-text-muted font-mono bg-bg-card px-1.5 py-0.5 rounded">
                  {token.age}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-text-secondary">{token.name}</span>
                <button
                  onClick={copyMint}
                  className="flex items-center gap-1 text-[10px] font-mono text-text-muted hover:text-accent transition-colors"
                >
                  {token.mint.slice(0, 6)}...{token.mint.slice(-4)}
                  {copied ? <Check className="w-2.5 h-2.5 text-green" /> : <Copy className="w-2.5 h-2.5" />}
                </button>
                <a
                  href={`https://solscan.io/token/${token.mint}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-muted hover:text-accent transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-bg-card text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Price + Chart Row */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-5">
            {/* Price Stats */}
            <div className="space-y-4">
              <div>
                <div className="text-3xl font-bold font-mono">${formatPrice(token.price)}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`flex items-center gap-1 text-sm font-medium ${isPositive24h ? "text-green" : "text-red"}`}>
                    {isPositive24h ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {isPositive24h ? "+" : ""}{token.priceChange24h.toFixed(2)}%
                  </span>
                  <span className="text-xs text-text-muted">24h</span>
                </div>
              </div>

              {/* Time-frame changes */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-bg-card rounded-lg p-2.5 text-center">
                  <div className="text-[10px] text-text-muted mb-1">1H</div>
                  <div className={`text-xs font-mono font-semibold ${isPositive1h ? "text-green" : "text-red"}`}>
                    {isPositive1h ? "+" : ""}{token.priceChange1h.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-bg-card rounded-lg p-2.5 text-center">
                  <div className="text-[10px] text-text-muted mb-1">4H</div>
                  <div className={`text-xs font-mono font-semibold ${isPositive4h ? "text-green" : "text-red"}`}>
                    {isPositive4h ? "+" : ""}{token.priceChange4h.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-bg-card rounded-lg p-2.5 text-center">
                  <div className="text-[10px] text-text-muted mb-1">24H</div>
                  <div className={`text-xs font-mono font-semibold ${isPositive24h ? "text-green" : "text-red"}`}>
                    {isPositive24h ? "+" : ""}{token.priceChange24h.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Price Chart */}
            <div className="bg-bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">24h Price</span>
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${isPositive24h ? "bg-green" : "bg-red"} animate-pulse`} />
                  <span className="text-[10px] text-text-muted font-mono">Live</span>
                </div>
              </div>
              <div className="h-[140px]">
                <PriceChart data={token.sparkline} width={400} height={140} />
              </div>
            </div>
          </div>

          {/* Market Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatBox
              icon={<BarChart3 className="w-3.5 h-3.5" />}
              label="Market Cap"
              value={formatCompact(token.marketCap)}
            />
            <StatBox
              icon={<Activity className="w-3.5 h-3.5" />}
              label="24h Volume"
              value={formatCompact(token.volume24h)}
            />
            <StatBox
              icon={<Droplets className="w-3.5 h-3.5" />}
              label="Liquidity"
              value={formatCompact(token.liquidity)}
            />
            <StatBox
              icon={<Users className="w-3.5 h-3.5" />}
              label="Holders"
              value={token.holders >= 1_000_000 ? `${(token.holders / 1_000_000).toFixed(1)}M`
                : token.holders >= 1000 ? `${(token.holders / 1000).toFixed(1)}K`
                : token.holders.toString()}
              badge={token.holderGrade}
            />
          </div>

          {/* Risk + Momentum Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Risk Panel */}
            <div className="bg-bg-card rounded-xl border border-border p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-accent" />
                Risk Analysis
              </h3>
              <RiskMeter score={token.rugRisk} label="Rug Risk Score" />

              <div className="mt-4 space-y-2">
                <RiskFactor
                  label="Mint Authority"
                  passed={token.mintAuthorityRevoked}
                  passText="Revoked"
                  failText="Active"
                  icon={token.mintAuthorityRevoked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                />
                <RiskFactor
                  label="Freeze Authority"
                  passed={token.freezeAuthorityDisabled}
                  passText="Disabled"
                  failText="Active"
                  icon={<Snowflake className="w-3 h-3" />}
                />
                <RiskFactor
                  label="LP Status"
                  passed={token.lpLocked}
                  passText="Locked"
                  failText="Unlocked"
                  icon={token.lpLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                />
                <RiskFactor
                  label="Honeypot Check"
                  passed={!token.isHoneypot}
                  passText="Clear"
                  failText="Detected"
                  icon={token.isHoneypot ? <AlertTriangle className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                />
              </div>

              <div className="mt-3 pt-3 border-t border-border/50">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-text-muted">Top 10 Holders</span>
                  <span className={`font-mono font-medium ${
                    token.top10HolderPct > 60 ? "text-red" :
                    token.top10HolderPct > 30 ? "text-amber" : "text-green"
                  }`}>
                    {token.top10HolderPct.toFixed(1)}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-bg-primary overflow-hidden mt-1">
                  <div
                    className={`h-full rounded-full transition-all ${
                      token.top10HolderPct > 60 ? "bg-red" :
                      token.top10HolderPct > 30 ? "bg-amber" : "bg-green"
                    }`}
                    style={{ width: `${Math.min(100, token.top10HolderPct)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Momentum Panel */}
            <div className="bg-bg-card rounded-xl border border-border p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-accent" />
                Momentum Analysis
              </h3>
              <RiskMeter score={token.momentum} label="Momentum Score" />

              <div className="mt-4 space-y-3">
                <MomentumStat label="Volume / MCap" value={
                  token.marketCap > 0 ? `${((token.volume24h / token.marketCap) * 100).toFixed(1)}%` : "N/A"
                } good={token.marketCap > 0 && (token.volume24h / token.marketCap) > 0.1} />
                <MomentumStat label="Vol Change (1h)" value={
                  `${token.volumeChange1h >= 0 ? "+" : ""}${token.volumeChange1h.toFixed(0)}%`
                } good={token.volumeChange1h > 0} />
                <MomentumStat label="Price Trend" value={
                  token.priceChange1h > 0 && token.priceChange4h > 0 ? "Strong Uptrend" :
                  token.priceChange1h > 0 ? "Short-term Up" :
                  token.priceChange1h < 0 && token.priceChange4h < 0 ? "Downtrend" :
                  "Consolidating"
                } good={token.priceChange1h > 0 && token.priceChange4h > 0} />
                <MomentumStat label="Holder Grade" value={token.holderGrade} good={token.holderGrade === "A" || token.holderGrade === "B"} />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => onTrade(token)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl swap-button-gradient text-white font-semibold text-sm hover:opacity-90 active:scale-[0.99] transition-all"
            >
              <ArrowRight className="w-4 h-4" />
              Trade {token.symbol}
            </button>
            <button
              onClick={() => onSafetyScan(token.mint)}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-accent/30 text-accent text-sm font-medium hover:bg-accent/10 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              Deep Scan
            </button>
            <a
              href={`https://solscan.io/token/${token.mint}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-border text-text-secondary text-sm font-medium hover:bg-bg-card transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Explorer
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon, label, value, badge }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  badge?: string;
}) {
  return (
    <div className="bg-bg-card rounded-xl border border-border p-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-text-muted">{icon}</span>
        <span className="text-[10px] text-text-muted uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold font-mono">{value}</span>
        {badge && (
          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
            badge === "A" ? "text-green bg-green/10"
            : badge === "B" ? "text-accent bg-accent/10"
            : badge === "C" ? "text-amber bg-amber/10"
            : "text-red bg-red/10"
          }`}>
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}

function RiskFactor({ label, passed, passText, failText, icon }: {
  label: string;
  passed: boolean;
  passText: string;
  failText: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2 text-[11px] text-text-secondary">
        <span className={passed ? "text-green" : "text-red"}>{icon}</span>
        {label}
      </div>
      <span className={`text-[11px] font-medium ${passed ? "text-green" : "text-red"}`}>
        {passed ? passText : failText}
      </span>
    </div>
  );
}

function MomentumStat({ label, value, good }: { label: string; value: string; good: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[11px] text-text-secondary">{label}</span>
      <span className={`text-[11px] font-mono font-medium ${good ? "text-green" : "text-text-primary"}`}>
        {value}
      </span>
    </div>
  );
}
