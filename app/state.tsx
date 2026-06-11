"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { PILOTS, Pilot } from '../components/data';
import { useAccount, useDisconnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';

export interface CharterSettings {
  targets: { sym: string; name: string; target: number; color: string }[];
  maxSingleTx: number;
  maxDailySpend: number;
  slippage: number;
}

export interface VaultLog {
  kind: string;
  marker: string;
  ttl: string;
  sub: string;
  ts: string;
  tx?: string;
}

export interface UserVault {
  id: string;
  address: string;
  chain: string;
  pilotId: string;
  charter: CharterSettings;
  status: 'On course' | 'Off-course, correcting' | 'Paused' | 'Revoked';
  drift: number;
  balanceUsd: number;
  holdings: { sym: string; name: string; target: number; actual: number; color: string }[];
  logs: VaultLog[];
  pilotScore: number;
}

interface DashboardContextType {
  walletConnected: boolean;
  walletAddress: string | null;
  walletName: string | null;
  vaults: UserVault[];
  activeVaultIndex: number;
  rebalancing: boolean;
  connectWallet: (name: string) => void;
  disconnectWallet: () => void;
  deployVault: (chain: string, pilotId: string, charter: CharterSettings) => void;
  depositToVault: (vaultId: string, amount: number) => void;
  withdrawFromVault: (vaultId: string) => void;
  revokePilot: (vaultId: string) => void;
  pausePilot: (vaultId: string) => void;
  unpausePilot: (vaultId: string) => void;
  modifyCharter: (vaultId: string, charter: CharterSettings) => void;
  simulatePriceDrop: (vaultId: string, assetSym: string, pctDrop: number) => void;
  setActiveVaultIndex: (index: number) => void;
  resetAllState: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardStateProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();

  const walletConnected = isConnected;
  const walletAddress = address || null;
  const walletName = connector?.name || null;

  const [vaults, setVaults] = useState<UserVault[]>([]);
  const [activeVaultIndex, setActiveVaultIndex] = useState<number>(0);
  const [rebalancing, setRebalancing] = useState(false);

  // Sync wallet connection state to cookie for Next.js Middleware check
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isConnected) {
        document.cookie = "wallet_connected=true; path=/; max-age=31536000; SameSite=Lax";
      } else {
        document.cookie = "wallet_connected=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
      }
    }
  }, [isConnected]);

  // Load vaults from localStorage on mount
  useEffect(() => {
    const savedVaults = localStorage.getItem('pl_vaults');
    if (savedVaults) {
      try {
        setVaults(JSON.parse(savedVaults));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Save vaults to localStorage whenever they change
  const saveState = (vts: UserVault[]) => {
    localStorage.setItem('pl_vaults', JSON.stringify(vts));
  };

  const connectWallet = (name?: string) => {
    if (openConnectModal) {
      openConnectModal();
    }
  };

  const disconnectWallet = () => {
    disconnect();
  };

  const deployVault = (chain: string, pilotId: string, charter: CharterSettings) => {
    const mockAddress = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const pilot = PILOTS.find(p => p.id === pilotId) || PILOTS[0];

    const initialHoldings = charter.targets.map(t => ({
      sym: t.sym,
      name: t.name,
      target: t.target,
      actual: t.target, // Perfectly balanced initially
      color: t.color
    }));

    const formattedTime = () => new Date().toTimeString().split(' ')[0];

    const newVault: UserVault = {
      id: Math.random().toString(36).substring(2, 9),
      address: mockAddress.substring(0, 6) + '...' + mockAddress.substring(36),
      chain,
      pilotId,
      charter,
      status: 'On course',
      drift: 0.0,
      balanceUsd: 10000.0, // Default sponsored starting balance
      holdings: initialHoldings,
      pilotScore: pilot.score,
      logs: [
        {
          kind: 'info',
          marker: '#6E909B',
          ttl: 'Vault Deployed on ' + chain,
          sub: `Smart contract deployed at ${mockAddress.substring(0, 14)}...`,
          ts: formattedTime()
        },
        {
          kind: 'info',
          marker: '#2E6E8E',
          ttl: `Hired Pilot: ${pilot.name}`,
          sub: 'ERC-7715 charter signature registered. Sponsoring initial operations.',
          ts: formattedTime()
        },
        {
          kind: 'watch',
          marker: '#6E909B',
          ttl: 'Watching vault, all positions on course',
          sub: 'Drift 0.0% · within charter band',
          ts: formattedTime()
        }
      ]
    };

    const updatedVaults = [...vaults, newVault];
    setVaults(updatedVaults);
    setActiveVaultIndex(updatedVaults.length - 1);
    saveState(updatedVaults);
  };

  const depositToVault = (vaultId: string, amount: number) => {
    const updated = vaults.map(v => {
      if (v.id === vaultId) {
        const updatedLogs = [
          ...v.logs,
          {
            kind: 'deposit',
            marker: '#2C8A5B',
            ttl: 'Deposit Registered',
            sub: `Funded vault with +${amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`,
            ts: new Date().toTimeString().split(' ')[0]
          }
        ];
        return {
          ...v,
          balanceUsd: v.balanceUsd + amount,
          logs: updatedLogs
        };
      }
      return v;
    });
    setVaults(updated);
    saveState(updated);
  };

  const withdrawFromVault = (vaultId: string) => {
    const updated = vaults.map(v => {
      if (v.id === vaultId) {
        const withdrawnAmt = v.balanceUsd;
        const updatedLogs = [
          ...v.logs,
          {
            kind: 'withdraw',
            marker: '#C0573B',
            ttl: 'Force Withdraw Executed',
            sub: `Returned all ${withdrawnAmt.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} to your wallet EOA`,
            ts: new Date().toTimeString().split(' ')[0]
          }
        ];
        return {
          ...v,
          balanceUsd: 0,
          holdings: v.holdings.map(h => ({ ...h, actual: 0 })),
          logs: updatedLogs,
          status: 'Paused' as const
        };
      }
      return v;
    });
    setVaults(updated);
    saveState(updated);
  };

  const revokePilot = (vaultId: string) => {
    const updated = vaults.map(v => {
      if (v.id === vaultId) {
        return {
          ...v,
          status: 'Revoked' as const,
          logs: [
            ...v.logs,
            {
              kind: 'revoke',
              marker: '#C0573B',
              ttl: 'Hired Pilot Revoked',
              sub: 'ERC-7715 charter keys revoked. Pilot can no longer perform actions.',
              ts: new Date().toTimeString().split(' ')[0]
            }
          ]
        };
      }
      return v;
    });
    setVaults(updated);
    saveState(updated);
  };

  const pausePilot = (vaultId: string) => {
    const updated = vaults.map(v => {
      if (v.id === vaultId) {
        return {
          ...v,
          status: 'Paused' as const,
          logs: [
            ...v.logs,
            {
              kind: 'pause',
              marker: '#C98A2B',
              ttl: 'Charter Execution Paused',
              sub: 'Suspended pilot execution. Manual reactivation required.',
              ts: new Date().toTimeString().split(' ')[0]
            }
          ]
        };
      }
      return v;
    });
    setVaults(updated);
    saveState(updated);
  };

  const unpausePilot = (vaultId: string) => {
    const updated = vaults.map(v => {
      if (v.id === vaultId) {
        return {
          ...v,
          status: 'On course' as const,
          logs: [
            ...v.logs,
            {
              kind: 'unpause',
              marker: '#2C8A5B',
              ttl: 'Charter Execution Resumed',
              sub: 'Pilot active. Resumed watch rules.',
              ts: new Date().toTimeString().split(' ')[0]
            }
          ]
        };
      }
      return v;
    });
    setVaults(updated);
    saveState(updated);
  };

  const modifyCharter = (vaultId: string, charter: CharterSettings) => {
    const updated = vaults.map(v => {
      if (v.id === vaultId) {
        const newHoldings = charter.targets.map(t => {
          const old = v.holdings.find(o => o.sym === t.sym);
          return {
            sym: t.sym,
            name: t.name,
            target: t.target,
            actual: old ? old.actual : t.target,
            color: t.color
          };
        });

        // recalculate drift
        let driftSum = 0;
        newHoldings.forEach(h => {
          driftSum += Math.abs(h.actual - h.target);
        });
        const drift = driftSum / 2;

        return {
          ...v,
          charter,
          holdings: newHoldings,
          drift,
          logs: [
            ...v.logs,
            {
              kind: 'info',
              marker: '#2E6E8E',
              ttl: 'Charter Parameters Modified',
              sub: 'ERC-7715 keys updated with new whitelists and limits.',
              ts: new Date().toTimeString().split(' ')[0]
            }
          ]
        };
      }
      return v;
    });
    setVaults(updated);
    saveState(updated);
  };

  const simulatePriceDrop = (vaultId: string, assetSym: string, pctDrop: number) => {
    if (rebalancing) return;

    const vault = vaults.find(v => v.id === vaultId);
    if (!vault || vault.status === 'Paused' || vault.status === 'Revoked') return;

    setRebalancing(true);

    // 1. Simulate the immediate price drop (update actual allocations)
    const targetAssetIndex = vault.holdings.findIndex(h => h.sym === assetSym);
    if (targetAssetIndex === -1) {
      setRebalancing(false);
      return;
    }

    const updatedHoldings = vault.holdings.map((h, i) => {
      if (h.sym === assetSym) {
        // Drop the actual weight of the asset (e.g. TSLA drops from 40 to 33)
        const droppedVal = h.actual * (1 + pctDrop / 100);
        return { ...h, actual: Number(droppedVal.toFixed(1)) };
      }
      return h;
    });

    // Redistribute the remaining percentage to other assets (typically USDC) so they total 100%
    const sumActual = updatedHoldings.reduce((sum, h) => sum + h.actual, 0);
    const deficit = 100 - sumActual;
    const nonTargetHoldingsCount = updatedHoldings.length - 1;
    
    const holdingsWithDrop = updatedHoldings.map(h => {
      if (h.sym !== assetSym && nonTargetHoldingsCount > 0) {
        return { ...h, actual: Number((h.actual + deficit / nonTargetHoldingsCount).toFixed(1)) };
      }
      return h;
    });

    // Calculate drift: half of sum of absolute differences
    let driftSum = 0;
    holdingsWithDrop.forEach(h => {
      driftSum += Math.abs(h.actual - h.target);
    });
    const calculatedDrift = Number((driftSum / 2).toFixed(1));

    // Update state to show the drop
    let stateVaults = vaults.map(v => {
      if (v.id === vaultId) {
        return {
          ...v,
          holdings: holdingsWithDrop,
          drift: calculatedDrift,
          status: 'Off-course, correcting' as const,
          logs: [
            ...v.logs,
            {
              kind: 'detect',
              marker: '#C98A2B',
              ttl: `Drift detected on ${assetSym} exposure`,
              sub: `${assetSym} ${pctDrop >= 0 ? '+' : ''}${pctDrop}% · allocation now ${holdingsWithDrop[targetAssetIndex].actual}% vs ${holdingsWithDrop[targetAssetIndex].target}% target`,
              ts: new Date().toTimeString().split(' ')[0]
            }
          ]
        };
      }
      return v;
    });
    setVaults(stateVaults);
    saveState(stateVaults);

    // 2. Queue the rebalancing steps (feed logs)
    const timers = [
      {
        delay: 1000,
        action: (currVaults: UserVault[]) => currVaults.map(v => {
          if (v.id === vaultId) {
            return {
              ...v,
              logs: [
                ...v.logs,
                {
                  kind: 'compute',
                  marker: '#1F9DAE',
                  ttl: 'Computing safe passage',
                  sub: 'CharterValidator preflight · limits whitelisted · slippage acceptable',
                  ts: new Date().toTimeString().split(' ')[0]
                }
              ]
            };
          }
          return v;
        })
      },
      {
        delay: 2500,
        action: (currVaults: UserVault[]) => currVaults.map(v => {
          if (v.id === vaultId) {
            const txHash = '0x' + Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('') + '...' + Array.from({ length: 4 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
            const tradeText = holdingsWithDrop[targetAssetIndex].actual < holdingsWithDrop[targetAssetIndex].target 
              ? `Swap aUSDC → ${assetSym} · buy ${Number((holdingsWithDrop[targetAssetIndex].target - holdingsWithDrop[targetAssetIndex].actual).toFixed(1))}% ${assetSym}`
              : `Swap ${assetSym} → aUSDC · sell ${Number((holdingsWithDrop[targetAssetIndex].actual - holdingsWithDrop[targetAssetIndex].target).toFixed(1))}% ${assetSym}`;
            return {
              ...v,
              logs: [
                ...v.logs,
                {
                  kind: 'submit',
                  marker: '#2E6E8E',
                  ttl: `Submitting rebalance UserOp`,
                  sub: `${tradeText} · gas sponsored via ZeroDev`,
                  ts: new Date().toTimeString().split(' ')[0],
                  tx: txHash
                }
              ]
            };
          }
          return v;
        })
      },
      {
        delay: 4000,
        action: (currVaults: UserVault[]) => currVaults.map(v => {
          if (v.id === vaultId) {
            // Restore actual to target!
            const restoredHoldings = v.holdings.map(h => ({ ...h, actual: h.target }));
            const pilot = PILOTS.find(p => p.id === v.pilotId);
            const scoreIncr = Number((v.pilotScore + 0.1).toFixed(1));

            return {
              ...v,
              holdings: restoredHoldings,
              drift: 0.2,
              status: 'On course' as const,
              pilotScore: scoreIncr,
              logs: [
                ...v.logs,
                {
                  kind: 'safe',
                  marker: '#2C8A5B',
                  ttl: 'Safe passage, back on course',
                  sub: `Allocation restored to ${restoredHoldings.map(h => h.target).join('/')} · drift 0.2%`,
                  ts: new Date().toTimeString().split(' ')[0]
                }
              ]
            };
          }
          return v;
        })
      }
    ];

    let runningChain = Promise.resolve();

    timers.forEach((t) => {
      runningChain = runningChain.then(() => new Promise((resolve) => {
        setTimeout(() => {
          setVaults(prevVaults => {
            const nextVal = t.action(prevVaults);
            saveState(nextVal);
            return nextVal;
          });
          resolve();
        }, t.delay);
      }));
    });

    runningChain.then(() => {
      setRebalancing(false);
    });
  };

  const resetAllState = () => {
    localStorage.clear();
    disconnect();
    setVaults([]);
    setActiveVaultIndex(0);
    setRebalancing(false);
  };

  return (
    <DashboardContext.Provider value={{
      walletConnected,
      walletAddress,
      walletName,
      vaults,
      activeVaultIndex,
      rebalancing,
      connectWallet,
      disconnectWallet,
      deployVault,
      depositToVault,
      withdrawFromVault,
      revokePilot,
      pausePilot,
      unpausePilot,
      modifyCharter,
      simulatePriceDrop,
      setActiveVaultIndex,
      resetAllState
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardState() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardState must be used within a DashboardStateProvider');
  }
  return context;
}
