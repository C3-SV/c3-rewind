"use client";

import { useMemo, type CSSProperties } from "react";
import type { Edition, Slide } from "../../content/schema.ts";
import { OrbitField } from "../motion/orbit-field.tsx";
import { SceneProvider, type RecipientPresentation, type SceneCtx } from "./scene-context.tsx";
import { SCENES } from "./scenes/registry.tsx";
import { GenericScene } from "./scenes/generic.tsx";

export type FrameProps = {
  slide: Slide;
  edition: string;
  photos?: Edition["photos"];
  imageKitEndpoint?: string;
  recipient?: RecipientPresentation;
  showDraft: boolean;
  hidePdf?: boolean;
  pdfHref: string;
  staticMode?: boolean;
  active?: boolean;
  reducedMotion?: boolean;
  className?: string;
  label?: string;
  inert?: boolean;
  hidden?: boolean;
  originStyle?: { x: number; y: number } | null;
  actions?: { next: () => void; home: () => void; jump: (slideId: string) => void };
};

const noop = () => {};

/** One slide: background, orbit field and scene, wrapped with the scene context. Shared by the live player and the static/PDF deck. */
export function SlideFrame(props: FrameProps) {
  const { slide, edition, photos = {}, imageKitEndpoint, recipient, showDraft, hidePdf = false, pdfHref, staticMode = false, active = false, reducedMotion = false, className = "", label, actions } = props;
  const def = SCENES[slide.id];
  const Scene = def?.Scene ?? GenericScene;
  const privateMediaBase = pdfHref.replace(/\/pdf$/, "/media");
  const partnerLogo = recipient?.logo ? (/^https:\/\//i.test(recipient.logo) ? recipient.logo : `${privateMediaBase}/${encodeURIComponent(recipient.logo)}`) : null;
  const ctx = useMemo<SceneCtx>(() => ({
    slide, edition, photos, imageKitEndpoint, recipient, partnerLogo, showDraft, staticMode, active: active || staticMode, reducedMotion,
    pdfHref, hidePdf, next: actions?.next ?? noop, home: actions?.home ?? noop, jump: actions?.jump ?? noop,
  }), [slide, edition, photos, imageKitEndpoint, recipient, partnerLogo, showDraft, staticMode, active, reducedMotion, pdfHref, hidePdf, actions]);

  return (
    <section
      className={`experience-slide ${className}${staticMode ? " is-active is-static" : ""}`}
      data-theme={def?.theme ?? "p0"}
      data-chapter={slide.chapter}
      aria-label={label ?? slide.title}
      aria-roledescription="diapositiva"
      aria-hidden={props.hidden || undefined}
      inert={props.inert || undefined}
      style={props.originStyle ? ({ "--cx": `${props.originStyle.x}%`, "--cy": `${props.originStyle.y}%` } as CSSProperties) : undefined}
    >
      <div className="rw-bg" aria-hidden="true" />
      <div className="rw-edge" aria-hidden="true" />
      {staticMode && <OrbitField slideId={slide.id} isStatic />}
      <div className="rw-fg">
        <SceneProvider value={ctx}><Scene /></SceneProvider>
      </div>
    </section>
  );
}
