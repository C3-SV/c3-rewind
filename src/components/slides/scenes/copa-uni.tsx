"use client";

import "./copa-uni.css";
import type { CSSProperties } from "react";
import { FactRow, Icon, LineChip, Pending, Photo, Ribbon, monogram } from "../primitives.tsx";
import { useScene, visibleStatus } from "../scene-context.tsx";
import { CopaStats, CopaTitle, isBracket, supportsCopa } from "./copa-col-kit.tsx";

/* Scoreboard graphic language: problem columns A-H with solved dots. Purely decorative — no teams, no rankings, no results. */
const COLS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const LANES = ["11010110", "10111001", "01101011", "11100110", "00111101", "10011011"];
const DOT_TONE = ["var(--compite-l)", "var(--crea)", "var(--conecta-l)", "var(--copa-pl)"];

export function CopaUniScene() {
  const { slide, recipient, photos, showDraft } = useScene();
  const ribbon = recipient && supportsCopa(recipient.supportedEvents, "uni");
  const focal = photos.copaU?.focalPoint ?? { x: 70, y: 45 };
  const quote = slide.blocks.find((b): b is Extract<typeof b, { type: "quote" }> => b.type === "quote" && visibleStatus(b.status, showDraft));

  return (
    <article className={`story-scene sc-copa-uni${quote ? " has-quote" : ""}`} data-slide-id={slide.id} aria-label={slide.title}>
      {/* giant scoreboard layer */}
      <div className="cu-sb" aria-hidden="true">
        {COLS.map((letter, c) => (
          <div className="cu-sbc" key={letter}>
            <b className="cu-sbl" style={{ "--cd": `${(0.2 + c * 0.08).toFixed(2)}s` } as CSSProperties}>{letter}</b>
            {LANES.map((lane, r) => (
              <i key={r} className={`cu-d${lane[c] === "1" ? " is-s" : ""}`} style={{ "--dd": `${(0.6 + c * 0.13 + r * 0.06).toFixed(2)}s`, "--dc": DOT_TONE[(c + r) % 4] } as CSSProperties} />
            ))}
          </div>
        ))}
        {showDraft && <span className="cu-sbnote">Marcador: lenguaje gráfico, no son resultados</span>}
      </div>

      {/* protagonist photo */}
      <div className="cu-frame" style={{ "--fx": `${focal.x}%`, "--fy": `${focal.y}%` } as CSSProperties}>
        <div className="cu-photo bite2">
          <div className="cu-iris">
            <Photo slot="copaU" label="final universitaria" tone="copa" className="cu-ph" />
          </div>
          <i className="cu-ring" aria-hidden="true" />
        </div>
        <i className="node cu-n1" aria-hidden="true" />
        <i className="node cu-n2" aria-hidden="true" />
      </div>

      {quote && (
        <figure className="cu-quote rv" style={{ "--d": "3.1s" } as CSSProperties}>
          <Photo slot="retrato1" label="retrato" tone="copa" circle small className="cu-avatar" />
          <blockquote>
            <Icon name="quote" className="cu-qi" />
            <p>{isBracket(quote.text) ? <Pending>testimonio real de ganador o participante</Pending> : quote.text}</p>
            <figcaption>
              {isBracket(quote.person) ? <Pending>nombre</Pending> : quote.person}
              {quote.role && <> · {isBracket(quote.role) ? <Pending>rol</Pending> : quote.role}</>}
            </figcaption>
          </blockquote>
        </figure>
      )}

      {/* copy */}
      <div className="cu-copy">
        <div className="cu-eyebrow rv" style={{ "--d": ".25s" } as CSSProperties}><LineChip line="compite">Compite</LineChip></div>
        <p className="ev-k k-copa cu-kicker rv" style={{ "--d": ".35s" } as CSSProperties}>Copa II <span aria-hidden="true">·</span> Universidades</p>
        <CopaTitle title={slide.title} max={13} delay={0.55} acDelay={2.2} />
        {slide.body && <p className="para cu-body rv" style={{ "--d": "1.4s" } as CSSProperties}>{slide.body}</p>}
        <FactRow className="cu-facts rv" style={{ "--d": "1.7s", "--mc": "var(--compite-l)" } as CSSProperties} />
        <div className="cu-row">
          <CopaStats delay={3} />
          <div className="cu-podium" aria-hidden="true">
            <div className="cu-steps">
              <span className="cu-st cu-st2" /><span className="cu-st cu-st1"><i className="cu-pn" /></span><span className="cu-st cu-st3" />
            </div>
            <em>Premiación</em>
          </div>
        </div>
        {ribbon && <div className="cu-ribbon rv" style={{ "--d": "4.2s" } as CSSProperties}><Ribbon name={recipient.commercialName} mono={monogram(recipient.commercialName)} /></div>}
      </div>
    </article>
  );
}
