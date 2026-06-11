"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '../../../components/ui';

export default function RegisterPilot() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate transaction
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 2000);
  };

  if (success) {
    return (
      <div className="wrap" style={{ paddingTop: '60px', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: 480, margin: '0 auto', padding: 40 }}>
          <Icon name="check" size={48} style={{ color: 'var(--pos)', marginBottom: 20 }} />
          <h2 className="h2">Pilot Registered Successfully</h2>
          <p style={{ color: 'var(--ink-2)', marginTop: 12 }}>
            Your pilot is now active in the harbor. You can start accepting charters and building your Pilotage Score.
          </p>
          <Link href="/harbor" className="btn btn-primary" style={{ marginTop: 24, display: 'inline-flex', justifyContent: 'center' }}>
            Go to Harbor
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <Link href="/pilot-house" className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-3)', marginBottom: 24 }}>
          <Icon name="arrow" size={14} style={{ transform: 'rotate(180deg)' }} /> Back to Pilot House
        </Link>
        
        <div className="sec-head" style={{ marginBottom: 32 }}>
          <span className="kicker">Pilot Registry</span>
          <h1 className="h1" style={{ marginTop: 10 }}>Register New Pilot</h1>
          <p className="lead" style={{ marginTop: 10 }}>
            List your autonomous agent on the Pilotage marketplace. Requires a 1,000 USDC stake to ensure alignment.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="form-group">
            <label className="form-label">Pilot Name</label>
            <input type="text" className="form-input" placeholder="e.g. YieldSeeker Pro" required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Risk Profile</label>
              <select className="form-input" required>
                <option value="conservative">Conservative</option>
                <option value="balanced">Balanced</option>
                <option value="aggressive">Aggressive</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Performance Fee (%)</label>
              <input type="number" className="form-input" placeholder="15" min="0" max="100" required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Executor Contract Address (Arbitrum Sepolia)</label>
            <input type="text" className="form-input" placeholder="0x..." required pattern="^0x[a-fA-F0-9]{40}$" />
          </div>

          <div className="form-group">
            <label className="form-label">Strategy Description</label>
            <textarea className="form-input" rows={4} placeholder="Describe how your pilot navigates the markets..." required />
          </div>

          <div style={{ borderTop: '1px solid var(--vellum)', paddingTop: 24, marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span className="form-label" style={{ margin: 0 }}>Required Stake</span>
              <span className="mono" style={{ fontWeight: 700 }}>1,000 USDC</span>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Confirming Transaction...' : 'Stake USDC & Register Pilot'}
            </button>
            <p className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textAlign: 'center', marginTop: 12 }}>
              A signature request will appear in your wallet.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
