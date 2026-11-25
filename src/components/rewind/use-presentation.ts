"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Slide } from "../../content/schema.ts";

export type Origin = { x: number; y: number } | null; // percent of the stage

type Transition = { leaving: number | null; origin: Origin; token: number };

/** Navigation state. The user can advance at any moment — a new go() cancels the running transition. */
export function usePresentation(slides: Slide[]) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [transition, setTransition] = useState<Transition>({ leaving: null, origin: null, token: 0 });
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const indexRef = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touch = useRef<{ x: number; y: number; t: number; origin: Origin } | null>(null);
  const reduced = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => { reduced.current = media.matches; setReducedMotion(media.matches); };
    sync();
    media.addEventListener("change", sync);
    const stableId = decodeURIComponent(window.location.hash.slice(1));
    const restored = slides.findIndex((slide) => slide.id === stableId);
    if (restored > 0) { indexRef.current = restored; setActiveIndex(restored); }
    return () => media.removeEventListener("change", sync);
  }, [slides]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const go = useCallback((target: number, origin: Origin = null) => {
    const next = Math.max(0, Math.min(slides.length - 1, target));
    const previous = indexRef.current;
    if (next === previous) return;
    indexRef.current = next;
    setActiveIndex(next);
    if (timer.current) clearTimeout(timer.current);
    if (reduced.current) {
      setTransition((t) => ({ leaving: null, origin: null, token: t.token + 1 }));
    } else {
      setTransition((t) => ({ leaving: previous, origin, token: t.token + 1 }));
      timer.current = setTimeout(() => { timer.current = null; setTransition((t) => ({ ...t, leaving: null })); }, 1250);
    }
    const stableId = slides[next]?.id;
    if (stableId) window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${encodeURIComponent(stableId)}`);
  }, [slides]);

  const originOf = (event: { clientX: number; clientY: number; detail?: number } | undefined, stage: HTMLElement | null): Origin => {
    if (!event || !stage || event.detail === 0) return null;
    const box = stage.getBoundingClientRect();
    return { x: ((event.clientX - box.left) / box.width) * 100, y: ((event.clientY - box.top) / box.height) * 100 };
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, textarea, select, [contenteditable='true']")) return;
      if (event.key === " " && target instanceof HTMLElement && target.closest("button, a, summary")) return;
      const i = indexRef.current;
      if (event.key === "ArrowRight" || event.key === "ArrowDown" || event.key === "PageDown") { event.preventDefault(); go(i + 1); }
      else if (event.key === "ArrowLeft" || event.key === "ArrowUp" || event.key === "PageUp") { event.preventDefault(); go(i - 1); }
      else if (event.key === "Home") { event.preventDefault(); go(0); }
      else if (event.key === "End") { event.preventDefault(); go(slides.length - 1); }
      else if (event.key === " ") { event.preventDefault(); setPaused((value) => !value); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [go, slides.length]);

  const onTouchStart = (event: React.TouchEvent) => {
    const t = event.changedTouches[0];
    if (t) touch.current = { x: t.clientX, y: t.clientY, t: Date.now(), origin: null };
  };
  const onTouchEnd = (event: React.TouchEvent, stage: HTMLElement | null) => {
    const start = touch.current; const t = event.changedTouches[0];
    touch.current = null;
    if (!start || !t) return;
    const dx = t.clientX - start.x; const dy = t.clientY - start.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4 && Date.now() - start.t < 900) {
      go(indexRef.current + (dx < 0 ? 1 : -1), originOf({ clientX: t.clientX, clientY: t.clientY, detail: 1 }, stage));
    }
  };

  return { activeIndex, transition, paused, setPaused, reducedMotion, go, originOf, onTouchStart, onTouchEnd };
}
