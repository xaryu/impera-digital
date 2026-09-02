import { useEffect, useRef, useState } from "react";

/**
 * Fires once when the element scrolls into view, then stops observing.
 * Also surfaces prefers-reduced-motion so callers can skip the animation
 * and just show the final state immediately.
 */
export function useInView<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null);
  const [isInView, setIsInView] = useState(false);
  const reduced =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced) {
      setIsInView(true); // skip straight to final state, no motion
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px", ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced]);

  return { ref, isInView, reduced };
}