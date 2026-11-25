"use client";

import { useId, useState, type CSSProperties, type ReactNode } from "react";
import { Icon, Lines, LineChip, Pending, Photo, type Tone } from "../primitives.tsx";
import { useScene } from "../scene-context.tsx";
import "./conecta.css";

/* ------------------------------------------------------------------ *
 * CONECTA — "Llevamos C3 a más espacios."
 * A connection graph: the C3 mark is the hub, a ring of terminals sits
 * around it and six photo frames hang off it by drawn connectors. Talleres
 * use solid lines, Ecosistema dotted ones. Landscape coordinates are in em,
 * local to .cn-graph (which starts at stage x = 38em). Portrait re-composes
 * the same spots as a zig-zag along a spine (pure CSS grid).
 * ------------------------------------------------------------------ */

type Shape = "rect" | "circle" | "arch";
type Spot = {
  k: string; g: "t" | "e"; slot: string; tone: Tone; label: string; shape: Shape;
  x: number; y: number; w: number; h: number; // frame box, em, graph-local
  bx: number; by: number;                     // bite / node position, % of the frame box
  cap: "below" | "right" | "left";
  name: ReactNode; plain: string; sub: ReactNode; subPlain: string;
  d: number;                                  // reveal delay, s
};

const GW = 62, GH = 56.25;           // graph box (em)
const N = { x: 32, y: 28.5 };         // hub centre
const RING = 7.6;                     // terminal ring radius
const HUB_R = 5.1;                    // C mark outer radius

const SPOTS: Spot[] = [
  { k: "t1", g: "t", slot: "taller1", tone: "conecta", label: "Software Week", shape: "rect", x: 2.5, y: 9.4, w: 15.5, h: 10.2, bx: 100, by: 100, cap: "below", name: "Software Week", plain: "Software Week", sub: <Pending>actividad</Pending>, subPlain: "", d: 0.95 },
  { k: "t2", g: "t", slot: "taller2", tone: "conecta", label: "Instituto nacional", shape: "circle", x: 21.4, y: 6.2, w: 8.8, h: 8.8, bx: 85.4, by: 85.4, cap: "right", name: <Pending>Instituto nacional</Pending>, plain: "Instituto nacional", sub: "Emprendimientos digitales", subPlain: "Emprendimientos digitales", d: 1.4 },
  { k: "t3", g: "t", slot: "taller3", tone: "conecta", label: "Instituto Retos", shape: "rect", x: 45.2, y: 7.4, w: 13.2, h: 8.8, bx: 0, by: 100, cap: "below", name: "Instituto Retos", plain: "Instituto Retos", sub: "Software y Mecatrónica", subPlain: "Software y Mecatrónica", d: 1.85 },
  { k: "e1", g: "e", slot: "comu1", tone: "crea", label: "Ciberseguridad", shape: "arch", x: 2.5, y: 26.6, w: 9, h: 12.6, bx: 100, by: 52, cap: "below", name: "Ciberseguridad", plain: "Ciberseguridad", sub: "Taller con David Díaz", subPlain: "Taller con David Díaz", d: 2.5 },
  { k: "e2", g: "e", slot: "comu2", tone: "compite", label: "PyloCTF", shape: "circle", x: 17.4, y: 42.2, w: 8, h: 8, bx: 82, by: 18, cap: "right", name: "PyloCTF", plain: "PyloCTF", sub: "Cobertura de C3", subPlain: "Cobertura de C3", d: 2.95 },
  { k: "e3", g: "e", slot: "comu3", tone: "conecta", label: "Hacklatam 2026", shape: "rect", x: 46.6, y: 36.2, w: 13.4, h: 9.2, bx: 0, by: 0, cap: "below", name: "Hacklatam 2026", plain: "Hacklatam 2026", sub: "Presencia de C3", subPlain: "Presencia de C3", d: 3.4 },
];

const rad = (deg: number) => (deg * Math.PI) / 180;
const f2 = (n: number) => +n.toFixed(2);

function geometry(s: Spot) {
  const F = { x: s.x + (s.w * s.bx) / 100, y: s.y + (s.h * s.by) / 100 };
  const a = Math.atan2(F.y - N.y, F.x - N.x);
  const P = { x: N.x + RING * Math.cos(a), y: N.y + RING * Math.sin(a) };
  const dx = F.x - P.x, dy = F.y - P.y, dist = Math.hypot(dx, dy);
  const mx = (P.x + F.x) / 2 - (dy / dist) * dist * 0.17, my = (P.y + F.y) / 2 + (dx / dist) * dist * 0.17;
  return { F, P, d: `M${f2(P.x)} ${f2(P.y)}Q${f2(mx)} ${f2(my)} ${f2(F.x)} ${f2(F.y)}` };
}

/* The C3 isotipo, redrawn at hub scale (proportions from the official mark). */
const pol = (r: number, deg: number) => ({ x: f2(200 + r * Math.cos(rad(deg))), y: f2(200 + r * Math.sin(rad(deg))) });
const ANN = "M200 25A175 175 0 1 0 200 375A175 175 0 1 0 200 25ZM200 112A88 88 0 1 1 200 288A88 88 0 1 1 200 112Z";
function Hub({ uid }: { uid: string }) {
  const bl = pol(134, -28), pu = pol(134, 28);
  const w1 = pol(300, -12), w2 = pol(300, 12);
  return (
    <svg className="cn-hub wipe-c" style={{ "--d": ".25s" } as CSSProperties} viewBox="0 0 400 400" aria-hidden="true" focusable="false">
      <defs>
        <mask id={uid}>
          <rect width="400" height="400" fill="#fff" />
          <circle cx={bl.x} cy={bl.y} r="58" fill="#000" />
          <circle cx={pu.x} cy={pu.y} r="58" fill="#000" />
          <path d={`M200 200L${w1.x} ${w1.y}L${w2.x} ${w2.y}Z`} fill="#000" />
        </mask>
      </defs>
      <circle className="cn-pulse" cx={pu.x} cy={pu.y} r="46" />
      <circle className="cn-pulse cn-pulse--2" cx={pu.x} cy={pu.y} r="46" />
      <path d={ANN} fill="#f4f9ff" fillRule="evenodd" mask={`url(#${uid})`} />
      <circle cx="200" cy="200" r="44" fill="var(--crea)" />
      <circle cx={bl.x} cy={bl.y} r="41" fill="var(--compite)" />
      <circle className="cn-core" cx={pu.x} cy={pu.y} r="45" fill="var(--conecta)" />
    </svg>
  );
}

function Spot({ s, idx, st, setHot }: { s: Spot; idx: number; st: string | undefined; setHot: (k: string | null) => void }) {
  return (
    <figure
      className={`cn-sp cn-sp--${s.shape} cn-sp--${s.g} cn-cap--${s.cap}`}
      data-k={s.k}
      data-st={st}
      data-row={idx}
      tabIndex={0}
      aria-label={`${s.plain}${s.subPlain ? `, ${s.subPlain}` : ""}. ${s.g === "t" ? "Taller" : "Ecosistema"}.`}
      style={{ "--x": s.x, "--y": s.y, "--w": s.w, "--h": s.h, "--bx": `${s.bx}%`, "--by": `${s.by}%`, "--d": `${s.d}s`, "--bob": `${6.5 + (idx % 3) * 1.3}s` } as CSSProperties}
      onPointerEnter={() => setHot(s.k)}
      onPointerLeave={() => setHot(null)}
      onFocus={() => setHot(s.k)}
      onBlur={() => setHot(null)}
    >
      <div className="cn-frw">
        <div className="cn-fr bite">
          <Photo slot={s.slot} label={s.label} tone={s.tone} circle={s.shape === "circle"} small={s.w < 14} />
        </div>
        <span className="cn-nd" aria-hidden="true" />
      </div>
      <figcaption className="cn-cap">
        <b className="cn-nm">{s.name}</b>
        <span className="cn-sb">{s.sub}</span>
      </figcaption>
    </figure>
  );
}

export function ConectaScene() {
  const { slide, showDraft, recipient } = useScene();
  const uid = useId().replace(/[^a-z0-9]/gi, "");
  const [hot, setHot] = useState<string | null>(null);
  const st = (k: string) => (hot === null ? undefined : hot === k ? "on" : "off");
  const [lead, tail] = slide.body ? slide.body.split(/\s+Porque\s+/i) : ["", ""];
  const punch = tail ? tail.charAt(0).toUpperCase() + tail.slice(1) : "El talento crece cuando las comunidades se encuentran.";
  const showAllies = showDraft && !recipient;
  const geo = SPOTS.map((s) => ({ s, ...geometry(s) }));

  return (
    <article className="story-scene sc-conecta cn" data-slide-id={slide.id} aria-label={slide.title}>
      <header className="cn-head">
        <div className="rv" style={{ "--d": ".2s" } as CSSProperties}><LineChip line="conecta">Conecta</LineChip></div>
        <h1 className="cn-h"><Lines lines={["Llevamos C3", "a más", "espacios."]} delay={0.35} step={0.16} /></h1>
        {lead && <p className="cn-lead rv" style={{ "--d": "1.1s" } as CSSProperties}>{lead}</p>}
        <p className="cn-tag rv" style={{ "--d": "1.35s" } as CSSProperties}>{punch}</p>
      </header>

      {showAllies && (
        <aside className="cn-ally rv" style={{ "--d": "4.3s" } as CSSProperties} aria-label="Aliados">
          <p className="cn-ally__k"><Icon name="heart" />Aliados</p>
          <div className="cn-ally__g">{[0, 1, 2, 3, 4, 5].map((i) => <span key={i}><Pending>logo aliado</Pending></span>)}</div>
        </aside>
      )}

      <div className="cn-graph" data-hot={hot ?? ""}>
        {/* landscape: ghost rings, ring terminals and connectors */}
        <svg className="cn-svg" viewBox={`0 0 ${GW} ${GH}`} aria-hidden="true" focusable="false">
          <defs>
            {geo.filter(({ s }) => s.g === "e").map(({ s, d }) => (
              <mask key={s.k} id={`${uid}-${s.k}`} maskUnits="userSpaceOnUse" x="0" y="0" width={GW} height={GH}>
                <path d={d} fill="none" stroke="#fff" strokeWidth="1.2" pathLength={1} className="draw" style={{ "--d": `${s.d}s` } as CSSProperties} />
              </mask>
            ))}
          </defs>
          <g className="cn-ghost">
            {[13.5, 21, 29].map((r) => <circle key={r} cx={N.x} cy={N.y} r={r} />)}
          </g>
          <g className="cn-ripples">
            {[0, 1, 2].map((i) => <circle key={i} className="cn-rip" style={{ animationDelay: `${2.2 + i * 3}s` }} cx={N.x} cy={N.y} r={RING} />)}
          </g>
          <circle className="cn-ring draw" pathLength={1} style={{ "--d": ".5s" } as CSSProperties} cx={N.x} cy={N.y} r={RING} />
          <circle className="cn-orbit" cx={N.x} cy={N.y} r={RING + 1.3} />
          {geo.map(({ s, d, P }) =>
            s.g === "t" ? (
              <path key={s.k} className="cn-lk cn-lk--t draw" data-k={s.k} data-st={st(s.k)} d={d} pathLength={1} style={{ "--d": `${s.d}s` } as CSSProperties} />
            ) : (
              <path key={s.k} className="cn-lk cn-lk--e" data-k={s.k} data-st={st(s.k)} d={d} mask={`url(#${uid}-${s.k})`} style={{ "--d": `${s.d}s` } as CSSProperties} />
            ),
          )}
          {geo.map(({ s, P }) => (
            <circle key={s.k} className={`cn-pd cn-pd--${s.g}`} data-k={s.k} data-st={st(s.k)} cx={f2(P.x)} cy={f2(P.y)} r=".36" style={{ "--d": `${s.d}s` } as CSSProperties} />
          ))}
        </svg>

        <Hub uid={`${uid}m`} />

        <svg className="cn-curve" viewBox="0 0 11 5.5" aria-hidden="true" focusable="false">
          <path className="draw" pathLength={1} style={{ "--d": ".9s" } as CSSProperties} d="M11 0C11 3.2 0 2.3 0 5.5" />
        </svg>

        <div className="cn-spots">
          <span className="cn-spine" aria-hidden="true" />
          <p className="cn-grp cn-grp--t rv" style={{ "--d": ".8s" } as CSSProperties}><i aria-hidden="true" /><Icon name="school" />Talleres</p>
          {SPOTS.slice(0, 3).map((s, idx) => <Spot key={s.k} s={s} idx={idx} st={st(s.k)} setHot={setHot} />)}
          <p className="cn-grp cn-grp--e rv" style={{ "--d": "2.3s" } as CSSProperties}><i aria-hidden="true" /><Icon name="globe" />Ecosistema</p>
          {SPOTS.slice(3).map((s, idx) => <Spot key={s.k} s={s} idx={idx + 3} st={st(s.k)} setHot={setHot} />)}
        </div>
      </div>
    </article>
  );
}
