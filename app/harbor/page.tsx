"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRegistryPilots } from "../../lib/hooks";
import { fmtUsd, shortAddr, toUiRisk, pilotColor, initialsOf, series } from "../../components/data";
import { Icon, ScoreRing, Sparkline, RiskPill } from "../../components/ui";
import type { RegisteredPilot } from "../../lib/chain";
import { usdc6 } from "../../lib/chain";

function PilotCard({ p }: { p: RegisteredPilot }) {
  const color = pilotColor(p.id);
  const risk = toUiRisk(p.riskProfile);
  const spark = series(p.id * 7 + p.score, 40, 6, p.score >= 0);

  return (
    <div className="card pilot-card" style={{ display: "flex", flexDirection: "column" }}>
      <Link href={`/pilot/${p.id}`} style={{ display: "block", color: "inherit" }}>
        <div className="pilot-head">
          <div className="pilot-avatar" style={{ background: `linear-gradient(150deg, ${color}, ${color}cc)` }}>
            {initialsOf(p.name)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="pilot-name">{p.name}</div>
            <div className="pilot-handle mono">{shortAddr(p.operator)}</div>
          </div>
          <ScoreRing value={Math.min(100, Math.max(0, p.score))} size={56} stroke={6} label="" />
        </div>

        <p style={{ color: "var(--ink-2)", fontSize: 13.5, lineHeight: 1.5, minHeight: 40, marginTop: 14 }}>
          {p.description || "No description provided."}
        </p>

        <div style={{ margin: "12px -22px 0", overflow: "hidden" }}>
          <Sparkline data={spark} h={46} color={color} sw={2} />
        </div>

        <div className="pilot-stats" style={{ marginTop: 12 }}>
          <div className="pstat">
            <div className="k">Pilotage Score</div>
            <div className="v">{p.score}</div>
          </div>
          <div className="pstat">
            <div className="k">Safe passages</div>
            <div className="v pos">{p.feedbackCount}</div>
          </div>
          <div className="pstat">
            <div className="k">Stake</div>
            <div className="v">{fmtUsd(usdc6(p.stakedAmount))}</div>
          </div>
        </div>
      </Link>

      <div className="pilot-foot" style={{ marginTop: "auto", paddingTop: 14 }}>
        <div className="tags">
          <RiskPill risk={risk} />
          <span className="chip" style={{ fontSize: 10.5, padding: "4px 9px" }}>
            <Icon name="layers" size={11} style={{ verticalAlign: "-1.5px", marginRight: 3 }} />
            Arbitrum Sepolia
          </span>
        </div>
        <Link className="btn btn-ghost btn-sm" href={`/vault/create?pilot=${p.id}`}>
          Hire <Icon name="arrow" size={15} />
        </Link>
      </div>
    </div>
  );
}

export default function Harbor() {
  const { data: pilots = [], isLoading, isError } = useRegistryPilots();
  const [risk, setRisk] = useState("all");
  const [sort, setSort] = useState<"score" | "passages" | "stake">("score");

  const riskOpts = [
    ["all", "All"],
    ["low", "Calm"],
    ["balanced", "Balanced"],
    ["high", "High seas"],
  ];

  const filteredList = useMemo(() => {
    const l = pilots.filter((p) => risk === "all" || toUiRisk(p.riskProfile) === risk);
    const sorters: Record<string, (a: RegisteredPilot, b: RegisteredPilot) => number> = {
      score: (a, b) => b.score - a.score,
      passages: (a, b) => b.feedbackCount - a.feedbackCount,
      stake: (a, b) => Number(b.stakedAmount - a.stakedAmount),
    };
    return [...l].sort(sorters[sort]);
  }, [pilots, risk, sort]);

  return (
    <div className="wrap" style={{ paddingTop: "20px" }}>
      {isLoading && (
        <div style={{ position: "absolute", top: 12, right: 24, fontSize: 12, color: "var(--ink-3)" }}>
          Reading the registry…
        </div>
      )}
      <div className="sec-head" style={{ marginBottom: 32, maxWidth: 960 }}>
        <span className="kicker">The Harbor Marketplace</span>
        <h1 className="h1" style={{ marginTop: 14 }}>
          Browse pilots ranked by reputation,<br />not by marketing budget.
        </h1>
        <p className="lead" style={{ marginTop: 14 }}>
          Every pilot here is registered on-chain in the PilotRegistry with a staked bond. Scores are
          accumulated per successful execution via the ERC-8004 reputation registry — fully auditable.
        </p>
      </div>

      <div className="harbor-toolbar">
        <div className="seg">
          {riskOpts.map(([value, label]) => (
            <button key={value} className={risk === value ? "on" : ""} onClick={() => setRisk(value)}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
          <span className="mono" style={{ fontSize: 12, color: "var(--ink-3)" }}>
            {filteredList.length} pilot{filteredList.length === 1 ? "" : "s"} registered
          </span>
          <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value as any)}>
            <option value="score">Sort · Pilotage Score</option>
            <option value="passages">Sort · Safe passages</option>
            <option value="stake">Sort · Stake</option>
          </select>
        </div>
      </div>

      <div className="pilot-grid" style={{ marginTop: "30px" }}>
        {filteredList.map((p) => (
          <PilotCard key={p.id} p={p} />
        ))}
      </div>

      {!isLoading && filteredList.length === 0 && (
        <div className="card" style={{ padding: 60, textAlign: "center", color: "var(--ink-3)", marginTop: "30px" }}>
          <Icon name="compass" size={36} style={{ color: "var(--ink-3)", opacity: 0.6 }} />
          <p style={{ marginTop: 16, fontSize: 16 }}>
            {isError ? "Could not reach the chain. Check your RPC connection." : "No pilots registered in these waters yet."}
          </p>
          <Link href="/pilot-house/register" className="btn btn-primary" style={{ marginTop: 20 }}>
            Register the first pilot
          </Link>
        </div>
      )}
    </div>
  );
}
