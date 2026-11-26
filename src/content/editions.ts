import general2026 from "./2026/general.json" with { type: "json" };
import { EditionSchema, type ContentBlock, type Edition, type Slide } from "./schema.ts";

export type EditionView = "general" | "private";
export type SlideOverrides = { disabled?: string[]; order?: string[] };
export type GeneralExperienceMode = "published" | "review" | "blocked";

export function getGeneralExperienceMode(
  edition: Edition,
  access: { production: boolean; published: boolean; preview: boolean },
): GeneralExperienceMode {
  if (access.published && isEditionPublishable(edition)) return "published";
  if (!access.production || access.preview) return "review";
  return "blocked";
}

const editions: Record<string, unknown> = { "2026": general2026 };

export function getEdition(year: string): Edition {
  const source = editions[year];
  if (!source) throw new Error(`Unknown Rewind edition: ${year}`);
  return EditionSchema.parse(source);
}

export function resolveSlides(
  year: string,
  view: EditionView,
  overrides: SlideOverrides = {},
): Slide[] {
  const edition = getEdition(year);
  const disabled = new Set(overrides.disabled ?? []);
  const candidates = edition.slides.filter((slide) => {
    if (!slide.enabled || disabled.has(slide.id)) return false;
    if (view === "general") return slide.audience !== "private";
    return slide.audience !== "general";
  });
  if (!overrides.order?.length) return candidates;

  const positions = new Map(overrides.order.map((id, index) => [id, index]));
  return candidates.toSorted((a, b) =>
    (positions.get(a.id) ?? overrides.order!.length) -
    (positions.get(b.id) ?? overrides.order!.length),
  );
}

export function isEditionPublishable(edition: Edition, view: EditionView = "general"): boolean {
  if (edition.publicationStatus !== "approved") return false;
  const publicSlides = edition.slides.filter((slide) => slide.enabled && slide.audience !== (view === "general" ? "private" : "general"));
  return publicSlides.length === (view === "general" ? 13 : 14) && publicSlides.every((slide) => {
    const blocksApproved = slide.blocks.every(isBlockApproved);
    return slide.status === "approved" && blocksApproved && slide.facts.every((fact) => fact.status === "approved");
  });
}

/** Filter before crossing the server/client boundary; hiding content in a scene is too late. */
export function presentationContent(edition: Edition, view: EditionView, showDraft = false): Edition {
  const mediaAllowed = (media: Edition["photos"][string]) => (view === "private" || !media.private) && (showDraft || media.status === "approved");
  return {
    ...edition,
    photos: Object.fromEntries(Object.entries(edition.photos).filter(([, media]) => mediaAllowed(media))),
    slides: edition.slides.filter((slide) => slide.enabled && slide.audience !== (view === "general" ? "private" : "general") && (showDraft || slide.status === "approved")).map((slide) => ({
      ...slide,
      editorialNotes: showDraft ? slide.editorialNotes : [],
      facts: slide.facts.filter((fact) => showDraft || fact.status === "approved"),
      blocks: slide.blocks.flatMap((block): ContentBlock[] => {
        if (block.type === "image") return mediaAllowed(block.media) ? [block] : [];
        if (!showDraft && block.status !== "approved") return [];
        if (block.type !== "gallery") return [block];
        const media = block.media.filter(mediaAllowed);
        return media.length ? [{ ...block, media }] : [];
      }),
    })),
  };
}

function isBlockApproved(block: ContentBlock): boolean {
  if (block.type === "image") return block.media.status === "approved";
  if (block.type === "gallery") return block.status === "approved" && block.media.every((media) => media.status === "approved");
  return block.status === "approved";
}
