import { useEffect, useRef } from "react";

export interface DrawFrame {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  /** seconds since this canvas mounted */
  elapsed: number;
  /** width / 1600 — the unit the scenes scale stroke widths and radii by */
  scale: number;
  /** smoothed pointer position + idle sway, already ramped in by driftFactor, in px */
  drift: { x: number; y: number };
  /** 0 → 1 ramp that gates the idle pulse/parallax until the draw-in reveal has settled */
  driftFactor: number;
  reduced: boolean;
  /** true when the scene should skip its own background fill + vignette */
  transparentBg: boolean;
}

export type DrawFn = (frame: DrawFrame) => void;

interface Options {
  /** seconds until idle pulse/parallax starts ramping in (default 3.0) */
  lifeStart?: number;
  /** seconds until idle pulse/parallax is fully ramped in (default 3.9) */
  lifeEnd?: number;
  transparentBg?: boolean;
}

function smoothstep(x: number, a: number, b: number) {
  if (b <= a) return x >= b ? 1 : 0;
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/**
 * Owns sizing (via ResizeObserver), the requestAnimationFrame loop, pointer
 * tracking, and prefers-reduced-motion for an ambient background canvas.
 * Pass a DrawFn built on the DrawFrame contract above — see scenes.ts for
 * drawImperialNetwork / drawAqueductPulse.
 *
 * `draw` is read from a ref internally, so you don't need useCallback:
 * pass the module-level scene function directly and this hook's setup
 * effect will only re-run if the refs/options actually change.
 */
export function useAmbientCanvas(
  containerRef: React.RefObject<HTMLDivElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  draw: DrawFn,
  opts: Options = {}
) {
  const drawRef = useRef(draw);
  useEffect(() => {
    drawRef.current = draw;
  }, [draw]);

  const lifeStart = opts.lifeStart ?? 3.0;
  const lifeEnd = opts.lifeEnd ?? 3.9;
  const transparentBg = opts.transparentBg ?? false;

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let mouseTX = 0,
      mouseTY = 0,
      curPX = 0,
      curPY = 0;

    function onPointerMove(e: PointerEvent) {
      const b = container!.getBoundingClientRect();
      if (b.width <= 0 || b.height <= 0) return;
      mouseTX = Math.max(-1, Math.min(1, ((e.clientX - b.left) / b.width) * 2 - 1));
      mouseTY = Math.max(-1, Math.min(1, ((e.clientY - b.top) / b.height) * 2 - 1));
    }
    function onPointerLeave() {
      mouseTX = 0;
      mouseTY = 0;
    }

    if (!reduced) {
      // window-level, not the canvas: the canvas stays pointer-events:none
      // so it never blocks clicks on real hero content, but tracking still works.
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerleave", onPointerLeave);
    }

    let w = 0,
      h = 0;
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = container!.clientWidth;
      h = container!.clientHeight;
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    let rafId = 0;
    let start: number | null = null;

    function renderFrame(elapsed: number) {
      if (w === 0 || h === 0) return;
      const driftFactor = reduced ? 0 : smoothstep(elapsed, lifeStart, lifeEnd);
      if (!reduced) {
        curPX += (mouseTX - curPX) * 0.05;
        curPY += (mouseTY - curPY) * 0.05;
      }
      const swayX = reduced ? 0 : Math.sin(elapsed * 0.15) * w * 0.0035;
      const swayY = reduced ? 0 : Math.cos(elapsed * 0.12) * h * 0.008;
      const drift = {
        x: (swayX + curPX * w * 0.012) * driftFactor,
        y: (swayY + curPY * h * 0.014) * driftFactor,
      };

      ctx!.clearRect(0, 0, w, h);
      drawRef.current({
        ctx: ctx!,
        width: w,
        height: h,
        elapsed,
        scale: w / 1600,
        drift,
        driftFactor,
        reduced,
        transparentBg,
      });
    }

    if (reduced) {
      renderFrame(10); // fully "settled" static frame — no reveal, no motion
    } else {
      const loop = (ts: number) => {
        if (start === null) start = ts;
        renderFrame((ts - start) / 1000);
        rafId = requestAnimationFrame(loop);
      };
      rafId = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [containerRef, canvasRef, lifeStart, lifeEnd, transparentBg]);
}
