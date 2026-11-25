import type { Slide } from "../../content/schema.ts";
import type { RecipientPresentation } from "../slides/slide-view.tsx";
import { SlideView } from "../slides/slide-view.tsx";

export function StaticDeck({ slides, edition, imageKitEndpoint, recipient, pdfHref, isDevelopment }: {
  slides: Slide[];
  edition: string;
  imageKitEndpoint?: string;
  recipient?: RecipientPresentation;
  pdfHref: string;
  isDevelopment?: boolean;
}) {
  return (
    <main className="rewind-app static-deck" aria-label={`C3 Rewind ${edition} · documento estático`}>
      <div className="experience-stage">
        {slides.map((slide) => (
          <section className="experience-slide is-active" key={slide.id} aria-label={slide.title}>
            <SlideView slide={slide} edition={edition} imageKitEndpoint={imageKitEndpoint} recipient={recipient} staticMode isDevelopment={isDevelopment} pdfHref={pdfHref} />
          </section>
        ))}
      </div>
    </main>
  );
}
