import { NextResponse } from "next/server";
import type { TrendingFeedData, TrendingToken } from "@/types/trending";

export const revalidate = 60; // ISR every 60s

// ============================================================
// TRENDING TOKENS API
//
// Currently fetches from Jupiter Price API + curated list.
// When your sniper is ready, add a second data source here
// by POSTing sniper picks to this route or reading from a DB.
// ============================================================

// Curated trending tokens — real Solana mints
const TRENDING_MINTS: Array<{
  mint: string;
  symbol: string;
  name: string;
  logoURI: string;
  decimals: number;
  category: "hot" | "new" | "gainers";
}> = [
  // HOT — high volume, popular right now
  { mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", symbol: "BONK", name: "Bonk", logoURI: "https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I", decimals: 5, category: "hot" },
  { mint: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm", symbol: "WIF", name: "dogwifhat", logoURI: "https://bafkreibk3covs5ltyqxa272uodhber447nnr4kvfyjv2ykpre7hrid54ke.ipfs.nftstorage.link", decimals: 6, category: "hot" },
  { mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN", symbol: "JUP", name: "Jupiter", logoURI: "https://static.jup.ag/jup/icon.png", decimals: 6, category: "hot" },
  { mint: "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr", symbol: "POPCAT", name: "Popcat", logoURI: "https://bafkreidvkvuzyslw5jh5z242lgzwzhbi2kxxnpkm427q7zbhstmhcpsmoq.ipfs.nftstorage.link", decimals: 9, category: "hot" },
  { mint: "jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL", symbol: "JTO", name: "Jito", logoURI: "https://metadata.jito.network/token/jto/image", decimals: 9, category: "hot" },
  { mint: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R", symbol: "RAY", name: "Raydium", logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png", decimals: 6, category: "hot" },

  // NEW LISTINGS — recently launched / gaining traction
  { mint: "TNSRxcUxoT9xBG3de7PiJyTDYu7kskLqcpddxnEJAS6", symbol: "TNSR", name: "Tensor", logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/TNSRxcUxoT9xBG3de7PiJyTDYu7kskLqcpddxnEJAS6/logo.png", decimals: 9, category: "new" },
  { mint: "85VBFQZC9TZkfaptBWjvUw7YbZjy52A6mjtPGjstQAmQ", symbol: "W", name: "Wormhole", logoURI: "https://raw.githubusercontent.com/wormhole-foundation/wormhole-token-list/main/assets/W_purple_512.png", decimals: 6, category: "new" },
  { mint: "HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3", symbol: "PYTH", name: "Pyth Network", logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3/logo.png", decimals: 6, category: "new" },
  { mint: "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE", symbol: "ORCA", name: "Orca", logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE/logo.png", decimals: 6, category: "new" },

  // GAINERS — strong price movement
  { mint: "rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof", symbol: "RENDER", name: "Render", logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof/logo.png", decimals: 8, category: "gainers" },
  { mint: "hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknKrdu1oxWux", symbol: "HNT", name: "Helium", logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknKrdu1oxWux/logo.png", decimals: 8, category: "gainers" },
  { mint: "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So", symbol: "MSOL", name: "Marinade SOL", logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png", decimals: 9, category: "gainers" },
  { mint: "So11111111111111111111111111111111111111112", symbol: "SOL", name: "Solana", logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png", decimals: 9, category: "gainers" },
];

async function fetchJupiterPrices(mints: string[]): Promise<Record<string, number>> {
  try {
    const ids = mints.join(",");
    const res = await fetch(`https://price.jup.ag/v6/price?ids=${ids}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return {};
    const data = await res.json();
    const prices: Record<string, number> = {};
    for (const [mint, info] of Object.entries(data.data as Record<string, { price: number }>)) {
      prices[mint] = info.price;
    }
    return prices;
  } catch {
    return {};
  }
}

export async function GET() {
  try {
    // Fetch live prices from Jupiter
    const allMints = TRENDING_MINTS.map((t) => t.mint);
    const prices = await fetchJupiterPrices(allMints);

    const buildToken = (t: typeof TRENDING_MINTS[0]): TrendingToken => ({
      mint: t.mint,
      symbol: t.symbol,
      name: t.name,
      logoURI: t.logoURI,
      decimals: t.decimals,
      price: prices[t.mint] ?? 0,
      priceChange24h: 0, // Jupiter price API doesn't give 24h change directly
      volume24h: 0,
    });

    const hot = TRENDING_MINTS.filter((t) => t.category === "hot").map(buildToken);
    const newTokens = TRENDING_MINTS.filter((t) => t.category === "new").map(buildToken);
    const gainers = TRENDING_MINTS.filter((t) => t.category === "gainers").map(buildToken);

    const result: TrendingFeedData = {
      hot,
      new: newTokens,
      gainers,
      sniper: [], // Empty until sniper is connected
      lastUpdated: new Date().toISOString(),
      source: "default",
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Trending fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending tokens" },
      { status: 500 }
    );
  }
}

// ============================================================
// SNIPER INTEGRATION POINT
//
// To feed your sniper data, POST to this route:
//
// POST /api/trending
// Body: { sniper: TrendingToken[] }
//
// Or, modify this route to read from your sniper's
// database/API/websocket feed.
// ============================================================
export async function POST(request: Request) {
  try {
    const body = await request.json();
    // TODO: Validate and store sniper picks
    // For now, this is a placeholder for sniper integration
    // In production: write to DB, Redis, or in-memory cache
    console.log("Sniper data received:", body.sniper?.length ?? 0, "tokens");
    return NextResponse.json({ ok: true, received: body.sniper?.length ?? 0 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
