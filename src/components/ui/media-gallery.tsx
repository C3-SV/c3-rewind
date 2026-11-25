"use client";

import { useState } from "react";
import type { ContentBlock } from "../../content/schema.ts";
import { resolveMediaSource } from "../../lib/media.ts";

type GalleryMedia = Extract<ContentBlock, { type: "gallery" }>['media'][number];

export function MediaGallery({ media, imageKitEndpoint, staticMode }: {
  media: GalleryMedia[];
  imageKitEndpoint?: string;
  staticMode: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  if (staticMode) {
    return <div className="media-gallery media-gallery--static">
      {media.map((asset) => <figure key={asset.src}><img src={resolveMediaSource(asset, imageKitEndpoint)} alt={asset.alt} style={{ objectPosition: asset.focalPoint ? `${asset.focalPoint.x}% ${asset.focalPoint.y}%` : undefined }} /><figcaption>{asset.alt}</figcaption></figure>)}
    </div>;
  }

  const active = media[activeIndex];
  return <section className="media-gallery" aria-label="Galería de fotografías">
    <figure aria-live="polite">
      <img src={resolveMediaSource(active, imageKitEndpoint)} alt={active.alt} loading="lazy" style={{ objectPosition: active.focalPoint ? `${active.focalPoint.x}% ${active.focalPoint.y}%` : undefined }} />
      <figcaption>{active.alt}</figcaption>
    </figure>
    {media.length > 1 && <div className="gallery-controls" aria-label="Controles de galería">
      <button type="button" onClick={() => setActiveIndex((index) => (index - 1 + media.length) % media.length)} aria-label="Fotografía anterior">←</button>
      <span aria-live="polite">{activeIndex + 1} / {media.length}</span>
      <button type="button" onClick={() => setActiveIndex((index) => (index + 1) % media.length)} aria-label="Fotografía siguiente">→</button>
    </div>}
  </section>;
}
