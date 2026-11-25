"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Slide } from "../../content/schema.ts";

export function usePresentation(slides: Slide[]) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<"forward" | "backward">("forward");
  const activeIndexRef = useRef(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const setFromSystem = () => setReducedMotion(media.matches);
    setFromSystem();
    media.addEventListener("change", setFromSystem);
    const stableId = decodeURIComponent(window.location.hash.slice(1));
    const restoredIndex = slides.findIndex((slide) => slide.id === stableId);
    if (restoredIndex >= 0) {
      activeIndexRef.current = restoredIndex;
      setActiveIndex(restoredIndex);
    }
    return () => media.removeEventListener("change", setFromSystem);
  }, [slides]);

  useEffect(() => () => {
    if (transitionTimer.current) clearTimeout(transitionTimer.current);
  }, []);

  const go = useCallback((next: number) => {
    const bounded = Math.max(0, Math.min(slides.length - 1, next));
    const previous = activeIndexRef.current;
    if (bounded === previous) return;
    activeIndexRef.current = bounded;
    setActiveIndex(bounded);
    setTransitionDirection(bounded > previous ? "forward" : "backward");
    if (transitionTimer.current) clearTimeout(transitionTimer.current);
    transitionTimer.current = setTimeout(() => { transitionTimer.current = null; }, reducedMotion ? 0 : 720);
    const stableId = slides[bounded]?.id;
    if (stableId && typeof window !== "undefined") {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${encodeURIComponent(stableId)}`);
    }
  }, [reducedMotion, slides]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, textarea, select, [contenteditable='true']")) return;
      if (event.key === " " && target instanceof HTMLElement && target.closest("button, a, summary")) return;
      if (event.key === "ArrowRight" || event.key === "PageDown") { event.preventDefault(); go(activeIndex + 1); }
      else if (event.key === "ArrowLeft" || event.key === "PageUp") { event.preventDefault(); go(activeIndex - 1); }
      else if (event.key === "Home") { event.preventDefault(); go(0); }
      else if (event.key === "End") { event.preventDefault(); go(slides.length - 1); }
      else if (event.key === " ") { event.preventDefault(); setPaused((value) => !value); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, go, slides.length]);

  const onTouchStart = (event: React.TouchEvent) => {
    const touch = event.changedTouches[0];
    if (touch) touchStart.current = { x: touch.clientX, y: touch.clientY };
  };
  const onTouchEnd = (event: React.TouchEvent) => {
    const start = touchStart.current;
    const touch = event.changedTouches[0];
    touchStart.current = null;
    if (!start || !touch) return;
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.35) go(activeIndex + (dx < 0 ? 1 : -1));
  };

  return {
    activeIndex,
    paused,
    setPaused,
    reducedMotion,
    transitionDirection,
    go,
    onTouchStart,
    onTouchEnd,
  };
}
