// ============================================================
// ALERT SYSTEM — Types & Interfaces
// ============================================================

export type AlertType =
  | "price_above"       // Price rises above threshold
  | "price_below"       // Price drops below threshold
  | "price_change_pct"  // Price changes by X% in a time window
  | "risk_change"       // Safety score changes significantly
  | "whale_move"        // Large holder transfer detected
  | "volume_spike";     // Volume spikes above normal

export type AlertStatus = "active" | "triggered" | "expired" | "paused";

export type AlertTimeframe = "1h" | "4h" | "24h";

export interface Alert {
  id: string;
  createdAt: string;      // ISO timestamp
  triggeredAt?: string;   // When it was triggered

  // What token to watch
  tokenMint: string;
  tokenSymbol: string;
  tokenName: string;

  // Alert configuration
  type: AlertType;
  status: AlertStatus;

  // Condition parameters
  condition: AlertCondition;

  // Optional: one-shot vs repeating
  repeat: boolean;

  // Notification message when triggered
  message?: string;
}

export type AlertCondition =
  | { type: "price_above"; targetPrice: number }
  | { type: "price_below"; targetPrice: number }
  | { type: "price_change_pct"; pctThreshold: number; timeframe: AlertTimeframe; direction: "up" | "down" | "either" }
  | { type: "risk_change"; riskThreshold: number; direction: "safer" | "riskier" }
  | { type: "whale_move"; minPct: number }  // min % of supply moved
  | { type: "volume_spike"; multiplier: number }; // e.g. 3x normal volume

export interface AlertNotification {
  alertId: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// Labels and descriptions for the UI
export const ALERT_TYPE_CONFIG: Record<AlertType, { label: string; description: string; icon: string }> = {
  price_above: {
    label: "Price Above",
    description: "Triggers when the token price rises above a target",
    icon: "TrendingUp",
  },
  price_below: {
    label: "Price Below",
    description: "Triggers when the token price drops below a target (stop-loss)",
    icon: "TrendingDown",
  },
  price_change_pct: {
    label: "Price Change %",
    description: "Triggers on a percentage price move within a timeframe",
    icon: "Activity",
  },
  risk_change: {
    label: "Risk Score Change",
    description: "Triggers when on-chain risk score changes significantly",
    icon: "ShieldAlert",
  },
  whale_move: {
    label: "Whale Movement",
    description: "Triggers when a large holder moves tokens",
    icon: "Anchor",
  },
  volume_spike: {
    label: "Volume Spike",
    description: "Triggers when trading volume spikes above normal",
    icon: "BarChart3",
  },
};
