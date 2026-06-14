// Central on-chain configuration for the Pilotage dashboard.
// All addresses default to the deployed Arbitrum Sepolia contracts but can be
// overridden via NEXT_PUBLIC_* env vars (.env.local).

import { arbitrumSepolia } from "wagmi/chains";

export const CHAIN = arbitrumSepolia;
export const CHAIN_ID = 421614;

const env = (key: string, fallback: string) =>
  (process.env[key] as string | undefined) || fallback;

export const ADDRESSES = {
  vaultFactory: env(
    "NEXT_PUBLIC_VAULT_FACTORY",
    "0x74dF16FfEb1FC602Ed9c893C73c0c0dcAce99DD0",
  ) as `0x${string}`,
  pilotRegistry: env(
    "NEXT_PUBLIC_PILOT_REGISTRY",
    "0x52F10df476d30F42C9A019302Ea691Cedd0f5616",
  ) as `0x${string}`,
  conservativeRwa: env(
    "NEXT_PUBLIC_CONSERVATIVE_RWA",
    "0x102784664B0E5edBEb7B899d522e2D6edA06EA59",
  ) as `0x${string}`,
  oracle: env(
    "NEXT_PUBLIC_ORACLE",
    "0x8B9BC7d5a8d004eB26C27845139c87a643Ac5426",
  ) as `0x${string}`,
  reputation: env(
    "NEXT_PUBLIC_ERC8004_REPUTATION",
    "0xF6317Be12A558C069Cac3571F46D1821193D97a0",
  ) as `0x${string}`,
  usdc: env(
    "NEXT_PUBLIC_USDC",
    "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
  ) as `0x${string}`,
  aUsdc: env(
    "NEXT_PUBLIC_A_USDC",
    "0x460b97BD498E1157530AEb3086301d5225b91216",
  ) as `0x${string}`,
  aavePool: env(
    "NEXT_PUBLIC_AAVE_POOL",
    "0xBfC91D59fdAA134A4ED45f7B584cAf96D7792Eff",
  ) as `0x${string}`,
};

// The pilot's on-chain rebalance band (matches DRIFT_THRESHOLD_BPS on
// ConservativeRWA) and target allocation (matches the runtime's TARGET_*_BPS).
export const DRIFT_THRESHOLD_BPS = 500;
export const TARGETS_BPS: [bigint, bigint] = [5000n, 5000n]; // USDC / aUSDC

export const TOKENS = {
  usdc: { address: ADDRESSES.usdc, symbol: "USDC", name: "USD Coin", decimals: 6, color: "#2C8A5B" },
  aUsdc: { address: ADDRESSES.aUsdc, symbol: "aUSDC", name: "Aave USDC", decimals: 6, color: "#2E6E8E" },
} as const;

// Oracle markup used by the "Simulation Control Room" to push the vault past
// the drift band so the running pilot rebalances (mirrors trigger-price-drop.sh up).
export const SIM_AUSDC_PRICE_UP = 1_400_000_000_000_000_000n; // $1.40 (18 dec)
export const ORACLE_PRICE_ONE = 1_000_000_000_000_000_000n; // $1.00 (18 dec)

export const EXPLORER = "https://sepolia.arbiscan.io";
export const txUrl = (hash: string) => `${EXPLORER}/tx/${hash}`;
export const addrUrl = (addr: string) => `${EXPLORER}/address/${addr}`;

// ---------------------------------------------------------------------------
// ABIs (viem-compatible, trimmed to what the dashboard calls)
// ---------------------------------------------------------------------------

export const VAULT_FACTORY_ABI = [
  { name: "createVault", type: "function", stateMutability: "nonpayable", inputs: [], outputs: [{ name: "vault", type: "address" }] },
  { name: "vaultOf", type: "function", stateMutability: "view", inputs: [{ name: "captain", type: "address" }], outputs: [{ name: "", type: "address" }] },
  {
    name: "VaultCreated", type: "event", inputs: [
      { name: "captain", type: "address", indexed: true },
      { name: "vault", type: "address", indexed: true },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
] as const;

const CHARTER_TUPLE = {
  name: "charter", type: "tuple", components: [
    { name: "pilot", type: "address" },
    { name: "allowedTargets", type: "address[]" },
    { name: "allowedTokensIn", type: "address[]" },
    { name: "allowedTokensOut", type: "address[]" },
    { name: "maxSingleAmountIn", type: "uint256" },
    { name: "maxDailyAmountIn", type: "uint256" },
    { name: "expiresAt", type: "uint256" },
  ],
} as const;

export const VAULT_ABI = [
  { name: "deposit", type: "function", stateMutability: "nonpayable", inputs: [{ name: "token", type: "address" }, { name: "amount", type: "uint256" }], outputs: [] },
  { name: "withdraw", type: "function", stateMutability: "nonpayable", inputs: [{ name: "token", type: "address" }, { name: "amount", type: "uint256" }, { name: "to", type: "address" }], outputs: [] },
  { name: "hirePilot", type: "function", stateMutability: "nonpayable", inputs: [CHARTER_TUPLE], outputs: [] },
  { name: "revokePilot", type: "function", stateMutability: "nonpayable", inputs: [{ name: "pilot", type: "address" }], outputs: [] },
  { name: "pause", type: "function", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { name: "unpause", type: "function", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { name: "forceWithdrawAll", type: "function", stateMutability: "nonpayable", inputs: [{ name: "to", type: "address" }, { name: "tokens", type: "address[]" }], outputs: [] },
  { name: "captain", type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "address" }] },
  { name: "isPaused", type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "bool" }] },
  { name: "getDailySpent", type: "function", stateMutability: "view", inputs: [{ name: "pilot", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
  {
    name: "getCharter", type: "function", stateMutability: "view", inputs: [{ name: "pilot", type: "address" }], outputs: [{
      name: "", type: "tuple", components: [
        { name: "pilot", type: "address" },
        { name: "allowedTargets", type: "address[]" },
        { name: "allowedTokensIn", type: "address[]" },
        { name: "allowedTokensOut", type: "address[]" },
        { name: "maxSingleAmountIn", type: "uint256" },
        { name: "maxDailyAmountIn", type: "uint256" },
        { name: "expiresAt", type: "uint256" },
      ],
    }],
  },
] as const;

export const ERC20_ABI = [
  { name: "balanceOf", type: "function", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
  { name: "decimals", type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint8" }] },
  { name: "allowance", type: "function", stateMutability: "view", inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
  { name: "approve", type: "function", stateMutability: "nonpayable", inputs: [{ name: "spender", type: "address" }, { name: "value", type: "uint256" }], outputs: [{ name: "", type: "bool" }] },
] as const;

export const ORACLE_ABI = [
  { name: "getPrice", type: "function", stateMutability: "view", inputs: [{ name: "token", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
  { name: "getValue", type: "function", stateMutability: "view", inputs: [{ name: "token", type: "address" }, { name: "amount", type: "uint256" }, { name: "tokenDecimals", type: "uint8" }], outputs: [{ name: "valueUSD", type: "uint256" }] },
  { name: "setPrice", type: "function", stateMutability: "nonpayable", inputs: [{ name: "token", type: "address" }, { name: "priceUSD", type: "uint256" }, { name: "symbol", type: "string" }], outputs: [] },
] as const;

export const CONSERVATIVE_RWA_ABI = [
  { name: "computeDrifts", type: "function", stateMutability: "view", inputs: [{ name: "balances", type: "uint256[]" }, { name: "targetsBps", type: "uint256[]" }], outputs: [{ name: "driftsBps", type: "int256[]" }] },
  { name: "shouldRebalance", type: "function", stateMutability: "view", inputs: [{ name: "driftsBps", type: "int256[]" }], outputs: [{ name: "", type: "bool" }] },
] as const;

export const REPUTATION_ABI = [
  { name: "getScore", type: "function", stateMutability: "view", inputs: [{ name: "subject", type: "address" }], outputs: [{ name: "", type: "int256" }] },
  { name: "getFeedbackCount", type: "function", stateMutability: "view", inputs: [{ name: "subject", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
] as const;

export const PILOT_REGISTRY_ABI = [
  {
    name: "registerPilot", type: "function", stateMutability: "nonpayable", inputs: [
      {
        name: "card", type: "tuple", components: [
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
    ], outputs: [{ name: "id", type: "uint256" }],
  },
  { name: "minStake", type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { name: "activePilotCount", type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { name: "getActivePilotIds", type: "function", stateMutability: "view", inputs: [{ name: "start", type: "uint256" }, { name: "limit", type: "uint256" }], outputs: [{ name: "ids", type: "uint256[]" }] },
  {
    name: "getPilot", type: "function", stateMutability: "view", inputs: [{ name: "id", type: "uint256" }], outputs: [{
      name: "", type: "tuple", components: [
        { name: "id", type: "uint256" },
        { name: "developer", type: "address" },
        { name: "executor", type: "address" },
        { name: "operator", type: "address" },
        {
          name: "card", type: "tuple", components: [
            { name: "name", type: "string" },
            { name: "description", type: "string" },
            { name: "riskProfile", type: "string" },
            { name: "ipfsMetadata", type: "string" },
            { name: "supportedChains", type: "address[]" },
          ],
        },
        { name: "stakedAmount", type: "uint256" },
        { name: "active", type: "bool" },
        { name: "slashed", type: "bool" },
        { name: "registeredAt", type: "uint256" },
      ],
    }],
  },
] as const;
