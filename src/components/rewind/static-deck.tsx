import type { Edition, Slide } from "../../content/schema.ts";
import type { RecipientPresentation } from "../slides/scene-context.tsx";
import { SlideFrame } from "../slides/slide-frame.tsx";

/** Static/PDF rendering: one 16:9 page per slide, every animation resolved to its final frame. */
export function StaticDeck({ slides, edition, photos, imageKitEndpoint, recipient, pdfHref, isDevelopment }: {
  slides: Slide[];
  edition: string;
  photos?: Edition["photos"];
  imageKitEndpoint?: string;
  recipient?: RecipientPresentation;
  pdfHref: string;
  isDevelopment?: boolean;
}) {
  return (
    <main className="rewind-app static-deck is-static" aria-label={`C3 Rewind ${edition} · documento estático`}>
      <div className="experience-stage">
        {slides.map((slide, index) => (
          <div className="rw-page" key={slide.id}>
            <SlideFrame slide={slide} edition={edition} photos={photos} imageKitEndpoint={imageKitEndpoint} recipient={recipient} showDraft={Boolean(isDevelopment)} pdfHref={pdfHref} staticMode />
            {index > 0 && <div className="rw-pgf" style={{ fontSize: "1cqw" }}><span>c3.com.sv{recipient ? ` · Para ${recipient.commercialName}` : ""}</span><span>{String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</span></div>}
          </div>
        ))}
      </div>
    </main>
  );
}
