import { COINGECKO_API_URL } from "./config";
import { TOKENS } from "@/data/tokens";

export interface PriceData {
  [symbol: string]: {
    usd: number;
    usd_24h_change: number;
  };
}

export async function fetchLivePrices(): Promise<PriceData> {
  // Build ID map from token data
  const symbolToGeckoId: Record<string, string> = {};
  for (const token of TOKENS) {
    symbolToGeckoId[token.symbol] = token.coingeckoId;
  }

  const ids = Object.values(symbolToGeckoId).join(",");
  const url = `${COINGECKO_API_URL}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;

  const res = await fetch(url, {
    next: { revalidate: 30 },
  });

  if (!res.ok) {
    throw new Error(`CoinGecko API error: ${res.status}`);
  }

  const data = await res.json();

  const result: PriceData = {};
  for (const [symbol, geckoId] of Object.entries(symbolToGeckoId)) {
    if (data[geckoId]) {
      result[symbol] = {
        usd: data[geckoId].usd,
        usd_24h_change: data[geckoId].usd_24h_change ?? 0,
      };
    }
  }

  return result;
}
