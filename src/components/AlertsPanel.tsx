"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  Bell,
  BellRing,
  Plus,
  Trash2,
  Pause,
  Play,
  TrendingUp,
  TrendingDown,
  Activity,
  ShieldAlert,
  BarChart3,
  X,
  ChevronDown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
} from "lucide-react";
import { useAlerts } from "@/hooks/useAlerts";
import { TOKENS } from "@/data/tokens";
import type { Alert, AlertType, AlertCondition, AlertTimeframe } from "@/types/alerts";
import { ALERT_TYPE_CONFIG } from "@/types/alerts";

// ============================================================
// Token selector for alert creation
// ============================================================
function TokenPicker({
  onSelect,
  onClose,
}: {
  onSelect: (token: { mint: string; symbol: string; name: string }) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return TOKENS;
    const q = search.toLowerCase();
    return TOKENS.filter(
      (t) =>
        t.symbol.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.mint.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search token or paste mint..."
          className="w-full bg-bg-primary rounded-lg border border-border pl-9 pr-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50"
          autoFocus
        />
      </div>
      <div className="max-h-48 overflow-y-auto space-y-1">
        {filtered.map((token) => (
          <button
            key={token.mint}
            onClick={() =>
              onSelect({
                mint: token.mint,
                symbol: token.symbol,
                name: token.name,
              })
            }
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-bg-card-hover transition-colors text-left"
          >
            <span className="text-xs font-semibold text-text-primary">
              {token.symbol}
            </span>
            <span className="text-[11px] text-text-secondary truncate">
              {token.name}
            </span>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-4 text-xs text-text-muted">
            No tokens found. You can paste a custom mint address.
          </div>
        )}
      </div>
      {/* Custom mint input */}
      {search.length >= 32 && filtered.length === 0 && (
        <button
          onClick={() =>
            onSelect({ mint: search, symbol: "???", name: "Custom Token" })
          }
          className="w-full px-3 py-2 rounded-lg border border-accent/30 bg-accent/5 text-xs text-accent font-medium hover:bg-accent/10 transition-colors"
        >
          Use custom mint: {search.slice(0, 12)}...
        </button>
      )}
      <button
        onClick={onClose}
        className="w-full text-[11px] text-text-muted hover:text-text-secondary transition-colors"
      >
        Cancel
      </button>
    </div>
  );
}

// ============================================================
// Alert creation form
// ============================================================
function CreateAlertForm({
  onCreated,
  onCancel,
}: {
  onCreated: () => void;
  onCancel: () => void;
}) {
  const { createAlert } = useAlerts();
  const [step, setStep] = useState<"token" | "type" | "config">("token");
  const [selectedToken, setSelectedToken] = useState<{
    mint: string;
    symbol: string;
    name: string;
  } | null>(null);
  const [selectedType, setSelectedType] = useState<AlertType | null>(null);
  const [repeat, setRepeat] = useState(false);

  // Config values
  const [targetPrice, setTargetPrice] = useState("");
  const [pctThreshold, setPctThreshold] = useState("5");
  const [timeframe, setTimeframe] = useState<AlertTimeframe>("24h");
  const [direction, setDirection] = useState<"up" | "down" | "either">("either");
  const [riskThreshold, setRiskThreshold] = useState("20");
  const [riskDirection, setRiskDirection] = useState<"safer" | "riskier">("riskier");
  const [whaleMinPct, setWhaleMinPct] = useState("5");
  const [volumeMultiplier, setVolumeMultiplier] = useState("3");

  const handleSelectToken = useCallback(
    (token: { mint: string; symbol: string; name: string }) => {
      setSelectedToken(token);
      setStep("type");
    },
    []
  );

  const handleSelectType = useCallback((type: AlertType) => {
    setSelectedType(type);
    setStep("config");
  }, []);

  const handleCreate = useCallback(() => {
    if (!selectedToken || !selectedType) return;

    let condition: AlertCondition;

    switch (selectedType) {
      case "price_above":
        condition = { type: "price_above", targetPrice: parseFloat(targetPrice) || 0 };
        break;
      case "price_below":
        condition = { type: "price_below", targetPrice: parseFloat(targetPrice) || 0 };
        break;
      case "price_change_pct":
        condition = {
          type: "price_change_pct",
          pctThreshold: parseFloat(pctThreshold) || 5,
          timeframe,
          direction,
        };
        break;
      case "risk_change":
        condition = {
          type: "risk_change",
          riskThreshold: parseInt(riskThreshold) || 20,
          direction: riskDirection,
        };
        break;
      case "whale_move":
        condition = { type: "whale_move", minPct: parseFloat(whaleMinPct) || 5 };
        break;
      case "volume_spike":
        condition = { type: "volume_spike", multiplier: parseFloat(volumeMultiplier) || 3 };
        break;
    }

    createAlert({
      tokenMint: selectedToken.mint,
      tokenSymbol: selectedToken.symbol,
      tokenName: selectedToken.name,
      type: selectedType,
      condition,
      repeat,
    });

    onCreated();
  }, [
    selectedToken, selectedType, targetPrice, pctThreshold, timeframe,
    direction, riskThreshold, riskDirection, whaleMinPct, volumeMultiplier,
    repeat, createAlert, onCreated,
  ]);

  const alertTypes: AlertType[] = [
    "price_above",
    "price_below",
    "price_change_pct",
    "risk_change",
    "whale_move",
    "volume_spike",
  ];

  const typeIcons: Record<string, React.ReactNode> = {
    price_above: <TrendingUp className="w-4 h-4" />,
    price_below: <TrendingDown className="w-4 h-4" />,
    price_change_pct: <Activity className="w-4 h-4" />,
    risk_change: <ShieldAlert className="w-4 h-4" />,
    whale_move: <ChevronDown className="w-4 h-4" />,
    volume_spike: <BarChart3 className="w-4 h-4" />,
  };

  return (
    <div className="bg-bg-card rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-text-primary">Create Alert</h3>
        <button onClick={onCancel} className="text-text-muted hover:text-text-primary transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-4">
        {["Token", "Type", "Configure"].map((label, i) => {
          const stepIndex = ["token", "type", "config"].indexOf(step);
          const isActive = i === stepIndex;
          const isDone = i < stepIndex;
          return (
            <div key={label} className="flex items-center gap-1.5">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isActive
                    ? "bg-accent text-white"
                    : isDone
                      ? "bg-green/20 text-green"
                      : "bg-bg-primary text-text-muted"
                }`}
              >
                {isDone ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
              </div>
              <span
                className={`text-[10px] font-medium ${
                  isActive ? "text-accent" : isDone ? "text-green" : "text-text-muted"
                }`}
              >
                {label}
              </span>
              {i < 2 && <div className="w-4 h-px bg-border" />}
            </div>
          );
        })}
      </div>

      {/* Step 1: Token selection */}
      {step === "token" && (
        <TokenPicker
          onSelect={handleSelectToken}
          onClose={onCancel}
        />
      )}

      {/* Step 2: Alert type */}
      {step === "type" && (
        <div className="space-y-2">
          <div className="text-[11px] text-text-secondary mb-2">
            Alert for <span className="font-semibold text-accent">{selectedToken?.symbol}</span>
          </div>
          {alertTypes.map((type) => (
            <button
              key={type}
              onClick={() => handleSelectType(type)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border hover:border-accent/30 hover:bg-accent/5 transition-all text-left"
            >
              <span className="text-accent">{typeIcons[type]}</span>
              <div>
                <div className="text-xs font-semibold text-text-primary">
                  {ALERT_TYPE_CONFIG[type].label}
                </div>
                <div className="text-[10px] text-text-secondary">
                  {ALERT_TYPE_CONFIG[type].description}
                </div>
              </div>
            </button>
          ))}
          <button
            onClick={() => setStep("token")}
            className="w-full text-[11px] text-text-muted hover:text-text-secondary transition-colors mt-2"
          >
            Back to token selection
          </button>
        </div>
      )}

      {/* Step 3: Configuration */}
      {step === "config" && selectedType && (
        <div className="space-y-4">
          <div className="text-[11px] text-text-secondary">
            <span className="font-semibold text-accent">{selectedToken?.symbol}</span>
            {" — "}
            <span className="text-text-primary">{ALERT_TYPE_CONFIG[selectedType].label}</span>
          </div>

          {/* Price Above / Price Below */}
          {(selectedType === "price_above" || selectedType === "price_below") && (
            <div>
              <label className="text-[11px] text-text-secondary block mb-1">
                Target Price (USD)
              </label>
              <input
                type="number"
                step="any"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="e.g. 150.00"
                className="w-full bg-bg-primary rounded-lg border border-border px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50"
                autoFocus
              />
            </div>
          )}

          {/* Price Change % */}
          {selectedType === "price_change_pct" && (
            <>
              <div>
                <label className="text-[11px] text-text-secondary block mb-1">
                  Percentage Threshold
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={pctThreshold}
                    onChange={(e) => setPctThreshold(e.target.value)}
                    className="flex-1 bg-bg-primary rounded-lg border border-border px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent/50"
                  />
                  <span className="text-xs text-text-muted">%</span>
                </div>
              </div>
              <div>
                <label className="text-[11px] text-text-secondary block mb-1">Timeframe</label>
                <div className="flex gap-2">
                  {(["1h", "4h", "24h"] as AlertTimeframe[]).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        timeframe === tf
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border text-text-secondary hover:border-accent/30"
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[11px] text-text-secondary block mb-1">Direction</label>
                <div className="flex gap-2">
                  {(["up", "down", "either"] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDirection(d)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize ${
                        direction === d
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border text-text-secondary hover:border-accent/30"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Risk Change */}
          {selectedType === "risk_change" && (
            <>
              <div>
                <label className="text-[11px] text-text-secondary block mb-1">
                  Risk Score Change Threshold
                </label>
                <input
                  type="number"
                  value={riskThreshold}
                  onChange={(e) => setRiskThreshold(e.target.value)}
                  className="w-full bg-bg-primary rounded-lg border border-border px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent/50"
                />
              </div>
              <div>
                <label className="text-[11px] text-text-secondary block mb-1">Direction</label>
                <div className="flex gap-2">
                  {(["safer", "riskier"] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setRiskDirection(d)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize ${
                        riskDirection === d
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border text-text-secondary hover:border-accent/30"
                      }`}
                    >
                      {d === "safer" ? "Getting Safer" : "Getting Riskier"}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Whale Move */}
          {selectedType === "whale_move" && (
            <div>
              <label className="text-[11px] text-text-secondary block mb-1">
                Minimum % of Supply Moved
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={whaleMinPct}
                  onChange={(e) => setWhaleMinPct(e.target.value)}
                  className="flex-1 bg-bg-primary rounded-lg border border-border px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent/50"
                />
                <span className="text-xs text-text-muted">%</span>
              </div>
            </div>
          )}

          {/* Volume Spike */}
          {selectedType === "volume_spike" && (
            <div>
              <label className="text-[11px] text-text-secondary block mb-1">
                Volume Multiplier (vs. average)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={volumeMultiplier}
                  onChange={(e) => setVolumeMultiplier(e.target.value)}
                  className="flex-1 bg-bg-primary rounded-lg border border-border px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent/50"
                />
                <span className="text-xs text-text-muted">x</span>
              </div>
            </div>
          )}

          {/* Repeat toggle */}
          <div className="flex items-center justify-between py-2 border-t border-border">
            <div>
              <div className="text-[11px] font-medium text-text-primary">Repeat</div>
              <div className="text-[10px] text-text-muted">Keep checking after trigger</div>
            </div>
            <button
              onClick={() => setRepeat(!repeat)}
              className={`w-9 h-5 rounded-full transition-colors ${
                repeat ? "bg-accent" : "bg-border"
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full bg-white transition-transform mx-0.5 ${
                  repeat ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Create button */}
          <div className="flex gap-2">
            <button
              onClick={() => setStep("type")}
              className="px-4 py-2 rounded-lg border border-border text-xs text-text-secondary hover:bg-bg-card-hover transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleCreate}
              className="flex-1 px-4 py-2 rounded-lg text-xs font-semibold text-white swap-button-gradient transition-opacity hover:opacity-90"
            >
              Create Alert
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Alert row in the list
// ============================================================
function AlertRow({
  alert,
  onDelete,
  onTogglePause,
}: {
  alert: Alert;
  onDelete: (id: string) => void;
  onTogglePause: (id: string) => void;
}) {
  const typeIcons: Record<string, React.ReactNode> = {
    price_above: <TrendingUp className="w-3.5 h-3.5" />,
    price_below: <TrendingDown className="w-3.5 h-3.5" />,
    price_change_pct: <Activity className="w-3.5 h-3.5" />,
    risk_change: <ShieldAlert className="w-3.5 h-3.5" />,
    whale_move: <ChevronDown className="w-3.5 h-3.5" />,
    volume_spike: <BarChart3 className="w-3.5 h-3.5" />,
  };

  const statusColors: Record<string, string> = {
    active: "text-green",
    triggered: "text-amber",
    paused: "text-text-muted",
    expired: "text-red",
  };

  function conditionSummary(alert: Alert): string {
    const c = alert.condition;
    switch (c.type) {
      case "price_above":
        return `Price > $${c.targetPrice}`;
      case "price_below":
        return `Price < $${c.targetPrice}`;
      case "price_change_pct":
        return `${c.direction === "either" ? "±" : c.direction === "up" ? "+" : "-"}${c.pctThreshold}% in ${c.timeframe}`;
      case "risk_change":
        return `Risk ${c.direction === "riskier" ? ">" : "<"} ${c.riskThreshold}pt change`;
      case "whale_move":
        return `Whale moves ${c.minPct}%+ supply`;
      case "volume_spike":
        return `Volume > ${c.multiplier}x avg`;
    }
  }

  return (
    <div
      className={`flex items-center gap-3 px-3 py-3 rounded-lg border transition-colors ${
        alert.status === "triggered"
          ? "border-amber/30 bg-amber/5"
          : alert.status === "paused"
            ? "border-border/50 bg-bg-primary/50 opacity-60"
            : "border-border bg-bg-card hover:bg-bg-card-hover"
      }`}
    >
      {/* Type icon */}
      <div className={`${statusColors[alert.status]}`}>
        {typeIcons[alert.type]}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-text-primary">
            {alert.tokenSymbol}
          </span>
          <span className="text-[10px] text-text-muted">
            {ALERT_TYPE_CONFIG[alert.type].label}
          </span>
          {alert.repeat && (
            <span className="text-[9px] px-1 py-0.5 rounded bg-accent/10 text-accent font-medium">
              REPEAT
            </span>
          )}
        </div>
        <div className="text-[11px] text-text-secondary mt-0.5">
          {conditionSummary(alert)}
        </div>
        {alert.status === "triggered" && alert.message && (
          <div className="text-[10px] text-amber mt-0.5 flex items-center gap-1">
            <BellRing className="w-2.5 h-2.5" />
            {alert.message}
          </div>
        )}
      </div>

      {/* Status badge */}
      <div className="flex items-center gap-1">
        <div
          className={`w-1.5 h-1.5 rounded-full ${
            alert.status === "active"
              ? "bg-green animate-pulse"
              : alert.status === "triggered"
                ? "bg-amber"
                : "bg-text-muted"
          }`}
        />
        <span className={`text-[10px] font-medium capitalize ${statusColors[alert.status]}`}>
          {alert.status}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {(alert.status === "active" || alert.status === "paused") && (
          <button
            onClick={() => onTogglePause(alert.id)}
            className="p-1 rounded hover:bg-bg-primary transition-colors text-text-muted hover:text-text-primary"
            title={alert.status === "active" ? "Pause" : "Resume"}
          >
            {alert.status === "active" ? (
              <Pause className="w-3 h-3" />
            ) : (
              <Play className="w-3 h-3" />
            )}
          </button>
        )}
        <button
          onClick={() => onDelete(alert.id)}
          className="p-1 rounded hover:bg-red/10 transition-colors text-text-muted hover:text-red"
          title="Delete"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Main AlertsPanel component
// ============================================================
export default function AlertsPanel() {
  const {
    alerts,
    notifications,
    unreadCount,
    deleteAlert,
    togglePause,
    clearTriggered,
    markAllRead,
  } = useAlerts();
  const [showCreate, setShowCreate] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "triggered">("all");

  const filteredAlerts = useMemo(() => {
    if (filterStatus === "all") return alerts;
    return alerts.filter((a) => a.status === filterStatus);
  }, [alerts, filterStatus]);

  const activeCount = alerts.filter((a) => a.status === "active").length;
  const triggeredCount = alerts.filter((a) => a.status === "triggered").length;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-bold">Alerts</h2>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-red text-white text-[10px] font-bold min-w-[18px] text-center">
                {unreadCount}
              </span>
            )}
          </div>
          <p className="text-text-secondary text-xs mt-0.5">
            Price targets, stop-losses, risk changes, and whale monitoring.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white swap-button-gradient hover:opacity-90 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" />
          New Alert
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="mb-4">
          <CreateAlertForm
            onCreated={() => setShowCreate(false)}
            onCancel={() => setShowCreate(false)}
          />
        </div>
      )}

      {/* Stats bar */}
      <div className="flex items-center gap-4 mb-4 text-[11px]">
        <span className="text-text-secondary">
          {alerts.length} alert{alerts.length !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1 text-green">
          <div className="w-1.5 h-1.5 rounded-full bg-green" />
          {activeCount} active
        </span>
        {triggeredCount > 0 && (
          <>
            <span className="flex items-center gap-1 text-amber">
              <BellRing className="w-3 h-3" />
              {triggeredCount} triggered
            </span>
            <button
              onClick={clearTriggered}
              className="text-text-muted hover:text-text-secondary transition-colors"
            >
              Clear triggered
            </button>
          </>
        )}
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="ml-auto text-text-muted hover:text-accent transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-3">
        {(["all", "active", "triggered"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors capitalize ${
              filterStatus === status
                ? "bg-accent/10 text-accent border border-accent/20"
                : "text-text-secondary hover:text-text-primary border border-transparent"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Alert list */}
      {filteredAlerts.length > 0 ? (
        <div className="space-y-2">
          {filteredAlerts.map((alert) => (
            <AlertRow
              key={alert.id}
              alert={alert}
              onDelete={deleteAlert}
              onTogglePause={togglePause}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Bell className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-text-primary mb-1">
            {alerts.length === 0 ? "No alerts yet" : "No matching alerts"}
          </h3>
          <p className="text-xs text-text-secondary max-w-xs mx-auto">
            {alerts.length === 0
              ? "Create your first alert to monitor token prices, risk scores, whale movements, and volume spikes."
              : "Try changing the filter to see all alerts."}
          </p>
          {alerts.length === 0 && !showCreate && (
            <button
              onClick={() => setShowCreate(true)}
              className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white swap-button-gradient hover:opacity-90 transition-opacity mx-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Alert
            </button>
          )}
        </div>
      )}

      {/* Recent notifications */}
      {notifications.length > 0 && (
        <div className="mt-6">
          <h4 className="text-xs font-semibold text-text-secondary mb-2 flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            Recent Notifications
          </h4>
          <div className="space-y-1.5">
            {notifications.slice(0, 10).map((notif, i) => (
              <div
                key={`${notif.alertId}-${i}`}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] ${
                  notif.read
                    ? "bg-bg-primary text-text-muted"
                    : "bg-accent/5 border border-accent/10 text-text-secondary"
                }`}
              >
                <BellRing className={`w-3 h-3 shrink-0 ${notif.read ? "text-text-muted" : "text-accent"}`} />
                <span className="flex-1">{notif.message}</span>
                <span className="text-[9px] text-text-muted shrink-0">
                  {new Date(notif.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info footer */}
      <div className="mt-8 px-4 py-3 rounded-lg bg-bg-card border border-border">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber shrink-0 mt-0.5" />
          <div className="text-[10px] text-text-secondary">
            <span className="font-semibold text-text-primary">How it works:</span> Price alerts
            check Jupiter prices every 30 seconds while this tab is open. Risk score alerts,
            whale movement, and volume spike alerts require the Safety Scanner backend and will
            be evaluated when on-chain data is available via Helius RPC.
          </div>
        </div>
      </div>
    </div>
  );
}
