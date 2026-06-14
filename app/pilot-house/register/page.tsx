"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '../../../components/ui';
import { useAccount, useWriteContract, useSwitchChain, usePublicClient, useReadContract } from 'wagmi';
import { arbitrumSepolia } from 'wagmi/chains';

const REGISTRY_ADDRESS = '0x52F10df476d30F42C9A019302Ea691Cedd0f5616';
const USDC_ADDRESS = '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d';

const PILOT_REGISTRY_ABI = [
  {
    name: "registerPilot",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "card",
        type: "tuple",
        components: [
          { name: "name", type: "string" },
          { name: "description", type: "string" },
          { name: "riskProfile", type: "string" },
          { name: "ipfsMetadata", type: "string" },
          { name: "supportedChains", type: "address[]" },
        ],
      },
      { name: "executor", type: "address" },
      { name: "operator", type: "address" },
      { name: "stake", type: "uint256" },
    ],
    outputs: [{ name: "id", type: "uint256" }],
  },
  {
    name: "minStake",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  }
] as const;

const ERC20_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  }
] as const;

export default function RegisterPilot() {
  const { address, isConnected, chain } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();
  const publicClient = usePublicClient();

  const { data: minStake } = useReadContract({
    address: REGISTRY_ADDRESS,
    abi: PILOT_REGISTRY_ABI,
    functionName: 'minStake',
  });

  const [loadingStep, setLoadingStep] = useState<'idle' | 'approving' | 'registering'>('idle');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [riskProfile, setRiskProfile] = useState('conservative');
  const [executorAddress, setExecutorAddress] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isConnected || !address) {
      setError("Please connect your wallet first.");
      return;
    }

    try {
      // Switch chain to Arbitrum Sepolia if needed
      if (chain?.id !== arbitrumSepolia.id) {
        if (switchChainAsync) {
          await switchChainAsync({ chainId: arbitrumSepolia.id });
        } else {
          setError("Please switch your wallet network to Arbitrum Sepolia.");
          return;
        }
      }

      // 1. Approve USDC stake (use minStake from contract or fallback to 5 USDC)
      setLoadingStep('approving');
      const stakeAmount = minStake || (BigInt(5) * (BigInt(10) ** BigInt(6)));

      const approveTx = await writeContractAsync({
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [REGISTRY_ADDRESS, stakeAmount],
      });

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: approveTx });
      }

      // 2. Register Pilot on PilotRegistry contract
      setLoadingStep('registering');
      const card = {
        name,
        description,
        riskProfile,
        ipfsMetadata: "",
        supportedChains: []
      };

      const registerTx = await writeContractAsync({
        address: REGISTRY_ADDRESS,
        abi: PILOT_REGISTRY_ABI,
        functionName: 'registerPilot',
        args: [card, executorAddress as `0x${string}`, address, stakeAmount],
      });

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: registerTx });
      }

      setSuccess(true);
      setLoadingStep('idle');
    } catch (err: any) {
      console.error(err);
      setError(err?.shortMessage || err?.message || "Transaction failed. Please try again.");
      setLoadingStep('idle');
    }
  };

  if (success) {
    return (
      <div className="wrap" style={{ paddingTop: '60px', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: 480, margin: '0 auto', padding: 40 }}>
          <Icon name="check" size={48} style={{ color: 'var(--pos)', marginBottom: 20 }} />
          <h2 className="h2">Pilot Registered Successfully</h2>
          <p style={{ color: 'var(--ink-2)', marginTop: 12 }}>
            Your pilot is now active on-chain and registered in the database! It will appear in the harbor shortly.
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
            List your autonomous agent on the Pilotage marketplace. Requires a {minStake ? (Number(minStake) / 1e6).toLocaleString() : '5'} USDC stake to ensure alignment.
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(192, 87, 59, 0.12)',
            border: '1px solid var(--neg)',
            color: 'var(--neg)',
            borderRadius: 'var(--r)',
            padding: '12px 20px',
            marginBottom: '24px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="form-group">
            <label className="form-label">Pilot Name</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. YieldSeeker Pro" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
              disabled={loadingStep !== 'idle'}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Risk Profile</label>
            <select
              className="form-input"
              value={riskProfile}
              onChange={(e) => setRiskProfile(e.target.value)}
              required
              disabled={loadingStep !== 'idle'}
            >
              <option value="conservative">Conservative</option>
              <option value="steady-yield">Steady Yield</option>
              <option value="balanced">Balanced</option>
              <option value="aggressive">Aggressive</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Executor Contract Address (Arbitrum Sepolia)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="0x..." 
              value={executorAddress}
              onChange={(e) => setExecutorAddress(e.target.value)}
              required 
              pattern="^0x[a-fA-F0-9]{40}$" 
              disabled={loadingStep !== 'idle'}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Strategy Description</label>
            <textarea 
              className="form-input" 
              rows={4} 
              placeholder="Describe how your pilot navigates the markets..." 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required 
              disabled={loadingStep !== 'idle'}
            />
          </div>

          <div style={{ borderTop: '1px solid var(--vellum)', paddingTop: 24, marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span className="form-label" style={{ margin: 0 }}>Required Stake</span>
              <span className="mono" style={{ fontWeight: 700 }}>
                {minStake ? (Number(minStake) / 1e6).toLocaleString() : '5'} USDC
              </span>
            </div>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', justifyContent: 'center' }} 
              disabled={loadingStep !== 'idle'}
            >
              {loadingStep === 'approving' && 'Step 1/2: Approving USDC Stake...'}
              {loadingStep === 'registering' && 'Step 2/2: Confirming Registry Transaction...'}
              {loadingStep === 'idle' && 'Stake USDC & Register Pilot'}
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
