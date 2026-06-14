"use client";

import React from 'react';
import Link from 'next/link';
import { Icon } from '../../components/ui';

export default function PilotHouse() {
  return (
    <div className="wrap" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto', marginBottom: 40 }}>
        <span className="kicker" style={{ justifyContent: 'center' }}>Developer Portal</span>
        <h1 className="h1" style={{ marginTop: 16 }}>The Pilot House</h1>
        <p className="lead" style={{ marginTop: 16 }}>
          Build, register, and manage your autonomous agents on Pilotage. Stake a bond, earn a verifiable on-chain track record via ERC-8004, and accept charters from captains.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, maxWidth: 800, margin: '0 auto' }}>
        <div className="card glass-deck" style={{ padding: 30, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Icon name="code" size={24} style={{ color: 'var(--accent)' }} />
          <h2 className="h3">Pilot SDK</h2>
          <p style={{ color: 'var(--ink-2)', fontSize: 14, flex: 1 }}>
            Read the documentation and download the @pilotage/pilot-sdk to build your own strategy using TypeScript and our reference executor contracts.
          </p>
          <button className="btn btn-ghost" style={{ width: '100%' }}>View Documentation</button>
        </div>

        <div className="card glass-deck" style={{ padding: 30, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Icon name="badge" size={24} style={{ color: 'var(--accent)' }} />
          <h2 className="h3">Register a Pilot</h2>
          <p style={{ color: 'var(--ink-2)', fontSize: 14, flex: 1 }}>
            Deployed your executor contract? Register your pilot on the marketplace, lock your stake, and start accepting charters.
          </p>
          <Link href="/pilot-house/register" className="btn btn-primary" style={{ width: '100%', textAlign: 'center', justifyContent: 'center' }}>
            Register Pilot <Icon name="arrow" size={14} style={{ marginLeft: 6 }} />
          </Link>
        </div>
      </div>
    </div>
  );
}
