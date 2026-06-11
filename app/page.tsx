"use client";

import React, { useState, useEffect } from 'react';
import { useDashboardState, UserVault, CharterSettings } from './state';
import { Pilot, fmtUsd, enrichApiPilot } from '../components/data';
import { fetchPilots } from '../lib/api';
import { Icon, ScoreRing } from '../components/ui';
import Link from 'next/link';

export default function DashboardPage() {
  const {
    walletConnected,
    connectWallet,
    vaults,
    activeVaultIndex,
    rebalancing,
    depositToVault,
    withdrawFromVault,
    revokePilot,
    pausePilot,
    unpausePilot,
    modifyCharter,
    simulatePriceDrop,
    setActiveVaultIndex,
    resetAllState
  } = useDashboardState();

  const [depositAmount, setDepositAmount] = useState<string>('5000');
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('alert') === 'wallet-required') {
        setShowAlert(true);
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, []);

  // Form states for modify charter
  const [splitRatio, setSplitRatio] = useState<number>(60);
  const [maxSingleTx, setMaxSingleTx] = useState<number>(10000);
  const [maxDailySpend, setMaxDailySpend] = useState<number>(30000);
  const [slippage, setSlippage] = useState<number>(0.5);

  const activeVault: UserVault | undefined = vaults[activeVaultIndex];
  
  // Fetch real pilots instead of using static PILOTS
  const [pilotsList, setPilotsList] = useState<Pilot[]>([]);
  useEffect(() => {
    fetchPilots().then(data => {
      if (data && data.length > 0) {
        setPilotsList(data.map(enrichApiPilot));
      } else {
        const { PILOTS } = require('../components/data');
        setPilotsList(PILOTS);
      }
    });
  }, []);

  const activePilot = activeVault && pilotsList.length > 0 ? pilotsList.find(p => p.id === activeVault.pilotId) : null;

  const handleDeposit = () => {
    if (!activeVault) return;
    const amt = parseFloat(depositAmount);
    if (!isNaN(amt) && amt > 0) {
      depositToVault(activeVault.id, amt);
      setDepositAmount('5000');
    }
  };

  const openModifyModal = () => {
    if (!activeVault) return;
    // Pre-fill form values from active vault settings
    setSplitRatio(activeVault.charter.targets[0].target);
    setMaxSingleTx(activeVault.charter.maxSingleTx);
    setMaxDailySpend(activeVault.charter.maxDailySpend);
    setSlippage(activeVault.charter.slippage);
    setShowModifyModal(true);
  };

  const handleSaveCharter = () => {
    if (!activeVault) return;
    const targets = activeVault.charter.targets;
    const updatedCharter: CharterSettings = {
      targets: [
        { ...targets[0], target: splitRatio },
        { ...targets[1], target: 100 - splitRatio }
      ],
      maxSingleTx,
      maxDailySpend,
      slippage
    };
    modifyCharter(activeVault.id, updatedCharter);
    setShowModifyModal(false);
  };

  const triggerVolatility = () => {
    if (!activeVault || !activeVault.holdings[1]) return;
    // Simulate drop on the second asset (TSLA, GMX, or whatever it is)
    simulatePriceDrop(activeVault.id, activeVault.holdings[1].sym, -8);
  };

  // ---------------- EMPTY STATE ----------------
  if (vaults.length === 0) {
    // Show top 2 pilots from API or fallback
    const featuredPilots = pilotsList.slice(0, 2);
    return (
      <div className="wrap" style={{ paddingTop: '30px', paddingBottom: '60px' }}>
        {showAlert && (
          <div style={{
            background: 'rgba(192, 87, 59, 0.12)',
            border: '1px solid var(--neg)',
            color: 'var(--neg)',
            borderRadius: 'var(--r)',
            padding: '12px 20px',
            marginBottom: '24px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'feed-in 0.4s ease'
          }}>
            <Icon name="lock" size={16} />
            <span style={{ fontWeight: 500 }}>Wallet connection required. Please connect your wallet first to deploy a vault.</span>
            <button onClick={() => setShowAlert(false)} style={{ marginLeft: 'auto', opacity: 0.7, cursor: 'pointer' }}>
              <Icon name="x" size={14} />
            </button>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '32px', alignItems: 'stretch' }} className="dashboard-grid">
          
          {/* Left Column: Command & Instrument Panel */}
          <div className="card glass-deck" style={{ padding: '40px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            
            {/* CSS Gyroscope */}
            <div className="gyro-container">
              <div className="gyro-ring gyro-ring-1" />
              <div className="gyro-ring gyro-ring-2" />
              <div className="gyro-ring gyro-ring-3" />
              <div className="gyro-center">
                <Icon name="anchor" size={20} sw={2.2} />
              </div>
            </div>

            <div style={{ textAlign: 'center', maxWidth: '480px', margin: '0 auto' }}>
              <span className="kicker" style={{ justifyContent: 'center', display: 'inline-flex', marginBottom: 12 }}>Captain's Anchorage</span>
              <h1 className="h2" style={{ marginBottom: 14, fontSize: 28 }}>Deploy Your First Vault</h1>
              <p style={{ color: 'var(--ink-2)', fontSize: 14.5, lineHeight: 1.6, marginBottom: 28 }}>
                Pilotage is a self-custodial marketplace for autonomous capital management. Anchor your assets in a non-custodial vault, sign a permissioned delegation charter, and let professional pilots steer through the markets.
              </p>
            </div>

            {/* Telemetry Board */}
            <div className="telemetry-board">
              <div className="telemetry-item">
                <span className="label">Telemetry Link</span>
                <span className="value" style={{ color: walletConnected ? 'var(--pos)' : 'var(--warn)' }}>
                  <span className="pulse" style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: walletConnected ? 'var(--pos)' : 'var(--warn)', marginRight: 6 }} />
                  {walletConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="telemetry-item" style={{ borderLeft: '1px solid var(--vellum)', borderRight: '1px solid var(--vellum)' }}>
                <span className="label">Vessel Status</span>
                <span className="value">
                  <Icon name="helm" size={12} style={{ color: 'var(--ink-3)', marginRight: 4 }} /> In Port
                </span>
              </div>
              <div className="telemetry-item">
                <span className="label">Gas / Fuel</span>
                <span className="value" style={{ color: 'var(--pos)' }}>
                  <Icon name="bolt" size={11} style={{ marginRight: 4 }} /> Sponsored
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link className="btn btn-ghost" href="/harbor" style={{ flex: 1, minWidth: 160 }}>
                <Icon name="compass" size={16} /> Browse the harbor
              </Link>
              {walletConnected ? (
                <Link className="btn btn-primary" href="/vault/create" style={{ flex: 1, minWidth: 160 }}>
                  <Icon name="anchor" size={16} /> Deploy a vault
                </Link>
              ) : (
                <button className="btn btn-primary" onClick={() => connectWallet('MetaMask')} style={{ flex: 1, minWidth: 160 }}>
                  <Icon name="key" size={16} /> Connect wallet
                </button>
              )}
            </div>

            <p className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 24, textAlign: 'center' }}>
              Sponsor gas on deployment · non-custodial session authorization
            </p>
          </div>

          {/* Right Column: Featured Crew (Pilots) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, justifyContent: 'center' }}>
            <div style={{ paddingLeft: 8 }}>
              <span className="kicker" style={{ fontSize: 11 }}>Harbor Crew Registry</span>
              <h2 className="h3" style={{ fontSize: 21, marginTop: 4, marginBottom: 4 }}>Available reference pilots</h2>
              <p style={{ color: 'var(--ink-2)', fontSize: 13.5 }}>Hire these certified, rule-bound agents to manage your vault's assets.</p>
            </div>

            {featuredPilots.map((p) => {
              const initials = p.name.replace(/[a-z]/g, '').slice(0, 2);
              return (
                <div key={p.id} className="card pilot-card" style={{ padding: 20, cursor: 'default' }}>
                  <div className="pilot-head">
                    <div className="pilot-avatar" style={{ background: `linear-gradient(150deg, ${p.color}, ${p.color}cc)` }}>{initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="pilot-name" style={{ fontSize: 16 }}>{p.name}</div>
                      <div className="pilot-handle">{p.handle}</div>
                    </div>
                    <ScoreRing value={p.score} size={48} stroke={5} label="" />
                  </div>

                  <p style={{ color: 'var(--ink-2)', fontSize: 12.5, lineHeight: 1.5 }}>{p.blurb}</p>

                  <div className="pilot-stats" style={{ paddingTop: 0 }}>
                    <div className="pstat"><div className="k" style={{ fontSize: 9 }}>TVL</div><div className="v" style={{ fontSize: 14 }}>{fmtUsd(p.tvl)}</div></div>
                    <div className="pstat"><div className="k" style={{ fontSize: 9 }}>Net APY</div><div className="v pos" style={{ fontSize: 14 }}>+{p.apy}%</div></div>
                    <div className="pstat"><div className="k" style={{ fontSize: 9 }}>Risk</div><div className="v" style={{ fontSize: 14, textTransform: 'capitalize', color: p.risk === 'low' ? 'var(--pos)' : 'var(--neg)' }}>{p.risk}</div></div>
                  </div>

                  <div className="pilot-foot" style={{ padding: 0, paddingTop: 10, borderTop: '1px solid var(--vellum)' }}>
                    <div className="tags">
                      <span className="chip" style={{ fontSize: 9.5, padding: '3px 8px' }}><Icon name={p.chain === 'Arbitrum' ? 'layers' : 'stock'} size={10} style={{ marginRight: 4 }} /> {p.chain}</span>
                    </div>
                    {walletConnected ? (
                      <Link className="btn btn-ghost btn-sm" href={`/vault/create?pilot=${p.id}`}>
                        Hire Pilot <Icon name="arrow" size={12} />
                      </Link>
                    ) : (
                      <button className="btn btn-ghost btn-sm" onClick={() => connectWallet('MetaMask')}>
                        Connect to Hire <Icon name="key" size={12} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    );
  }


  // ---------------- FULL DASHBOARD STATE ----------------
  const statusColor = activeVault.status === 'On course' ? 'var(--pos)' 
    : activeVault.status === 'Off-course, correcting' ? 'var(--warn)' 
    : 'var(--ink-3)';

  const driftColor = activeVault.drift < 1.0 ? 'var(--pos)' 
    : activeVault.drift < 5.0 ? 'var(--warn)' 
    : 'var(--neg)';

  return (
    <div className="wrap" style={{ paddingTop: '10px' }}>
      
      {/* Vault Switcher & Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <span className="kicker">Captain's Control Deck</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8 }}>
            <h1 className="h2" style={{ margin: 0 }}>Vault {activeVault.address}</h1>
            <span className="chip" style={{ background: 'var(--paper-raise)', textTransform: 'none' }}>
              <Icon name={activeVault.chain === 'Arbitrum' ? 'layers' : 'stock'} size={11} style={{ marginRight: 4 }} />
              {activeVault.chain}
            </span>
          </div>
        </div>

        {/* Switcher dropdown for multiple vaults */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {vaults.length > 1 && (
            <select
              className="sort-select"
              value={activeVaultIndex}
              onChange={(e) => setActiveVaultIndex(Number(e.target.value))}
              style={{ padding: '8px 16px' }}
            >
              {vaults.map((v, i) => (
                <option key={v.id} value={i}>
                  Vault: {v.address} ({v.chain})
                </option>
              ))}
            </select>
          )}
          <Link className="btn btn-ghost btn-sm" href="/vault/create">
            <Icon name="anchor" size={13} /> Deploy another
          </Link>
          <button className="btn btn-ghost btn-sm" onClick={resetAllState} title="Reset simulation state" style={{ color: 'var(--neg)' }}>
            Reset state
          </button>
        </div>
      </div>

      {/* Volatility simulation control panel */}
      {activeVault.status === 'On course' && activeVault.balanceUsd > 0 && (
        <div className="sim-panel reveal in">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="bolt" size={16} style={{ color: 'var(--accent)' }} />
                <span>Simulation Control Room</span>
              </h3>
              <p style={{ color: 'var(--ink-2)', fontSize: 13.5, marginTop: 4 }}>
                Simulate market volatility to trigger the pilot. Dropping {activeVault.holdings[1]?.sym} price by -8% will push the vault out of its target charter weights.
              </p>
            </div>
            <button className="btn btn-primary" onClick={triggerVolatility} disabled={rebalancing}>
              <Icon name="bolt" size={15} /> Drop {activeVault.holdings[1]?.sym} −8%
            </button>
          </div>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div className="metric-card">
          <span className="metric-label">Vault Balance</span>
          <span className="metric-value">{activeVault.balanceUsd.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
        </div>
        
        <div className="metric-card">
          <span className="metric-label">Telemetry Status</span>
          <span className="metric-value" style={{ color: statusColor, display: 'flex', alignItems: 'center', gap: 8, fontSize: 20 }}>
            {activeVault.status === 'On course' && <Icon name="check" size={20} />}
            {activeVault.status === 'Off-course, correcting' && <Icon name="route" size={20} className="pulse" />}
            {activeVault.status === 'Paused' && <Icon name="lock" size={20} />}
            {activeVault.status === 'Revoked' && <Icon name="x" size={20} />}
            {activeVault.status}
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Active Drift</span>
          <span className="metric-value" style={{ color: driftColor }}>
            {activeVault.drift.toFixed(1)}%
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Whitelisted Assets</span>
          <span className="metric-value" style={{ fontSize: 18, fontFamily: 'var(--font-body)', marginTop: 4 }}>
            {activeVault.holdings.map(h => h.sym).join(' / ')}
          </span>
        </div>
      </div>

      {/* Main Grid layout */}
      <div className="dashboard-grid">
        
        {/* Left Column: Holdings & Logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          
          {/* Target vs Actual Holdings weights */}
          <div className="card">
            <div className="card-title">
              <Icon name="chart" size={18} style={{ color: 'var(--accent)' }} />
              <span>Asset Allocations (Target vs. Actual)</span>
            </div>
            <div className="card-body">
              {activeVault.holdings.map(h => (
                <div key={h.sym} className="holding-row">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 9, height: 9, borderRadius: 3, background: h.color }} />
                      <span style={{ fontWeight: 600, fontSize: 14.5 }}>{h.sym}</span>
                      <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{h.name}</span>
                    </div>
                    <div className="bar">
                      <i style={{ width: `${h.actual}%`, background: h.color }} />
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="mono" style={{ fontWeight: 700, fontSize: 16 }}>{h.actual}%</div>
                    <div className="mono" style={{ fontSize: 11, color: Math.abs(h.actual - h.target) > 1 ? 'var(--warn)' : 'var(--ink-3)' }}>
                      target {h.target}%
                    </div>
                  </div>
                </div>
              ))}
              <p className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 14 }}>
                *Charter allows a maximum deviation of 5.0% before rebalance triggers.
              </p>
            </div>
          </div>

          {/* Hired Pilot details card */}
          {activePilot ? (
            <div className="card">
              <div className="card-title">
                <Icon name="helm" size={18} style={{ color: 'var(--accent)' }} />
                <span>Hired Pilot Details</span>
              </div>
              <div className="card-body" style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="pilot-avatar" style={{ width: 60, height: 60, borderRadius: 14, fontSize: 20, background: `linear-gradient(150deg, ${activePilot.color}, ${activePilot.color}cc)` }}>
                  {activePilot.name.replace(/[a-z]/g, '').slice(0, 2)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <Link href={`/pilot/${activePilot.id}`} style={{ fontWeight: 700, fontSize: 16, textDecoration: 'underline' }}>
                      {activePilot.name}
                    </Link>
                    <span className="mono" style={{ color: 'var(--ink-3)', fontSize: 12 }}>{activePilot.handle}</span>
                  </div>
                  <p style={{ fontSize: 13.5, color: 'var(--ink-2)', marginTop: 4 }}>{activePilot.blurb}</p>
                </div>
                
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center' }}>
                    <span className="metric-label" style={{ fontSize: 9 }}>APY</span>
                    <div className="mono" style={{ fontWeight: 700, color: 'var(--pos)' }}>+{activeVault.holdings[0]?.actual > 0 ? activePilot.apy : 0.0}%</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span className="metric-label" style={{ fontSize: 9 }}>Score</span>
                    <div className="mono" style={{ fontWeight: 700 }}>{activeVault.pilotScore.toFixed(1)}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: 20, textAlign: 'center', color: 'var(--ink-3)' }}>
              Pilot revoked. Rebalance automation disabled.
            </div>
          )}

          {/* Telemetry log feed console */}
          <div className="console">
            <div className="console-bar">
              <span className="dotrow"><i style={{ background: '#C0573B' }} /><i style={{ background: '#C98A2B' }} /><i style={{ background: '#2C8A5B' }} /></span>
              <span className="console-title">pilot · {activePilot?.name || 'none'} · telemetry logs</span>
              {rebalancing && <span style={{ marginLeft: 'auto' }} className="chip live"><span className="pulse" /> rebalancing</span>}
            </div>
            
            <div className="feed" style={{ maxHeight: 320, overflowY: 'auto' }}>
              {[...activeVault.logs].reverse().map((f, i) => (
                <div className="feed-item" key={i}>
                  <div className="tl">
                    <span className="marker" style={{ background: f.marker }} />
                  </div>
                  <div className="body">
                    <div className="ttl">
                      {f.ttl}
                      <span className="ts">{f.ts}</span>
                    </div>
                    <div className="sub">{f.sub}</div>
                    {f.tx && (
                      <span className="txlink" style={{ cursor: 'default' }}>
                        tx: {f.tx}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Actions & Charter settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          
          {/* Quick Vault Capital Actions */}
          <div className="card">
            <div className="card-title">
              <Icon name="coins" size={18} style={{ color: 'var(--accent)' }} />
              <span>Capital Operations</span>
            </div>
            <div className="card-body">
              {/* Deposit */}
              <div className="form-group" style={{ marginBottom: 24 }}>
                <label className="form-label">Deposit mock USDC</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input
                    type="number"
                    className="form-input"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    disabled={activeVault.status === 'Revoked'}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={handleDeposit}
                    disabled={activeVault.status === 'Revoked' || rebalancing}
                  >
                    Deposit
                  </button>
                </div>
              </div>

              {/* Pilot Controls */}
              <div style={{ borderTop: '1px solid var(--vellum)', paddingTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span className="form-label">Automation Controls</span>
                
                {activeVault.status === 'Paused' && (
                  <button className="btn btn-ghost" style={{ width: '100%' }} onClick={() => unpausePilot(activeVault.id)} disabled={rebalancing}>
                    <Icon name="check" size={14} style={{ color: 'var(--pos)' }} /> Resume Pilot automation
                  </button>
                )}

                {activeVault.status === 'On course' && (
                  <button className="btn btn-ghost" style={{ width: '100%' }} onClick={() => pausePilot(activeVault.id)} disabled={rebalancing}>
                    <Icon name="lock" size={14} style={{ color: 'var(--warn)' }} /> Pause Pilot automation
                  </button>
                )}

                {activeVault.status !== 'Revoked' && (
                  <button className="btn btn-ghost" style={{ width: '100%', color: 'var(--neg)' }} onClick={() => revokePilot(activeVault.id)} disabled={rebalancing}>
                    <Icon name="x" size={14} /> Revoke Pilot Session Keys
                  </button>
                )}

                <button
                  className="btn btn-ink"
                  style={{ width: '100%', background: 'var(--neg)', borderColor: 'var(--neg)', color: '#fff' }}
                  onClick={() => withdrawFromVault(activeVault.id)}
                  disabled={activeVault.balanceUsd === 0 || rebalancing}
                >
                  <Icon name="lock" size={14} /> Force Withdraw All Capital
                </button>
              </div>
            </div>
          </div>

          {/* Active Charter constraints summary */}
          <div className="card">
            <div className="card-title">
              <Icon name="shield" size={18} style={{ color: 'var(--accent)' }} />
              <span>Active Charter Policies</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
                {[
                  ['Single tx limit', `$${activeVault.charter.maxSingleTx.toLocaleString()} USDC`],
                  ['Daily cumulative spend', `$${activeVault.charter.maxDailySpend.toLocaleString()} USDC`],
                  ['Target slippage limit', `${activeVault.charter.slippage}%`],
                  ['Trigger bandwidth', 'Drift >= 5.0%'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--vellum-soft)' }} className="mono">
                    <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{k}</span>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{v}</span>
                  </div>
                ))}
              </div>
              
              {activeVault.status !== 'Revoked' && (
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={openModifyModal} disabled={rebalancing}>
                  <Icon name="code" size={14} /> Modify Charter Rules
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* MODIFY CHARTER RULES MODAL */}
      {showModifyModal && (
        <div className="modal-veil" onClick={() => setShowModifyModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 className="h2" style={{ fontSize: 20 }}>Modify Charter Rules</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModifyModal(false)} style={{ padding: 8 }}>
                <Icon name="x" size={16} />
              </button>
            </div>

            {/* Target Allocations Slider */}
            <div className="form-group" style={{ background: 'var(--paper-raise)', border: '1px solid var(--vellum)', borderRadius: 'var(--r)', padding: 14, marginBottom: 18 }}>
              {(() => {
                const targets = activeVault.charter.targets;
                return (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }} className="mono">
                      <span style={{ fontSize: 11.5, fontWeight: 600, color: targets[0].color }}>{targets[0].sym} ({splitRatio}%)</span>
                      <span style={{ fontSize: 11.5, fontWeight: 600, color: targets[1].color }}>{targets[1].sym} ({100 - splitRatio}%)</span>
                    </div>
                    
                    <div style={{ height: 8, borderRadius: 999, display: 'flex', overflow: 'hidden', marginBottom: 12 }}>
                      <div style={{ width: `${splitRatio}%`, background: targets[0].color }} />
                      <div style={{ width: `${100 - splitRatio}%`, background: targets[1].color }} />
                    </div>

                    <input
                      type="range"
                      className="form-slider"
                      min="10"
                      max="90"
                      value={splitRatio}
                      onChange={(e) => setSplitRatio(Number(e.target.value))}
                    />
                  </>
                );
              })()}
            </div>

            {/* Limits */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" style={{ fontSize: 11 }}>Max single tx limit</label>
                <input
                  type="number"
                  className="form-input"
                  value={maxSingleTx}
                  onChange={(e) => setMaxSingleTx(Number(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: 11 }}>Max daily spend</label>
                <input
                  type="number"
                  className="form-input"
                  value={maxDailySpend}
                  onChange={(e) => setMaxDailySpend(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <label className="form-label" style={{ fontSize: 11 }}>Max Slippage tolerance</label>
                <span className="mono" style={{ fontSize: 13, fontWeight: 700 }}>{slippage}%</span>
              </div>
              <input
                type="range"
                className="form-slider"
                min="0.1"
                max="2.0"
                step="0.1"
                value={slippage}
                onChange={(e) => setSlippage(Number(e.target.value))}
              />
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSaveCharter}>
              Save Charter modifications
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
