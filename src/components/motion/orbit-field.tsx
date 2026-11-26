"use client";

import type { CSSProperties } from "react";
import { DEFAULT_POSE, OC, POSES, polar } from "./orbit-geometry.ts";

/** The persistent C3 orbit system. Lives between each slide's background and foreground; poses glide between slides. */
export function OrbitField({ slideId, isStatic = false }: { slideId: string; isStatic?: boolean }) {
  const pose = POSES[slideId] ?? DEFAULT_POSE;
  const style = {
    "--lx": pose.land.x, "--ly": pose.land.y, "--ld": pose.land.d, "--lo": pose.land.o,
    "--px": pose.port.x, "--py": pose.port.y, "--pd": pose.port.d, "--po": pose.port.o,
  } as CSSProperties;
  return (
    <div className={`oc${isStatic ? " oc--static" : ""}`} data-acc={pose.acc} data-slide={slideId} style={style} aria-hidden="true">
      <div className="oc__sys"><OrbitSymbol logo={pose.logo} /></div>
    </div>
  );
}

/* One dot per level. Each rides its own ring, at its own speed and direction; `start` is where it sits at t=0 (degrees, 0 = right). */
const DOTS = [
  { cls: "oc-n1", orb: "oc-orb--1", r: OC.rCompite, start: -110 }, // Compite: inner level, clockwise
  { cls: "oc-n2", orb: "oc-orb--2", r: OC.rCrea, start: 160 },     // Crea: middle level, counter-clockwise
  { cls: "oc-n3", orb: "oc-orb--3", r: OC.rConecta, start: 55 },   // Conecta: outer level, clockwise, fastest
] as const;

/** The symbol as a living figure: concentric thin rings, one dot per ring, a teal core (or the C3 isotipo when `logo`). Reusable by scenes. */
export function OrbitSymbol({ nodes = true, logo = false }: { nodes?: boolean; logo?: boolean }) {
  return (
    <svg viewBox="0 0 400 400" role="presentation">
      <circle className="oc-track oc-track--1" cx={OC.c} cy={OC.c} r={OC.rCompite} />
      <circle className="oc-track oc-track--2" cx={OC.c} cy={OC.c} r={OC.rCrea} />
      <circle className="oc-track oc-track--3" cx={OC.c} cy={OC.c} r={OC.rConecta} />
      {nodes && DOTS.map(({ cls, orb, r, start }) => {
        const p = polar(r, start);
        return (
          <g key={cls} className={`oc-turn ${orb}`}>
            <circle className="oc-halo" cx={p.x} cy={p.y} r={OC.halo} />
            <circle className={`oc-node ${cls}`} cx={p.x} cy={p.y} r={OC.node} />
          </g>
        );
      })}
      {/* the core is drawn under the isotipo, so the isotipo hides it wherever the logo is shown */}
      {nodes && <circle className="oc-node oc-core" cx={OC.c} cy={OC.c} r={OC.core} />}
      {logo && (
        <>
          {/* the isotipo's square ground is cut to a disc, so it sits in the field like a halo */}
          <defs><clipPath id="oc-logo-clip"><circle cx={OC.c} cy={OC.c} r={OC.logo / 2} /></clipPath></defs>
          <image className="oc-logo" href="/brand/iso.png" x={OC.c - OC.logo / 2} y={OC.c - OC.logo / 2} width={OC.logo} height={OC.logo} clipPath="url(#oc-logo-clip)" />
        </>
      )}
    </svg>
  );
}
