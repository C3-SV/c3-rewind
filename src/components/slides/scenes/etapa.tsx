"use client";

import "./etapa.css";
import { useEffect, useRef, type CSSProperties } from "react";
import { OC, crescentPath, polar } from "../../motion/orbit-geometry.ts";
import { Icon, Lines } from "../primitives.tsx";
import { useScene } from "../scene-context.tsx";

type LineKey = "compite" | "crea" | "conecta";
const LINES: Array<{ key: LineKey; name: string; def: string; to: string; t0: number; lift: number }> = [
  { key: "compite", name: "Compite", def: "Desarrollar excelencia técnica mediante retos y competencia.", to: "copa-col", t0: 1.5, lift: 5 },
  { key: "crea", name: "Crea", def: "Convertir conocimiento en proyectos reales.", to: "htc-1", t0: 1.64, lift: 3 },
  { key: "conecta", name: "Conecta", def: "Acercar el talento a comunidades y oportunidades.", to: "conecta", t0: 1.78, lift: -4 },
];
const DUR = 1.75; // seconds a node takes to travel from the symbol to its column
const TRAIL = [4, 3, 2, 1, 0]; // painted tail first so the head sits on top

/** The symbol before it splits: same geometry as the orbit field (crescent r175/r85, orbit r150, nodes at ±27°, Crea at the centre). */
function Symbol() {
  const blue = polar(OC.rOrbit, -OC.nodeAngle);
  const purple = polar(OC.rOrbit, OC.nodeAngle);
  return (
    <svg viewBox="0 0 400 400" overflow="visible" role="presentation" focusable="false">
      <circle className="et-oline" cx={OC.c} cy={OC.c} r={OC.rOrbit} />
      <g className="et-turn et-turn--rev"><circle className="et-odots" cx={OC.c} cy={OC.c} r={OC.rOrbit} /></g>
      <g className="et-turn">
        <path className="et-ring" d={crescentPath(OC.rOut)} />
        <path className="et-ring et-ring--in" d={crescentPath(OC.rIn)} />
      </g>
      {/* nodes ride the same angle as the global field when this slide became active (--rot), and leave one by one */}
      <g className="et-nodes">
        <g className="et-sn" style={{ "--t0": `${LINES[0].t0}s` } as CSSProperties}><circle className="et-halo" cx={blue.x} cy={blue.y} r={OC.halo} /><circle data-sn="0" className="et-sn-c et-sn-c--compite" cx={blue.x} cy={blue.y} r={OC.node} /></g>
        <g className="et-sn" style={{ "--t0": `${LINES[2].t0}s` } as CSSProperties}><circle className="et-halo" cx={purple.x} cy={purple.y} r={OC.halo} /><circle data-sn="2" className="et-sn-c et-sn-c--conecta" cx={purple.x} cy={purple.y} r={OC.node} /></g>
      </g>
      <g className="et-sn et-sn--c" style={{ "--t0": `${LINES[1].t0}s` } as CSSProperties}><circle data-sn="1" className="et-sn-c et-sn-c--crea" cx={OC.c} cy={OC.c} r={OC.node} /></g>
    </svg>
  );
}

export function EtapaScene() {
  const { slide, jump, active, staticMode } = useScene();
  const root = useRef<HTMLElement>(null);

  const m = slide.title.match(/^(.*? una)\s+(.*)$/);
  const titleLines = m ? [m[1], m[2]] : [slide.title];
  const sentences = (slide.body ?? "").split(/(?<=\.)\s+/);
  const intro = (slide.body ?? "").split(":")[0].trim().replace(/\.?$/, ".") || "Este año ordenamos todo lo que hacemos en tres líneas.";
  const outro = sentences.length > 1 ? sentences[sentences.length - 1] : "Este es nuestro 2026, línea por línea.";

  /* Flight plans: measure where each symbol node is and where its column's node lands, in px relative to this scene.
     Re-runs on resize so the hand-off between the travelling node and the column node is always exact. */
  const measure = useRef<() => void>(() => {});
  useEffect(() => {
    const el = root.current;
    if (!el || staticMode) return;
    measure.current = () => {
      const base = el.getBoundingClientRect();
      LINES.forEach((_, i) => {
        const a = el.querySelector<SVGGraphicsElement>(`[data-sn="${i}"]`)?.getBoundingClientRect();
        const b = el.querySelector<HTMLElement>(`[data-en="${i}"]`)?.getBoundingClientRect();
        const fly = el.querySelector<HTMLElement>(`[data-fly="${i}"]`);
        if (!a || !b || !fly || !a.width || !b.width) return;
        const set = (k: string, v: string) => fly.style.setProperty(k, v);
        set("--x0", `${a.left + a.width / 2 - base.left}px`); set("--y0", `${a.top + a.height / 2 - base.top}px`);
        set("--x1", `${b.left + b.width / 2 - base.left}px`); set("--y1", `${b.top + b.height / 2 - base.top}px`);
        set("--dia", `${a.width}px`); set("--k", `${b.width / a.width}`);
      });
    };
    measure.current();
    const ro = new ResizeObserver(() => measure.current());
    ro.observe(el);
    return () => ro.disconnect();
  }, [staticMode]);

  /* continuity: pick up the rotation of the global orbit field the moment this slide becomes active */
  useEffect(() => {
    const el = root.current;
    if (!el || !active || staticMode) return;
    const turn = el.closest(".experience-stage")?.querySelector<SVGGElement>(".oc .oc-turn:not(.oc-turn--rev)");
    let deg = 0;
    if (turn) {
      const t = getComputedStyle(turn).transform;
      const mm = t && t !== "none" ? t.match(/matrix\(([^)]+)\)/) : null;
      if (mm) { const [a, b] = mm[1].split(",").map(Number); deg = (Math.atan2(b, a) * 180) / Math.PI; }
    }
    el.style.setProperty("--rot", deg.toFixed(2));
    measure.current();
  }, [active, staticMode]);

  return (
    <article ref={root} className="story-scene sc-etapa" data-slide-id={slide.id} aria-label={slide.title}>
      <div className="et-sym" aria-hidden="true"><Symbol /></div>

      <header className="et-head">
        <h1 className="et-title">
          <Lines lines={[titleLines[0], titleLines[1] ? <span className="hl">{titleLines[1]}</span> : null].filter(Boolean)} delay={0.25} step={0.14} />
        </h1>
        <p className="et-intro rv" style={{ "--d": ".95s" } as CSSProperties}>{intro}</p>
      </header>

      <div className="et-tail"><p className="et-outro rv" style={{ "--d": "4.5s" } as CSSProperties}><i className="et-outro__tick" aria-hidden="true" />{outro}</p></div>

      <nav className="et-cols" aria-label="Las tres líneas de C3">
        {LINES.map((l, i) => {
          const arrive = l.t0 + DUR;
          return (
            <button key={l.key} type="button" className={`et-col et-col--${l.key}`} onClick={() => jump(l.to)}
              style={{ "--arr": `${arrive.toFixed(2)}s`, "--i": i } as CSSProperties}>
              <span className="et-id" aria-hidden="true">
                <i className="et-ringc" />
                <i className="et-en" data-en={i}><img src={`/brand/${l.key}.png`} alt="" draggable={false} /></i>
              </span>
              <span className="et-name"><span className="ln"><span style={{ "--d": `${(arrive + 0.05).toFixed(2)}s` } as CSSProperties}>{l.name}</span></span></span>
              <span className="et-def rv" style={{ "--d": `${(arrive + 0.35).toFixed(2)}s` } as CSSProperties}>{l.def}</span>
              <span className="et-go rv" style={{ "--d": `${(arrive + 0.65).toFixed(2)}s` } as CSSProperties}>Ver {l.name} <Icon name="arrow" /></span>
            </button>
          );
        })}
      </nav>

      {/* travelling nodes: head + comet trail, one per line */}
      <div className="et-flights" aria-hidden="true">
        {LINES.map((l, i) => (
          <span key={l.key} className={`et-fly et-fly--${l.key}`} data-fly={i} style={{ "--t0": `${l.t0}s`, "--dur": `${DUR}s`, "--lift": l.lift } as CSSProperties}>
            {TRAIL.map((j) => (
              <span className="et-fx" key={j} style={{ "--j": j } as CSSProperties}><span className="et-fy"><i className="et-fd" /></span></span>
            ))}
          </span>
        ))}
      </div>
    </article>
  );
}
