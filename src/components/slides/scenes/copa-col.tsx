"use client";

import "./copa-col.css";
import type { CSSProperties } from "react";
import { FactRow, LineChip, Photo, Ribbon, monogram, type Tone } from "../primitives.tsx";
import { useScene } from "../scene-context.tsx";
import { CopaStats, CopaTitle, Tick, supportsCopa } from "./copa-col-kit.tsx";

type Cell =
  | { kind: "code"; letter: string; tone: "blue" | "teal" | "purple" }
  | { kind: "photo"; slot: string; label: string; tone: Tone };

/* 4x3 board. Problems A-F are a graphic device (no results); photo slots copa1..copa6 fill the rest. */
const CELLS: Cell[] = [
  { kind: "code", letter: "A", tone: "blue" },
  { kind: "photo", slot: "copa1", label: "laboratorio", tone: "copa" },
  { kind: "code", letter: "B", tone: "teal" },
  { kind: "photo", slot: "copa2", label: "concentración", tone: "compite" },
  { kind: "photo", slot: "copa3", label: "equipo", tone: "compite" },
  { kind: "code", letter: "C", tone: "blue" },
  { kind: "photo", slot: "copa4", label: "premiación", tone: "copa" },
  { kind: "code", letter: "D", tone: "purple" },
  { kind: "code", letter: "E", tone: "teal" },
  { kind: "photo", slot: "copa5", label: "colegios", tone: "copa" },
  { kind: "code", letter: "F", tone: "blue" },
  { kind: "photo", slot: "copa6", label: "celebración", tone: "compite" },
];

/** Node bites seated on the outer edge of the board: the three nodes of the C3 symbol. */
const BITES: Record<number, { bx: string; by: string; nc: string }> = {
  0: { bx: "80%", by: "0%", nc: "var(--conecta-l)" },
  4: { bx: "0%", by: "50%", nc: "var(--crea)" },
  9: { bx: "62%", by: "100%", nc: "var(--compite-l)" },
};

export function CopaColScene() {
  const { slide, recipient } = useScene();
  const ribbon = recipient && supportsCopa(recipient.supportedEvents, "col");
  let k = 0;
  return (
    <article className="story-scene sc-copa-col" data-slide-id={slide.id} aria-label={slide.title}>
      <div className="cc-bg" aria-hidden="true"><i className="cc-dots" /><b className="cc-ghost">A</b></div>

      <div className="cc-copy">
        <div className="cc-eyebrow rv" style={{ "--d": ".2s" } as CSSProperties}><LineChip line="compite">Compite</LineChip></div>
        <p className="ev-k k-copa cc-kicker rv" style={{ "--d": ".3s" } as CSSProperties}>Copa Salvadoreña de Programación II <span aria-hidden="true">·</span> Colegios</p>
        <CopaTitle title={slide.title} max={13} delay={0.45} acDelay={2.1} />
        {slide.body && <p className="para cc-body rv" style={{ "--d": "1.3s" } as CSSProperties}>{slide.body}</p>}
        <FactRow className="cc-facts rv" style={{ "--d": "1.6s", "--mc": "var(--compite-l)" } as CSSProperties} />
        {ribbon && <div className="cc-ribbon rv" style={{ "--d": "4s" } as CSSProperties}><Ribbon name={recipient.commercialName} mono={monogram(recipient.commercialName)} /></div>}
      </div>

      <div className="cc-board" aria-hidden="true">
        <div className="cc-grid">
          {CELLS.map((cell, i) => {
            const col = i % 4, row = Math.floor(i / 4);
            const sd = 0.5 + i * 0.07; // tile leaves the centre
            const bite = BITES[i];
            const style: Record<string, string | number> = { "--i": i, "--ox": 1.5 - col, "--oy": 1 - row, "--cc-sd": `${sd.toFixed(2)}s`, "--rt": `${(i % 2 ? 1 : -1) * (10 + (i % 3) * 6)}deg` };
            let body;
            if (cell.kind === "code") {
              const fs = 1.9 + k * 0.16; // judge flips the tile
              style["--fs"] = `${fs.toFixed(2)}s`; style["--k"] = k;
              k += 1;
              body = (
                <>
                  <div className="cc-pend"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" /></svg></div>
                  <div className="cc-ok">
                    <span className="cc-ver"><Tick delay={fs + 0.85} /><em>AC</em></span>
                    <b>{cell.letter}</b>
                  </div>
                </>
              );
            } else {
              style["--pd"] = `${(2.3 + (i % 5) * 0.14).toFixed(2)}s`;
              const capTop = bite?.by === "100%" ? " cc-photo--cap-top" : "";
              body = <Photo slot={cell.slot} label={cell.label} tone={cell.tone} className={`cc-photo${capTop}`} />;
            }
            if (bite) { style["--bx"] = bite.bx; style["--by"] = bite.by; style["--nx"] = bite.bx; style["--ny"] = bite.by; style["--nc"] = bite.nc; style["--nd"] = `${(sd + 1.4).toFixed(2)}s`; }
            return (
              <div className={`cc-slot cc-slot--${cell.kind}${cell.kind === "code" ? ` cc-t-${cell.tone}` : ""}`} key={i} style={style as CSSProperties}>
                <div className={`cc-card${bite ? " bite" : ""}`}>{body}</div>
                {bite && <i className="node cc-node" />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="cc-foot"><CopaStats delay={3.4} /></div>
    </article>
  );
}
