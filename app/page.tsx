"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useDashboardState } from "./state";
import { useVault, useVaultActions, useRegistryPilots } from "../lib/hooks";
import { usdc6, usd18, type VaultSnapshot } from "../lib/chain";
import { Icon, ScoreRing } from "../components/ui";
import { fmtUsd, shortAddr, toUiRisk, pilotColor, initialsOf } from "../components/data";
import { ADDRESSES, addrUrl, txUrl } from "../lib/contracts";
import type { ApiAction } from "../lib/api";

const TOKEN_SYM: Record<string, string> = {
  [ADDRESSES.usdc.toLowerCase()]: "USDC",
  [ADDRESSES.aUsdc.toLowerCase()]: "aUSDC",
  "0x0000000000000000000000000000000000000000": "—",
};
const symOf = (a: string) => TOKEN_SYM[a?.toLowerCase()] ?? shortAddr(a);

function statusOf(v: VaultSnapshot): { label: string; color: string; icon: string } {
  if (v.paused) return { label: "Paused", color: "var(--ink-3)", icon: "lock" };
  if (!v.hiredPilot) return { label: "No pilot", color: "var(--ink-3)", icon: "x" };
  if (v.totalUsd === 0n) return { label: "Empty", color: "var(--ink-3)", icon: "anchor" };
  if (v.shouldRebalance) return { label: "Off-course, correcting", color: "var(--warn)", icon: "route" };
  return { label: "On course", color: "var(--pos)", icon: "check" };
}

export default function DashboardPage() {
  const { address } = useAccount();
  const { walletConnected, connectWallet, busy, busyLabel, lastError, clearError,
    deposit, withdrawAll, pausePilot, unpausePilot, revokePilot, hirePilot } = useDashboardState();

  const { data: vault, isLoading: vaultLoading } = useVault(address as `0x${string}` | undefined);
  const { data: actions = [] } = useVaultActions(vault?.address);
  const { data: pilots = [] } = useRegistryPilots();

  const [depositAmount, setDepositAmount] = useState("5");
  const [showModify, setShowModify] = useState(false);

  // ---------------- EMPTY STATE (no wallet or no vault) ----------------
  if (!walletConnected || (!vault && !vaultLoading)) {
    const featured = [...pilots].sort((a, b) => b.score - a.score).slice(0, 2);
    return (
      <div className="wrap" style={{ paddingTop: 30, paddingBottom: 60 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 32, alignItems: "stretch" }} className="dashboard-grid">
          <div className="card glass-deck" style={{ padding: "40px 30px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div className="gyro-container">
              <div className="gyro-ring gyro-ring-1" />
              <div className="gyro-ring gyro-ring-2" />
              <div className="gyro-ring gyro-ring-3" />
              <div className="gyro-center"><Icon name="anchor" size={20} sw={2.2} /></div>
            </div>
            <div style={{ textAlign: "center", maxWidth: 480, margin: "0 auto" }}>
              <span className="kicker" style={{ justifyContent: "center", display: "inline-flex", marginBottom: 12 }}>Captain's Anchorage</span>
              <h1 className="h2" style={{ marginBottom: 14, fontSize: 28 }}>
                {walletConnected ? "Deploy Your First Vault" : "Connect to Begin"}
              </h1>
              <p style={{ color: "var(--ink-2)", fontSize: 14.5, lineHeight: 1.6, marginBottom: 28 }}>
                Pilotage is a non-custodial marketplace for autonomous capital management on Arbitrum Sepolia.
                Anchor USDC in your own vault, grant a bounded charter, and let a registered pilot rebalance against Aave V3 — without ever giving up custody.
              </p>
            </div>
            <div className="telemetry-board">
              <div className="telemetry-item">
                <span className="label">Wallet</span>
                <span className="value" style={{ color: walletConnected ? "var(--pos)" : "var(--warn)" }}>
                  <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: walletConnected ? "var(--pos)" : "var(--warn)", marginRight: 6 }} />
                  {walletConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
              <div className="telemetry-item" style={{ borderLeft: "1px solid var(--vellum)", borderRight: "1px solid var(--vellum)" }}>
                <span className="label">Network</span>
                <span className="value"><Icon name="layers" size={12} style={{ color: "var(--ink-3)", marginRight: 4 }} /> Arbitrum Sepolia</span>
              </div>
              <div className="telemetry-item">
                <span className="label">Vault</span>
                <span className="value">{vaultLoading ? "…" : "In Port"}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <Link className="btn btn-ghost" href="/harbor" style={{ flex: 1, minWidth: 160 }}>
                <Icon name="compass" size={16} /> Browse the harbor
              </Link>
              {walletConnected ? (
                <Link className="btn btn-primary" href="/vault/create" style={{ flex: 1, minWidth: 160 }}>
                  <Icon name="anchor" size={16} /> Deploy a vault
                </Link>
              ) : (
                <button className="btn btn-primary" onClick={connectWallet} style={{ flex: 1, minWidth: 160 }}>
                  <Icon name="key" size={16} /> Connect wallet
                </button>
              )}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20, justifyContent: "center" }}>
            <div style={{ paddingLeft: 8 }}>
              <span className="kicker" style={{ fontSize: 11 }}>Harbor Crew Registry</span>
              <h2 className="h3" style={{ fontSize: 21, marginTop: 4, marginBottom: 4 }}>Registered pilots</h2>
              <p style={{ color: "var(--ink-2)", fontSize: 13.5 }}>Charter-bound agents, ranked by on-chain reputation.</p>
            </div>
            {featured.map((p) => (
              <div key={p.id} className="card pilot-card" style={{ padding: 20 }}>
                <div className="pilot-head">
                  <div className="pilot-avatar" style={{ background: `linear-gradient(150deg, ${pilotColor(p.id)}, ${pilotColor(p.id)}cc)` }}>{initialsOf(p.name)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="pilot-name" style={{ fontSize: 16 }}>{p.name}</div>
                    <div className="pilot-handle mono">{shortAddr(p.operator)}</div>
                  </div>
                  <ScoreRing value={Math.min(100, Math.max(0, p.score))} size={48} stroke={5} label="" />
                </div>
                <p style={{ color: "var(--ink-2)", fontSize: 12.5, lineHeight: 1.5 }}>{p.description}</p>
                <div className="pilot-foot" style={{ padding: 0, paddingTop: 10, borderTop: "1px solid var(--vellum)" }}>
                  <span className="chip" style={{ fontSize: 9.5, padding: "3px 8px" }}>Safe passages: {p.feedbackCount}</span>
                  {walletConnected ? (
                    <Link className="btn btn-ghost btn-sm" href={`/vault/create?pilot=${p.id}`}>Hire Pilot <Icon name="arrow" size={12} /></Link>
                  ) : (
                    <button className="btn btn-ghost btn-sm" onClick={connectWallet}>Connect to Hire <Icon name="key" size={12} /></button>
                  )}
                </div>
              </div>
            ))}
            {featured.length === 0 && <p className="mono" style={{ color: "var(--ink-3)", paddingLeft: 8 }}>Reading registry…</p>}
          </div>
        </div>
      </div>
    );
  }

  if (!vault) {
    return <div className="wrap" style={{ paddingTop: 40, fontFamily: "var(--font-mono)", color: "var(--ink-3)" }}>Loading your vault from chain…</div>;
  }

  // ---------------- FULL DASHBOARD ----------------
  const status = statusOf(vault);
  const drift = vault.driftBps / 100;
  const driftColor = drift < 1 ? "var(--pos)" : drift < 5 ? "var(--warn)" : "var(--neg)";
  const pilot = vault.hiredPilot;

  const holdings = [
    { sym: "USDC", name: "Idle USDC", color: "#2C8A5B", pct: vault.usdcPct, usd: usd18(vault.usdcUsd) },
    { sym: "aUSDC", name: "Aave USDC yield", color: "#2E6E8E", pct: vault.aUsdcPct, usd: usd18(vault.aUsdcUsd) },
  ];

  const handleDeposit = () => {
    const amt = parseFloat(depositAmount);
    if (!isNaN(amt) && amt > 0) deposit(vault.address, amt);
  };

  return (
    <div className="wrap" style={{ paddingTop: 10 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <span className="kicker">Captain's Control Deck</span>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 8 }}>
            <h1 className="h2" style={{ margin: 0 }}>Vault</h1>
            <a className="chip mono" href={addrUrl(vault.address)} target="_blank" rel="noreferrer" style={{ background: "var(--paper-raise)", textTransform: "none" }}>
              {shortAddr(vault.address)} <Icon name="ext" size={11} style={{ marginLeft: 4 }} />
            </a>
            <span className="chip" style={{ background: "var(--paper-raise)", textTransform: "none" }}>
              <Icon name="layers" size={11} style={{ marginRight: 4 }} /> Arbitrum Sepolia
            </span>
          </div>
        </div>
        <Link className="btn btn-ghost btn-sm" href="/harbor"><Icon name="compass" size={13} /> Harbor</Link>
      </div>

      {lastError && (
        <div style={{ background: "rgba(192, 87, 59, 0.12)", border: "1px solid var(--neg)", color: "var(--neg)", borderRadius: "var(--r)", padding: "10px 16px", marginBottom: 16, fontSize: 13.5, display: "flex", alignItems: "center", gap: 10 }}>
          <Icon name="x" size={14} /> {lastError}
          <button onClick={clearError} style={{ marginLeft: "auto", opacity: 0.7 }}><Icon name="x" size={12} /></button>
        </div>
      )}
      {busy && (
        <div className="chip live" style={{ marginBottom: 16 }}><span className="pulse" /> {busyLabel}</div>
      )}

      {/* Metric cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div className="metric-card">
          <span className="metric-label">Vault Balance</span>
          <span className="metric-value">{fmtUsd(usd18(vault.totalUsd))}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Status</span>
          <span className="metric-value" style={{ color: status.color, display: "flex", alignItems: "center", gap: 8, fontSize: 19 }}>
            <Icon name={status.icon} size={19} className={vault.shouldRebalance ? "pulse" : ""} /> {status.label}
          </span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Live Drift</span>
          <span className="metric-value" style={{ color: driftColor }}>{drift.toFixed(2)}%</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">ERC-8004 Score</span>
          <span className="metric-value">{pilot ? pilot.score : "—"}</span>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {/* Holdings */}
          <div className="card">
            <div className="card-title">
              <Icon name="chart" size={18} style={{ color: "var(--accent)" }} />
              <span>Live Allocation (USDC / aUSDC)</span>
            </div>
            <div className="card-body">
              {holdings.map((h) => (
                <div key={h.sym} className="holding-row">
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 9, height: 9, borderRadius: 3, background: h.color }} />
                      <span style={{ fontWeight: 600, fontSize: 14.5 }}>{h.sym}</span>
                      <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{h.name}</span>
                    </div>
                    <div className="bar"><i style={{ width: `${h.pct}%`, background: h.color }} /></div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="mono" style={{ fontWeight: 700, fontSize: 16 }}>{h.pct.toFixed(1)}%</div>
                    <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{fmtUsd(h.usd)}</div>
                  </div>
                </div>
              ))}
              <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 14 }}>
                Values priced live via the MockOracle. The pilot rebalances when drift from its balanced target exceeds 5.0%.
              </p>
            </div>
          </div>

          {/* Hired pilot */}
          {pilot ? (
            <div className="card">
              <div className="card-title">
                <Icon name="helm" size={18} style={{ color: "var(--accent)" }} />
                <span>Hired Pilot</span>
              </div>
              <div className="card-body" style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
                <div className="pilot-avatar" style={{ width: 60, height: 60, borderRadius: 14, fontSize: 20, background: `linear-gradient(150deg, ${pilotColor(pilot.id)}, ${pilotColor(pilot.id)}cc)` }}>
                  {initialsOf(pilot.name)}
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <Link href={`/pilot/${pilot.id}`} style={{ fontWeight: 700, fontSize: 16, textDecoration: "underline" }}>{pilot.name}</Link>
                    <span className="mono" style={{ color: "var(--ink-3)", fontSize: 12 }}>{shortAddr(pilot.operator)}</span>
                  </div>
                  <p style={{ fontSize: 13.5, color: "var(--ink-2)", marginTop: 4 }}>{pilot.description}</p>
                </div>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                  <div style={{ textAlign: "center" }}>
                    <span className="metric-label" style={{ fontSize: 9 }}>Score</span>
                    <div className="mono" style={{ fontWeight: 700 }}>{pilot.score}</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <span className="metric-label" style={{ fontSize: 9 }}>Passages</span>
                    <div className="mono" style={{ fontWeight: 700, color: "var(--pos)" }}>{pilot.feedbackCount}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: 20, textAlign: "center", color: "var(--ink-3)" }}>
              No pilot hired. <Link href="/harbor" style={{ textDecoration: "underline" }}>Hire one from the harbor</Link> to enable automated rebalancing.
            </div>
          )}

          {/* Telemetry — real indexed actions */}
          <div className="console">
            <div className="console-bar">
              <span className="dotrow"><i style={{ background: "#C0573B" }} /><i style={{ background: "#C98A2B" }} /><i style={{ background: "#2C8A5B" }} /></span>
              <span className="console-title">pilot · {pilot?.name || "none"} · executed actions (indexer)</span>
              {vault.shouldRebalance && <span style={{ marginLeft: "auto" }} className="chip live"><span className="pulse" /> drift detected</span>}
            </div>
            <div className="feed" style={{ maxHeight: 340, overflowY: "auto" }}>
              {actions.length === 0 && (
                <div className="feed-item"><div className="body"><div className="sub" style={{ color: "var(--ink-3)" }}>No actions indexed yet. Trigger a rebalance from the Simulation Control Room, then watch executions land here (requires the indexer + pilot runtime running).</div></div></div>
              )}
              {actions.map((a: ApiAction) => {
                const amt = Number(a.amount_in) / 1e6;
                const supplied = symOf(a.token_out) === "aUSDC";
                return (
                  <div className="feed-item" key={a.id}>
                    <div className="tl"><span className="marker" style={{ background: a.success ? "#2C8A5B" : "#C0573B" }} /></div>
                    <div className="body">
                      <div className="ttl">
                        {a.success ? "Safe passage" : "Reverted"} · {supplied ? "supplied to Aave" : "withdrew from Aave"}
                        <span className="ts">{new Date(a.executed_at).toLocaleTimeString()}</span>
                      </div>
                      <div className="sub">{symOf(a.token_in)} → {symOf(a.token_out)} · {amt.toFixed(2)} USDC · block {a.block_number}</div>
                      <a className="txlink mono" href={txUrl(a.tx_hash)} target="_blank" rel="noreferrer">tx: {a.tx_hash.slice(0, 14)}… <Icon name="ext" size={10} /></a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {/* Capital ops */}
          <div className="card">
            <div className="card-title">
              <Icon name="coins" size={18} style={{ color: "var(--accent)" }} />
              <span>Capital Operations</span>
            </div>
            <div className="card-body">
              <div className="form-group" style={{ marginBottom: 24 }}>
                <label className="form-label">Deposit USDC (from your wallet)</label>
                <div style={{ display: "flex", gap: 10 }}>
                  <input type="number" className="form-input" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} min={0} step="0.1" />
                  <button className="btn btn-primary" onClick={handleDeposit} disabled={busy}>Deposit</button>
                </div>
                <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>Approves then deposits to your vault. Needs testnet USDC.</span>
              </div>

              <div style={{ borderTop: "1px solid var(--vellum)", paddingTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
                <span className="form-label">Pilot controls</span>
                {vault.paused ? (
                  <button className="btn btn-ghost" style={{ width: "100%" }} onClick={() => unpausePilot(vault.address)} disabled={busy}>
                    <Icon name="check" size={14} style={{ color: "var(--pos)" }} /> Resume pilot
                  </button>
                ) : (
                  <button className="btn btn-ghost" style={{ width: "100%" }} onClick={() => pausePilot(vault.address)} disabled={busy || !pilot}>
                    <Icon name="lock" size={14} style={{ color: "var(--warn)" }} /> Pause pilot
                  </button>
                )}
                {pilot && (
                  <button className="btn btn-ghost" style={{ width: "100%", color: "var(--neg)" }} onClick={() => revokePilot(vault.address, vault.charter!.pilot)} disabled={busy}>
                    <Icon name="x" size={14} /> Revoke pilot charter
                  </button>
                )}
                <button className="btn btn-ink" style={{ width: "100%", background: "var(--neg)", borderColor: "var(--neg)", color: "#fff" }} onClick={() => withdrawAll(vault.address)} disabled={busy || vault.totalUsd === 0n}>
                  <Icon name="lock" size={14} /> Force withdraw all
                </button>
              </div>
            </div>
          </div>

          {/* Charter */}
          <div className="card">
            <div className="card-title">
              <Icon name="shield" size={18} style={{ color: "var(--accent)" }} />
              <span>Active Charter</span>
            </div>
            <div className="card-body">
              {vault.charter ? (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 18 }}>
                    {[
                      ["Max per action", `${usdc6(vault.charter.maxSingleAmountIn)} USDC`],
                      ["Max per day", `${usdc6(vault.charter.maxDailyAmountIn)} USDC`],
                      ["Spent today", `${usdc6(vault.dailySpent)} USDC`],
                      ["Whitelisted venue", "Aave V3"],
                      ["Whitelisted tokens", "USDC, aUSDC"],
                      ["Expiry", vault.charter.expiresAt === 0n ? "No expiry" : new Date(Number(vault.charter.expiresAt) * 1000).toLocaleDateString()],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", paddingBottom: 8, borderBottom: "1px solid var(--vellum-soft)" }} className="mono">
                        <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{k}</span>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  {pilot && (
                    <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => setShowModify(true)} disabled={busy}>
                      <Icon name="code" size={14} /> Modify charter limits
                    </button>
                  )}
                </>
              ) : (
                <p style={{ color: "var(--ink-3)", fontSize: 13.5 }}>No charter active. Hire a pilot to set one.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modify charter modal */}
      {showModify && pilot && vault.charter && (
        <ModifyCharterModal
          initialSingle={usdc6(vault.charter.maxSingleAmountIn)}
          initialDaily={usdc6(vault.charter.maxDailyAmountIn)}
          onClose={() => setShowModify(false)}
          onSave={async (single, daily, days) => {
            await hirePilot(vault.address, pilot, { maxSingleUsdc: single, maxDailyUsdc: daily, expiresDays: days });
            setShowModify(false);
          }}
        />
      )}
    </div>
  );
}

function ModifyCharterModal({ initialSingle, initialDaily, onClose, onSave }: {
  initialSingle: number; initialDaily: number;
  onClose: () => void; onSave: (single: number, daily: number, days: number) => void;
}) {
  const [single, setSingle] = useState(initialSingle);
  const [daily, setDaily] = useState(initialDaily);
  const [days, setDays] = useState(7);
  return (
    <div className="modal-veil" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 className="h2" style={{ fontSize: 20 }}>Modify Charter</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ padding: 8 }}><Icon name="x" size={16} /></button>
        </div>
        <p style={{ color: "var(--ink-2)", fontSize: 13.5, marginBottom: 18 }}>Re-signs the charter on-chain with new spend limits. Venue and token whitelists stay USDC/aUSDC on Aave V3.</p>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" style={{ fontSize: 11 }}>Max per action (USDC)</label>
            <input type="number" className="form-input" value={single} min={1} onChange={(e) => setSingle(Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: 11 }}>Max per day (USDC)</label>
            <input type="number" className="form-input" value={daily} min={1} onChange={(e) => setDaily(Number(e.target.value))} />
          </div>
        </div>
        <div className="form-group" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <label className="form-label" style={{ fontSize: 11 }}>Expiry</label>
            <span className="mono" style={{ fontSize: 13, fontWeight: 700 }}>{days === 0 ? "No expiry" : `${days} days`}</span>
          </div>
          <input type="range" className="form-slider" min={0} max={30} step={1} value={days} onChange={(e) => setDays(Number(e.target.value))} />
        </div>
        <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => onSave(single, daily, days)}>Save charter on-chain</button>
      </div>
    </div>
  );
}
