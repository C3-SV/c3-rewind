"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Edition, Slide } from "../../content/schema.ts";
import { OrbitField } from "../motion/orbit-field.tsx";
import type { RecipientPresentation } from "../slides/scene-context.tsx";
import { SlideFrame } from "../slides/slide-frame.tsx";
import { Navigation } from "../ui/navigation.tsx";
import { usePresentation } from "./use-presentation.ts";

type Props = {
  slides: Slide[];
  edition: string;
  photos?: Edition["photos"];
  imageKitEndpoint?: string;
  recipient?: RecipientPresentation;
  isDevelopment?: boolean;
  isReviewPreview?: boolean;
  pdfHref?: string;
};

export function RewindPlayer({ slides, edition, photos, imageKitEndpoint, recipient, isDevelopment = false, isReviewPreview = false, pdfHref: pdfHrefProp }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const p = usePresentation(slides);
  const active = slides[p.activeIndex];
  const pdfHref = pdfHrefProp ?? `/${edition}/pdf`;
  const showDraft = isDevelopment || isReviewPreview;
  const { go } = p;

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.();
    else await document.exitFullscreen?.();
  }, []);

  const originOf = useCallback((event: { clientX: number; clientY: number; detail?: number }) => p.originOf(event, stageRef.current), [p]);
  const actions = useRef({ next: () => {}, home: () => {}, jump: (_id: string) => {} });
  actions.current = {
    next: () => go(p.activeIndex + 1),
    home: () => go(0),
    jump: (id) => { const i = slides.findIndex((s) => s.id === id); if (i >= 0) go(i); },
  };
  const stableActions = useRef({ next: () => actions.current.next(), home: () => actions.current.home(), jump: (id: string) => actions.current.jump(id) }).current;

  return (
    <main className={`rewind-app is-live${p.paused || p.reducedMotion ? " is-paused" : ""}${fullscreen ? " is-fullscreen" : ""}`}>
      <div
        ref={stageRef}
        className={`experience-stage${p.reducedMotion ? " reduce-motion" : ""}`}
        onTouchStart={p.onTouchStart}
        onTouchEnd={(event) => p.onTouchEnd(event, stageRef.current)}
        aria-roledescription="presentación"
      >
        {slides.map((slide, index) => {
          const isActive = index === p.activeIndex;
          const entering = isActive && p.transition.leaving !== null;
          const cls = [isActive ? "is-active" : "", entering ? "top reveal" : "", index === p.transition.leaving ? "leaving out" : ""].filter(Boolean).join(" ");
          const o = p.transition.origin;
          return (
            <SlideFrame
              key={slide.id}
              slide={slide}
              edition={edition}
              photos={photos}
              imageKitEndpoint={imageKitEndpoint}
              recipient={recipient}
              showDraft={showDraft}
              hidePdf={isReviewPreview}
              pdfHref={pdfHref}
              active={isActive}
              reducedMotion={p.reducedMotion}
              className={cls}
              label={`${index + 1} de ${slides.length}: ${slide.title}`}
              hidden={!isActive}
              inert={!isActive}
              actions={stableActions}
              originStyle={entering ? o : null}
            />
          );
        })}
        <OrbitFieldHost slideId={active?.id ?? "portada"} />
        <Navigation
          slides={slides}
          activeIndex={p.activeIndex}
          paused={p.paused}
          reducedMotion={p.reducedMotion}
          fullscreen={fullscreen}
          nudgeNext={p.activeIndex === 0}
          onGo={p.go}
          onPause={() => p.setPaused((v) => !v)}
          onFullscreen={toggleFullscreen}
          originOf={originOf}
          notes={active?.editorialNotes ?? []}
          showNotes={showDraft}
        />
        {isDevelopment && <p className="dev-ribbon">VISTA DE DESARROLLO · {recipient ? "EMPRESA" : "GENERAL"}</p>}
        {isReviewPreview && <p className="dev-ribbon review-ribbon" role="status">VISTA PÚBLICA DE REVISIÓN · DATOS PENDIENTES</p>}
      </div>
      <span className="sr-only" aria-live="polite">{active ? `Slide ${p.activeIndex + 1}: ${active.title}` : ""}</span>
    </main>
  );
}

function OrbitFieldHost({ slideId }: { slideId: string }) {
  return <OrbitField slideId={slideId} />;
}
