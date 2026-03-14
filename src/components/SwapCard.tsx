"use client";

import React, { useState, useCallback, useEffect } from "react";
import { ArrowDownUp, Settings, Info, Loader2, ChevronDown, AlertTriangle } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { VersionedTransaction, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { Token, TOKENS, formatPrice } from "@/data/tokens";
import { PLATFORM_FEE_BPS, OWNER_WALLET } from "@/lib/config";
import { getQuote, getSwapTransaction, type JupiterQuote } from "@/lib/jupiter";
import { useBalances } from "@/hooks/useBalances";
import TokenSelector from "./TokenSelector";

const NATIVE_SOL_MINT = "So11111111111111111111111111111111111111112";

interface SwapCardProps {
  priceData: {
    getPrice: (symbol: string) => number;
    getChange: (symbol: string) => number;
    loading: boolean;
  };
  externalTokenTo?: Token | null;
  onExternalTokenConsumed?: () => void;
}

export default function SwapCard({ priceData, externalTokenTo, onExternalTokenConsumed }: SwapCardProps) {
  const { connected, publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const { getBalance, refetch: refetchBalances } = useBalances();
  const [tokenFrom, setTokenFrom] = useState<Token>(TOKENS[0]);
  const [tokenTo, setTokenTo] = useState<Token>(TOKENS[1]);
  const [amountFrom, setAmountFrom] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);
  const [showFromSelector, setShowFromSelector] = useState(false);
  const [showToSelector, setShowToSelector] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [isQuoting, setIsQuoting] = useState(false);
  const [quote, setQuote] = useState<JupiterQuote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [swapStatus, setSwapStatus] = useState<string | null>(null);

  const priceFrom = priceData.getPrice(tokenFrom.symbol);
  const priceTo = priceData.getPrice(tokenTo.symbol);
  const balanceFrom = getBalance(tokenFrom.mint);
  const balanceTo = getBalance(tokenTo.mint);

  // Compute output from Jupiter quote or fallback to price estimate
  const amountTo = quote
    ? (parseInt(quote.outAmount) / Math.pow(10, tokenTo.decimals)).toFixed(
        priceTo < 0.01 ? 8 : priceTo < 1 ? 4 : 2
      )
    : amountFrom && priceFrom && priceTo
    ? ((parseFloat(amountFrom) * priceFrom) / priceTo).toFixed(
        priceTo < 0.01 ? 8 : priceTo < 1 ? 4 : 2
      )
    : "";

  const rate = priceFrom && priceTo ? priceFrom / priceTo : 0;
  const priceImpact = quote ? parseFloat(quote.priceImpactPct).toFixed(2) : "0.00";
  const platformFee = amountFrom
    ? (parseFloat(amountFrom) * priceFrom * (PLATFORM_FEE_BPS / 10000)).toFixed(2)
    : "0.00";

  const insufficientBalance = amountFrom && parseFloat(amountFrom) > balanceFrom;

  // Handle external token selection (from trending feed)
  useEffect(() => {
    if (externalTokenTo && externalTokenTo.mint !== tokenTo.mint) {
      // If the selected token is the same as tokenFrom, flip them
      if (externalTokenTo.mint === tokenFrom.mint) {
        setTokenFrom(tokenTo);
      }
      setTokenTo(externalTokenTo);
      setQuote(null);
      onExternalTokenConsumed?.();
    }
  }, [externalTokenTo]);

  // Fetch Jupiter quote when inputs change
  useEffect(() => {
    const fetchQuote = async () => {
      if (!amountFrom || parseFloat(amountFrom) <= 0) {
        setQuote(null);
        setQuoteError(null);
        return;
      }

      setIsQuoting(true);
      setQuoteError(null);

      try {
        const amountInSmallest = Math.floor(
          parseFloat(amountFrom) * Math.pow(10, tokenFrom.decimals)
        ).toString();

        const q = await getQuote(
          tokenFrom.mint,
          tokenTo.mint,
          amountInSmallest,
          Math.round(slippage * 100)
        );
        setQuote(q);
      } catch (err) {
        console.error("Quote error:", err);
        setQuoteError("Could not get quote. Try a different amount.");
        setQuote(null);
      } finally {
        setIsQuoting(false);
      }
    };

    const debounce = setTimeout(fetchQuote, 500);
    return () => clearTimeout(debounce);
  }, [amountFrom, tokenFrom, tokenTo, slippage]);

  const handleFlip = useCallback(() => {
    setTokenFrom(tokenTo);
    setTokenTo(tokenFrom);
    setAmountFrom(amountTo);
    setQuote(null);
  }, [tokenFrom, tokenTo, amountTo]);

  const handleMax = useCallback(() => {
    if (!connected) return;
    const maxAmount = tokenFrom.mint === NATIVE_SOL_MINT
      ? Math.max(0, balanceFrom - 0.01)
      : balanceFrom;
    setAmountFrom(maxAmount > 0 ? maxAmount.toString() : "");
  }, [connected, balanceFrom, tokenFrom.mint]);

  const getFeeAccount = useCallback((): string => {
    const ownerPubkey = new PublicKey(OWNER_WALLET);
    if (tokenTo.mint === NATIVE_SOL_MINT) {
      return OWNER_WALLET;
    }
    const outputMint = new PublicKey(tokenTo.mint);
    const ata = getAssociatedTokenAddressSync(outputMint, ownerPubkey, true);
    return ata.toBase58();
  }, [tokenTo.mint]);

  const handleSwap = async () => {
    if (!connected || !publicKey || !signTransaction || !quote) return;

    setIsSwapping(true);
    setSwapStatus("Getting transaction...");

    try {
      const feeAccount = getFeeAccount();
      const { swapTransaction } = await getSwapTransaction(
        quote,
        publicKey.toBase58(),
        feeAccount
      );

      setSwapStatus("Please approve in wallet...");

      const txBuf = Buffer.from(swapTransaction, "base64");
      const tx = VersionedTransaction.deserialize(txBuf);
      const signed = await signTransaction(tx);

      setSwapStatus("Confirming transaction...");

      const sig = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: true,
        maxRetries: 2,
      });

      await connection.confirmTransaction(sig, "confirmed");

      setSwapStatus(`Swap successful!`);
      setAmountFrom("");
      setQuote(null);

      setTimeout(() => refetchBalances(), 2000);
      setTimeout(() => setSwapStatus(null), 4000);
    } catch (err: unknown) {
      console.error("Swap error:", err);
      const message = err instanceof Error ? err.message : "Swap failed";
      if (message.includes("User rejected")) {
        setSwapStatus("Transaction cancelled");
      } else {
        setSwapStatus(`Error: ${message.slice(0, 60)}`);
      }
      setTimeout(() => setSwapStatus(null), 4000);
    } finally {
      setIsSwapping(false);
    }
  };

  const formatBal = (bal: number): string => {
    if (bal === 0) return "0";
    if (bal < 0.001) return bal.toFixed(6);
    if (bal < 1) return bal.toFixed(4);
    if (bal < 1000) return bal.toFixed(2);
    return bal.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  return (
    <div className="w-full max-w-[480px] mx-auto animate-fade-in">
      <div className="glass-card rounded-2xl p-1 animate-pulse-glow">
        <div className="bg-bg-card rounded-2xl p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold">Swap</h2>
              <div className="text-[10px] text-text-muted">
                {PLATFORM_FEE_BPS / 100}% platform fee per swap
              </div>
            </div>
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
                Balance: {connected ? formatBal(balanceFrom) : "—"}
                {connected && balanceFrom > 0 && (
                  <button
                    onClick={handleMax}
                    className="ml-1.5 text-accent font-semibold hover:text-accent-hover transition-colors"
                  >
                    MAX
                  </button>
                )}
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
                <img src={tokenFrom.logoURI} alt={tokenFrom.symbol} className="w-6 h-6 rounded-full"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                <span className="font-semibold text-sm">{tokenFrom.symbol}</span>
                <ChevronDown className="w-4 h-4 text-text-muted" />
              </button>
            </div>
            {amountFrom && priceFrom > 0 && (
              <div className="text-xs text-text-muted mt-1">
                ~${(parseFloat(amountFrom) * priceFrom).toFixed(2)}
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
                Balance: {connected ? formatBal(balanceTo) : "—"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                {isQuoting ? (
                  <div className="flex items-center gap-2 text-text-muted">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm">Fetching best price...</span>
                  </div>
                ) : (
                  <input
                    type="text"
                    placeholder="0.00"
                    value={amountTo}
                    readOnly
                    className="w-full bg-transparent text-2xl font-semibold outline-none placeholder:text-text-muted"
                  />
                )}
              </div>
              <button
                onClick={() => setShowToSelector(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-card hover:bg-bg-card-hover transition-colors shrink-0"
              >
                <img src={tokenTo.logoURI} alt={tokenTo.symbol} className="w-6 h-6 rounded-full"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                <span className="font-semibold text-sm">{tokenTo.symbol}</span>
                <ChevronDown className="w-4 h-4 text-text-muted" />
              </button>
            </div>
            {amountTo && priceTo > 0 && (
              <div className="text-xs text-text-muted mt-1">
                ~${(parseFloat(amountTo) * priceTo).toFixed(2)}
              </div>
            )}
          </div>

          {/* Insufficient balance warning */}
          {insufficientBalance && connected && (
            <div className="mt-3 p-2 rounded-lg bg-red/10 border border-red/20 flex items-center gap-2 text-xs text-red">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              Insufficient {tokenFrom.symbol} balance
            </div>
          )}

          {/* Quote error */}
          {quoteError && (
            <div className="mt-3 p-2 rounded-lg bg-red/10 border border-red/20 flex items-center gap-2 text-xs text-red">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              {quoteError}
            </div>
          )}

          {/* Swap details */}
          {amountFrom && parseFloat(amountFrom) > 0 && !quoteError && (
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
                <span className="text-text-muted">Platform Fee ({PLATFORM_FEE_BPS / 100}%)</span>
                <span className="text-text-secondary">${platformFee}</span>
              </div>
              {quote && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">Route</span>
                  <span className="text-text-secondary">
                    {quote.routePlan.map((r) => r.swapInfo.label).join(" → ")}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Slippage</span>
                <span className="text-text-secondary">{slippage}%</span>
              </div>
            </div>
          )}

          {/* Swap status */}
          {swapStatus && (
            <div className={`mt-3 p-2 rounded-lg text-xs text-center font-medium ${
              swapStatus.includes("successful") ? "bg-green/10 text-green" :
              swapStatus.includes("Error") || swapStatus.includes("cancelled") ? "bg-red/10 text-red" :
              "bg-accent/10 text-accent"
            }`}>
              {swapStatus}
            </div>
          )}

          {/* Swap button */}
          <button
            onClick={connected ? handleSwap : undefined}
            disabled={isSwapping || isQuoting || (!amountFrom && connected) || (connected && !quote) || !!insufficientBalance}
            className={`w-full mt-4 py-4 rounded-xl font-semibold text-white transition-all duration-200 ${
              !connected
                ? "swap-button-gradient opacity-80 cursor-default"
                : isSwapping
                ? "swap-button-gradient opacity-70 cursor-wait"
                : insufficientBalance
                ? "bg-red/20 text-red cursor-not-allowed"
                : amountFrom && quote
                ? "swap-button-gradient hover:opacity-90 active:scale-[0.98]"
                : "bg-bg-card-hover text-text-muted cursor-not-allowed"
            }`}
          >
            {!connected ? (
              "Connect Wallet"
            ) : isSwapping ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> {swapStatus || "Swapping..."}
              </span>
            ) : isQuoting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Getting quote...
              </span>
            ) : insufficientBalance ? (
              `Insufficient ${tokenFrom.symbol} balance`
            ) : amountFrom && quote ? (
              "Swap"
            ) : amountFrom && quoteError ? (
              "No route found"
            ) : (
              "Enter an amount"
            )}
          </button>
        </div>
      </div>

      {/* Rate bar */}
      {rate > 0 && (
        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-text-muted">
          <div className="w-2 h-2 rounded-full bg-green animate-pulse" />
          <span>
            1 {tokenFrom.symbol} = {formatPrice(rate)} {tokenTo.symbol}
          </span>
          {quote && <span className="text-accent">via Jupiter</span>}
        </div>
      )}

      {/* Token selectors */}
      <TokenSelector
        isOpen={showFromSelector}
        onClose={() => setShowFromSelector(false)}
        onSelect={(t) => { setTokenFrom(t); setQuote(null); }}
        excludeToken={tokenTo}
        getPrice={priceData.getPrice}
        getChange={priceData.getChange}
      />
      <TokenSelector
        isOpen={showToSelector}
        onClose={() => setShowToSelector(false)}
        onSelect={(t) => { setTokenTo(t); setQuote(null); }}
        excludeToken={tokenFrom}
        getPrice={priceData.getPrice}
        getChange={priceData.getChange}
      />
    </div>
  );
}
