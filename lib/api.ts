const API_URL = process.env.NEXT_PUBLIC_INDEXER_URL || "http://localhost:3001";

export interface ApiPilot {
  id: number;
  operator: string;
  active: boolean;
  slashed: boolean;
  registered_at: string;
  risk_profile: string; // conservative, balanced, high
  pilotage_score?: number;
  // Metadata that might come from IPFS later, but we map to UI mocks for now:
  name?: string;
  description?: string;
}

export async function fetchPilots(): Promise<ApiPilot[]> {
  try {
    const res = await fetch(`${API_URL}/api/pilots?limit=100`, { next: { revalidate: 15 } });
    if (!res.ok) throw new Error("Failed to fetch pilots");
    const data = await res.json();
    return data.pilots || [];
  } catch (err) {
    console.error("fetchPilots failed", err);
    return [];
  }
}

export async function fetchPilot(id: number): Promise<ApiPilot | null> {
  try {
    const res = await fetch(`${API_URL}/api/pilots/${id}`, { next: { revalidate: 15 } });
    if (!res.ok) throw new Error("Failed to fetch pilot");
    return await res.json();
  } catch (err) {
    console.error(`fetchPilot(${id}) failed`, err);
    return null;
  }
}

export async function fetchStats() {
  try {
    const res = await fetch(`${API_URL}/api/stats`, { next: { revalidate: 15 } });
    if (!res.ok) throw new Error("Failed to fetch stats");
    return await res.json();
  } catch (err) {
    console.error("fetchStats failed", err);
    return { vaults: 0, activePilots: 0, successfulActions: 0 };
  }
}

export async function fetchVault(address: string) {
  try {
    const res = await fetch(`${API_URL}/api/vaults/${address}`, { next: { revalidate: 15 } });
    if (!res.ok) throw new Error("Failed to fetch vault");
    return await res.json();
  } catch (err) {
    console.error(`fetchVault(${address}) failed`, err);
    return null;
  }
}

export async function fetchVaultActions(address: string) {
  try {
    const res = await fetch(`${API_URL}/api/vaults/${address}/actions?limit=50`, { next: { revalidate: 15 } });
    if (!res.ok) throw new Error("Failed to fetch vault actions");
    const data = await res.json();
    return data.actions || [];
  } catch (err) {
    console.error(`fetchVaultActions(${address}) failed`, err);
    return [];
  }
}
