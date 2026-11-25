"use client";

import { createContext, useContext } from "react";
import type { Edition, Fact, Slide } from "../../content/schema.ts";

export type RecipientPresentation = {
  id: string;
  commercialName: string;
  logo: string | null;
  welcomeMessage: string | null;
  closingMessage: string | null;
  contactDestination: string | null;
  supportedEvents: string[];
  enabledByEvent: Array<{ eventId: string; contribution: string; description: string | null }>;
  impact: Array<{ label: string; value: string; status: string }>;
  media: Array<{ file: string; alt: string; status: string }>;
  people: Array<{ name: string; role: string }>;
  testimonials: Array<{ text: string; person: string; permission: boolean }>;
};

export type SceneCtx = {
  slide: Slide;
  edition: string;
  /** Named photo slots from the edition (already filtered by editorial visibility). */
  photos: Edition["photos"];
  imageKitEndpoint?: string;
  recipient?: RecipientPresentation;
  /** URL of the recipient logo (private media route or https), if any. */
  partnerLogo: string | null;
  /** True in review/dev builds: pending content and photo labels are shown. */
  showDraft: boolean;
  staticMode: boolean;
  active: boolean;
  reducedMotion: boolean;
  pdfHref: string;
  hidePdf: boolean;
  /** Navigation helpers — no-ops in static mode. */
  next: () => void;
  home: () => void;
  jump: (slideId: string) => void;
};

const Ctx = createContext<SceneCtx | null>(null);
export const SceneProvider = Ctx.Provider;
export function useScene(): SceneCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useScene must be used inside a SceneProvider");
  return v;
}

/** Editorial visibility: a fact/stat/etc. is shown when approved, or always in review/dev builds. */
export function visibleStatus(status: string, showDraft: boolean): boolean {
  return showDraft || status === "approved";
}
export function useFacts(): Fact[] {
  const { slide, showDraft } = useScene();
  return slide.facts.filter((fact) => visibleStatus(fact.status, showDraft));
}
