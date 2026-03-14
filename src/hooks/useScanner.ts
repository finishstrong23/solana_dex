"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { ScannerToken } from "@/types/scanner";

interface UseScannerOptions {
  limit?: number;
  refreshInterval?: number; // ms
}

interface ScannerState {
  tokens: ScannerToken[];
  total: number;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  search: string;
}

export function useScanner(options: UseScannerOptions = {}) {
  const { limit = 100, refreshInterval = 30_000 } = options;

  const [state, setState] = useState<ScannerState>({
    tokens: [],
    total: 0,
    loading: true,
    loadingMore: false,
    error: null,
    hasMore: false,
    search: "",
  });

  const offsetRef = useRef(0);
  const searchRef = useRef("");

  const fetchTokens = useCallback(
    async (opts: { offset?: number; append?: boolean; search?: string } = {}) => {
      const { offset = 0, append = false, search = searchRef.current } = opts;

      setState((prev) => ({
        ...prev,
        loading: !append,
        loadingMore: append,
        error: null,
      }));

      try {
        const params = new URLSearchParams({
          limit: limit.toString(),
          offset: offset.toString(),
        });
        if (search) params.set("search", search);

        const res = await fetch(`/api/scanner?${params}`);
        if (!res.ok) throw new Error("Scanner API error");

        const data = await res.json();

        if (data.error && data.tokens.length === 0) {
          throw new Error(data.error);
        }

        offsetRef.current = offset + data.tokens.length;

        setState((prev) => ({
          ...prev,
          tokens: append ? [...prev.tokens, ...data.tokens] : data.tokens,
          total: data.total,
          loading: false,
          loadingMore: false,
          hasMore: data.hasMore,
          error: null,
        }));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load tokens";
        setState((prev) => ({
          ...prev,
          loading: false,
          loadingMore: false,
          error: message,
        }));
      }
    },
    [limit]
  );

  // Initial fetch
  useEffect(() => {
    fetchTokens({ offset: 0 });
  }, [fetchTokens]);

  // Auto-refresh
  useEffect(() => {
    if (refreshInterval <= 0) return;
    const interval = setInterval(() => {
      fetchTokens({ offset: 0, search: searchRef.current });
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchTokens, refreshInterval]);

  const loadMore = useCallback(() => {
    if (state.loadingMore || !state.hasMore) return;
    fetchTokens({ offset: offsetRef.current, append: true });
  }, [fetchTokens, state.loadingMore, state.hasMore]);

  const setSearch = useCallback(
    (query: string) => {
      searchRef.current = query;
      setState((prev) => ({ ...prev, search: query }));
      offsetRef.current = 0;
      fetchTokens({ offset: 0, search: query });
    },
    [fetchTokens]
  );

  const refetch = useCallback(() => {
    offsetRef.current = 0;
    fetchTokens({ offset: 0 });
  }, [fetchTokens]);

  return {
    ...state,
    loadMore,
    setSearch,
    refetch,
  };
}
