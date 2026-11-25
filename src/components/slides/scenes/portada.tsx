"use client";

import "./portada.css";
import { Fragment, useState, type CSSProperties } from "react";
import { Icon, Photo, monogram, type Tone } from "../primitives.tsx";
import { useScene } from "../scene-context.tsx";

/** One frame of the film band. w/h in em (landscape), y = vertical offset in the band, shape = crop, bite = node seated in the frame. */
type Frame = {
  slot: string; label: string; tone: Tone; w: number; h: number; y: number;
  shape: "round" | "circle" | "arch" | "arch-down";
  bite?: { line: "compite" | "crea" | "conecta"; x: number; y: number; size: number };
};

/* reel2 and reel5 are the two real photos: they sit in the first screenful so they are visible from the first second. */
const FRAMES: Frame[] = [
  { slot: "reel2", label: "HTC · trabajo en equipo", tone: "htc", w: 16, h: 11.4, y: 0.2, shape: "round" },
  { slot: "reel1", label: "Copa · equipos", tone: "compite", w: 9.4, h: 9.4, y: 3.8, shape: "circle" },
  { slot: "reel5", label: "Copa · premiación", tone: "copa", w: 18.5, h: 10.6, y: 1.2, shape: "round", bite: { line: "compite", x: 94, y: 9, size: 3.6 } },
  { slot: "reel3", label: "Taller", tone: "crea", w: 10.4, h: 12.8, y: 0, shape: "arch" },
  { slot: "reel4", label: "Equipo C3", tone: "navy", w: 13.4, h: 8.8, y: 4.4, shape: "round" },
  { slot: "reel6", label: "HTC · mentoría", tone: "htc", w: 10.6, h: 10.6, y: 1.4, shape: "circle", bite: { line: "crea", x: 84, y: 16, size: 3 } },
  { slot: "reel7", label: "Comunidad", tone: "conecta", w: 16.4, h: 10.4, y: 2.6, shape: "round", bite: { line: "conecta", x: 6, y: 92, size: 3.4 } },
  { slot: "reel8", label: "Montaje", tone: "navy", w: 11.6, h: 12.2, y: 0.4, shape: "arch-down" },
];

const RADIUS: Record<Frame["shape"], string | undefined> = {
  round: "1.3em", circle: undefined, arch: "7em 7em 1.2em 1.2em", "arch-down": "1.2em 1.2em 7em 7em",
};

function FilmFrame({ f, i, dup }: { f: Frame; i: number; dup?: boolean }) {
  const style = { "--w": f.w, "--h": f.h, "--y": f.y, "--i": Math.min(i, 7) } as CSSProperties;
  const bite = f.bite && ({ "--bx": `${f.bite.x}%`, "--by": `${f.bite.y}%`, "--bs": `${f.bite.size * 1.12}em`, "--nx": `${f.bite.x}%`, "--ny": `${f.bite.y}%`, "--ns": `${f.bite.size}em` } as CSSProperties);
  return (
    <figure className={`pt-fr${dup ? " is-dup" : ""}`} style={style} aria-hidden={dup || undefined}>
      <Photo
        slot={f.slot} label={f.label} tone={f.tone} circle={f.shape === "circle"} small={f.shape === "circle" || f.w < 11}
        className={`pt-ph hz${f.bite ? " bite" : ""}`}
        style={{ ...(RADIUS[f.shape] ? ({ "--br": RADIUS[f.shape] } as CSSProperties) : {}), ...bite }}
      />
      {f.bite && <span className={`node node--${f.bite.line}`} style={bite} />}
    </figure>
  );
}

/** Text that sits on a circular path around the orbit field: «Competencia · Creación · Conexión». Decorative. */
function RingType() {
  const phrase = "COMPETENCIA  ·  CREACIÓN  ·  CONEXIÓN  ·  ";
  /* a 250° arc, leaving the left side (where the year sits) clear */
  return (
    <svg className="pt-ringtype" viewBox="-52 -52 104 104" aria-hidden="true" focusable="false">
      <defs><path id="pt-rt-path" d="M-20.28 -43.5 A48 48 0 1 1 -33.94 33.94" /></defs>
      <circle className="pt-rt-hair" cx="0" cy="0" r="50.4" />
      <text><textPath href="#pt-rt-path" textLength="204" lengthAdjust="spacing">{phrase.repeat(3).trimEnd()}</textPath></text>
    </svg>
  );
}

export function PortadaScene() {
  const { slide, recipient, partnerLogo, next, staticMode } = useScene();
  const [held, setHeld] = useState(false);
  const name = recipient?.commercialName ?? "";
  const body = slide.body ?? "Un año de competencia, creación y conexión.";
  const sub = recipient ? "El año que nos ayudaron a construir." : body;
  const parts = sub.split(/(competencia|creación|conexión)/i);
  const cls = (w: string) => ({ competencia: "compite", creación: "crea", conexión: "conecta" } as Record<string, string>)[w.toLowerCase()];

  return (
    <article className={`story-scene sc-portada${recipient ? " is-company" : ""}`} data-slide-id={slide.id} aria-label={slide.title}>
      {/* depth: ring typography around the orbit field + light sweep + breathing glow behind the final digit */}
      <div className="pt-depth" aria-hidden="true">
        <div className="pt-ring rv-f" style={{ "--d": ".35s" } as CSSProperties}><RingType /></div>
        <i className="pt-glow" />
        <i className="pt-sweep" />
      </div>

      <div className="pt-grid">
        {/* co-branding only: without a recipient the C3 mark lives at the centre of the orbit */}
        {recipient && (
          <header className="pt-top rv-l" style={{ "--d": ".1s" } as CSSProperties}>
            <img className="pt-lockup" src="/brand/lockup.png" alt="C3" />
            <span className="pt-x" aria-hidden="true">×</span>
            {partnerLogo
              ? <span className="pt-co pt-co--logo"><img src={partnerLogo} alt={name} /></span>
              : <span className="pt-co pt-co--mono"><i aria-hidden="true">{monogram(name)}</i><b>{name}</b></span>}
          </header>
        )}

        <div className="pt-hero">
          <p className="kicker pt-kicker rv" style={{ "--d": ".22s" } as CSSProperties}>
            <i className="pt-dot" aria-hidden="true" />C3 Rewind{recipient ? <span className="pt-for"> · Para {name}</span> : null}
          </p>
          <h1 className="pt-year" aria-label={slide.title}>
            {["20", "26"].map((pair, g) => (
              <span className="pt-pair" key={pair} aria-hidden="true">
                {[...pair].map((d, k) => {
                  const idx = g * 2 + k;
                  return <span className={`pt-dg${idx === 3 ? " pt-dg--six" : ""}`} key={idx}><i style={{ "--i": idx } as CSSProperties}>{d}</i></span>;
                })}
              </span>
            ))}
          </h1>
          <p className="pt-sub rv" style={{ "--d": "1.15s" } as CSSProperties}>
            {parts.map((p, k) => (cls(p) ? <b className={`pt-w pt-w--${cls(p)}`} key={k}>{p}</b> : <Fragment key={k}>{p}</Fragment>))}
          </p>
          <button type="button" className="cta pt-cta rv" style={{ "--d": "1.45s" } as CSSProperties} onClick={next}>
            Comenzar <Icon name="arrow" />
          </button>
        </div>
      </div>

      <section className={`pt-reel${held ? " is-held" : ""}`} aria-label="Fotos de 2026">
        <div className="pt-track">
          {FRAMES.map((f, i) => <FilmFrame f={f} i={i} key={f.slot} />)}
          {!staticMode && FRAMES.map((f, i) => <FilmFrame f={f} i={i} key={`d${f.slot}`} dup />)}
        </div>
      </section>
      <button type="button" className="ibtn pt-ctl" aria-pressed={held} aria-label={held ? "Reanudar fotos" : "Pausar fotos"} onClick={() => setHeld((v) => !v)}>
        <Icon name={held ? "play" : "pause"} />
      </button>
    </article>
  );
}
