"use client";

import { Lines } from "../primitives.tsx";
import { useScene } from "../scene-context.tsx";

export function GenericScene() {
  const { slide } = useScene();
  return (
    <article className="story-scene" data-slide-id={slide.id} aria-label={slide.title}>
      <div className="abs" style={{ left: "5em", top: "10em", width: "60em" }}>
        <h1 className="h"><Lines lines={[slide.title]} /></h1>
        {slide.body && <p className="para" style={{ marginTop: "1em" }}>{slide.body}</p>}
      </div>
    </article>
  );
}
