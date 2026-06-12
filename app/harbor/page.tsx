"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Pilot, fmtUsd, fmtPct, enrichApiPilot } from '../../components/data';
import { fetchPilots } from '../../lib/api';
import { Icon, ScoreRing, Sparkline, RiskPill } from '../../components/ui';
import Link from 'next/link';

function PilotCard({ p }: { p: Pilot }) {
  const initials = p.name.replace(/[a-z]/g, '').slice(0, 2);
  
  return (
    <div className="card pilot-card" style={{ display: 'flex', flexDirection: 'column' }}>
      <Link href={`/pilot/${p.id}`} style={{ display: 'block', color: 'inherit' }}>
        <div className="pilot-head">
          <div className="pilot-avatar" style={{ background: `linear-gradient(150deg, ${p.color}, ${p.color}cc)` }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="pilot-name">{p.name}</div>
            <div className="pilot-handle">{p.handle}</div>
          </div>
          <ScoreRing value={p.score} size={56} stroke={6} label="" />
        </div>

        <p style={{ color: 'var(--ink-2)', fontSize: 13.5, lineHeight: 1.5, minHeight: 40, marginTop: 14 }}>
          {p.blurb}
        </p>

        <div style={{ margin: '12px -22px 0', overflow: 'hidden' }}>
          <Sparkline data={p.spark} h={46} color={p.color} sw={2} />
        </div>

        <div className="pilot-stats" style={{ marginTop: 12 }}>
          <div className="pstat">
            <div className="k">TVL</div>
            <div className="v">{fmtUsd(p.tvl)}</div>
          </div>
          <div className="pstat">
            <div className="k">Net APY</div>
            <div className="v pos">{fmtPct(p.apy)}</div>
          </div>
          <div className="pstat">
            <div className="k">Captains</div>
            <div className="v">{p.captains}</div>
          </div>
        </div>
      </Link>

      <div className="pilot-foot" style={{ marginTop: 'auto', paddingTop: 14 }}>
        <div className="tags">
          <RiskPill risk={p.risk} />
          <span className="chip" style={{ fontSize: 10.5, padding: '4px 9px' }}>
            <Icon name={p.chain === 'Arbitrum' ? 'layers' : 'stock'} size={11} style={{ verticalAlign: '-1.5px', marginRight: 3 }} />
            {p.chain}
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
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPilots().then(data => {
      // If API returns no pilots, we could fallback to the mock PILOTS array, but let's show actual DB data
      // For demo purposes, if the db is empty, maybe we should fall back to mock data?
      if (data && data.length > 0) {
        setPilots(data.map(enrichApiPilot));
      } else {
        // Fallback to mock data if API is empty or down
        const { PILOTS } = require('../../components/data');
        setPilots(PILOTS);
      }
      setLoading(false);
    });
  }, []);

  const [risk, setRisk] = useState('all');
  const [chain, setChain] = useState('all');
  const [sort, setSort] = useState<'score' | 'tvl' | 'apy' | 'captains'>('score');

  const riskOpts = [
    ['all', 'All'],
    ['low', 'Calm'],
    ['balanced', 'Balanced'],
    ['high', 'High seas']
  ];
  
  const chainOpts = [
    ['all', 'All chains'],
    ['Arbitrum', 'Arbitrum'],
    ['Robinhood Chain', 'Robinhood']
  ];

  const filteredList = useMemo(() => {
    const l = pilots.filter((p) => {
      const matchRisk = risk === 'all' || p.risk === risk;
      const matchChain = chain === 'all' || p.chain === chain;
      return matchRisk && matchChain;
    });

    const sortingFuncs: Record<string, (a: Pilot, b: Pilot) => number> = {
      score: (a, b) => b.score - a.score,
      tvl: (a, b) => b.tvl - a.tvl,
      apy: (a, b) => b.apy - a.apy,
      captains: (a, b) => b.captains - a.captains
    };

    return [...l].sort(sortingFuncs[sort]);
  }, [pilots, risk, chain, sort]);

  return (
    <div className="wrap" style={{ paddingTop: '20px' }}>
      {loading && <div style={{ position: 'absolute', top: 12, right: 24, fontSize: 12, color: 'var(--ink-3)' }}>Connecting to Indexer...</div>}
      <div className="sec-head" style={{ marginBottom: 32, maxWidth: 960 }}>
        <span className="kicker">The Harbor Marketplace</span>
        <h1 className="h1" style={{ marginTop: 14 }}>
          Browse pilots ranked by reputation,<br />not by marketing budget.
        </h1>
        <p className="lead" style={{ marginTop: 14 }}>
          Filter by risk, network, and strategy. All performance metrics are permanently audited on-chain via ERC-8004.
        </p>
      </div>

      <div className="harbor-toolbar">
        <div className="seg">
          {riskOpts.map(([value, label]) => (
            <button
              key={value}
              className={risk === value ? 'on' : ''}
              onClick={() => setRisk(value)}
            >
              {label}
            </button>
          ))}
        </div>
        
        <div className="seg">
          {chainOpts.map(([value, label]) => (
            <button
              key={value}
              className={chain === value ? 'on' : ''}
              onClick={() => setChain(value)}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
          <span className="mono" style={{ fontSize: 12, color: 'var(--ink-3)' }}>
            {filteredList.length} pilots found
          </span>
          <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value as any)}>
            <option value="score">Sort · Pilotage Score</option>
            <option value="tvl">Sort · TVL</option>
            <option value="apy">Sort · Net APY</option>
            <option value="captains">Sort · Captains</option>
          </select>
        </div>
      </div>

      <div className="pilot-grid" style={{ marginTop: '30px' }}>
        {filteredList.map((p) => (
          <PilotCard key={p.id} p={p} />
        ))}
      </div>

      {filteredList.length === 0 && (
        <div className="card" style={{ padding: 60, textAlign: 'center', color: 'var(--ink-3)', marginTop: '30px' }}>
          <Icon name="compass" size={36} style={{ color: 'var(--ink-3)', opacity: 0.6 }} />
          <p style={{ marginTop: 16, fontSize: 16 }}>No pilots match these waters. Try widening your filters.</p>
        </div>
      )}
    </div>
  );
}
