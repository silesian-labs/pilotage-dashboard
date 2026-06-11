"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

// ---------- Icon (simple geometric line set) ----------
export const ICONS: Record<string, string> = {
  anchor: 'M12 7v13M12 4a2 2 0 1 0 0 .01M5 12H3a9 9 0 0 0 18 0h-2M5 12a7 7 0 0 0 14 0',
  compass: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM15.5 8.5l-2 5-5 2 2-5 5-2Z',
  wheel: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7ZM12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1',
  shield: 'M12 3l7 3v5c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6l7-3Z',
  shieldcheck: 'M12 3l7 3v5c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6l7-3ZM9 11.5l2 2 4-4',
  key: 'M14.5 9.5a3.5 3.5 0 1 1-4.6 4.6L4 20H2v-2l6-6M14.5 9.5L20 4M14.5 9.5l2 2M20 4l-2-2',
  route: 'M6 19a2 2 0 1 0 0-.01M18 5a2 2 0 1 0 0-.01M8 19h6a3 3 0 0 0 3-3V8M16 5h-6a3 3 0 0 0-3 3v9',
  badge: 'M12 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM9.5 13.5L8 21l4-2 4 2-1.5-7.5',
  cpu: 'M7 7h10v10H7zM4 9v6M4 9h3M4 15h3M20 9v6M17 9h3M17 15h3M9 4h6M9 4v3M15 4v3M9 20h6M9 17v3M15 17v3',
  layers: 'M12 3l9 5-9 5-9-5 9-5ZM3 13l9 5 9-5M3 17l9 5 9-5',
  stock: 'M4 19V5M4 19h16M8 15l3-4 3 2 4-6',
  lock: 'M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3',
  chart: 'M4 19V5M4 19h16M7 15l3-4 3 3 4-7',
  code: 'M9 8l-4 4 4 4M15 8l4 4-4 4',
  scroll: 'M5 4h11a2 2 0 0 1 2 2v12a2 2 0 0 0 2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 0-2-2ZM8 8h7M8 12h7M8 16h4',
  helm: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  ext: 'M14 5h5v5M19 5l-7 7M12 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-6',
  check: 'M5 12.5l4.5 4.5L19 7',
  spark: 'M12 3l2 6 6 1-4.5 4 1.2 6L12 17l-5.7 3 1.2-6L3 10l6-1 3-6Z',
  bolt: 'M13 3L5 13h6l-1 8 8-10h-6l1-8Z',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  coins: 'M9 13a6 3 0 1 0 0-6 6 3 0 0 0 0 6ZM3 7v5c0 1.7 2.7 3 6 3M3 7c0 1.7 2.7 3 6 3M15 11.5c2.3.4 4 1.4 4 2.5 0 1.7-2.7 3-6 3s-6-1.3-6-3',
  github: 'M9 19c-4 1.5-4-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2s-1-.3-3.5 1.3a12 12 0 0 0-6.3 0C6.5 2.8 5.5 3 5.5 3a4.3 4.3 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.4c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21',
  x: 'M4 4l16 16M20 4L4 20',
  menu: 'M4 7h16M4 12h16M4 17h16',
};

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  size?: number;
  sw?: number;
  fill?: string;
}

export function Icon({ name, size = 20, sw = 1.7, fill, style, ...rest }: IconProps) {
  const d = ICONS[name] || ICONS.compass;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      style={style} {...rest}>
      <path d={d} fill={fill || 'none'} />
    </svg>
  );
}

// ---------- Logo mark (anchor in a brass roundel) ----------
export function Mark({ size = 36 }: { size?: number }) {
  return (
    <span className="brand-mark" style={{ width: size, height: size }}>
      <Icon name="anchor" size={size * 0.56} sw={1.9} style={{ color: '#F2E6CE' }} />
    </span>
  );
}

export function Brand({ size = 36 }: { size?: number }) {
  return (
    <Link href="/" className="brand">
      <Mark size={size} />
      <span className="brand-name">Pilotage<span className="dot">.</span></span>
    </Link>
  );
}

// ---------- Score ring ----------
export function ScoreRing({ value, size = 72, stroke = 7, label = 'score' }: { value: number; size?: number; stroke?: number; label?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - value / 100);
  const hue = value >= 85 ? 'var(--pos)' : value >= 65 ? 'var(--accent)' : value >= 45 ? 'var(--warn)' : 'var(--neg)';
  return (
    <div className="score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--vellum)" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={hue} strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(.2,.7,.3,1)' }} />
      </svg>
      <div className="val" style={{ fontSize: size * 0.32, color: 'var(--ink)' }}>
        {Math.round(value)}
        {label && <small>{label}</small>}
      </div>
    </div>
  );
}

// ---------- Sparkline / sea-chart area ----------
interface SparklineProps {
  data: number[];
  w?: number;
  h?: number;
  color?: string;
  fillId?: string;
  area?: boolean;
  sw?: number;
}

export function Sparkline({ data, w = 240, h = 56, color = 'var(--accent)', fillId, area = true, sw = 2 }: SparklineProps) {
  const max = Math.max(...data), min = Math.min(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * w,
    h - 4 - ((v - min) / span) * (h - 8),
  ]);
  const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const [fid, setFid] = useState('');
  useEffect(() => {
    setFid(fillId || ('g' + Math.random().toString(36).slice(2, 8)));
  }, [fillId]);

  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ height: h }}>
      {fid && (
        <defs>
          <linearGradient id={fid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.26" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
      )}
      {area && fid && <path d={`${line} L${w} ${h} L0 ${h} Z`} fill={`url(#${fid})`} />}
      <path d={line} fill="none" stroke={color} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ---------- Reveal-on-scroll hook ----------
export function useReveal() {
  useEffect(() => {
    const reveal = () => {
      const vh = window.innerHeight || 800;
      document.querySelectorAll('.reveal:not(.in)').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > -40) el.classList.add('in');
      });
    };
    reveal();
    const raf = requestAnimationFrame(reveal);
    const t1 = setTimeout(reveal, 180);
    const t2 = setTimeout(reveal, 600);
    window.addEventListener('scroll', reveal, { passive: true });
    window.addEventListener('resize', reveal);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('scroll', reveal);
      window.removeEventListener('resize', reveal);
    };
  }, []);
}

// ---------- animated count-up ----------
export function useCountUp(target: number, run: boolean, dur = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf: number, start: number;
    const tick = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setVal(target * e);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, target, dur]);
  return val;
}

// ---------- risk pill ----------
export function RiskPill({ risk }: { risk: 'low' | 'balanced' | 'high' }) {
  const map = { low: ['risk-low', 'Calm waters'], balanced: ['risk-bal', 'Balanced'], high: ['risk-high', 'High seas'] };
  const [cls, label] = map[risk] || map.balanced;
  return <span className={'risk ' + cls}>{label}</span>;
}

// ---------- wave divider ----------
export function Wave({ up = false }: { up?: boolean }) {
  return (
    <svg className={'wave' + (up ? ' up' : '')} viewBox="0 0 1440 64" preserveAspectRatio="none">
      <path d="M0 34 C 180 8 320 8 480 30 C 660 56 820 56 1000 32 C 1180 10 1320 12 1440 30 L1440 64 L0 64 Z" />
    </svg>
  );
}
