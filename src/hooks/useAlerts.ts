"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { Alert, AlertNotification, AlertCondition, AlertType, AlertStatus } from "@/types/alerts";

const STORAGE_KEY = "alphadex_alerts";
const NOTIF_KEY = "alphadex_alert_notifications";
const CHECK_INTERVAL = 30_000; // Check every 30 seconds

interface UseAlertsReturn {
  alerts: Alert[];
  notifications: AlertNotification[];
  unreadCount: number;
  createAlert: (params: CreateAlertParams) => Alert;
  deleteAlert: (id: string) => void;
  togglePause: (id: string) => void;
  clearTriggered: () => void;
  markNotificationRead: (alertId: string) => void;
  markAllRead: () => void;
}

interface CreateAlertParams {
  tokenMint: string;
  tokenSymbol: string;
  tokenName: string;
  type: AlertType;
  condition: AlertCondition;
  repeat?: boolean;
}

function loadAlerts(): Alert[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAlerts(alerts: Alert[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
}

function loadNotifications(): AlertNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveNotifications(notifs: AlertNotification[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));
}

function generateId(): string {
  return `alert_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function buildTriggerMessage(alert: Alert): string {
  const { tokenSymbol, condition } = alert;
  switch (condition.type) {
    case "price_above":
      return `${tokenSymbol} price rose above $${condition.targetPrice}`;
    case "price_below":
      return `${tokenSymbol} price dropped below $${condition.targetPrice}`;
    case "price_change_pct":
      return `${tokenSymbol} moved ${condition.pctThreshold}% in ${condition.timeframe}`;
    case "risk_change":
      return `${tokenSymbol} risk score changed (${condition.direction})`;
    case "whale_move":
      return `Large holder moved ${condition.minPct}%+ of ${tokenSymbol} supply`;
    case "volume_spike":
      return `${tokenSymbol} volume spiked ${condition.multiplier}x above normal`;
  }
}

export function useAlerts(): UseAlertsReturn {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [notifications, setNotifications] = useState<AlertNotification[]>([]);
  const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    setAlerts(loadAlerts());
    setNotifications(loadNotifications());
  }, []);

  // Price checking loop
  useEffect(() => {
    const activeAlerts = alerts.filter((a) => a.status === "active");
    if (activeAlerts.length === 0) return;

    async function checkAlerts() {
      const active = loadAlerts().filter((a) => a.status === "active");
      if (active.length === 0) return;

      // Collect unique mints to fetch prices for
      const mints = [...new Set(active.map((a) => a.tokenMint))];
      const mintIds = mints.join(",");

      try {
        const res = await fetch(`https://price.jup.ag/v6/price?ids=${mintIds}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!data.data) return;

        const prices: Record<string, number> = {};
        for (const [mint, info] of Object.entries(data.data as Record<string, { price: number }>)) {
          prices[mint] = info.price;
        }

        // Evaluate each active alert
        const updatedAlerts = [...loadAlerts()];
        const newNotifs: AlertNotification[] = [];
        let changed = false;

        for (const alert of updatedAlerts) {
          if (alert.status !== "active") continue;
          const price = prices[alert.tokenMint];
          if (price === undefined) continue;

          let triggered = false;

          switch (alert.condition.type) {
            case "price_above":
              triggered = price >= alert.condition.targetPrice;
              break;
            case "price_below":
              triggered = price <= alert.condition.targetPrice;
              break;
            case "volume_spike":
              // Volume spike requires historical data — skip for client-side
              break;
            case "whale_move":
              // Whale moves require on-chain monitoring — skip for client-side
              break;
            case "risk_change":
              // Risk changes require safety scanner — skip for client-side
              break;
            case "price_change_pct":
              // Percentage change requires historical snapshot — skip for client-side
              break;
          }

          if (triggered) {
            changed = true;
            alert.status = alert.repeat ? "active" : "triggered";
            alert.triggeredAt = new Date().toISOString();
            alert.message = buildTriggerMessage(alert);

            newNotifs.push({
              alertId: alert.id,
              message: alert.message,
              timestamp: new Date().toISOString(),
              read: false,
            });
          }
        }

        if (changed) {
          saveAlerts(updatedAlerts);
          setAlerts(updatedAlerts);

          const allNotifs = [...loadNotifications(), ...newNotifs];
          saveNotifications(allNotifs);
          setNotifications(allNotifs);
        }
      } catch {
        // Silently fail — will retry next interval
      }
    }

    // Run immediately then on interval
    checkAlerts();
    checkIntervalRef.current = setInterval(checkAlerts, CHECK_INTERVAL);

    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, [alerts.length]); // Re-setup when alert count changes

  const createAlert = useCallback((params: CreateAlertParams): Alert => {
    const alert: Alert = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      tokenMint: params.tokenMint,
      tokenSymbol: params.tokenSymbol,
      tokenName: params.tokenName,
      type: params.type,
      status: "active" as AlertStatus,
      condition: params.condition,
      repeat: params.repeat ?? false,
    };

    setAlerts((prev) => {
      const next = [alert, ...prev];
      saveAlerts(next);
      return next;
    });

    return alert;
  }, []);

  const deleteAlert = useCallback((id: string) => {
    setAlerts((prev) => {
      const next = prev.filter((a) => a.id !== id);
      saveAlerts(next);
      return next;
    });
  }, []);

  const togglePause = useCallback((id: string) => {
    setAlerts((prev) => {
      const next = prev.map((a) => {
        if (a.id !== id) return a;
        if (a.status === "active") return { ...a, status: "paused" as AlertStatus };
        if (a.status === "paused") return { ...a, status: "active" as AlertStatus };
        return a;
      });
      saveAlerts(next);
      return next;
    });
  }, []);

  const clearTriggered = useCallback(() => {
    setAlerts((prev) => {
      const next = prev.filter((a) => a.status !== "triggered");
      saveAlerts(next);
      return next;
    });
  }, []);

  const markNotificationRead = useCallback((alertId: string) => {
    setNotifications((prev) => {
      const next = prev.map((n) =>
        n.alertId === alertId ? { ...n, read: true } : n
      );
      saveNotifications(next);
      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      saveNotifications(next);
      return next;
    });
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    alerts,
    notifications,
    unreadCount,
    createAlert,
    deleteAlert,
    togglePause,
    clearTriggered,
    markNotificationRead,
    markAllRead,
  };
}
