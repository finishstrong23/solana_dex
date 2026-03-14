// ============================================================
// OWNER CONFIGURATION — Update these values with your own!
// ============================================================

// Your Solana wallet address where platform fees are collected.
// Every swap on SolSwap sends a % fee to this wallet.
export const OWNER_WALLET = "7g1jNY6e9Vy9yHtYcbAF8uWtQmbntcdx8TivzaBbXEHA";

// Platform fee in basis points. 10 = 0.10% per swap.
// Lower than competitors to attract volume.
// Example: A $1,000 swap at 10 bps = $1.00 fee to you.
export const PLATFORM_FEE_BPS = 10;

// Jupiter API endpoint
export const JUPITER_API_URL = "https://quote-api.jup.ag/v6";

// CoinGecko API (free tier - 30 calls/min)
export const COINGECKO_API_URL = "https://api.coingecko.com/api/v3";

// How often to refresh prices (in milliseconds)
export const PRICE_REFRESH_INTERVAL = 30_000; // 30 seconds
