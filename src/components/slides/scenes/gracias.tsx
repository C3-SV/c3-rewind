"use client";

import "./gracias.css";
import type { CSSProperties } from "react";
import { Pending, Photo, monogram } from "../primitives.tsx";
import { useScene } from "../scene-context.tsx";

const CLOSING = "Hoy queremos mostrarles lo que construimos en 2026, porque una parte de esto es suya.";

/** A word split into masked letters that rise one after another. */
function Letters({ text, delay = 0.2, step = 0.055, className = "" }: { text: string; delay?: number; step?: number; className?: string }) {
  return (
    <span className={`gr-word ${className}`} aria-hidden="true">
      {[...text].map((ch, i) => (
        <span className="gr-l" key={i}><i style={{ "--d": `${(delay + i * step).toFixed(2)}s` } as CSSProperties}>{ch === " " ? " " : ch}</i></span>
      ))}
    </span>
  );
}

/** Medallion for the pair: C3 isotipo or the company (logo on white, else a refined monogram). */
function Medal({ kind, name, logo }: { kind: "c3" | "partner"; name: string; logo: string | null }) {
  if (kind === "c3") return <span className="gr-medal gr-medal--c3"><img src="/brand/iso.png" alt="C3" /></span>;
  return logo
    ? <span className="gr-medal gr-medal--logo"><img src={logo} alt={name} /></span>
    : <span className="gr-medal gr-medal--mono" role="img" aria-label={name}><b aria-hidden="true">{monogram(name)}</b></span>;
}

export function GraciasScene() {
  const { slide, recipient, partnerLogo, showDraft } = useScene();
  const name = recipient?.commercialName ?? "";
  const welcome = recipient?.welcomeMessage?.trim() || null;
  const longest = Math.max(4, ...name.split(/\s+/).map((w) => w.length));
  const tail = slide.title.replace(/^Gracias\s*/i, "").replace(/\.$/, ""); // «por ser parte de nuestro 2026»
  const year = tail.match(/2026/)?.[0];
  const tailParts = year ? tail.split(year) : [tail];

  if (recipient) {
    return (
      <article className="story-scene sc-gracias is-company" data-slide-id={slide.id} aria-label={slide.title}>
        <div className="gr-copy">
          <h1 className="gr-h1" aria-label={`Gracias, ${name}.`}>
            <span className="gr-hello"><Letters text="Gracias," delay={0.2} step={0.06} /></span>
            <span className="gr-name" style={{ "--n": longest } as CSSProperties}>
              <Letters text={name} delay={0.55} step={0.05} className="gr-name__w" /><span className="gr-dot" aria-hidden="true"><i style={{ "--d": `${(0.6 + name.length * 0.05).toFixed(2)}s` } as CSSProperties}>.</i></span>
            </span>
          </h1>

          {/* portrait: the pair as a row joined by a drawn line */}
          <div className="gr-pair" aria-hidden="true">
            <Medal kind="c3" name={name} logo={null} />
            <span className="gr-pair__line"><i className="draw-x" /><b className="gr-pair__node" /></span>
            <Medal kind="partner" name={name} logo={partnerLogo} />
          </div>

          <div className="gr-msg">
            {welcome
              ? <p className="gr-welcome rv" style={{ "--d": "2.1s" } as CSSProperties}>{welcome}</p>
              : showDraft && <p className="gr-welcome gr-welcome--pending rv" style={{ "--d": "2.1s" } as CSSProperties}><Pending>MENSAJE DE LA PERSONA DE C3 QUE LLEVÓ LA RELACIÓN, 2–3 LÍNEAS</Pending></p>}
            <p className="gr-closing rv" style={{ "--d": "2.7s" } as CSSProperties}>{CLOSING}</p>
          </div>
        </div>

        <div className="gr-photo">
          <div className="gr-photo__in wipe-c" style={{ "--d": "1s" } as CSSProperties}>
            <Photo slot="gracias" label="su participación en un evento" tone="conecta" circle clean className="gr-ph" />
          </div>
          {/* landscape: the pair sits on the photo's rim, two medallions at the aperture joined by one arc */}
          <div className="gr-link" aria-hidden="true">
            <svg viewBox="0 0 100 100" overflow="visible">
              <path className="gr-arc draw" pathLength={1} d="M92.4 23.5 Q139 50 92.4 76.5" style={{ "--d": "1.9s" } as CSSProperties} />
            </svg>
            <b className="gr-link__node rv-s" style={{ "--d": "2.5s" } as CSSProperties} />
            <span className="gr-slot gr-slot--a rv-s" style={{ "--d": "1.6s" } as CSSProperties}><Medal kind="c3" name={name} logo={null} /></span>
            <span className="gr-slot gr-slot--b rv-s" style={{ "--d": "1.75s" } as CSSProperties}><Medal kind="partner" name={name} logo={partnerLogo} /></span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="story-scene sc-gracias" data-slide-id={slide.id} aria-label={slide.title}>
      <div className="gr-copy">
        <h1 className="gr-h1" aria-label={slide.title}>
          <span className="gr-big"><Letters text="Gracias" delay={0.2} step={0.065} /></span>
          <span className="gr-tail ln" aria-hidden="true">
            <span style={{ "--d": "1s" } as CSSProperties}>
              {tailParts[0]}{year && <><em className="gr-year">{year}</em>{tailParts[1]}</>}.
            </span>
          </span>
        </h1>
        <p className="gr-para rv" style={{ "--d": "1.7s" } as CSSProperties}>{slide.body}</p>
      </div>

      <div className="gr-photo">
        <div className="gr-photo__in wipe-c" style={{ "--d": "1s" } as CSSProperties}>
          <Photo slot="comunidad" label="comunidad C3" tone="conecta" circle clean className="gr-ph" />
        </div>
      </div>
    </article>
  );
}
