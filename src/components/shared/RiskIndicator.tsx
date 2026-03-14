"use client";

import React from "react";
import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";

interface RiskIndicatorProps {
  score: number;
  showLabel?: boolean;
}

export default function RiskIndicator({ score, showLabel = false }: RiskIndicatorProps) {
  if (score <= 30) {
    return (
      <span className="inline-flex items-center gap-1 text-green">
        <ShieldCheck className="w-3.5 h-3.5" />
        {showLabel && <span className="text-[10px] font-medium">Safe</span>}
      </span>
    );
  }
  if (score <= 60) {
    return (
      <span className="inline-flex items-center gap-1 text-amber">
        <ShieldAlert className="w-3.5 h-3.5" />
        {showLabel && <span className="text-[10px] font-medium">Moderate</span>}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-red">
      <ShieldX className="w-3.5 h-3.5" />
      {showLabel && <span className="text-[10px] font-medium">High Risk</span>}
    </span>
  );
}
