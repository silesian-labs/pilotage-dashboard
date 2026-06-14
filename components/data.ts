/* ============================================================
   PILOTAGE — formatting helpers (no mock data)
   ============================================================ */

export const fmtUsd = (n: number) => {
  if (n >= 1e9) return "$" + (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return "$" + (n / 1e3).toFixed(1) + "K";
  return "$" + n.toFixed(2);
};

export const fmtPct = (n: number) => (n >= 0 ? "+" : "") + n.toFixed(1) + "%";

export const shortAddr = (a?: string) =>
  a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "";

export type UiRisk = "low" | "balanced" | "high";

// Maps an on-chain riskProfile string to the three UI buckets.
export function toUiRisk(riskProfile: string): UiRisk {
  const r = (riskProfile || "").toLowerCase();
  if (r.includes("conservative") || r.includes("steady") || r.includes("low"))
    return "low";
  if (r.includes("aggressive") || r.includes("high")) return "high";
  return "balanced";
}

// A deterministic colour per pilot id so avatars/accents stay stable.
const PALETTE = ["#2E6E8E", "#2C8A5B", "#B8843C", "#6B57C4", "#C0573B", "#1F9DAE"];
export const pilotColor = (id: number) => PALETTE[id % PALETTE.length];

export const initialsOf = (name: string) =>
  (name.replace(/[a-z]/g, "").slice(0, 2) || name.slice(0, 2)).toUpperCase();

// deterministic pseudo-random walk for sparkline decoration, seeded by a pilot's
// real score so the curve is stable per pilot (purely visual, no fake numbers shown).
export function series(seed: number, n: number, vol: number, up: boolean) {
  const out: number[] = [];
  let v = 50;
  let s = seed || 1;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = 0; i < n; i++) {
    v += (rnd() - 0.5) * vol + (up ? vol * 0.16 : -vol * 0.02);
    v = Math.max(8, Math.min(96, v));
    out.push(v);
  }
  return out;
}
