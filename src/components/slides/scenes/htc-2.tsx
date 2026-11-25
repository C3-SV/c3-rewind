"use client";

import type { CSSProperties } from "react";
import "./htc-1-kit.css";
import "./htc-2.css";
import { Icon, Lines, LineChip, Photo } from "../primitives.tsx";
import { useScene, visibleStatus } from "../scene-context.tsx";
import { Brackets, HtcRibbon, Route } from "./htc-1-kit.tsx";

/* Same route language as htc-1, reversed: the orange node leaves htc-1's last station (P03 corner) along the lane and lands on the mosaic, becoming the winner's medal. */
const D_LAND = "M 95 43.2 H 66 C 59 43.2, 55 41.4, 55 38";
const D_PORT = "M 34.8 25.6 H 12 C 8 25.6, 5.4 24.2, 5.4 21";
/* scatter origins for the six tiles (em, em, deg) */
const SCATTER: Array<[number, number, number]> = [[-13, -7, -14], [1, -13, 7], [14, -8, 13], [-14, 9, 11], [0, 13, -7], [13, 9, -12]];
const delay = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;
const hasPending = (text: string) => /\[[^\]]+\]/.test(text);

export function Htc2Scene() {
  const { slide, showDraft, photos } = useScene();
  const copy = slide.blocks.find((block) => block.type === "copy" && /ganador/i.test(block.text));
  const quote = slide.blocks.find((block) => block.type === "quote");
  const winVisible = copy?.type === "copy" && visibleStatus(copy.status, showDraft);
  const quoteVisible = quote?.type === "quote" && visibleStatus(quote.status, showDraft);
  const [team = "", line = ""] = winVisible ? copy.text.replace(/^\s*ganador\s*:\s*/i, "").split(/\s[—–]\s/) : [];
  const bodyShown = !!slide.body && (showDraft || !hasPending(slide.body));
  const realWin = Boolean(photos.htcWin) && (showDraft || photos.htcWin.status === "approved");
  const [t1, t2 = ""] = slide.title.split(/\s(?=construyeron)/);

  return (
    <article className="story-scene sc-htc-2" data-slide-id={slide.id} aria-label={slide.title}>
      <div className="h2-ghost" aria-hidden="true">HTC</div>

      <div className="h2-col">
        <div className="h2-eyebrow">
          <span className="rv" style={delay(0.2)}><LineChip line="crea">{slide.chapterLabel}</LineChip></span>
          <p className="ev-k k-htc rv" style={delay(0.35)}>HTC · Vol. 1</p>
        </div>
        <h1 className="h2-title">
          {t2 ? <Lines delay={0.45} step={0.16} lines={[t1, t2]} /> : <Lines delay={0.45} lines={[slide.title]} />}
        </h1>
        {bodyShown && <p className="h2-body rv" style={delay(1.2)}><Brackets text={slide.body!} /></p>}

        <div className="h2-mid" aria-hidden="true" />

        {winVisible && (
          <div className="h2-win">
            <span className="h2-badge rv-s" style={delay(3.55)}><Icon name="trophy" />Ganador</span>
            <p className="h2-team"><Lines delay={3.7} lines={[<Brackets key="t" text={team} />]} /></p>
            {line && <p className="h2-line rv" style={delay(4.1)}><Brackets text={line} /></p>}
          </div>
        )}
        {quoteVisible && (
          <figure className="h2-quote rv" style={delay(4.4)}>
            <Photo slot="retrato2" label="retrato" tone="htc" circle small clean className="h2-portrait" />
            <blockquote>
              <Icon name="quote" className="h2-qi" />
              <p><Brackets text={quote.text} /></p>
              <figcaption><Brackets text={quote.person} />{quote.role ? <> · <Brackets text={quote.role} /></> : null}</figcaption>
            </blockquote>
          </figure>
        )}
      </div>

      <div className="h2-cluster">
        <div className="h2-mosaic" role="img" aria-label="Foto de los ganadores">
          {SCATTER.map(([ax, ay, ar], i) => (
            <div className={`h2-tl h2-tl--${i + 1} bite`} key={i} style={{ "--i": i, "--ax": `${ax}em`, "--ay": `${ay}em`, "--ar": `${ar}deg` } as CSSProperties}>
              <Photo slot="htcWin" tone="htc" clean className="h2-tp" style={{ "--br": "0" } as CSSProperties} />
            </div>
          ))}
          {showDraft && !realWin && <span className="h2-mlabel"><Icon name="cam" />Foto · ganadores en gran formato</span>}
        </div>

        <Route className="h2-route h2-route--l" vb="0 0 100 56.25" d={D_LAND} start={[95, 43.2]} style={{ "--r0": "0.7s", "--rd": "2.6s", "--g0": "0.6s" } as CSSProperties} />
        <Route className="h2-route h2-route--p" vb="0 0 36.36 26.5" d={D_PORT} start={[34.8, 25.6]} style={{ "--r0": "0.7s", "--rd": "2.6s", "--g0": "0.6s" } as CSSProperties} />

        <div className="h2-medal" aria-hidden="true">
          <svg className="h2-medal__g" viewBox="-50 -50 100 100" focusable="false">
            <circle className="h2-medal__veil" r="46" />
            <circle className="h2-medal__rim" r="45" />
            <circle className="h2-medal__echo h2-medal__echo--1" r="46" />
            <circle className="h2-medal__echo h2-medal__echo--2" r="46" />
            <circle className="h2-medal__dash" r="38" />
            <circle className="h2-medal__disc" r="29" />
          </svg>
          <Icon name="trophy" className="h2-medal__ic" />
        </div>

      </div>
      {showDraft && (
        <ul className="h2-chips" aria-label="Propuestas">
          {[0, 1, 2, 3].map((i) => <li key={i} className="rv-s" style={delay(4.9 + i * 0.12)}><span className="pend">[PROPUESTA]</span></li>)}
        </ul>
      )}
      <div className="h2-tail"><HtcRibbon delay={5.6} /></div>
    </article>
  );
}
