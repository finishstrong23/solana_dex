"use client";

import React, { useState } from "react";
import { Shield, DollarSign, TrendingUp, Copy, Check, ExternalLink, Settings } from "lucide-react";
import { OWNER_WALLET, PLATFORM_FEE_BPS } from "@/lib/config";

export default function OwnerDashboard() {
  const [copied, setCopied] = useState(false);

  const isConfigured = OWNER_WALLET !== "YOUR_SOLANA_WALLET_ADDRESS_HERE";

  const copyAddress = () => {
    navigator.clipboard.writeText(OWNER_WALLET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl swap-button-gradient flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Owner Dashboard</h2>
          <p className="text-xs text-text-muted">Fee collection and platform settings</p>
        </div>
      </div>

      {/* Setup warning */}
      {!isConfigured && (
        <div className="mb-6 p-4 rounded-xl bg-amber/10 border border-amber/30 animate-fade-in">
          <div className="flex items-start gap-3">
            <Settings className="w-5 h-5 text-amber shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-amber text-sm mb-1">Setup Required</div>
              <p className="text-sm text-text-secondary mb-3">
                You need to set your Solana wallet address to start collecting fees.
                Edit <code className="px-1.5 py-0.5 rounded bg-bg-input text-accent text-xs">src/lib/config.ts</code> and
                replace <code className="px-1.5 py-0.5 rounded bg-bg-input text-accent text-xs">YOUR_SOLANA_WALLET_ADDRESS_HERE</code> with
                your actual Solana wallet address (e.g. from Phantom).
              </p>
              <div className="text-xs text-text-muted">
                After updating, redeploy to Vercel and fees will automatically flow to your wallet.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2 text-accent">
            <DollarSign className="w-5 h-5" />
            <span className="text-xs text-text-muted">Platform Fee Rate</span>
          </div>
          <div className="text-3xl font-bold">{PLATFORM_FEE_BPS / 100}%</div>
          <div className="text-xs text-text-muted mt-1">{PLATFORM_FEE_BPS} basis points per swap</div>
        </div>
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2 text-green">
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs text-text-muted">Example Revenue</span>
          </div>
          <div className="text-3xl font-bold">$30</div>
          <div className="text-xs text-text-muted mt-1">per $10,000 in swap volume</div>
        </div>
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2 text-accent">
            <Shield className="w-5 h-5" />
            <span className="text-xs text-text-muted">Fee Collection</span>
          </div>
          <div className="text-3xl font-bold">Auto</div>
          <div className="text-xs text-text-muted mt-1">Sent directly to your wallet</div>
        </div>
      </div>

      {/* Fee wallet */}
      <div className="glass-card rounded-xl p-5 mb-6">
        <h3 className="font-semibold mb-3">Fee Collection Wallet</h3>
        <div className="flex items-center gap-3">
          <div className="flex-1 px-4 py-3 bg-bg-input rounded-xl border border-border font-mono text-sm truncate">
            {OWNER_WALLET}
          </div>
          <button
            onClick={copyAddress}
            className="p-3 rounded-xl bg-bg-input border border-border hover:bg-bg-card-hover transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green" /> : <Copy className="w-4 h-4 text-text-muted" />}
          </button>
          {isConfigured && (
            <a
              href={`https://solscan.io/account/${OWNER_WALLET}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-bg-input border border-border hover:bg-bg-card-hover transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-text-muted" />
            </a>
          )}
        </div>
        {isConfigured && (
          <p className="text-xs text-text-muted mt-2">
            View all collected fees on Solscan. Fees arrive as the output token of each swap.
          </p>
        )}
      </div>

      {/* How it works */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="font-semibold mb-4">How Fee Collection Works</h3>
        <div className="space-y-4">
          <Step
            number={1}
            title="User initiates a swap"
            desc="User enters an amount and selects tokens on the Swap page."
          />
          <Step
            number={2}
            title="Jupiter routes the trade"
            desc={`Jupiter finds the best route across all Solana DEXs. The platformFeeBps parameter (${PLATFORM_FEE_BPS} bps = ${PLATFORM_FEE_BPS / 100}%) is included in the quote request.`}
          />
          <Step
            number={3}
            title="Fee is deducted automatically"
            desc="The platform fee is taken from the output tokens before they reach the user. This is built into the swap transaction by Jupiter."
          />
          <Step
            number={4}
            title="Fee lands in your wallet"
            desc="The fee amount is sent to your configured wallet address as part of the same on-chain transaction. Instant, trustless, and verifiable."
          />
        </div>

        <div className="mt-6 p-4 bg-bg-input rounded-xl">
          <h4 className="text-sm font-semibold mb-2">Revenue Projections</h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-text-muted text-xs">
                <th className="text-left py-1">Daily Volume</th>
                <th className="text-right py-1">Daily Revenue</th>
                <th className="text-right py-1">Monthly Revenue</th>
                <th className="text-right py-1">Annual Revenue</th>
              </tr>
            </thead>
            <tbody className="text-text-secondary">
              {[10_000, 100_000, 1_000_000, 10_000_000].map((vol) => {
                const daily = vol * (PLATFORM_FEE_BPS / 10000);
                return (
                  <tr key={vol} className="border-t border-border/30">
                    <td className="py-2">${vol.toLocaleString()}</td>
                    <td className="py-2 text-right">${daily.toLocaleString()}</td>
                    <td className="py-2 text-right">${(daily * 30).toLocaleString()}</td>
                    <td className="py-2 text-right font-semibold text-green">${(daily * 365).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Step({ number, title, desc }: { number: number; title: string; desc: string }) {
  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 rounded-full swap-button-gradient flex items-center justify-center text-white text-xs font-bold shrink-0">
        {number}
      </div>
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-text-muted mt-0.5">{desc}</div>
      </div>
    </div>
  );
}
