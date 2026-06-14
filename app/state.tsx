"use client";

import React, { createContext, useContext, useState } from "react";
import { useAccount, useDisconnect, useWriteContract, usePublicClient, useSwitchChain } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useQueryClient } from "@tanstack/react-query";
import {
  ADDRESSES,
  CHAIN_ID,
  VAULT_FACTORY_ABI,
  VAULT_ABI,
  ERC20_ABI,
} from "../lib/contracts";
import { getVaultOf, type RegisteredPilot } from "../lib/chain";

export interface CharterInput {
  maxSingleUsdc: number; // human USDC (e.g. 10)
  maxDailyUsdc: number; // human USDC (e.g. 20)
  expiresDays: number; // 0 = no expiry
}

interface DashboardContextType {
  walletConnected: boolean;
  walletAddress: `0x${string}` | null;
  walletName: string | null;
  busy: boolean;
  busyLabel: string;
  lastError: string | null;
  connectWallet: () => void;
  disconnectWallet: () => void;
  clearError: () => void;
  // real on-chain actions
  createVault: () => Promise<`0x${string}` | undefined>;
  hirePilot: (vault: `0x${string}`, pilot: RegisteredPilot, charter: CharterInput) => Promise<void>;
  deposit: (vault: `0x${string}`, usdcAmount: number) => Promise<void>;
  withdrawAll: (vault: `0x${string}`) => Promise<void>;
  pausePilot: (vault: `0x${string}`) => Promise<void>;
  unpausePilot: (vault: `0x${string}`) => Promise<void>;
  revokePilot: (vault: `0x${string}`, pilotAddr: `0x${string}`) => Promise<void>;
  refresh: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

const toUsdc6 = (n: number) => BigInt(Math.round(n * 1e6));

export function DashboardStateProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected, connector, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const { writeContractAsync } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();

  const [busy, setBusy] = useState(false);
  const [busyLabel, setBusyLabel] = useState("");
  const [lastError, setLastError] = useState<string | null>(null);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["vault"] });
    queryClient.invalidateQueries({ queryKey: ["vault-actions"] });
    queryClient.invalidateQueries({ queryKey: ["registry-pilots"] });
    queryClient.invalidateQueries({ queryKey: ["pilot"] });
  };

  async function ensureChain() {
    if (chainId !== CHAIN_ID && switchChainAsync) {
      await switchChainAsync({ chainId: CHAIN_ID });
    }
  }

  async function waitFor(hash: `0x${string}`) {
    if (publicClient) await publicClient.waitForTransactionReceipt({ hash });
  }

  /** Wrap a write flow with busy/error state and a final refresh. */
  async function run<T>(label: string, fn: () => Promise<T>): Promise<T | undefined> {
    setLastError(null);
    setBusy(true);
    setBusyLabel(label);
    try {
      await ensureChain();
      const result = await fn();
      refresh();
      return result;
    } catch (err: any) {
      console.error(label, err);
      setLastError(err?.shortMessage || err?.message || "Transaction failed.");
      return undefined;
    } finally {
      setBusy(false);
      setBusyLabel("");
    }
  }

  const createVault = () =>
    run("Deploying your vault…", async () => {
      const hash = await writeContractAsync({
        address: ADDRESSES.vaultFactory,
        abi: VAULT_FACTORY_ABI,
        functionName: "createVault",
      });
      await waitFor(hash);
      // Read back the freshly created vault address.
      return address ? await getVaultOf(address) ?? undefined : undefined;
    });

  const hirePilot = (vault: `0x${string}`, pilot: RegisteredPilot, c: CharterInput) =>
    run(`Hiring ${pilot.name}…`, async () => {
      // The charter is keyed by the address that signs executePlan — for the
      // reference pilots that is the operator (its runtime session wallet).
      const expiresAt = c.expiresDays > 0
        ? BigInt(Math.floor(Date.now() / 1000) + c.expiresDays * 86400)
        : 0n;
      const charter = {
        pilot: pilot.operator,
        allowedTargets: [ADDRESSES.aavePool],
        allowedTokensIn: [ADDRESSES.usdc, ADDRESSES.aUsdc],
        allowedTokensOut: [ADDRESSES.usdc, ADDRESSES.aUsdc],
        maxSingleAmountIn: toUsdc6(c.maxSingleUsdc),
        maxDailyAmountIn: toUsdc6(c.maxDailyUsdc),
        expiresAt,
      };
      const hash = await writeContractAsync({
        address: vault,
        abi: VAULT_ABI,
        functionName: "hirePilot",
        args: [charter],
      });
      await waitFor(hash);
    }).then(() => undefined);

  const deposit = (vault: `0x${string}`, usdcAmount: number) =>
    run(`Depositing ${usdcAmount} USDC…`, async () => {
      const amount = toUsdc6(usdcAmount);
      const approveHash = await writeContractAsync({
        address: ADDRESSES.usdc,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [vault, amount],
      });
      await waitFor(approveHash);
      const depHash = await writeContractAsync({
        address: vault,
        abi: VAULT_ABI,
        functionName: "deposit",
        args: [ADDRESSES.usdc, amount],
      });
      await waitFor(depHash);
    }).then(() => undefined);

  const withdrawAll = (vault: `0x${string}`) =>
    run("Withdrawing all capital…", async () => {
      if (!address) throw new Error("No wallet");
      const hash = await writeContractAsync({
        address: vault,
        abi: VAULT_ABI,
        functionName: "forceWithdrawAll",
        args: [address, [ADDRESSES.usdc, ADDRESSES.aUsdc]],
      });
      await waitFor(hash);
    }).then(() => undefined);

  const pausePilot = (vault: `0x${string}`) =>
    run("Pausing pilot…", async () => {
      const hash = await writeContractAsync({ address: vault, abi: VAULT_ABI, functionName: "pause" });
      await waitFor(hash);
    }).then(() => undefined);

  const unpausePilot = (vault: `0x${string}`) =>
    run("Resuming pilot…", async () => {
      const hash = await writeContractAsync({ address: vault, abi: VAULT_ABI, functionName: "unpause" });
      await waitFor(hash);
    }).then(() => undefined);

  const revokePilot = (vault: `0x${string}`, pilotAddr: `0x${string}`) =>
    run("Revoking pilot charter…", async () => {
      const hash = await writeContractAsync({
        address: vault,
        abi: VAULT_ABI,
        functionName: "revokePilot",
        args: [pilotAddr],
      });
      await waitFor(hash);
    }).then(() => undefined);

  return (
    <DashboardContext.Provider
      value={{
        walletConnected: isConnected,
        walletAddress: (address as `0x${string}`) ?? null,
        walletName: connector?.name ?? null,
        busy,
        busyLabel,
        lastError,
        connectWallet: () => openConnectModal?.(),
        disconnectWallet: () => disconnect(),
        clearError: () => setLastError(null),
        createVault,
        hirePilot,
        deposit,
        withdrawAll,
        pausePilot,
        unpausePilot,
        revokePilot,
        refresh,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardState() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboardState must be used within DashboardStateProvider");
  return ctx;
}
