import { Token } from "@/data/tokens";

// ============================================================
// TRENDING TOKEN TYPES
// Designed to be sniper-compatible. When your sniper software
// is integrated, it populates the sniper-specific fields.
// ============================================================

export interface TrendingToken {
  // Core token data
  mint: string;
  symbol: string;
  name: string;
  logoURI: string;
  decimals: number;

  // Market data
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap?: number;
  liquidity?: number;

  // Sniper-specific fields (populated when sniper is connected)
  sniperScore?: number;       // 0-100 confidence rating from your sniper
  detectedAt?: string;        // ISO timestamp when sniper first spotted this token
  signal?: TrendingSignal;    // What triggered the signal
  sniperNote?: string;        // Free-text note from sniper (e.g. "whale accumulation detected")
}

export type TrendingSignal =
  | "volume_spike"      // Unusual volume increase
  | "new_listing"       // Newly listed token
  | "whale_buy"         // Large wallet bought
  | "breakout"          // Price breakout pattern
  | "momentum"          // Strong upward momentum
  | "recovery"          // Recovering from dip
  | "sniper_pick";      // Your sniper's custom pick

export type TrendingCategory = "hot" | "new" | "gainers" | "sniper";

export interface TrendingFeedData {
  hot: TrendingToken[];
  new: TrendingToken[];
  gainers: TrendingToken[];
  sniper: TrendingToken[];  // Fed by your sniper software
  lastUpdated: string;
  source: "default" | "sniper";  // Which data source is active
}

// Convert a TrendingToken to a Token for the swap card
export function trendingToToken(t: TrendingToken): Token {
  return {
    symbol: t.symbol,
    name: t.name,
    mint: t.mint,
    decimals: t.decimals,
    logoURI: t.logoURI,
    coingeckoId: "", // Not needed for swap — we use mint address
  };
}

export const SIGNAL_LABELS: Record<TrendingSignal, { label: string; color: string }> = {
  volume_spike: { label: "Vol Spike", color: "text-amber" },
  new_listing: { label: "New", color: "text-accent" },
  whale_buy: { label: "Whale", color: "text-green" },
  breakout: { label: "Breakout", color: "text-green" },
  momentum: { label: "Momentum", color: "text-accent" },
  recovery: { label: "Recovery", color: "text-amber" },
  sniper_pick: { label: "Sniper", color: "text-accent" },
};
