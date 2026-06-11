"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PILOTS, Pilot, fmtUsd, fmtPct } from '../../../components/data';
import { Icon, RiskPill } from '../../../components/ui';
import { useDashboardState, CharterSettings } from '../../state';

const pilotTargets: Record<string, { sym: string; name: string; color: string }[]> = {
  'conservative-rwa': [
    { sym: 'aUSDC', name: 'Aave USDC yield', color: '#2C8A5B' },
    { sym: 'TSLA', name: 'Tokenized Tesla', color: '#C0573B' }
  ],
  'aggressive-yield': [
    { sym: 'ETH', name: 'Ethereum spot', color: '#6B57C4' },
    { sym: 'GMX', name: 'GMX perp margin', color: '#B8843C' }
  ],
  'steady-yield': [
    { sym: 'USDC', name: 'USD Coin stable', color: '#2C8A5B' },
    { sym: 'USDT', name: 'Tether stable', color: '#2E6E8E' }
  ],
  'delta-neutral': [
    { sym: 'USDC', name: 'USD Coin stable', color: '#2C8A5B' },
    { sym: 'BTC-H', name: 'Hedged Bitcoin', color: '#1F9DAE' }
  ],
  'index-pilot': [
    { sym: 'USDC', name: 'USD Coin stable', color: '#2C8A5B' },
    { sym: 'RWA-IDX', name: 'Equities Basket', color: '#C0573B' }
  ],
  'tide-runner': [
    { sym: 'USDC', name: 'USDC margin', color: '#2C8A5B' },
    { sym: 'ETH-P', name: 'ETH perps', color: '#1F9DAE' }
  ]
};

function VaultCreateWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { walletConnected, connectWallet, deployVault } = useDashboardState();

  const [step, setStep] = useState(1);
  const [chain, setChain] = useState<string>('');
  const [selectedPilotId, setSelectedPilotId] = useState<string>('');
  
  // Charter inputs
  const [splitRatio, setSplitRatio] = useState<number>(60); // Weight of first asset
  const [maxSingleTx, setMaxSingleTx] = useState<number>(10000);
  const [maxDailySpend, setMaxDailySpend] = useState<number>(30000);
  const [slippage, setSlippage] = useState<number>(0.5);

  // Animation states during deployment
  const [deploying, setDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState('');

  // Handle pre-selected pilot from query parameter
  useEffect(() => {
    const pilotId = searchParams.get('pilot');
    if (pilotId && PILOTS.some(p => p.id === pilotId)) {
      const p = PILOTS.find(p => p.id === pilotId)!;
      setSelectedPilotId(pilotId);
      setChain(p.chain);
      setStep(3); // Skip straight to configuration if chain and pilot are known
    }
  }, [searchParams]);

  // Pilots whitelisted for the selected chain
  const chainPilots = PILOTS.filter(p => p.chain === chain);
  const selectedPilot = PILOTS.find(p => p.id === selectedPilotId);

  const handleSelectChain = (c: string) => {
    setChain(c);
    // If selected pilot is on a different chain, reset selected pilot
    if (selectedPilot && selectedPilot.chain !== c) {
      setSelectedPilotId('');
    }
    setStep(2);
  };

  const handleSelectPilot = (id: string) => {
    setSelectedPilotId(id);
    setStep(3);
  };

  const handleDeploy = () => {
    if (!walletConnected) {
      connectWallet('MetaMask');
      return;
    }

    if (!selectedPilot) return;

    setDeploying(true);
    const logs = [
      'Sponsoring deployment fees via Alchemy Paymaster...',
      'Signing session keys with fine-grained ERC-7715 charter...',
      'Deploying non-custodial smart contract vault...',
      'Vault initialized. Safe sailing!'
    ];

    let runningLogIndex = 0;
    setDeployStep(logs[0]);

    const timer = setInterval(() => {
      runningLogIndex += 1;
      if (runningLogIndex < logs.length) {
        setDeployStep(logs[runningLogIndex]);
      } else {
        clearInterval(timer);
        
        // Finalize deployment
        const targets = pilotTargets[selectedPilotId] || [
          { sym: 'USDC', name: 'USD Coin', color: '#2C8A5B' },
          { sym: 'ASSET', name: 'Target asset', color: '#C0573B' }
        ];

        const charter: CharterSettings = {
          targets: [
            { ...targets[0], target: splitRatio },
            { ...targets[1], target: 100 - splitRatio }
          ],
          maxSingleTx,
          maxDailySpend,
          slippage
        };

        deployVault(chain, selectedPilotId, charter);
        router.push('/');
      }
    }, 1200);
  };

  return (
    <div className="wrap" style={{ maxWidth: 640, paddingTop: '10px' }}>
      
      {/* Wizard Progress Header */}
      {!deploying && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }} className="mono">
          <span style={{ fontSize: 13, color: step >= 1 ? 'var(--accent-deep)' : 'var(--ink-3)', fontWeight: step === 1 ? 700 : 500 }}>
            01. Network
          </span>
          <div style={{ flex: 1, height: 1.5, background: 'var(--vellum)', margin: '0 10px' }} />
          <span style={{ fontSize: 13, color: step >= 2 ? 'var(--accent-deep)' : 'var(--ink-3)', fontWeight: step === 2 ? 700 : 500 }}>
            02. Pilot
          </span>
          <div style={{ flex: 1, height: 1.5, background: 'var(--vellum)', margin: '0 10px' }} />
          <span style={{ fontSize: 13, color: step >= 3 ? 'var(--accent-deep)' : 'var(--ink-3)', fontWeight: step === 3 ? 700 : 500 }}>
            03. Charter
          </span>
          <div style={{ flex: 1, height: 1.5, background: 'var(--vellum)', margin: '0 10px' }} />
          <span style={{ fontSize: 13, color: step >= 4 ? 'var(--accent-deep)' : 'var(--ink-3)', fontWeight: step === 4 ? 700 : 500 }}>
            04. Sign
          </span>
        </div>
      )}

      {deploying ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <span className="chip live" style={{ marginBottom: 20 }}>
            <span className="pulse" /> Deploying
          </span>
          <h2 className="h2" style={{ fontSize: 24, marginBottom: 12 }}>Setting up your vault</h2>
          <p className="mono" style={{ fontSize: 14, color: 'var(--ink-2)' }}>{deployStep}</p>
          <div style={{ display: 'grid', placeItems: 'center', margin: '30px 0' }}>
            <svg className="compass-bg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="0.8" style={{ animation: 'spin 4s linear infinite', position: 'static', opacity: 1 }}>
              <path d="M12 2v20M2 12h20M12 12l4-7-4 2-4-2 4 7Z" />
            </svg>
            <style jsx global>{`
              @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 30 }}>
          
          {/* STEP 1: CHOOSE CHAIN */}
          {step === 1 && (
            <div>
              <h2 className="h2" style={{ marginBottom: 18 }}>Select your navigation waters</h2>
              <p style={{ color: 'var(--ink-2)', fontSize: 15, marginBottom: 24 }}>
                Choose which testnet chain you want to deploy your non-custodial smart vault on.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <button
                  className="wallet-opt"
                  style={{ borderColor: chain === 'Arbitrum' ? 'var(--accent)' : 'var(--vellum)', background: chain === 'Arbitrum' ? 'var(--accent-soft)' : 'var(--paper-raise)', padding: 20 }}
                  onClick={() => handleSelectChain('Arbitrum')}
                >
                  <span className="ic" style={{ background: 'var(--accent-soft)', fontSize: 22 }}>⚓</span>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 16, display: 'block' }}>Arbitrum Sepolia Testnet</span>
                    <span style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 400 }}>High yield DeFi protocols whitelisted (GMX, Aave).</span>
                  </div>
                  <Icon name="arrow" size={16} style={{ marginLeft: 'auto', color: 'var(--ink-3)' }} />
                </button>
                <button
                  className="wallet-opt"
                  style={{ borderColor: chain === 'Robinhood Chain' ? 'var(--accent)' : 'var(--vellum)', background: chain === 'Robinhood Chain' ? 'var(--accent-soft)' : 'var(--paper-raise)', padding: 20 }}
                  onClick={() => handleSelectChain('Robinhood Chain')}
                >
                  <span className="ic" style={{ background: 'var(--accent-soft)', fontSize: 22 }}>📈</span>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 16, display: 'block' }}>Robinhood Chain Testnet (46630)</span>
                    <span style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 400 }}>Tokenized real world stocks whitelisted (TSLA, AMZN, NFLX).</span>
                  </div>
                  <Icon name="arrow" size={16} style={{ marginLeft: 'auto', color: 'var(--ink-3)' }} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SELECT PILOT */}
          {step === 2 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)} style={{ padding: 6 }}>
                  <Icon name="arrow" size={14} style={{ transform: 'rotate(180deg)' }} />
                </button>
                <h2 className="h2">Select your Pilot</h2>
              </div>
              <p style={{ color: 'var(--ink-2)', fontSize: 15, marginBottom: 24 }}>
                Hire an agent specialized in navigating the whitelisted protocols of <b>{chain}</b>.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {chainPilots.map((p) => {
                  const initials = p.name.replace(/[a-z]/g, '').slice(0, 2);
                  return (
                    <button
                      key={p.id}
                      className="wallet-opt"
                      style={{ padding: '16px 20px', alignItems: 'flex-start' }}
                      onClick={() => handleSelectPilot(p.id)}
                    >
                      <div className="pilot-avatar" style={{ width: 44, height: 44, borderRadius: 10, fontSize: 16, flex: 'none', background: `linear-gradient(150deg, ${p.color}, ${p.color}cc)` }}>
                        {initials}
                      </div>
                      <div style={{ flex: 1, marginLeft: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 700, fontSize: 15.5 }}>{p.name}</span>
                          <RiskPill risk={p.risk} />
                        </div>
                        <span style={{ fontSize: 13, color: 'var(--ink-2)', display: 'block', marginTop: 4, fontWeight: 400 }}>
                          {p.blurb}
                        </span>
                        <div className="mono" style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 8, fontWeight: 400 }}>
                          TVL: {fmtUsd(p.tvl)} · APY: {fmtPct(p.apy)} · Score: {p.score}/100
                        </div>
                      </div>
                      <Icon name="arrow" size={16} style={{ marginLeft: 'auto', alignSelf: 'center', color: 'var(--ink-3)' }} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: CONFIGURE CHARTER */}
          {step === 3 && selectedPilot && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setStep(searchParams.get('pilot') ? 3 : 2)} style={{ padding: 6 }} disabled={!!searchParams.get('pilot')}>
                  <Icon name="arrow" size={14} style={{ transform: 'rotate(180deg)' }} />
                </button>
                <h2 className="h2">Configure Charter Policies</h2>
              </div>
              <p style={{ color: 'var(--ink-2)', fontSize: 15, marginBottom: 24 }}>
                Draw the boundaries for <b>{selectedPilot.name}</b>. The pilot cannot make transactions outside these rules.
              </p>

              {/* Target Allocations Slider */}
              <div className="form-group" style={{ background: 'var(--paper-raise)', border: '1px solid var(--vellum)', borderRadius: 'var(--r)', padding: 18, marginBottom: 20 }}>
                {(() => {
                  const targets = pilotTargets[selectedPilotId] || [
                    { sym: 'USDC', name: 'USDC', color: '#2C8A5B' },
                    { sym: 'ASSET', name: 'Asset', color: '#C0573B' }
                  ];
                  return (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }} className="mono">
                        <span style={{ fontSize: 12, fontWeight: 600, color: targets[0].color }}>{targets[0].sym} ({splitRatio}%)</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: targets[1].color }}>{targets[1].sym} ({100 - splitRatio}%)</span>
                      </div>
                      
                      <div style={{ height: 10, borderRadius: 999, display: 'flex', overflow: 'hidden', marginBottom: 16 }}>
                        <div style={{ width: `${splitRatio}%`, background: targets[0].color, transition: 'width 0.2s' }} />
                        <div style={{ width: `${100 - splitRatio}%`, background: targets[1].color, transition: 'width 0.2s' }} />
                      </div>

                      <input
                        type="range"
                        className="form-slider"
                        min="10"
                        max="90"
                        value={splitRatio}
                        onChange={(e) => setSplitRatio(Number(e.target.value))}
                      />
                      <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', display: 'block', textAlign: 'center' }}>
                        Drag to adjust the target weights whitelisted for drift rebalancing
                      </span>
                    </>
                  );
                })()}
              </div>

              {/* Limits and Slippage */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Max single tx limit</label>
                  <input
                    type="number"
                    className="form-input"
                    value={maxSingleTx}
                    onChange={(e) => setMaxSingleTx(Number(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Max daily budget</label>
                  <input
                    type="number"
                    className="form-input"
                    value={maxDailySpend}
                    onChange={(e) => setMaxDailySpend(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <label className="form-label">Max Slippage tolerance</label>
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

              <button className="btn btn-primary" style={{ width: '100%', marginTop: 14 }} onClick={() => setStep(4)}>
                Review and Sign <Icon name="arrow" size={16} />
              </button>
            </div>
          )}

          {/* STEP 4: REVIEW AND SIGN */}
          {step === 4 && selectedPilot && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setStep(3)} style={{ padding: 6 }}>
                  <Icon name="arrow" size={14} style={{ transform: 'rotate(180deg)' }} />
                </button>
                <h2 className="h2">Sign Charter Agreement</h2>
              </div>
              <p style={{ color: 'var(--ink-2)', fontSize: 15, marginBottom: 20 }}>
                Review the human-readable summary of the smart charter permissions you are delegating.
              </p>

              {/* human-readable charter box */}
              <div style={{ background: 'var(--paper-raise)', border: '1px solid var(--vellum)', borderRadius: 'var(--r-lg)', padding: 20, marginBottom: 24 }} className="mono">
                <div style={{ borderBottom: '1px solid var(--vellum)', paddingBottom: 12, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon name="scroll" size={16} style={{ color: 'var(--accent)' }} />
                  <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-deep)' }}>
                    Charter agreement: {selectedPilot.name}
                  </span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5, color: 'var(--ink)' }}>
                  <p>
                    <b>1. Scope:</b> Hires {selectedPilot.name} to pilot assets on {chain}.
                  </p>
                  <p>
                    <b>2. Targets:</b> WHitelisted allocations: 
                    {(() => {
                      const targets = pilotTargets[selectedPilotId] || [];
                      return ` ${targets[0]?.sym || 'Asset 1'} (${splitRatio}%) / ${targets[1]?.sym || 'Asset 2'} (${100 - splitRatio}%)`;
                    })()} (drift band 5%).
                  </p>
                  <p>
                    <b>3. Safe pass limits:</b> Max single transaction of ${maxSingleTx.toLocaleString()} USDC; max daily cumulative spend of ${maxDailySpend.toLocaleString()} USDC.
                  </p>
                  <p>
                    <b>4. Execution boundaries:</b> Allowed destinations restricted strictly to whitelisted smart pools. Slippage maximum {slippage}%.
                  </p>
                  <p style={{ color: 'var(--ink-3)', fontSize: 11, fontStyle: 'italic', borderTop: '1px solid var(--vellum)', paddingTop: 10, marginTop: 4 }}>
                    By signing this ERC-7715 session charter, you grant transaction signing authority inside these rules only. Capital custody remains in your vault.
                  </p>
                </div>
              </div>

              <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleDeploy}>
                {walletConnected ? (
                  <><Icon name="key" size={16} /> Sign ERC-7715 &amp; Deploy Vault</>
                ) : (
                  <><Icon name="anchor" size={16} /> Connect Wallet to Sign</>
                )}
              </button>
              
              <p className="mono" style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 14, textAlign: 'center' }}>
                Gas sponsored on deployment · single transaction deployment
              </p>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

export default function VaultCreateWizard() {
  return (
    <Suspense fallback={<div className="wrap" style={{ paddingTop: 40, fontFamily: 'var(--font-mono)' }}>Loading Pilotage Wizard...</div>}>
      <VaultCreateWizardContent />
    </Suspense>
  );
}
