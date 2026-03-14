export interface ScannerToken {
  mint: string;
  symbol: string;
  name: string;
  logoURI: string;
  decimals: number;
  age: string;            // "2h", "3d", "14d"
  ageHours: number;

  // Market data
  price: number;
  priceChange1h: number;
  priceChange4h: number;
  priceChange24h: number;
  volume24h: number;
  volumeChange1h: number;
  liquidity: number;
  marketCap: number;
  holders: number;
  holderGrade: string;    // A-F

  // Scores
  rugRisk: number;        // 0-100 (lower = safer)
  momentum: number;       // 0-100 (higher = better)

  // Risk factors
  mintAuthorityRevoked: boolean;
  freezeAuthorityDisabled: boolean;
  lpLocked: boolean;
  isHoneypot: boolean;
  top10HolderPct: number;

  // Sparkline data (24h price history, 24 points)
  sparkline: number[];
}

export type ScannerPreset = "blue_chips" | "early_alpha" | "trending_now" | "safe_yield" | "custom";

export interface ScannerFilters {
  riskTier: "all" | "safe" | "moderate" | "degen";
  minLiquidity: number;
  minHolders: number;
  maxAge: number | null;      // hours, null = all
  minVolume: number;
  minMomentum: number;
  hideHoneypots: boolean;
  hideFrozenMint: boolean;
}

export const DEFAULT_FILTERS: ScannerFilters = {
  riskTier: "all",
  minLiquidity: 0,
  minHolders: 0,
  maxAge: null,
  minVolume: 0,
  minMomentum: 0,
  hideHoneypots: true,
  hideFrozenMint: true,
};

export const SCANNER_PRESETS: Record<ScannerPreset, { label: string; description: string; filters: Partial<ScannerFilters> }> = {
  blue_chips: {
    label: "Blue Chips",
    description: "Rug Risk < 10, Liquidity > $1M, 5000+ holders",
    filters: { riskTier: "safe", minLiquidity: 1_000_000, minHolders: 5000, minMomentum: 0 },
  },
  early_alpha: {
    label: "Early Alpha",
    description: "< 24h old, Momentum > 70, Risk < 50, Liq > $50K",
    filters: { riskTier: "moderate", maxAge: 24, minMomentum: 70, minLiquidity: 50_000 },
  },
  trending_now: {
    label: "Trending Now",
    description: "Volume spike > 200%, Momentum > 80",
    filters: { minMomentum: 80, minVolume: 100_000 },
  },
  safe_yield: {
    label: "Safe Yield",
    description: "Established tokens, Rug Risk < 20",
    filters: { riskTier: "safe", minLiquidity: 500_000, minHolders: 1000 },
  },
  custom: {
    label: "Custom",
    description: "Your saved filters",
    filters: {},
  },
};
