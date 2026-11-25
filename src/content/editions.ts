import general2026 from "./2026/general.json" with { type: "json" };
import { EditionSchema, type ContentBlock, type Edition, type Slide } from "./schema.ts";

export type EditionView = "general" | "private";
export type SlideOverrides = { disabled?: string[]; order?: string[] };

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

export function isEditionPublishable(edition: Edition): boolean {
  if (edition.publicationStatus !== "approved") return false;
  const publicSlides = edition.slides.filter((slide) => slide.enabled && slide.audience !== "private");
  return publicSlides.length === 13 && publicSlides.every((slide) => {
    const blocksApproved = slide.blocks.every(isBlockApproved);
    return slide.status === "approved" && blocksApproved;
  });
}

function isBlockApproved(block: ContentBlock): boolean {
  if (block.type === "image") return block.media.status === "approved";
  if (block.type === "gallery") return block.status === "approved" && block.media.every((media) => media.status === "approved");
  return block.status === "approved";
}
