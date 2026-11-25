"use client";

import { useCallback, useState } from "react";
import type { Slide } from "../../content/schema.ts";
import type { RecipientPresentation } from "../slides/slide-view.tsx";
import { SlideView } from "../slides/slide-view.tsx";
import { Navigation } from "../ui/navigation.tsx";
import { usePresentation } from "./use-presentation.ts";

type Props = {
  slides: Slide[];
  edition: string;
  imageKitEndpoint?: string;
  recipient?: RecipientPresentation;
  isDevelopment?: boolean;
  isReviewPreview?: boolean;
  pdfHref?: string;
};

export function RewindPlayer({ slides, edition, imageKitEndpoint, recipient, isDevelopment = false, isReviewPreview = false, pdfHref: pdfHrefProp }: Props) {
  const [fullscreen, setFullscreen] = useState(false);
  const presentation = usePresentation(slides);
  const active = slides[presentation.activeIndex];
  const pdfHref = pdfHrefProp ?? `/${edition}/pdf`;

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen?.();
      setFullscreen(true);
    } else {
      await document.exitFullscreen?.();
      setFullscreen(false);
    }
  }, []);

  return (
    <main className={`rewind-app${presentation.paused || presentation.reducedMotion ? " is-paused" : ""}${fullscreen ? " is-fullscreen" : ""}`}>
      <div
        className={`experience-stage${presentation.reducedMotion ? " reduce-motion" : ""}`}
        onTouchStart={presentation.onTouchStart}
        onTouchEnd={presentation.onTouchEnd}
        aria-roledescription="presentación"
      >
        {slides.map((slide, index) => (
          <section
            className={`experience-slide${index === presentation.activeIndex ? " is-active" : ""} ${presentation.transitionDirection}`}
            key={slide.id}
            aria-hidden={index !== presentation.activeIndex}
            aria-roledescription="diapositiva"
            aria-label={`${index + 1} de ${slides.length}: ${slide.title}`}
            inert={index !== presentation.activeIndex}
          >
            <SlideView
              slide={slide}
              edition={edition}
              imageKitEndpoint={imageKitEndpoint}
              recipient={recipient}
              isDevelopment={isDevelopment}
              showDraftContent={isReviewPreview}
              hidePdf={isReviewPreview}
              onStart={() => presentation.go(1)}
              pdfHref={pdfHref}
            />
          </section>
        ))}
      </div>
      <Navigation
        slides={slides}
        activeIndex={presentation.activeIndex}
        paused={presentation.paused || presentation.reducedMotion}
        onGo={presentation.go}
        onPause={() => presentation.setPaused((value) => !value)}
        onHome={() => presentation.go(0)}
        onFullscreen={toggleFullscreen}
      />
      {isDevelopment && <p className="dev-ribbon">VISTA DE DESARROLLO · {recipient ? "EMPRESA" : "GENERAL"}</p>}
      {isReviewPreview && <p className="dev-ribbon review-ribbon" role="status">VISTA PÚBLICA DE REVISIÓN · DATOS PENDIENTES</p>}
      <span className="sr-only" aria-live="polite">{active ? `Slide ${presentation.activeIndex + 1}: ${active.title}` : ""}</span>
    </main>
  );
}

