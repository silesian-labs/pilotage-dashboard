"use client";

import React from 'react';
import { PILOTS, fmtUsd, fmtPct } from '../../../components/data';
import { Icon, ScoreRing, Sparkline, RiskPill } from '../../../components/ui';
import Link from 'next/link';

type Params = Promise<{ id: string }>;

export default function PilotProfile({ params }: { params: Params }) {
  const { id } = React.use(params);
  const p = PILOTS.find(pilot => pilot.id === id);

  if (!p) {
    return (
      <div className="wrap" style={{ paddingTop: 40, textAlign: 'center' }}>
        <h2 className="h2">Pilot not found in these waters</h2>
        <Link href="/harbor" className="btn btn-primary" style={{ marginTop: 20 }}>
          Back to Harbor
        </Link>
      </div>
    );
  }

  const initials = p.name.replace(/[a-z]/g, '').slice(0, 2);

  // Mock historical log events for the pilot
  const auditLogs = [
    { ts: '2 days ago', event: 'Safe Passage', detail: 'Rebalanced TSLA/USDC drift of 5.8% back to target. Gas sponsor: $0.12 (Alchemy)', status: 'success' },
    { ts: '5 days ago', event: 'Safe Passage', detail: 'Rebalanced TSLA/USDC drift of 6.2% back to target. Gas sponsor: $0.15 (Alchemy)', status: 'success' },
    { ts: '1 week ago', event: 'Compliance Check', detail: 'Preflight check: whitelisted protocols and daily limit verified.', status: 'success' },
    { ts: '2 weeks ago', event: 'Charter Modified', detail: 'Captain modified target weight from 70/30 to 60/40. Vault 0x7a...c12a', status: 'info' },
  ];

  return (
    <div className="wrap" style={{ paddingTop: '20px' }}>
      {/* Back button */}
      <Link href="/harbor" className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-3)', marginBottom: 24 }}>
        <Icon name="arrow" size={14} style={{ transform: 'rotate(180deg)' }} /> Return to Harbor
      </Link>

      {/* Profile Header */}
      <div className="card" style={{ padding: '30px', marginBottom: 28 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
          <div className="pilot-avatar" style={{ width: 80, height: 80, fontSize: 30, borderRadius: 18, background: `linear-gradient(150deg, ${p.color}, ${p.color}cc)` }}>
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
              <h1 className="h1">{p.name}</h1>
              <span className="mono" style={{ color: 'var(--ink-3)', fontSize: 14 }}>{p.handle}</span>
            </div>
            <p className="lead" style={{ marginTop: 8, fontSize: 16, maxWidth: 650 }}>
              {p.blurb}
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
              <RiskPill risk={p.risk} />
              <span className="chip">
                <Icon name={p.chain === 'Arbitrum' ? 'layers' : 'stock'} size={12} style={{ verticalAlign: '-1px', marginRight: 4 }} />
                {p.chain}
              </span>
              <span className="chip">{p.age}</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, minWidth: 160 }}>
            <ScoreRing value={p.score} size={84} stroke={8} label="Pilotage Score" />
            <Link className="btn btn-primary" href={`/vault/create?pilot=${p.id}`} style={{ width: '100%' }}>
              Hire Pilot <Icon name="arrow" size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div className="metric-card">
          <span className="metric-label">Total Value Piloted</span>
          <span className="metric-value">{fmtUsd(p.tvl)}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Audited APY</span>
          <span className="metric-value pos">{fmtPct(p.apy)}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Captains Aboard</span>
          <span className="metric-value">{p.captains}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Max Drawdown</span>
          <span className="metric-value" style={{ color: 'var(--neg)' }}>{p.drawdown}%</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Compliance Rate</span>
          <span className="metric-value" style={{ color: 'var(--pos)' }}>{p.compliance}%</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Performance Fee</span>
          <span className="metric-value">{p.fee}%</span>
        </div>
      </div>

      {/* Main layout split */}
      <div className="dashboard-grid">
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* APY Performance Chart */}
          <div className="card">
            <div className="card-title">
              <Icon name="chart" size={18} style={{ color: 'var(--accent)' }} />
              <span>Historical Performance (Net yield index)</span>
            </div>
            <div className="card-body" style={{ padding: '30px 20px 20px' }}>
              <div style={{ height: 180, display: 'flex', alignItems: 'flex-end' }}>
                <Sparkline data={p.spark} h={185} color={p.color} sw={2.5} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }} className="mono">
                <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>T-6 Months</span>
                <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>T-3 Months</span>
                <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>Current Passage</span>
              </div>
            </div>
          </div>

          {/* Audit log trail */}
          <div className="card">
            <div className="card-title">
              <Icon name="scroll" size={18} style={{ color: 'var(--accent)' }} />
              <span>On-Chain Passage History (ERC-8004 Registry)</span>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {auditLogs.map((log, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: i < auditLogs.length - 1 ? 16 : 0, borderBottom: i < auditLogs.length - 1 ? '1px solid var(--vellum)' : 'none' }}>
                  <div style={{ marginTop: 4 }}>
                    {log.status === 'success' ? (
                      <span className="status-badge on" style={{ padding: 4 }}><Icon name="check" size={12} /></span>
                    ) : (
                      <span className="status-badge warn" style={{ padding: 4 }}><Icon name="spark" size={12} /></span>
                    )}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 14.5 }}>{log.event}</span>
                      <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{log.ts}</span>
                    </div>
                    <p style={{ color: 'var(--ink-2)', fontSize: 13.5, marginTop: 4 }}>{log.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Charter policy limits */}
          <div className="card">
            <div className="card-title">
              <Icon name="shield" size={18} style={{ color: 'var(--accent)' }} />
              <span>Charter Policy Constraints</span>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                ['Strategy Target Assets', p.assets],
                ['Rebalance Trigger Band', 'Drift exceeds 5.0%'],
                ['Whitelisted Venues', p.chain === 'Arbitrum' ? 'GMX V2, Uniswap V3, Aave V3' : 'Robinhood Stock Faucet, Aave V3'],
                ['Supported Tokens', p.chain === 'Arbitrum' ? 'USDC, ETH, GMX, ARB' : 'USDC, TSLA, AMZN, PLTR, NFLX, AMD'],
                ['Max Slippage Limit', '0.5%'],
                ['Escrow Developer Stake', '1,000 USDC'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingBottom: 10, borderBottom: '1px solid var(--vellum-soft)' }}>
                  <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{k}</span>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{v}</span>
                </div>
              ))}
              
              <div style={{ background: 'var(--paper-raise)', border: '1px solid var(--vellum)', borderRadius: 'var(--r)', padding: 14, marginTop: 6 }}>
                <div style={{ display: 'flex', gap: 8, color: 'var(--accent-deep)' }}>
                  <Icon name="shieldcheck" size={18} style={{ flex: 'none', marginTop: 1 }} />
                  <p style={{ fontSize: 12.5, fontWeight: 500, lineHeight: 1.4 }}>
                    Math-verified execution. The pilot's session keys are physically restricted by smart contract logic to these exact rules.
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
