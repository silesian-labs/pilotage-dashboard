// Low-level on-chain readers backed by a standalone viem public client.
// These work without a connected wallet and without the indexer, so the
// marketplace and vault views always show real chain data.

import { createPublicClient, http } from "viem";
import {
  ADDRESSES,
  CHAIN,
  TARGETS_BPS,
  VAULT_FACTORY_ABI,
  VAULT_ABI,
  ERC20_ABI,
  ORACLE_ABI,
  CONSERVATIVE_RWA_ABI,
  REPUTATION_ABI,
  PILOT_REGISTRY_ABI,
} from "./contracts";

const RPC =
  process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC ||
  "https://sepolia-rollup.arbitrum.io/rpc";

export const publicClient = createPublicClient({
  chain: CHAIN,
  transport: http(RPC),
});

const ZERO = "0x0000000000000000000000000000000000000000";

export interface Charter {
  pilot: `0x${string}`;
  allowedTargets: `0x${string}`[];
  allowedTokensIn: `0x${string}`[];
  allowedTokensOut: `0x${string}`[];
  maxSingleAmountIn: bigint;
  maxDailyAmountIn: bigint;
  expiresAt: bigint;
}

export interface RegisteredPilot {
  id: number;
  developer: `0x${string}`;
  executor: `0x${string}`;
  operator: `0x${string}`;
  name: string;
  description: string;
  riskProfile: string; // raw on-chain value e.g. "conservative", "steady-yield"
  stakedAmount: bigint;
  active: boolean;
  slashed: boolean;
  registeredAt: bigint;
  score: number; // ERC-8004 score for operator
  feedbackCount: number;
}

export interface VaultSnapshot {
  address: `0x${string}`;
  captain: `0x${string}`;
  paused: boolean;
  usdcBal: bigint;
  aUsdcBal: bigint;
  usdcUsd: bigint;
  aUsdcUsd: bigint;
  totalUsd: bigint;
  usdcPct: number;
  aUsdcPct: number;
  driftBps: number;
  shouldRebalance: boolean;
  aUsdcPrice: bigint;
  charter: Charter | null;
  hiredPilot: RegisteredPilot | null;
  dailySpent: bigint;
}

/** Address of the captain's vault, or null if none exists. */
export async function getVaultOf(
  captain: `0x${string}`,
): Promise<`0x${string}` | null> {
  const vault = (await publicClient.readContract({
    address: ADDRESSES.vaultFactory,
    abi: VAULT_FACTORY_ABI,
    functionName: "vaultOf",
    args: [captain],
  })) as `0x${string}`;
  return vault && vault !== ZERO ? vault : null;
}

/** Load all active, non-slashed registered pilots with live ERC-8004 scores. */
export async function getRegistryPilots(): Promise<RegisteredPilot[]> {
  const ids = (await publicClient.readContract({
    address: ADDRESSES.pilotRegistry,
    abi: PILOT_REGISTRY_ABI,
    functionName: "getActivePilotIds",
    args: [0n, 50n],
  })) as bigint[];

  const records = await Promise.all(
    ids.map((id) =>
      publicClient.readContract({
        address: ADDRESSES.pilotRegistry,
        abi: PILOT_REGISTRY_ABI,
        functionName: "getPilot",
        args: [id],
      }),
    ),
  );

  const pilots = await Promise.all(
    records.map(async (r: any) => {
      const [score, feedback] = await Promise.all([
        readScore(r.operator),
        readFeedbackCount(r.operator),
      ]);
      return recordToPilot(r, score, feedback);
    }),
  );

  return pilots.filter((p) => p.active && !p.slashed);
}

export async function getPilotById(
  id: number,
): Promise<RegisteredPilot | null> {
  try {
    const r: any = await publicClient.readContract({
      address: ADDRESSES.pilotRegistry,
      abi: PILOT_REGISTRY_ABI,
      functionName: "getPilot",
      args: [BigInt(id)],
    });
    if (!r || r.executor === ZERO) return null;
    const [score, feedback] = await Promise.all([
      readScore(r.operator),
      readFeedbackCount(r.operator),
    ]);
    return recordToPilot(r, score, feedback);
  } catch {
    return null;
  }
}

function recordToPilot(r: any, score: number, feedback: number): RegisteredPilot {
  return {
    id: Number(r.id),
    developer: r.developer,
    executor: r.executor,
    operator: r.operator,
    name: r.card.name,
    description: r.card.description,
    riskProfile: r.card.riskProfile,
    stakedAmount: r.stakedAmount,
    active: r.active,
    slashed: r.slashed,
    registeredAt: r.registeredAt,
    score,
    feedbackCount: feedback,
  };
}

export async function readScore(subject: `0x${string}`): Promise<number> {
  try {
    const s = (await publicClient.readContract({
      address: ADDRESSES.reputation,
      abi: REPUTATION_ABI,
      functionName: "getScore",
      args: [subject],
    })) as bigint;
    return Number(s);
  } catch {
    return 0;
  }
}

export async function readFeedbackCount(
  subject: `0x${string}`,
): Promise<number> {
  try {
    const c = (await publicClient.readContract({
      address: ADDRESSES.reputation,
      abi: REPUTATION_ABI,
      functionName: "getFeedbackCount",
      args: [subject],
    })) as bigint;
    return Number(c);
  } catch {
    return 0;
  }
}

async function getCharter(
  vault: `0x${string}`,
  pilot: `0x${string}`,
): Promise<Charter | null> {
  const c = (await publicClient.readContract({
    address: vault,
    abi: VAULT_ABI,
    functionName: "getCharter",
    args: [pilot],
  })) as Charter;
  return c.pilot && c.pilot !== ZERO ? c : null;
}

/**
 * Determine which registered pilot currently holds a charter in the vault.
 * The charter is keyed by the address that signs executePlan, which may be the
 * pilot's operator or executor — we check both.
 */
async function findHiredPilot(
  vault: `0x${string}`,
  pilots: RegisteredPilot[],
): Promise<{ pilot: RegisteredPilot; charter: Charter } | null> {
  for (const p of pilots) {
    const candidates = Array.from(
      new Set([p.operator, p.executor].map((a) => a.toLowerCase())),
    ) as `0x${string}`[];
    for (const addr of candidates) {
      const charter = await getCharter(vault, addr);
      if (charter) return { pilot: p, charter };
    }
  }
  return null;
}

/** Full live snapshot of a vault: balances, USD values, drift, charter, pilot. */
export async function getVaultSnapshot(
  vault: `0x${string}`,
  registryPilots?: RegisteredPilot[],
): Promise<VaultSnapshot> {
  const [captain, paused, usdcBal, aUsdcBal, aUsdcPrice] = await Promise.all([
    publicClient.readContract({ address: vault, abi: VAULT_ABI, functionName: "captain" }) as Promise<`0x${string}`>,
    publicClient.readContract({ address: vault, abi: VAULT_ABI, functionName: "isPaused" }) as Promise<boolean>,
    publicClient.readContract({ address: ADDRESSES.usdc, abi: ERC20_ABI, functionName: "balanceOf", args: [vault] }) as Promise<bigint>,
    publicClient.readContract({ address: ADDRESSES.aUsdc, abi: ERC20_ABI, functionName: "balanceOf", args: [vault] }) as Promise<bigint>,
    publicClient.readContract({ address: ADDRESSES.oracle, abi: ORACLE_ABI, functionName: "getPrice", args: [ADDRESSES.aUsdc] }) as Promise<bigint>,
  ]);

  const [usdcUsd, aUsdcUsd] = await Promise.all([
    publicClient.readContract({ address: ADDRESSES.oracle, abi: ORACLE_ABI, functionName: "getValue", args: [ADDRESSES.usdc, usdcBal, 6] }) as Promise<bigint>,
    publicClient.readContract({ address: ADDRESSES.oracle, abi: ORACLE_ABI, functionName: "getValue", args: [ADDRESSES.aUsdc, aUsdcBal, 6] }) as Promise<bigint>,
  ]);

  const totalUsd = usdcUsd + aUsdcUsd;

  let driftBps = 0;
  let shouldRebalance = false;
  if (totalUsd > 0n) {
    const drifts = (await publicClient.readContract({
      address: ADDRESSES.conservativeRwa,
      abi: CONSERVATIVE_RWA_ABI,
      functionName: "computeDrifts",
      args: [[usdcUsd, aUsdcUsd], TARGETS_BPS],
    })) as bigint[];
    driftBps = Number(
      drifts.reduce((m, d) => {
        const a = d < 0n ? -d : d;
        return a > m ? a : m;
      }, 0n),
    );
    shouldRebalance = (await publicClient.readContract({
      address: ADDRESSES.conservativeRwa,
      abi: CONSERVATIVE_RWA_ABI,
      functionName: "shouldRebalance",
      args: [drifts],
    })) as boolean;
  }

  const pilots = registryPilots ?? (await getRegistryPilots());
  const hired = await findHiredPilot(vault, pilots);

  let dailySpent = 0n;
  if (hired) {
    try {
      dailySpent = (await publicClient.readContract({
        address: vault,
        abi: VAULT_ABI,
        functionName: "getDailySpent",
        args: [hired.charter.pilot],
      })) as bigint;
    } catch {
      dailySpent = 0n;
    }
  }

  const pctOf = (v: bigint) =>
    totalUsd > 0n ? Number((v * 10000n) / totalUsd) / 100 : 0;

  return {
    address: vault,
    captain,
    paused,
    usdcBal,
    aUsdcBal,
    usdcUsd,
    aUsdcUsd,
    totalUsd,
    usdcPct: pctOf(usdcUsd),
    aUsdcPct: pctOf(aUsdcUsd),
    driftBps,
    shouldRebalance,
    aUsdcPrice,
    charter: hired?.charter ?? null,
    hiredPilot: hired?.pilot ?? null,
    dailySpent,
  };
}

// Formatting helpers shared across views.
export const usd18 = (v: bigint) => Number(v) / 1e18;
export const usdc6 = (v: bigint) => Number(v) / 1e6;
export const price18 = (v: bigint) => Number(v) / 1e18;
