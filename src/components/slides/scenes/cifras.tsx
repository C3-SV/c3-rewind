"use client";

import "./cifras.css";
import type { CSSProperties } from "react";
import { Counter, Lines, Pending, Photo, type Tone } from "../primitives.tsx";
import { useScene, visibleStatus } from "../scene-context.tsx";
import { resolveMediaSource } from "../../../lib/media.ts";

/* ------------------------------------------------------------------ *
 * CIFRAS — numbers as a story. A horizontal contact sheet: tall photo
 * frames at staggered heights, giant numerals biting into them, over a
 * blurred collective backdrop whose veil lifts at the very end.
 * ------------------------------------------------------------------ */

type StatBlock = { type: "stat"; value: string; label: string; context: string; status: string };

/** Per-column composition: top offset (em), frame height (em), node on the frame's right edge (% from top), colours, photo hint. */
const COLS = [
  { t: 4, h: 18, ny: 0, sc: "var(--compite-l)", nc: "var(--compite)", tone: "compite" as Tone, hint: "participantes" },
  { t: 0, h: 21, ny: 56, sc: "var(--crea-t)", nc: "var(--crea)", tone: "crea" as Tone, hint: "primera competencia" },
  { t: 7, h: 16, ny: 10, sc: "var(--conecta-l)", nc: "var(--conecta)", tone: "conecta" as Tone, hint: "delegaciones" },
  { t: 1, h: 20, ny: 0, sc: "#fff", nc: "var(--compite-l)", tone: "navy" as Tone, hint: "participantes del país" },
  { t: 5, h: 17, ny: 44, sc: "var(--crea-t)", nc: "var(--crea)", tone: "crea" as Tone, hint: "actividades" },
];

type Parsed =
  | { kind: "num"; to: number; prefix: string; suffix: string; k: number }
  | { kind: "text"; text: string; k: number }
  | { kind: "pending"; name: string; k: number };

/** Real digits resolve through <Counter/>; anything still in [BRACKETS] is a pending slot. */
function parseValue(raw: string): Parsed {
  const v = raw.trim();
  const br = v.match(/^\[\s*(.*?)\s*\]$/);
  if (br) return { kind: "pending", name: br[1], k: 10.5 };
  const m = v.match(/^([^\d]{0,2})(\d[\d.,\s]*)([^\d]{0,4})$/);
  if (m) {
    const digits = m[2].replace(/\D/g, "");
    const to = parseInt(digits, 10);
    if (Number.isFinite(to)) {
      const n = digits.length;
      return { kind: "num", to, prefix: m[1].trim(), suffix: m[3].trim(), k: n <= 2 ? 10 : n === 3 ? 8.2 : n === 4 ? 6.6 : 5.4 };
    }
  }
  return { kind: "text", text: v, k: 3.4 };
}

/** The collective placeholder: a crowd of nodes (each person a node), built from the C3 palette. Never a fake photo. */
const RNG = (n: number) => { const x = Math.sin(n * 9301 + 49297) * 233280; return x - Math.floor(x); };
const PALETTE = ["#6fa0dd", "#33beac", "#9aa4e0", "#205298", "#4f5ba9", "#ffffff"];
const CROWD = (() => {
  const out: { x: number; y: number; r: number; c: string; o: number }[] = [];
  for (let row = 0; row < 7; row++) {
    const r = 15 + row * 5.5;
    const sp = r * 2.55;
    const y = 470 + row * 66 + RNG(row + 3) * 14;
    const count = Math.ceil(1700 / sp);
    for (let i = 0; i < count; i++) {
      const s = row * 97 + i;
      out.push({
        x: -20 + i * sp + (row % 2) * sp * 0.5 + (RNG(s + 5) - 0.5) * sp * 0.35,
        y: y + (RNG(s + 9) - 0.5) * 18,
        r: r * (0.78 + RNG(s + 13) * 0.44),
        c: PALETTE[Math.floor(RNG(s + 17) * PALETTE.length)],
        o: 0.34 + RNG(s + 21) * 0.5,
      });
    }
  }
  return out;
})();

function CrowdArt({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-g1`} cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#33beac" stopOpacity=".5" /><stop offset="1" stopColor="#33beac" stopOpacity="0" /></radialGradient>
        <radialGradient id={`${id}-g2`} cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#4f5ba9" stopOpacity=".7" /><stop offset="1" stopColor="#4f5ba9" stopOpacity="0" /></radialGradient>
        <radialGradient id={`${id}-g3`} cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#6fa0dd" stopOpacity=".5" /><stop offset="1" stopColor="#6fa0dd" stopOpacity="0" /></radialGradient>
        <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0f203e" stopOpacity="0" /><stop offset=".5" stopColor="#0f203e" stopOpacity="0" /><stop offset="1" stopColor="#0c1830" stopOpacity=".4" /></linearGradient>
      </defs>
      <rect width="1600" height="900" fill="#0f2a52" />
      <circle cx="260" cy="760" r="620" fill={`url(#${id}-g1)`} />
      <circle cx="1360" cy="120" r="560" fill={`url(#${id}-g2)`} />
      <circle cx="820" cy="360" r="520" fill={`url(#${id}-g3)`} />
      <g fill="none" stroke="#fff" strokeOpacity=".1">
        <circle cx="1180" cy="250" r="230" /><circle cx="1180" cy="250" r="360" /><circle cx="1180" cy="250" r="500" /><circle cx="1180" cy="250" r="660" />
      </g>
      <g>
        {CROWD.map((p, i) => <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r={p.r.toFixed(1)} fill={p.c} fillOpacity={p.o.toFixed(2)} />)}
      </g>
      <rect width="1600" height="900" fill={`url(#${id}-fade)`} />
    </svg>
  );
}

function Collective() {
  const { photos, imageKitEndpoint, showDraft } = useScene();
  const media = photos.colectiva;
  const real = media && (showDraft || media.status === "approved") ? media : undefined;
  const src = real ? resolveMediaSource(real, imageKitEndpoint) : null;
  const pos = real?.focalPoint ? `${real.focalPoint.x}% ${real.focalPoint.y}%` : undefined;
  return (
    <div className="cf-back" aria-hidden="true" data-slot="colectiva">
      {src ? (
        <>
          <img className="cf-img cf-soft" src={src} alt="" style={{ objectPosition: pos }} />
          <img className="cf-img cf-crisp" src={src} alt="" style={{ objectPosition: pos }} />
        </>
      ) : (
        <>
          <div className="cf-art cf-soft"><CrowdArt id="cfa" /></div>
          <div className="cf-art cf-crisp"><CrowdArt id="cfb" /></div>
        </>
      )}
      <div className="cf-veil" />
      <div className="cf-scrim" />
    </div>
  );
}

export function CifrasScene() {
  const { slide, recipient, showDraft } = useScene();
  const stats = (slide.blocks.filter((b) => b.type === "stat") as StatBlock[]).filter((b) => visibleStatus(b.status, showDraft));
  const title = recipient ? "Esto fue posible gracias a ustedes." : slide.title;
  const anyPending = stats.some((s) => s.status === "pending");
  const n = stats.length;

  return (
    <article className="story-scene sc-cifras" data-slide-id={slide.id} data-bare={n === 0 || undefined} aria-label={slide.title} style={{ "--n": n || 1, "--lift": `${(0.8 + Math.max(n, 1) * 0.5 + 0.6).toFixed(2)}s` } as CSSProperties}>
      <Collective />

      <header className="cf-head">
        <h1 className="cf-h"><Lines lines={[title]} delay={0.25} /></h1>
      </header>

      {n > 0 && (
        <ol className="cf-sheet">
          {stats.map((s, i) => {
            const c = COLS[i % COLS.length];
            const p = parseValue(s.value);
            const d = 0.8 + i * 0.5;
            const rollDelay = d + 0.4;
            const style = {
              "--i": i, "--d": `${d.toFixed(2)}s`, "--rd": `${rollDelay.toFixed(2)}s`, "--t": `${c.t}em`, "--h": `${c.h}em`,
              "--sc": c.sc, "--nc": c.nc, "--ny": `${c.ny}%`, "--k": p.k,
            } as CSSProperties;
            return (
              <li className="cf-col" key={i} style={style} data-side={i % 2 ? "r" : "l"}>
                <div className="cf-fr">
                  <Photo slot={`cifra${i + 1}`} label={c.hint} tone={c.tone} className="cf-ph bite" />
                  <span className="node cf-node" aria-hidden="true" />
                </div>
                <div className="cf-numw">
                  {p.kind === "pending" && (
                    <span className="cf-num cf-num--p" aria-hidden="true">
                      <span className="cf-roll"><span className="cf-roll__col">{["8", "3", "5", "1", "9", "7", "00"].map((g) => <i key={g}>{g}</i>)}</span></span>
                    </span>
                  )}
                  {p.kind === "num" && (
                    <span className="cf-num cf-num--n">
                      {p.prefix && <small>{p.prefix}</small>}
                      <Counter to={p.to} suffix={p.suffix} delay={Math.round(rollDelay * 1000)} duration={1600} />
                    </span>
                  )}
                  {p.kind === "text" && <span className="cf-num cf-num--t">{p.text}</span>}
                </div>
                <div className="cf-txt">
                  {p.kind === "pending" && <span className="cf-k"><Pending>{p.name}</Pending></span>}
                  <p className="cf-d">{s.label}</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {slide.body && (
        <p className="cf-foot"><i className="cf-fn" aria-hidden="true" /><span className="rv cf-foot__t">{slide.body}</span></p>
      )}
      {showDraft && anyPending && <span className="cf-legend legend">cifras preliminares, por validar</span>}
    </article>
  );
}
