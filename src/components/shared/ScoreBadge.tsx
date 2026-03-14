"use client";

import React from "react";

interface ScoreBadgeProps {
  score: number;
  label?: string;
  type?: "risk" | "momentum";
  size?: "sm" | "md";
}

export default function ScoreBadge({ score, label, type = "risk", size = "sm" }: ScoreBadgeProps) {
  const getScoreClass = () => {
    if (type === "risk") {
      if (score <= 30) return "score-safe";
      if (score <= 60) return "score-moderate";
      return "score-danger";
    }
    // Momentum: higher = better
    if (score >= 70) return "score-safe";
    if (score >= 40) return "score-moderate";
    return "score-danger";
  };

  const sizeClass = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span className={`inline-flex items-center gap-1 rounded-md font-mono font-semibold ${getScoreClass()} ${sizeClass}`}>
      {label && <span className="opacity-70">{label}</span>}
      {score}
    </span>
  );
}
