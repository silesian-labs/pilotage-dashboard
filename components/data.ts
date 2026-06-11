/* ============================================================
   PILOTAGE — mock data + helpers
   ============================================================ */

export const fmtUsd = (n: number) => {
  if (n >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return '$' + (n / 1e3).toFixed(1) + 'K';
  return '$' + n.toFixed(0);
};

export const fmtPct = (n: number) => (n >= 0 ? '+' : '') + n.toFixed(1) + '%';

// deterministic pseudo-random walk for sparkline series
export function series(seed: number, n: number, vol: number, up: boolean) {
  const out: number[] = [];
  let v = 50;
  let s = seed;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  for (let i = 0; i < n; i++) {
    v += (rnd() - 0.5) * vol + (up ? vol * 0.16 : -vol * 0.02);
    v = Math.max(8, Math.min(96, v));
    out.push(v);
  }
  return out;
}

export interface Pilot {
  id: string;
  name: string;
  handle: string;
  color: string;
  risk: 'low' | 'balanced' | 'high';
  chain: string;
  assets: string;
  score: number;
  tvl: number;
  apy: number;
  captains: number;
  age: string;
  compliance: number;
  drawdown: number;
  fee: number;
  blurb: string;
  spark: number[];
  tagset: string[];
}

export const PILOTS: Pilot[] = [
  {
    id: 'conservative-rwa', name: 'ConservativeRWA', handle: '@helmsman.eth',
    color: '#2E6E8E', risk: 'low', chain: 'Robinhood Chain', assets: 'RWA · Stocks',
    score: 87, tvl: 2_340_000, apy: 9.4, captains: 214, age: '6mo track record',
    compliance: 100, drawdown: -3.2, fee: 12,
    blurb: 'Rebalances tokenized equities against Aave USDC yield. Never sails outside a 5% drift band.',
    spark: series(7, 40, 6, true),
    tagset: ['Aave V3', 'TSLA·AMZN·NFLX', 'Drift 5%'],
  },
  {
    id: 'aggressive-yield', name: 'AggressiveYield', handle: '@stormrunner.eth',
    color: '#B8843C', risk: 'high', chain: 'Arbitrum', assets: 'Perps · LP',
    score: 78, tvl: 1_120_000, apy: 31.7, captains: 86, age: '4mo track record',
    compliance: 98, drawdown: -14.6, fee: 20,
    blurb: 'Manages GMX V2 perp exposure and concentrated Uniswap liquidity. Higher seas, higher catch.',
    spark: series(13, 40, 13, true),
    tagset: ['GMX V2', 'Uniswap', 'Leverage 3x'],
  },
  {
    id: 'steady-yield', name: 'SteadyYield', handle: '@ballast.eth',
    color: '#2C8A5B', risk: 'low', chain: 'Arbitrum', assets: 'Stablecoin',
    score: 91, tvl: 5_870_000, apy: 6.8, captains: 402, age: '9mo track record',
    compliance: 100, drawdown: -0.9, fee: 10,
    blurb: 'Pure stablecoin lending across Aave and Compound. The calmest waters in the harbor.',
    spark: series(21, 40, 3.5, true),
    tagset: ['Aave V3', 'Compound', 'USDC·USDT'],
  },
  {
    id: 'delta-neutral', name: 'DeltaNeutral', handle: '@trimmer.eth',
    color: '#6B57C4', risk: 'balanced', chain: 'Arbitrum', assets: 'Perps · Spot',
    score: 83, tvl: 3_010_000, apy: 17.2, captains: 158, age: '5mo track record',
    compliance: 99, drawdown: -6.1, fee: 15,
    blurb: 'Funding-rate harvest with hedged spot. Earns the spread while the hull stays level.',
    spark: series(34, 40, 7, true),
    tagset: ['GMX V2', 'Hedged', 'Funding'],
  },
  {
    id: 'index-pilot', name: 'IndexPilot', handle: '@cartographer.eth',
    color: '#C0573B', risk: 'balanced', chain: 'Robinhood Chain', assets: 'RWA · Index',
    score: 80, tvl: 1_640_000, apy: 14.1, captains: 119, age: '4mo track record',
    compliance: 97, drawdown: -8.7, fee: 15,
    blurb: 'Tracks a tokenized equity basket (PLTR·AMD·NFLX) with quarterly reweighting.',
    spark: series(48, 40, 9, true),
    tagset: ['PLTR·AMD', 'Quarterly', 'Basket'],
  },
  {
    id: 'tide-runner', name: 'TideRunner', handle: '@drifter.eth',
    color: '#1F9DAE', risk: 'high', chain: 'Arbitrum', assets: 'Perps',
    score: 54, tvl: 280_000, apy: 22.4, captains: 12, age: 'untested waters',
    compliance: 94, drawdown: -19.3, fee: 20,
    blurb: 'Momentum perps on majors. New to the harbor, sailing to earn its Pilotage Score.',
    spark: series(60, 40, 16, false),
    tagset: ['GMX V2', 'Momentum', 'New'],
  },
];

export interface FeedItem {
  kind: string;
  marker: string;
  ttl: string;
  sub: string;
  ts: string;
  tx?: string;
}

export const DEMO_FEED: FeedItem[] = [
  { kind: 'watch', marker: '#6E909B', ttl: 'Watching vault, all positions on course', sub: 'Drift 1.2% · within charter band', ts: '09:41:02' },
  { kind: 'detect', marker: '#C98A2B', ttl: 'Drift detected on TSLA exposure', sub: 'TSLA −8.0% · allocation now 33% vs 40% target', ts: '09:41:18' },
  { kind: 'compute', marker: '#1F9DAE', ttl: 'Computing safe passage', sub: 'CharterValidator preflight · 3 venues whitelisted', ts: '09:41:20' },
  { kind: 'submit', marker: '#2E6E8E', ttl: 'Submitting rebalance, buy 7% TSLA', sub: 'Swap aUSDC → TSLA · slippage 0.3% · gas sponsored', ts: '09:41:24', tx: '0x9f2a…c41e' },
  { kind: 'safe', marker: '#2C8A5B', ttl: 'Safe passage, back on course', sub: 'Allocation restored to 60/40 · drift 0.4%', ts: '09:41:31' },
];

export const HOLDINGS = [
  { sym: 'aUSDC', name: 'Aave USDC yield', color: '#2C8A5B', target: 60 },
  { sym: 'TSLA', name: 'Tokenized Tesla', color: '#C0573B', target: 40 },
];

export const ECO = [
  { ic: 'key', t: 'ERC-7715', d: 'Permissioned charters' },
  { ic: 'badge', t: 'ERC-8004', d: 'On-chain reputation' },
  { ic: 'cpu', t: 'Stylus (Rust)', d: 'Hot-path scoring' },
  { ic: 'layers', t: 'Arbitrum', d: 'Native deployment' },
  { ic: 'stock', t: 'Robinhood Chain', d: 'Tokenized equities' },
  { ic: 'shield', t: 'ZeroDev Kernel', d: 'Session keys · gas sponsor' },
];

export const TICKER = [
  { k: 'Total value piloted', v: '$14.3M' },
  { k: 'Active pilots', v: '38' },
  { k: 'Captains aboard', v: '991' },
  { k: 'Safe passages', v: '124,807' },
  { k: 'Charter violations blocked', v: '312' },
  { k: 'Avg Pilotage Score', v: '79 / 100' },
];

// Helper to enrich API pilots with mock UI data
export function enrichApiPilot(api: any): Pilot {
  // Use modulo arithmetic to pick consistent aesthetic properties for any ID
  const fallback = PILOTS[api.id % PILOTS.length] || PILOTS[0];
  
  return {
    ...fallback,
    id: api.id.toString(),
    name: api.name || `Pilot #${api.id}`,
    risk: (api.risk_profile === 'conservative' ? 'low' : api.risk_profile === 'high' ? 'high' : 'balanced') as any,
    score: api.pilotage_score ?? 50,
    handle: api.operator ? `${api.operator.substring(0,6)}...${api.operator.substring(38)}` : fallback.handle,
  };
}
