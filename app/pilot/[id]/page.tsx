"use client";

import React from "react";
import Link from "next/link";
import { usePilot } from "../../../lib/hooks";
import { usdc6 } from "../../../lib/chain";
import { fmtUsd, shortAddr, toUiRisk, pilotColor, initialsOf, series } from "../../../components/data";
import { Icon, ScoreRing, Sparkline, RiskPill } from "../../../components/ui";
import { addrUrl } from "../../../lib/contracts";

type Params = Promise<{ id: string }>;

export default function PilotProfile({ params }: { params: Params }) {
  const { id } = React.use(params);
  const numericId = parseInt(id, 10);
  const { data: p, isLoading } = usePilot(isNaN(numericId) ? null : numericId);

  if (isLoading) {
    return (
      <div className="wrap" style={{ paddingTop: 40, textAlign: "center" }}>
        <h2 className="h2">Navigating to pilot…</h2>
      </div>
    );
  }

  if (!p) {
    return (
      <div className="wrap" style={{ paddingTop: 40, textAlign: "center" }}>
        <h2 className="h2">Pilot not found in these waters</h2>
        <Link href="/harbor" className="btn btn-primary" style={{ marginTop: 20 }}>
          Back to Harbor
        </Link>
      </div>
    );
  }

  const color = pilotColor(p.id);
  const risk = toUiRisk(p.riskProfile);
  const spark = series(p.id * 7 + p.score, 40, 6, true);
  const registered = new Date(Number(p.registeredAt) * 1000).toLocaleDateString();

  return (
    <div className="wrap" style={{ paddingTop: "20px" }}>
      <Link href="/harbor" className="mono" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--ink-3)", marginBottom: 24 }}>
        <Icon name="arrow" size={14} style={{ transform: "rotate(180deg)" }} /> Return to Harbor
      </Link>

      {/* Profile header */}
      <div className="card" style={{ padding: "30px", marginBottom: 28 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center" }}>
          <div className="pilot-avatar" style={{ width: 80, height: 80, fontSize: 30, borderRadius: 18, background: `linear-gradient(150deg, ${color}, ${color}cc)` }}>
            {initialsOf(p.name)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
              <h1 className="h1">{p.name}</h1>
              <a className="mono" href={addrUrl(p.operator)} target="_blank" rel="noreferrer" style={{ color: "var(--ink-3)", fontSize: 14 }}>
                {shortAddr(p.operator)}
              </a>
            </div>
            <p className="lead" style={{ marginTop: 8, fontSize: 16, maxWidth: 650 }}>
              {p.description || "No description provided."}
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
              <RiskPill risk={risk} />
              <span className="chip">
                <Icon name="layers" size={12} style={{ verticalAlign: "-1px", marginRight: 4 }} /> Arbitrum Sepolia
              </span>
              <span className="chip">Registered {registered}</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, minWidth: 160 }}>
            <ScoreRing value={Math.min(100, Math.max(0, p.score))} size={84} stroke={8} label="Pilotage Score" />
            <Link className="btn btn-primary" href={`/vault/create?pilot=${p.id}`} style={{ width: "100%" }}>
              Hire Pilot <Icon name="arrow" size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Real on-chain metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 16, marginBottom: 28 }}>
        <div className="metric-card">
          <span className="metric-label">Pilotage Score</span>
          <span className="metric-value">{p.score}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Safe Passages</span>
          <span className="metric-value pos">{p.feedbackCount}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Staked Bond</span>
          <span className="metric-value">{fmtUsd(usdc6(p.stakedAmount))}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Registry ID</span>
          <span className="metric-value">#{p.id}</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div className="card">
            <div className="card-title">
              <Icon name="chart" size={18} style={{ color: "var(--accent)" }} />
              <span>Reputation trajectory (ERC-8004)</span>
            </div>
            <div className="card-body" style={{ padding: "30px 20px 20px" }}>
              <div style={{ height: 180, display: "flex", alignItems: "flex-end" }}>
                <Sparkline data={spark} h={185} color={color} sw={2.5} />
              </div>
              <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 10 }}>
                Score {p.score} from {p.feedbackCount} on-chain feedback event{p.feedbackCount === 1 ? "" : "s"}. Each successful, charter-bounded execution posts +1.
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-title">
              <Icon name="scroll" size={18} style={{ color: "var(--accent)" }} />
              <span>On-chain identity</span>
            </div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                ["Developer", p.developer],
                ["Operator (reputation)", p.operator],
                ["Executor", p.executor],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", flexDirection: "column", gap: 4, paddingBottom: 10, borderBottom: "1px solid var(--vellum-soft)" }}>
                  <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: ".04em" }}>{k}</span>
                  <a className="mono" href={addrUrl(v)} target="_blank" rel="noreferrer" style={{ fontSize: 13, fontWeight: 600 }}>{v}</a>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div className="card">
            <div className="card-title">
              <Icon name="shield" size={18} style={{ color: "var(--accent)" }} />
              <span>Operating envelope</span>
            </div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                ["Risk profile", p.riskProfile || "—"],
                ["Whitelisted venue", "Aave V3 pool"],
                ["Supported tokens", "USDC, aUSDC"],
                ["Rebalance band", "Drift exceeds 5.0%"],
                ["Custody", "Non-custodial — captain keeps withdrawal rights"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", flexDirection: "column", gap: 4, paddingBottom: 10, borderBottom: "1px solid var(--vellum-soft)" }}>
                  <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: ".04em" }}>{k}</span>
                  <span style={{ fontWeight: 600, fontSize: 14, textTransform: "capitalize" }}>{v}</span>
                </div>
              ))}

              <div style={{ background: "var(--paper-raise)", border: "1px solid var(--vellum)", borderRadius: "var(--r)", padding: 14, marginTop: 6 }}>
                <div style={{ display: "flex", gap: 8, color: "var(--accent-deep)" }}>
                  <Icon name="shieldcheck" size={18} style={{ flex: "none", marginTop: 1 }} />
                  <p style={{ fontSize: 12.5, fontWeight: 500, lineHeight: 1.4 }}>
                    The pilot's actions are bounded by an on-chain charter (target whitelist, token whitelist, per-action and daily spend caps). It physically cannot move funds outside those rules.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
