"use client";

import React, { useState, useCallback } from "react";
import { ArrowDownUp, Settings, Info, Loader2, ChevronDown } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Token, TOKENS, formatPrice } from "@/data/tokens";
import TokenSelector from "./TokenSelector";

export default function SwapCard() {
  const { connected } = useWallet();
  const [tokenFrom, setTokenFrom] = useState<Token>(TOKENS[0]); // SOL
  const [tokenTo, setTokenTo] = useState<Token>(TOKENS[1]); // USDC
  const [amountFrom, setAmountFrom] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);
  const [showFromSelector, setShowFromSelector] = useState(false);
  const [showToSelector, setShowToSelector] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  const amountTo = amountFrom
    ? ((parseFloat(amountFrom) * tokenFrom.price) / tokenTo.price).toFixed(
        tokenTo.price < 0.01 ? 8 : tokenTo.price < 1 ? 4 : 2
      )
    : "";

  const rate = tokenFrom.price / tokenTo.price;
  const priceImpact = amountFrom ? Math.min(parseFloat(amountFrom) * 0.001, 5).toFixed(2) : "0.00";
  const fee = amountFrom ? (parseFloat(amountFrom) * tokenFrom.price * 0.0025).toFixed(2) : "0.00";

  const handleFlip = useCallback(() => {
    setTokenFrom(tokenTo);
    setTokenTo(tokenFrom);
    setAmountFrom(amountTo);
  }, [tokenFrom, tokenTo, amountTo]);

  const handleSwap = async () => {
    setIsSwapping(true);
    await new Promise((r) => setTimeout(r, 2000));
    setIsSwapping(false);
    setAmountFrom("");
  };

  return (
    <div className="w-full max-w-[480px] mx-auto animate-fade-in">
      {/* Card */}
      <div className="glass-card rounded-2xl p-1 animate-pulse-glow">
        <div className="bg-bg-card rounded-2xl p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold">Swap</h2>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-colors ${
                showSettings ? "bg-accent/20 text-accent" : "hover:bg-bg-card-hover text-text-secondary"
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {/* Slippage settings */}
          {showSettings && (
            <div className="mb-4 p-3 bg-bg-input rounded-xl border border-border animate-fade-in">
              <div className="text-xs text-text-secondary mb-2">Slippage Tolerance</div>
              <div className="flex gap-2">
                {[0.1, 0.5, 1.0].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSlippage(s)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      slippage === s
                        ? "bg-accent text-white"
                        : "bg-bg-card hover:bg-bg-card-hover text-text-secondary"
                    }`}
                  >
                    {s}%
                  </button>
                ))}
                <input
                  type="number"
                  value={slippage}
                  onChange={(e) => setSlippage(parseFloat(e.target.value) || 0)}
                  className="w-20 px-2 py-1.5 rounded-lg bg-bg-card border border-border text-xs text-center focus:outline-none focus:border-border-focus"
                  step={0.1}
                  min={0.01}
                  max={50}
                />
              </div>
            </div>
          )}

          {/* From */}
          <div className="bg-bg-input rounded-xl p-4 border border-border focus-within:border-border-focus transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-muted">You Pay</span>
              <span className="text-xs text-text-muted">
                Balance: 0.00
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                placeholder="0.00"
                value={amountFrom}
                onChange={(e) => setAmountFrom(e.target.value)}
                className="flex-1 bg-transparent text-2xl font-semibold outline-none placeholder:text-text-muted [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <button
                onClick={() => setShowFromSelector(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-card hover:bg-bg-card-hover transition-colors shrink-0"
              >
                <img
                  src={tokenFrom.logoURI}
                  alt={tokenFrom.symbol}
                  className="w-6 h-6 rounded-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <span className="font-semibold text-sm">{tokenFrom.symbol}</span>
                <ChevronDown className="w-4 h-4 text-text-muted" />
              </button>
            </div>
            {amountFrom && (
              <div className="text-xs text-text-muted mt-1">
                ~${(parseFloat(amountFrom) * tokenFrom.price).toFixed(2)}
              </div>
            )}
          </div>

          {/* Flip button */}
          <div className="flex justify-center -my-3 relative z-10">
            <button
              onClick={handleFlip}
              className="w-10 h-10 rounded-xl bg-bg-card border-4 border-bg-primary flex items-center justify-center hover:bg-accent hover:text-white transition-all duration-200 group"
            >
              <ArrowDownUp className="w-4 h-4 text-text-secondary group-hover:text-white transition-colors" />
            </button>
          </div>

          {/* To */}
          <div className="bg-bg-input rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-muted">You Receive</span>
              <span className="text-xs text-text-muted">
                Balance: 0.00
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="0.00"
                value={amountTo}
                readOnly
                className="flex-1 bg-transparent text-2xl font-semibold outline-none placeholder:text-text-muted"
              />
              <button
                onClick={() => setShowToSelector(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-card hover:bg-bg-card-hover transition-colors shrink-0"
              >
                <img
                  src={tokenTo.logoURI}
                  alt={tokenTo.symbol}
                  className="w-6 h-6 rounded-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <span className="font-semibold text-sm">{tokenTo.symbol}</span>
                <ChevronDown className="w-4 h-4 text-text-muted" />
              </button>
            </div>
            {amountTo && (
              <div className="text-xs text-text-muted mt-1">
                ~${(parseFloat(amountTo) * tokenTo.price).toFixed(2)}
              </div>
            )}
          </div>

          {/* Swap details */}
          {amountFrom && parseFloat(amountFrom) > 0 && (
            <div className="mt-4 p-3 bg-bg-input rounded-xl space-y-2 animate-fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted flex items-center gap-1">
                  <Info className="w-3 h-3" /> Rate
                </span>
                <span className="text-text-secondary">
                  1 {tokenFrom.symbol} = {formatPrice(rate)} {tokenTo.symbol}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Price Impact</span>
                <span className={parseFloat(priceImpact) > 1 ? "text-amber" : "text-green"}>
                  {priceImpact}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Network Fee</span>
                <span className="text-text-secondary">${fee}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Slippage</span>
                <span className="text-text-secondary">{slippage}%</span>
              </div>
            </div>
          )}

          {/* Swap button */}
          <button
            onClick={connected ? handleSwap : undefined}
            disabled={isSwapping || (!amountFrom && connected)}
            className={`w-full mt-4 py-4 rounded-xl font-semibold text-white transition-all duration-200 ${
              !connected
                ? "swap-button-gradient opacity-80 cursor-default"
                : isSwapping
                ? "swap-button-gradient opacity-70 cursor-wait"
                : amountFrom
                ? "swap-button-gradient hover:opacity-90 active:scale-[0.98]"
                : "bg-bg-card-hover text-text-muted cursor-not-allowed"
            }`}
          >
            {!connected ? (
              "Connect Wallet"
            ) : isSwapping ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Swapping...
              </span>
            ) : amountFrom ? (
              "Swap"
            ) : (
              "Enter an amount"
            )}
          </button>
        </div>
      </div>

      {/* Rate bar */}
      <div className="mt-3 flex items-center justify-center gap-2 text-xs text-text-muted">
        <div className="w-2 h-2 rounded-full bg-green animate-pulse" />
        <span>
          1 {tokenFrom.symbol} = {formatPrice(rate)} {tokenTo.symbol}
        </span>
      </div>

      {/* Token selectors */}
      <TokenSelector
        isOpen={showFromSelector}
        onClose={() => setShowFromSelector(false)}
        onSelect={setTokenFrom}
        excludeToken={tokenTo}
      />
      <TokenSelector
        isOpen={showToSelector}
        onClose={() => setShowToSelector(false)}
        onSelect={setTokenTo}
        excludeToken={tokenFrom}
      />
    </div>
  );
}
