import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// How long to keep looking for the target while the page renders (~0.5s at 60fps).
const MAX_FRAMES = 30;

/** Navigation state that asks the scroll handling to leave the position alone (language switch). */
export type KeepScrollState = { keepScroll?: boolean };

/**
 * All scroll handling on navigation lives here, so links, `navigate()` calls and the browser
 * buttons behave the same way:
 *
 * - Link to a new page without an anchor: start at the top.
 * - Link with an anchor (/services#ai-automation): scroll to that element once it has rendered,
 *   or to the top if it never appears. Jumps straight there when arriving from another page,
 *   scrolls smoothly within the same page (unless the visitor prefers reduced motion), and moves
 *   keyboard focus to the target so keyboard and screen-reader users land in the same place.
 *   Give targets `scroll-mt-*` so the fixed navbar doesn't cover them.
 * - Back/forward: do nothing, so the browser restores the position the visitor left.
 * - `state: { keepScroll: true }`: do nothing (the language switcher keeps the reading position).
 */
export const useScrollOnNavigate = () => {
  const { pathname, hash, key, state } = useLocation();
  const navigationType = useNavigationType();
  const previousPathname = useRef<string | null>(null);

  useEffect(() => {
    const firstRender = previousPathname.current === null;
    const samePage = previousPathname.current === pathname;
    previousPathname.current = pathname;

    // The first render is also a POP; it still has to honour an anchor in the URL it opened with.
    if (navigationType === "POP" && !firstRender) return;
    if ((state as KeepScrollState | null)?.keepScroll) return;

    const toTop = () => {
      if (!firstRender) window.scrollTo({ top: 0, left: 0 });
    };

    let id: string | null = null;
    if (hash.length > 1) {
      try {
        id = decodeURIComponent(hash.slice(1));
      } catch {
        id = null;
      }
    }
    if (!id) {
      toTop();
      return;
    }

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    let frame = 0;
    let tries = 0;

    const attempt = () => {
      const target = document.getElementById(id);
      if (!target) {
        if (++tries < MAX_FRAMES) frame = requestAnimationFrame(attempt);
        else toTop();
        return;
      }
      target.scrollIntoView({ behavior: samePage && !reduceMotion ? "smooth" : "auto", block: "start" });
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    };

    attempt();
    return () => cancelAnimationFrame(frame);
    // `key` changes on every navigation, so clicking the same link twice scrolls again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, hash, key]);
};

export const ScrollOnNavigate = () => {
  useScrollOnNavigate();
  return null;
};
