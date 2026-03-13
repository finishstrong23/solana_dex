import { COINGECKO_API_URL } from "./config";

// Map our token symbols to CoinGecko IDs
const COINGECKO_IDS: Record<string, string> = {
  SOL: "solana",
  USDC: "usd-coin",
  USDT: "tether",
  RAY: "raydium",
  BONK: "bonk",
  JTO: "jito-governance-token",
  WIF: "dogwifcoin",
  JUP: "jupiter-exchange-solana",
};

export interface PriceData {
  [symbol: string]: {
    usd: number;
    usd_24h_change: number;
  };
}

export async function fetchLivePrices(): Promise<PriceData> {
  const ids = Object.values(COINGECKO_IDS).join(",");
  const url = `${COINGECKO_API_URL}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;

  const res = await fetch(url, {
    next: { revalidate: 30 }, // ISR: refresh every 30s
  });

  if (!res.ok) {
    throw new Error(`CoinGecko API error: ${res.status}`);
  }

  const data = await res.json();

  // Convert CoinGecko IDs back to our symbols
  const result: PriceData = {};
  for (const [symbol, geckoId] of Object.entries(COINGECKO_IDS)) {
    if (data[geckoId]) {
      result[symbol] = {
        usd: data[geckoId].usd,
        usd_24h_change: data[geckoId].usd_24h_change ?? 0,
      };
    }
  }

  return result;
}
