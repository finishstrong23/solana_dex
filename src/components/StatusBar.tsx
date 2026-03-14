"use client";

import React from "react";
import { Activity, Cpu, Shield } from "lucide-react";
import { PLATFORM_FEE_BPS } from "@/lib/config";

interface StatusBarProps {
  solPrice: number;
  connected: boolean;
}

export default function StatusBar({ solPrice, connected }: StatusBarProps) {
  return (
    <footer className="border-t border-border bg-bg-secondary/50 px-4 sm:px-6">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between h-8">
        <div className="flex items-center gap-4 text-[10px] text-text-muted font-mono">
          <span className="flex items-center gap-1.5">
            SOL <span className="text-text-secondary">${solPrice > 0 ? solPrice.toFixed(2) : "—"}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-accent" />
            Fee {PLATFORM_FEE_BPS / 100}%
          </span>
          <span className="hidden sm:flex items-center gap-1.5">
            <Cpu className="w-3 h-3" />
            Jupiter v6
          </span>
        </div>

        <div className="flex items-center gap-4 text-[10px] text-text-muted font-mono">
          <span className="hidden sm:inline text-text-muted">
            Alpha DEX
          </span>
          <span className="flex items-center gap-1.5">
            <Activity className="w-3 h-3" />
            {connected ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
                <span className="text-green">Connected</span>
              </>
            ) : (
              <span className="text-text-muted">Disconnected</span>
            )}
          </span>
        </div>
      </div>
    </footer>
  );
}
