import { useEffect, useRef, useState } from "react";

/**
 * Tracks 0→1 scroll progress through a tall wrapper element, meant to pair
 * with a `position: sticky` child inside it: 0 the instant the wrapper's
 * top reaches the viewport top (sticky just engaged), 1 the instant its
 * bottom reaches the viewport bottom (the moment sticky releases and
 * normal scrolling resumes). Drive per-item animation directly off this
 * value — no CSS transition involved, so it stays glued 1:1 to the scroll.
 */
export function useScrollProgress<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let rafId = 0;
    const update = () => {
      rafId = 0;
      const rect = el.getBoundingClientRect();
      const scrollableDistance = rect.height - window.innerHeight;
      const p = scrollableDistance > 0 ? -rect.top / scrollableDistance : 0;
      setProgress(Math.min(1, Math.max(0, p)));
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return { ref, progress };
}
