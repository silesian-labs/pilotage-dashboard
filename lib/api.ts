// Indexer (read-only) API client. The indexer serves historical/aggregated
// data; all writes happen directly against the contracts via wagmi.

const API_URL = process.env.NEXT_PUBLIC_INDEXER_URL || "http://localhost:3001";

export interface ApiPilot {
  id: number;
  operator: string;
  executor?: string;
  developer?: string;
  active: boolean;
  slashed: boolean;
  registered_at: string;
  risk_profile: string;
  staked_amount?: string;
  pilotage_score?: number;
  name?: string;
  description?: string;
}

export interface ApiAction {
  id: number;
  vault: string;
  pilot: string;
  tx_hash: string;
  token_in: string;
  amount_in: string;
  token_out: string;
  success: boolean;
  chain_id: number;
  block_number: number;
  executed_at: string;
}

export interface ApiStats {
  vaults: number;
  activePilots: number;
  successfulActions: number;
}

export async function fetchStats(): Promise<ApiStats> {
  try {
    const res = await fetch(`${API_URL}/api/stats`, { cache: "no-store" });
    if (!res.ok) throw new Error("stats");
    return await res.json();
  } catch {
    return { vaults: 0, activePilots: 0, successfulActions: 0 };
  }
}

export async function fetchVaultActions(address: string): Promise<ApiAction[]> {
  try {
    const res = await fetch(
      `${API_URL}/api/vaults/${address}/actions?limit=50`,
      { cache: "no-store" },
    );
    if (!res.ok) throw new Error("actions");
    const data = await res.json();
    return data.actions || [];
  } catch (err) {
    console.error(`fetchVaultActions(${address}) failed`, err);
    return [];
  }
}

export async function fetchPilots(): Promise<ApiPilot[]> {
  try {
    const res = await fetch(`${API_URL}/api/pilots?limit=100`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("pilots");
    const data = await res.json();
    return data.pilots || [];
  } catch {
    return [];
  }
}
