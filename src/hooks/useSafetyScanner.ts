"use client";

import { useState, useCallback } from "react";
import type { SafetyScanResult, SafetyScanResponse } from "@/types/safety";

interface UseSafetyScannerReturn {
  result: SafetyScanResult | null;
  loading: boolean;
  error: string | null;
  cached: boolean;
  scan: (mint: string) => Promise<void>;
  reset: () => void;
}

export function useSafetyScanner(): UseSafetyScannerReturn {
  const [result, setResult] = useState<SafetyScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cached, setCached] = useState(false);

  const scan = useCallback(async (mint: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setCached(false);

    try {
      const res = await fetch("/api/safety-scanner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mint }),
      });

      const data: SafetyScanResponse = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setResult(data.result);
        setCached(data.cached);
      }
    } catch {
      setError("Failed to connect to scanner. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setLoading(false);
    setCached(false);
  }, []);

  return { result, loading, error, cached, scan, reset };
}
