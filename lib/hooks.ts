"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getRegistryPilots,
  getPilotById,
  getVaultOf,
  getVaultSnapshot,
  type RegisteredPilot,
  type VaultSnapshot,
} from "./chain";
import { fetchVaultActions, type ApiAction } from "./api";

/** All active registered pilots (live from the registry + ERC-8004). */
export function useRegistryPilots() {
  return useQuery<RegisteredPilot[]>({
    queryKey: ["registry-pilots"],
    queryFn: getRegistryPilots,
    refetchInterval: 30_000,
  });
}

export function usePilot(id: number | null) {
  return useQuery<RegisteredPilot | null>({
    queryKey: ["pilot", id],
    queryFn: () => (id == null ? null : getPilotById(id)),
    enabled: id != null,
  });
}

/** Live snapshot of the connected captain's vault (null if none). */
export function useVault(captain?: `0x${string}`) {
  return useQuery<VaultSnapshot | null>({
    queryKey: ["vault", captain],
    queryFn: async () => {
      if (!captain) return null;
      const vault = await getVaultOf(captain);
      if (!vault) return null;
      return getVaultSnapshot(vault);
    },
    enabled: !!captain,
    refetchInterval: 10_000,
  });
}

/** Real executed actions for a vault, from the indexer. */
export function useVaultActions(vault?: string) {
  return useQuery<ApiAction[]>({
    queryKey: ["vault-actions", vault],
    queryFn: () => (vault ? fetchVaultActions(vault) : Promise.resolve([])),
    enabled: !!vault,
    refetchInterval: 8_000,
  });
}
