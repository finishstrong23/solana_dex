// ============================================================
// SAFETY SCANNER — Independent On-Chain Token Analysis
//
// This scanner queries the Solana blockchain directly to verify
// token safety, independent of any third-party scoring service.
// ============================================================

export interface SafetyScanResult {
  mint: string;
  symbol: string;
  name: string;
  logoURI: string;
  scannedAt: string; // ISO timestamp

  // Overall verdict
  overallScore: number; // 0-100 (higher = safer)
  verdict: "safe" | "caution" | "warning" | "danger";

  // Individual checks
  checks: SafetyCheck[];

  // On-chain details
  supply: {
    total: number;
    decimals: number;
  };

  // Authority analysis
  mintAuthority: {
    exists: boolean;
    address: string | null;
  };
  freezeAuthority: {
    exists: boolean;
    address: string | null;
  };

  // Holder distribution
  holders: {
    topHolders: TopHolder[];
    top10Pct: number;
    top20Pct: number;
    concentration: "distributed" | "moderate" | "concentrated" | "whale-dominated";
  };

  // Liquidity analysis
  liquidity: {
    hasLiquidity: boolean;
    estimatedUsd: number;
    lpBurned: boolean;
    dexPools: string[]; // Which DEXes have pools
  };

  // Token metadata
  metadata: {
    hasMetadata: boolean;
    isMutable: boolean;
    updateAuthority: string | null;
  };
}

export interface SafetyCheck {
  id: string;
  label: string;
  description: string;
  status: "pass" | "warn" | "fail" | "info";
  weight: number; // How much this affects the overall score
  details?: string;
}

export interface TopHolder {
  address: string;
  balance: number;
  pct: number;
  label?: string; // "LP Pool", "Burn Address", "Creator", etc.
}

export interface SafetyScanRequest {
  mint: string;
}

export interface SafetyScanResponse {
  result: SafetyScanResult | null;
  error: string | null;
  cached: boolean;
}

// Known addresses for labeling
export const KNOWN_ADDRESSES: Record<string, string> = {
  "1nc1nerator11111111111111111111111111111111": "Burn Address",
  "11111111111111111111111111111111": "System Program",
  "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1": "Raydium LP",
  "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc": "Orca Whirlpool",
  "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8": "Raydium AMM",
};
