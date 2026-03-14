"use client";

import { useState, useEffect, useCallback } from "react";
import type { TrendingFeedData, TrendingCategory, TrendingToken } from "@/types/trending";

const EMPTY_FEED: TrendingFeedData = {
  hot: [],
  new: [],
  gainers: [],
  sniper: [],
  lastUpdated: "",
  source: "default",
};

export function useTrendingTokens() {
  const [feed, setFeed] = useState<TrendingFeedData>(EMPTY_FEED);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<TrendingCategory>("hot");

  const fetchTrending = useCallback(async () => {
    try {
      const res = await fetch("/api/trending");
      if (!res.ok) throw new Error("API error");
      const data: TrendingFeedData = await res.json();
      setFeed(data);
    } catch {
      console.warn("Trending fetch failed, using cached data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrending();
    // Refresh trending every 60s
    const interval = setInterval(fetchTrending, 60_000);
    return () => clearInterval(interval);
  }, [fetchTrending]);

  const getTokens = useCallback(
    (category: TrendingCategory): TrendingToken[] => {
      return feed[category] ?? [];
    },
    [feed]
  );

  const currentTokens = getTokens(activeCategory);

  // Check if sniper is feeding data
  const sniperActive = feed.source === "sniper" || feed.sniper.length > 0;

  return {
    feed,
    loading,
    activeCategory,
    setActiveCategory,
    currentTokens,
    sniperActive,
    refetch: fetchTrending,
  };
}
