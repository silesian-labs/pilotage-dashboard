"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { Icon, RiskPill } from "../../../components/ui";
import { useDashboardState } from "../../state";
import { useRegistryPilots } from "../../../lib/hooks";
import { getVaultOf, usdc6, type RegisteredPilot } from "../../../lib/chain";
import { toUiRisk, pilotColor, initialsOf, fmtUsd, shortAddr } from "../../../components/data";

function WizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { address } = useAccount();
  const { walletConnected, connectWallet, createVault, hirePilot, busy, busyLabel, lastError } = useDashboardState();
  const { data: pilots = [], isLoading } = useRegistryPilots();

  const [step, setStep] = useState(1);
  const [selectedPilotId, setSelectedPilotId] = useState<number | null>(null);

  // Charter inputs — these map 1:1 to the on-chain Charter struct.
  const [maxSingleUsdc, setMaxSingleUsdc] = useState(10);
  const [maxDailyUsdc, setMaxDailyUsdc] = useState(20);
  const [expiresDays, setExpiresDays] = useState(7);

  // Pre-select pilot from query param.
  useEffect(() => {
    const pid = searchParams.get("pilot");
    if (pid && pilots.some((p) => p.id === Number(pid))) {
      setSelectedPilotId(Number(pid));
      setStep(2);
    }
  }, [searchParams, pilots]);

  const selectedPilot = pilots.find((p) => p.id === selectedPilotId) || null;

  const handleDeploy = async () => {
    if (!walletConnected) {
      connectWallet();
      return;
    }
    if (!selectedPilot || !address) return;

    // 1. Ensure the captain has a vault (one per captain).
    let vault = await getVaultOf(address as `0x${string}`);
    if (!vault) {
      vault = (await createVault()) ?? null;
    }
    if (!vault) return; // createVault failed; error is surfaced in context

    // 2. Hire the pilot with the configured charter.
    await hirePilot(vault, selectedPilot, { maxSingleUsdc, maxDailyUsdc, expiresDays });

    router.push("/");
  };

  return (
    <div className="wrap" style={{ maxWidth: 640, paddingTop: "10px" }}>
      {/* Progress header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }} className="mono">
        {[
          [1, "01. Pilot"],
          [2, "02. Charter"],
          [3, "03. Sign"],
        ].map(([n, label], i) => (
          <React.Fragment key={n as number}>
            {i > 0 && <div style={{ flex: 1, height: 1.5, background: "var(--vellum)", margin: "0 10px" }} />}
            <span style={{ fontSize: 13, color: step >= (n as number) ? "var(--accent-deep)" : "var(--ink-3)", fontWeight: step === n ? 700 : 500 }}>
              {label}
            </span>
          </React.Fragment>
        ))}
      </div>

      {lastError && (
        <div style={{ background: "rgba(192, 87, 59, 0.12)", border: "1px solid var(--neg)", color: "var(--neg)", borderRadius: "var(--r)", padding: "12px 20px", marginBottom: 20, fontSize: 14 }}>
          {lastError}
        </div>
      )}

      {busy ? (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <span className="chip live" style={{ marginBottom: 20 }}>
            <span className="pulse" /> Working
          </span>
          <h2 className="h2" style={{ fontSize: 24, marginBottom: 12 }}>Setting up your vault</h2>
          <p className="mono" style={{ fontSize: 14, color: "var(--ink-2)" }}>{busyLabel}</p>
          <p className="mono" style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 14 }}>
            Confirm the transaction(s) in your wallet.
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 30 }}>
          {/* STEP 1 — select pilot */}
          {step === 1 && (
            <div>
              <h2 className="h2" style={{ marginBottom: 18 }}>Select your Pilot</h2>
              <p style={{ color: "var(--ink-2)", fontSize: 15, marginBottom: 24 }}>
                Hire a registered, charter-bound agent to manage your vault on Arbitrum Sepolia.
              </p>
              {isLoading && <p className="mono" style={{ color: "var(--ink-3)" }}>Reading the registry…</p>}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {pilots.map((p) => (
                  <button key={p.id} className="wallet-opt" style={{ padding: "16px 20px", alignItems: "flex-start" }} onClick={() => { setSelectedPilotId(p.id); setStep(2); }}>
                    <div className="pilot-avatar" style={{ width: 44, height: 44, borderRadius: 10, fontSize: 16, flex: "none", background: `linear-gradient(150deg, ${pilotColor(p.id)}, ${pilotColor(p.id)}cc)` }}>
                      {initialsOf(p.name)}
                    </div>
                    <div style={{ flex: 1, marginLeft: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: 15.5 }}>{p.name}</span>
                        <RiskPill risk={toUiRisk(p.riskProfile)} />
                      </div>
                      <span style={{ fontSize: 13, color: "var(--ink-2)", display: "block", marginTop: 4, fontWeight: 400 }}>{p.description}</span>
                      <div className="mono" style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 8, fontWeight: 400 }}>
                        Score: {p.score} · Safe passages: {p.feedbackCount} · Stake: {fmtUsd(usdc6(p.stakedAmount))}
                      </div>
                    </div>
                    <Icon name="arrow" size={16} style={{ marginLeft: "auto", alignSelf: "center", color: "var(--ink-3)" }} />
                  </button>
                ))}
                {!isLoading && pilots.length === 0 && (
                  <p className="mono" style={{ color: "var(--ink-3)" }}>No registered pilots found.</p>
                )}
              </div>
            </div>
          )}

          {/* STEP 2 — configure charter */}
          {step === 2 && selectedPilot && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)} style={{ padding: 6 }}>
                  <Icon name="arrow" size={14} style={{ transform: "rotate(180deg)" }} />
                </button>
                <h2 className="h2">Configure Charter Limits</h2>
              </div>
              <p style={{ color: "var(--ink-2)", fontSize: 15, marginBottom: 24 }}>
                Set the on-chain boundaries for <b>{selectedPilot.name}</b>. The vault enforces these — the pilot
                cannot exceed them. Whitelisted venue: Aave V3. Whitelisted tokens: USDC / aUSDC.
              </p>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Max per action (USDC)</label>
                  <input type="number" className="form-input" min={1} value={maxSingleUsdc} onChange={(e) => setMaxSingleUsdc(Number(e.target.value))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Max per day (USDC)</label>
                  <input type="number" className="form-input" min={1} value={maxDailyUsdc} onChange={(e) => setMaxDailyUsdc(Number(e.target.value))} />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <label className="form-label">Charter expiry</label>
                  <span className="mono" style={{ fontSize: 13, fontWeight: 700 }}>{expiresDays === 0 ? "No expiry" : `${expiresDays} days`}</span>
                </div>
                <input type="range" className="form-slider" min={0} max={30} step={1} value={expiresDays} onChange={(e) => setExpiresDays(Number(e.target.value))} />
                <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", display: "block", textAlign: "center" }}>
                  After expiry the pilot can no longer execute until re-hired
                </span>
              </div>

              <button className="btn btn-primary" style={{ width: "100%", marginTop: 14 }} onClick={() => setStep(3)}>
                Review &amp; Sign <Icon name="arrow" size={16} />
              </button>
            </div>
          )}

          {/* STEP 3 — review & sign */}
          {step === 3 && selectedPilot && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setStep(2)} style={{ padding: 6 }}>
                  <Icon name="arrow" size={14} style={{ transform: "rotate(180deg)" }} />
                </button>
                <h2 className="h2">Sign Charter</h2>
              </div>
              <p style={{ color: "var(--ink-2)", fontSize: 15, marginBottom: 20 }}>
                Review the charter you are granting. If you don't have a vault yet, one is deployed for you first.
              </p>

              <div style={{ background: "var(--paper-raise)", border: "1px solid var(--vellum)", borderRadius: "var(--r-lg)", padding: 20, marginBottom: 24 }} className="mono">
                <div style={{ borderBottom: "1px solid var(--vellum)", paddingBottom: 12, marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
                  <Icon name="scroll" size={16} style={{ color: "var(--accent)" }} />
                  <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "var(--accent-deep)" }}>
                    Charter · {selectedPilot.name}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12.5, color: "var(--ink)" }}>
                  <p><b>Pilot signer:</b> {shortAddr(selectedPilot.operator)}</p>
                  <p><b>Allowed venue:</b> Aave V3 pool</p>
                  <p><b>Allowed tokens:</b> USDC, aUSDC (in &amp; out)</p>
                  <p><b>Max per action:</b> {maxSingleUsdc} USDC</p>
                  <p><b>Max per day:</b> {maxDailyUsdc} USDC</p>
                  <p><b>Expiry:</b> {expiresDays === 0 ? "none" : `${expiresDays} days from now`}</p>
                  <p style={{ color: "var(--ink-3)", fontSize: 11, fontStyle: "italic", borderTop: "1px solid var(--vellum)", paddingTop: 10, marginTop: 4 }}>
                    These limits are stored and enforced by your vault contract. Custody of the funds never leaves your vault.
                  </p>
                </div>
              </div>

              <button className="btn btn-primary" style={{ width: "100%" }} onClick={handleDeploy}>
                {walletConnected ? (
                  <><Icon name="key" size={16} /> Deploy vault &amp; hire pilot</>
                ) : (
                  <><Icon name="anchor" size={16} /> Connect wallet to sign</>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function VaultCreateWizard() {
  return (
    <Suspense fallback={<div className="wrap" style={{ paddingTop: 40, fontFamily: "var(--font-mono)" }}>Loading…</div>}>
      <WizardContent />
    </Suspense>
  );
}
