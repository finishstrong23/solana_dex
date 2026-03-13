"use client";

import { useState, useEffect, useCallback } from "react";
import { PRICE_REFRESH_INTERVAL } from "@/lib/config";

interface PriceMap {
  [symbol: string]: {
    usd: number;
    usd_24h_change: number;
  };
}

// Fallback prices in case API is down
const FALLBACK_PRICES: PriceMap = {
  SOL: { usd: 89.08, usd_24h_change: 0 },
  USDC: { usd: 1.0, usd_24h_change: 0 },
  USDT: { usd: 1.0, usd_24h_change: 0 },
  RAY: { usd: 2.87, usd_24h_change: 0 },
  BONK: { usd: 0.00002341, usd_24h_change: 0 },
  JTO: { usd: 3.56, usd_24h_change: 0 },
  WIF: { usd: 1.92, usd_24h_change: 0 },
  JUP: { usd: 1.24, usd_24h_change: 0 },
};

export function usePrices() {
  const [prices, setPrices] = useState<PriceMap>(FALLBACK_PRICES);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPrices = useCallback(async () => {
    try {
      const res = await fetch("/api/price");
      if (!res.ok) throw new Error("API error");
      const data: PriceMap = await res.json();
      if (Object.keys(data).length > 0) {
        setPrices(data);
        setLastUpdated(new Date());
      }
    } catch {
      // Keep existing prices on error
      console.warn("Price fetch failed, using cached prices");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, PRICE_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  const getPrice = useCallback(
    (symbol: string): number => {
      return prices[symbol]?.usd ?? 0;
    },
    [prices]
  );

  const getChange = useCallback(
    (symbol: string): number => {
      return prices[symbol]?.usd_24h_change ?? 0;
    },
    [prices]
  );

  return { prices, loading, lastUpdated, getPrice, getChange };
}
