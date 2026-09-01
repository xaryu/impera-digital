import type { DrawFrame } from "./ambientCanvas";

/* ---------------------------------------------------------------------- *
 * Shared math — deterministic PRNG so both compositions are stable across
 * reloads/resizes (not re-randomized every mount), plus easing helpers.
 * ---------------------------------------------------------------------- */

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const GOLD = "213,173,74";
const GOLD_BRIGHT = "232,196,104";
function rgba(c: string, a: number) {
  return `rgba(${c},${Math.max(0, a)})`;
}
function clamp01(x: number) {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}
function smoothstep(x: number, a: number, b: number) {
  if (b <= a) return x >= b ? 1 : 0;
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}
function ease(elapsed: number, start: number, duration: number) {
  return smoothstep(elapsed, start, start + duration);
}
function easeOutBack(x: number) {
  const c1 = 1.70158,
    c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}
function controlPoint(x0: number, y0: number, x1: number, y1: number, bow: number) {
  const mx = (x0 + x1) / 2,
    my = (y0 + y1) / 2;
  const dx = x1 - x0,
    dy = y1 - y0;
  const len = Math.hypot(dx, dy) || 1;
  return [mx + (-dy / len) * bow, my + (dx / len) * bow] as const;
}
function bezierPoint(x0: number, y0: number, cx: number, cy: number, x1: number, y1: number, t: number) {
  const mt = 1 - t;
  return [mt * mt * x0 + 2 * mt * t * cx + t * t * x1, mt * mt * y0 + 2 * mt * t * cy + t * t * y1] as const;
}
function strokeLine(
  ctx: CanvasRenderingContext2D,
  x0: number, y0: number, x1: number, y1: number,
  bow: number, color: string, alpha: number, width: number, progress = 1
) {
  if (progress <= 0 || alpha <= 0) return;
  const [cx, cy] = controlPoint(x0, y0, x1, y1, bow);
  ctx.strokeStyle = rgba(color, alpha);
  ctx.lineWidth = width;
  ctx.beginPath();
  if (progress >= 1) {
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(cx, cy, x1, y1);
  } else {
    const steps = 34,
      n = Math.max(1, Math.ceil(steps * progress));
    ctx.moveTo(x0, y0);
    for (let i = 1; i <= n; i++) {
      const t = Math.min(progress, i / steps);
      const [px, py] = bezierPoint(x0, y0, cx, cy, x1, y1, t);
      ctx.lineTo(px, py);
    }
  }
  ctx.stroke();
}
function layer(ctx: CanvasRenderingContext2D, dx: number, dy: number, depth: number, fn: () => void) {
  ctx.save();
  ctx.translate(dx * depth, dy * depth);
  fn();
  ctx.restore();
}

/* ---------------------------------------------------------------------- *
 * Scene 1 — Imperial Network: converging gold routes + a castrum grid,
 * ported from the "Imperial Network" artifact.
 * ---------------------------------------------------------------------- */

interface Node {
  fx: number; fy: number; r: number; hub: boolean; order: number; phase: number;
}
const netRand = mulberry32(4104);
const NODES: Node[] = [
  { fx: 0.34, fy: 0.58, r: 1.6, hub: false, order: 0, phase: 0 },
  { fx: 0.36, fy: 0.75, r: 1.6, hub: false, order: 1, phase: 0 },
  { fx: 0.37, fy: 0.52, r: 1.8, hub: false, order: 2, phase: 0 },
  { fx: 0.50, fy: 0.90, r: 1.8, hub: false, order: 3, phase: 0 },
  { fx: 0.65, fy: 0.20, r: 1.8, hub: false, order: 4, phase: 0 },
  { fx: 0.58, fy: 0.79, r: 2.2, hub: false, order: 5, phase: 0 },
  { fx: 0.81, fy: 0.58, r: 2.2, hub: false, order: 6, phase: 0 },
  { fx: 0.93, fy: 0.67, r: 2.6, hub: false, order: 7, phase: 0 },
  { fx: 0.45, fy: 0.63, r: 2.6, hub: false, order: 8, phase: 0 },
  { fx: 0.97, fy: 0.44, r: 2.2, hub: false, order: 9, phase: 0 },
  { fx: 0.88, fy: 0.24, r: 3.0, hub: false, order: 10, phase: 0 },
  { fx: 0.72, fy: 0.42, r: 4.6, hub: true, order: 11, phase: 0 },
];
NODES.forEach((n) => (n.phase = netRand() * Math.PI * 2));

const TRAILING: [number, number, number, number, number][] = [
  [0.04, 0.61, 0.34, 0.58, -18],
  [0.08, 0.47, 0.37, 0.52, 14],
  [0.14, 0.71, 0.36, 0.75, -10],
];
const SECONDARY: [number, number, number, number, number, number][] = [
  [0.33, 0.18, 0.88, 0.24, 46, 0.16],
  [0.36, 0.85, 0.58, 0.79, -20, 0.16],
  [0.65, 0.20, 0.88, 0.24, 16, 0.14],
  [0.37, 0.52, 0.45, 0.63, 8, 0.16],
  [0.50, 0.90, 0.58, 0.79, -9, 0.14],
  [0.81, 0.58, 0.93, 0.67, 10, 0.16],
];
const PRIMARY: [number, number, number, number, number, number][] = [
  [0.34, 0.58, 0.72, 0.42, -34, 0.46],
  [0.72, 0.42, 0.97, 0.30, 20, 0.42],
  [0.72, 0.42, 0.45, 0.63, 24, 0.40],
  [0.45, 0.63, 0.58, 0.79, -16, 0.36],
  [0.58, 0.79, 0.93, 0.67, 28, 0.38],
  [0.72, 0.42, 0.88, 0.24, -18, 0.40],
  [0.88, 0.24, 0.97, 0.44, 12, 0.34],
  [0.93, 0.67, 0.97, 0.44, -14, 0.32],
  [0.65, 0.20, 0.72, 0.42, -11, 0.34],
  [0.81, 0.58, 0.72, 0.42, 9, 0.30],
];
const NODE_START = 1.9, NODE_STEP = 0.06, NODE_DUR = 0.55;

function drawNode(ctx: CanvasRenderingContext2D, n: Node, X: (f: number) => number, Y: (f: number) => number, scale: number, elapsed: number, pulseFactor: number) {
  const p = ease(elapsed, NODE_START + n.order * NODE_STEP, NODE_DUR);
  if (p <= 0) return;
  const x = X(n.fx), y = Y(n.fy), r = n.r * scale;
  const popScale = Math.max(0, easeOutBack(p));
  const alpha = Math.min(1, p * 1.25);
  const pulse = 1 + pulseFactor * (n.hub ? 0.30 : 0.18) * Math.sin(elapsed * (n.hub ? 0.55 : 0.5) + n.phase);

  if (n.hub) {
    if (p < 1) {
      const flashA = (1 - p) * 0.28, flashR = r * (2 + (1 - p) * 9);
      ctx.strokeStyle = rgba(GOLD_BRIGHT, flashA);
      ctx.lineWidth = Math.max(1, scale);
      ctx.beginPath(); ctx.arc(x, y, flashR, 0, Math.PI * 2); ctx.stroke();
    }
    const haloR = r * 7 * pulse;
    const halo = ctx.createRadialGradient(x, y, 0, x, y, Math.max(1, haloR));
    halo.addColorStop(0, rgba(GOLD_BRIGHT, 0.22 * alpha * pulse));
    halo.addColorStop(1, rgba(GOLD_BRIGHT, 0));
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(x, y, Math.max(1, haloR), 0, Math.PI * 2); ctx.fill();

    ctx.strokeStyle = rgba(GOLD_BRIGHT, 0.35 * alpha * pulse);
    ctx.lineWidth = Math.max(1, scale);
    ctx.beginPath(); ctx.arc(x, y, r * 2.6 * popScale, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = rgba(GOLD_BRIGHT, 0.95 * alpha);
  } else {
    ctx.strokeStyle = rgba(GOLD, 0.22 * alpha * pulse);
    ctx.lineWidth = Math.max(0.75, 0.8 * scale);
    ctx.beginPath(); ctx.arc(x, y, r * 2.2 * popScale, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = rgba(GOLD, 0.85 * alpha);
  }
  ctx.beginPath();
  ctx.arc(x, y, r * popScale, 0, Math.PI * 2);
  ctx.fill();
}

export function drawImperialNetwork(frame: DrawFrame) {
  const { ctx, width: w, height: h, elapsed, scale, drift, driftFactor, transparentBg } = frame;
  const X = (fx: number) => fx * w, Y = (fy: number) => fy * h;
  const openA = frame.reduced ? 1 : ease(elapsed, 0, 0.7);

  if (!transparentBg) {
    const bg = ctx.createRadialGradient(w * 0.70, h * 0.42, 0, w * 0.70, h * 0.42, w * 0.78);
    bg.addColorStop(0, "#16293F"); bg.addColorStop(0.55, "#111F32"); bg.addColorStop(1, "#0B1522");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    if (openA < 1) { ctx.fillStyle = rgba("11,21,34", 1 - openA); ctx.fillRect(0, 0, w, h); }
  }

  const pulseFactor = driftFactor;
  const dx = drift.x, dy = drift.y;

  layer(ctx, dx, dy, 0.25, () => {
    const a = ease(elapsed, 0.05, 0.85);
    [0.30, 0.46].forEach((rf, i) => {
      ctx.strokeStyle = rgba(GOLD, (i === 0 ? 0.05 : 0.03) * a);
      ctx.lineWidth = Math.max(1, scale);
      ctx.beginPath(); ctx.arc(X(0.72), Y(0.42), w * rf, 0, Math.PI * 2); ctx.stroke();
    });
  });

  layer(ctx, dx, dy, 0.3, () => {
    const p = ease(elapsed, 0.25, 0.9);
    if (p <= 0) return;
    const gx0 = 0.595, gx1 = 0.855, gy0 = 0.285, gy1 = 0.515, cols = 6, rows = 5;
    ctx.lineWidth = Math.max(0.6, 0.6 * scale);
    ctx.strokeStyle = rgba(GOLD, 0.14 * p);
    for (let i = 0; i <= cols; i++) {
      const fx = gx0 + (gx1 - gx0) * (i / cols);
      const yTop = Y(gy0), yBot = yTop + (Y(gy1) - yTop) * p;
      ctx.beginPath(); ctx.moveTo(X(fx), yTop); ctx.lineTo(X(fx), yBot); ctx.stroke();
    }
    for (let j = 0; j <= rows; j++) {
      const fy = gy0 + (gy1 - gy0) * (j / rows);
      const xL = X(gx0), xR = xL + (X(gx1) - xL) * p;
      ctx.beginPath(); ctx.moveTo(xL, Y(fy)); ctx.lineTo(xR, Y(fy)); ctx.stroke();
    }
  });

  layer(ctx, dx, dy, 0.45, () => {
    TRAILING.forEach((t, i) => {
      const p = ease(elapsed, 0.4 + i * 0.08, 0.9);
      strokeLine(ctx, X(t[0]), Y(t[1]), X(t[2]), Y(t[3]), t[4] * scale, GOLD, 0.05 * p, scale, p);
    });
  });

  layer(ctx, dx, dy, 0.55, () => {
    SECONDARY.forEach((s, i) => {
      const p = ease(elapsed, 0.55 + i * 0.05, 0.55);
      strokeLine(ctx, X(s[0]), Y(s[1]), X(s[2]), Y(s[3]), s[4] * scale, GOLD, s[5] * p, scale, p);
    });
  });

  layer(ctx, dx, dy, 0.7, () => {
    PRIMARY.forEach((pr, i) => {
      const p = ease(elapsed, 0.95 + i * 0.06, 0.6);
      strokeLine(ctx, X(pr[0]), Y(pr[1]), X(pr[2]), Y(pr[3]), pr[4] * scale, GOLD, pr[5] * p, 1.5 * scale, p);
    });
  });

  layer(ctx, dx, dy, 0.7, () => {
    const x0 = 0.40, x1 = 0.945, baseY = 0.865, count = 24;
    const lineP = ease(elapsed, 1.65, 0.55);
    const span = x1 - x0;
    strokeLine(ctx, X(x0), Y(baseY), X(x1), Y(baseY), 0, GOLD, 0.24 * lineP, Math.max(0.9, scale), lineP);
    const stepPx = X(x0 + span / count) - X(x0);
    const r = Math.max(3, stepPx * 0.46);
    for (let i = 0; i < count; i++) {
      const ap = ease(elapsed, 1.75 + (i / count) * 0.75, 0.35);
      if (ap <= 0) continue;
      const fx = x0 + span * (i / (count - 1));
      const cx = X(fx), cy = Y(baseY);
      ctx.strokeStyle = rgba(GOLD, 0.20 * ap);
      ctx.lineWidth = Math.max(0.8, 0.9 * scale);
      ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI, 0, false); ctx.stroke();
    }
  });

  layer(ctx, dx, dy, 0.5, () => {
    const p = ease(elapsed, 0.6, 0.6);
    if (p <= 0) return;
    const x0 = 0.40, x1 = 0.955, y = 0.095, count = 18;
    ctx.strokeStyle = rgba(GOLD, 0.16 * p);
    ctx.lineWidth = Math.max(0.7, 0.7 * scale);
    ctx.beginPath();
    for (let i = 0; i <= count; i++) {
      const fx = x0 + (x1 - x0) * (i / count);
      const len = i % 3 === 0 ? 9 * scale : 5 * scale;
      ctx.moveTo(X(fx), Y(y)); ctx.lineTo(X(fx), Y(y) + len);
    }
    ctx.stroke();
  });

  layer(ctx, dx, dy, 1.0, () => {
    NODES.forEach((n) => drawNode(ctx, n, X, Y, scale, elapsed, pulseFactor));
  });

  if (!transparentBg) {
    const vg = ctx.createRadialGradient(w * 0.62, h * 0.48, h * 0.35, w * 0.62, h * 0.48, w * 0.85);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, `rgba(4,8,14,${0.4 * openA})`);
    ctx.fillStyle = vg; ctx.fillRect(0, 0, w, h);
  }
}

/* ---------------------------------------------------------------------- *
 * Scene 2 — Aqueduct Pulse: three tiers of repeating arches + a traveling
 * pulse, ported from the "Aqueduct Pulse" artifact.
 * ---------------------------------------------------------------------- */

interface Arc { i: number; fx: number; env: number; }
interface Tier {
  x0: number; x1: number; baseY: number; rFac: number; w: number; a: number;
  arcs: Arc[]; revealStart: number; revealSweep: number; popDur: number;
  baseStart: number; baseDur: number;
}
function buildTier(x0: number, x1: number, count: number, ampl: number, freq: number, phase: number): Arc[] {
  const arr: Arc[] = [];
  for (let i = 0; i < count; i++) {
    const u = count > 1 ? i / (count - 1) : 0;
    const env = 1 + ampl * Math.sin(u * freq * Math.PI * 2 + phase);
    arr.push({ i, fx: x0 + (x1 - x0) * u, env });
  }
  return arr;
}
const aqRand = mulberry32(9142);
const T1: Tier = { x0: 0.335, x1: 0.965, baseY: 0.775, rFac: 0.46, w: 1.6, a: 0.46, arcs: buildTier(0.335, 0.965, 16, 0.16, 1.3, aqRand() * 6.283), revealStart: 0.90, revealSweep: 1.3, popDur: 0.4, baseStart: 0.15, baseDur: 1.1 };
const T2: Tier = { x0: 0.345, x1: 0.970, baseY: 0.535, rFac: 0.42, w: 1.0, a: 0.24, arcs: buildTier(0.345, 0.970, 24, 0.12, 1.7, aqRand() * 6.283), revealStart: 1.30, revealSweep: 1.3, popDur: 0.35, baseStart: 0.50, baseDur: 1.1 };
const T3: Tier = { x0: 0.360, x1: 0.975, baseY: 0.315, rFac: 0.40, w: 0.8, a: 0.13, arcs: buildTier(0.360, 0.975, 34, 0.10, 2.1, aqRand() * 6.283), revealStart: 1.70, revealSweep: 1.3, popDur: 0.3, baseStart: 0.80, baseDur: 1.1 };

const HUB_IDX = Math.round(T1.arcs.length * 0.62);
const HUB_FX = T1.arcs[HUB_IDX].fx;
const PULSE_PERIOD = 9.5;

function drawTierBaseline(ctx: CanvasRenderingContext2D, X: (f: number) => number, Y: (f: number) => number, tier: Tier, elapsed: number, leftFadeX: number) {
  const p = ease(elapsed, tier.baseStart, tier.baseDur);
  if (p <= 0) return;
  const xStart = X(leftFadeX), xSolid = X(tier.x0), xEnd = X(tier.x1);
  const grad = ctx.createLinearGradient(xStart, 0, xSolid, 0);
  grad.addColorStop(0, rgba(GOLD, 0));
  grad.addColorStop(1, rgba(GOLD, tier.a * 0.55));
  const curX = xStart + (xEnd - xStart) * p;
  ctx.lineWidth = Math.max(0.8, tier.w);
  const y = Y(tier.baseY);
  if (curX <= xSolid) {
    ctx.strokeStyle = grad;
    ctx.beginPath(); ctx.moveTo(xStart, y); ctx.lineTo(curX, y); ctx.stroke();
  } else {
    ctx.strokeStyle = grad;
    ctx.beginPath(); ctx.moveTo(xStart, y); ctx.lineTo(xSolid, y); ctx.stroke();
    ctx.strokeStyle = rgba(GOLD, tier.a * 0.55);
    ctx.beginPath(); ctx.moveTo(xSolid, y); ctx.lineTo(curX, y); ctx.stroke();
  }
}

function drawTierArcs(ctx: CanvasRenderingContext2D, X: (f: number) => number, Y: (f: number) => number, tier: Tier, elapsed: number, scale: number, withMarkers: boolean, pulseFactor: number) {
  const stepPx = (X(tier.x1) - X(tier.x0)) / Math.max(1, tier.arcs.length - 1);
  const baseR = Math.max(2.4, stepPx * tier.rFac);
  const y = Y(tier.baseY);
  tier.arcs.forEach((a) => {
    const ap = ease(elapsed, tier.revealStart + (a.i / tier.arcs.length) * tier.revealSweep, tier.popDur);
    if (ap <= 0) return;
    const cx = X(a.fx), r = baseR * a.env;
    ctx.strokeStyle = rgba(GOLD, tier.a * ap);
    ctx.lineWidth = Math.max(0.7, tier.w * scale);
    ctx.beginPath(); ctx.arc(cx, y, r, Math.PI, 0, false); ctx.stroke();

    if (withMarkers) {
      const isHub = a.i === HUB_IDX;
      const mp = ease(elapsed, tier.revealStart + (a.i / tier.arcs.length) * tier.revealSweep + 0.15, 0.35);
      if (mp <= 0) return;
      const mx = cx, my = y - r;
      const popScale = Math.max(0, easeOutBack(mp));
      const alpha = Math.min(1, mp * 1.25);
      const pulse = 1 + pulseFactor * (isHub ? 0.32 : 0.16) * Math.sin(elapsed * (isHub ? 0.5 : 0.55) + a.i * 1.7);

      if (isHub) {
        if (mp < 1) {
          const flashA = (1 - mp) * 0.26, flashR = r * 0.28 * (2 + (1 - mp) * 8);
          ctx.strokeStyle = rgba(GOLD_BRIGHT, flashA);
          ctx.lineWidth = Math.max(1, scale);
          ctx.beginPath(); ctx.arc(mx, my, flashR, 0, Math.PI * 2); ctx.stroke();
        }
        const haloR = r * 0.28 * 7 * pulse;
        const halo = ctx.createRadialGradient(mx, my, 0, mx, my, Math.max(1, haloR));
        halo.addColorStop(0, rgba(GOLD_BRIGHT, 0.24 * alpha * pulse));
        halo.addColorStop(1, rgba(GOLD_BRIGHT, 0));
        ctx.fillStyle = halo;
        ctx.beginPath(); ctx.arc(mx, my, Math.max(1, haloR), 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = rgba(GOLD_BRIGHT, 0.35 * alpha * pulse);
        ctx.lineWidth = Math.max(1, scale);
        ctx.beginPath(); ctx.arc(mx, my, r * 0.28 * 2.4 * popScale, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = rgba(GOLD_BRIGHT, 0.95 * alpha);
        ctx.beginPath(); ctx.arc(mx, my, r * 0.28 * popScale, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillStyle = rgba(GOLD, 0.75 * alpha * pulse);
        ctx.beginPath(); ctx.arc(mx, my, Math.max(1, r * 0.14 * popScale), 0, Math.PI * 2); ctx.fill();
      }
    }
  });
}

export function drawAqueductPulse(frame: DrawFrame) {
  const { ctx, width: w, height: h, elapsed, scale, drift, driftFactor, reduced, transparentBg } = frame;
  const X = (fx: number) => fx * w, Y = (fy: number) => fy * h;
  const hubY = T1.baseY - ((X(T1.x1) - X(T1.x0)) / (T1.arcs.length - 1) * T1.rFac) / h;
  const openA = reduced ? 1 : ease(elapsed, 0, 0.7);

  if (!transparentBg) {
    const bg = ctx.createRadialGradient(X(HUB_FX), Y(hubY), 0, X(HUB_FX), Y(hubY), w * 0.75);
    bg.addColorStop(0, "#16293F"); bg.addColorStop(0.55, "#111F32"); bg.addColorStop(1, "#0B1522");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    if (openA < 1) { ctx.fillStyle = rgba("11,21,34", 1 - openA); ctx.fillRect(0, 0, w, h); }
  }

  const pulseFactor = driftFactor;
  const dx = drift.x, dy = drift.y;

  layer(ctx, dx, dy, 0.2, () => {
    const a = ease(elapsed, 0.05, 0.85);
    [0.28, 0.44].forEach((rf, i) => {
      ctx.strokeStyle = rgba(GOLD, (i === 0 ? 0.05 : 0.03) * a);
      ctx.lineWidth = Math.max(1, scale);
      ctx.beginPath(); ctx.arc(X(HUB_FX), Y(hubY), w * rf, 0, Math.PI * 2); ctx.stroke();
    });
  });

  layer(ctx, dx, dy, 0.3, () => { drawTierBaseline(ctx, X, Y, T3, elapsed, 0.10); drawTierArcs(ctx, X, Y, T3, elapsed, scale, false, pulseFactor); });
  layer(ctx, dx, dy, 0.55, () => { drawTierBaseline(ctx, X, Y, T2, elapsed, 0.09); drawTierArcs(ctx, X, Y, T2, elapsed, scale, false, pulseFactor); });
  layer(ctx, dx, dy, 0.85, () => { drawTierBaseline(ctx, X, Y, T1, elapsed, 0.05); drawTierArcs(ctx, X, Y, T1, elapsed, scale, true, pulseFactor); });

  if (!reduced && pulseFactor > 0) {
    const cyclePos = (elapsed % PULSE_PERIOD) / PULSE_PERIOD;
    const envelope = Math.sin(Math.PI * cyclePos);
    if (envelope > 0.01) {
      const fx = T1.x0 + (T1.x1 - T1.x0) * cyclePos;
      const stepPx = (X(T1.x1) - X(T1.x0)) / (T1.arcs.length - 1);
      const idxF = ((fx - T1.x0) / (T1.x1 - T1.x0)) * (T1.arcs.length - 1);
      const i0 = Math.max(0, Math.min(T1.arcs.length - 1, Math.floor(idxF)));
      const i1 = Math.min(T1.arcs.length - 1, i0 + 1);
      const envAt = T1.arcs[i0].env + (T1.arcs[i1].env - T1.arcs[i0].env) * (idxF - i0);
      const r = Math.max(2.4, stepPx * T1.rFac) * envAt;
      layer(ctx, dx, dy, 0.85, () => {
        const px = X(fx), py = Y(T1.baseY) - r;
        const glowR = r * 1.8;
        const g = ctx.createRadialGradient(px, py, 0, px, py, Math.max(1, glowR));
        g.addColorStop(0, rgba(GOLD_BRIGHT, 0.30 * envelope * pulseFactor));
        g.addColorStop(1, rgba(GOLD_BRIGHT, 0));
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(px, py, Math.max(1, glowR), 0, Math.PI * 2); ctx.fill();
      });
    }
  }

  if (!transparentBg) {
    const vg = ctx.createRadialGradient(X(HUB_FX), Y(hubY + 0.06), h * 0.32, X(HUB_FX), Y(hubY + 0.06), w * 0.85);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, `rgba(4,8,14,${0.4 * openA})`);
    ctx.fillStyle = vg; ctx.fillRect(0, 0, w, h);
  }
}
