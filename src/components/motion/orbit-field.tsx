"use client";

import type { CSSProperties } from "react";
import { DEFAULT_POSE, OC, POSES, crescentPath, polar, trailPath } from "./orbit-geometry.ts";

/** The persistent C3 orbit system. Lives between each slide's background and foreground; poses glide between slides. */
export function OrbitField({ slideId, isStatic = false }: { slideId: string; isStatic?: boolean }) {
  const pose = POSES[slideId] ?? DEFAULT_POSE;
  const style = {
    "--lx": pose.land.x, "--ly": pose.land.y, "--ld": pose.land.d, "--lo": pose.land.o,
    "--px": pose.port.x, "--py": pose.port.y, "--pd": pose.port.d, "--po": pose.port.o,
  } as CSSProperties;
  return (
    <div className={`oc${isStatic ? " oc--static" : ""}`} data-acc={pose.acc} style={style} aria-hidden="true">
      <div className="oc__sys"><OrbitSymbol /></div>
    </div>
  );
}

/** The symbol's geometry as a living figure. Reusable by scenes that stage their own orbital compositions. */
export function OrbitSymbol({ nodes = true }: { nodes?: boolean }) {
  const blue = polar(OC.rOrbit, -OC.nodeAngle);
  const purple = polar(OC.rOrbit, OC.nodeAngle);
  return (
    <svg viewBox="0 0 400 400" role="presentation">
      <circle className="oc-orbit-line" cx={OC.c} cy={OC.c} r={OC.rOrbit} />
      <g className="oc-turn oc-turn--rev"><circle className="oc-orbit" cx={OC.c} cy={OC.c} r={OC.rOrbit} /></g>
      <g className="oc-turn">
        <path className="oc-ring" d={crescentPath(OC.rOut)} />
        <path className="oc-ring oc-ring--in" d={crescentPath(OC.rIn)} />
        <path className="oc-trail oc-trail--1" d={trailPath(-OC.nodeAngle, 62)} stroke="var(--compite-l)" />
        <path className="oc-trail oc-trail--3" d={trailPath(OC.nodeAngle, 62)} stroke="var(--conecta-l)" />
        <line className="oc-link" x1={OC.c} y1={OC.c} x2={blue.x} y2={blue.y} />
        <line className="oc-link" x1={OC.c} y1={OC.c} x2={purple.x} y2={purple.y} />
        <line className="oc-link" x1={blue.x} y1={blue.y} x2={purple.x} y2={purple.y} />
        {nodes && (
          <>
            <g><circle className="oc-halo" cx={blue.x} cy={blue.y} r={OC.halo} /><circle className="oc-node oc-n1" cx={blue.x} cy={blue.y} r={OC.node} /></g>
            <g><circle className="oc-halo" cx={purple.x} cy={purple.y} r={OC.halo} /><circle className="oc-node oc-n3" cx={purple.x} cy={purple.y} r={OC.node} /></g>
          </>
        )}
      </g>
      {nodes && (
        <>
          <circle className="oc-pulse" cx={OC.c} cy={OC.c} r={OC.node} />
          <circle className="oc-pulse" cx={OC.c} cy={OC.c} r={OC.node} />
          <circle className="oc-node oc-n2" cx={OC.c} cy={OC.c} r={OC.node} />
        </>
      )}
    </svg>
  );
}
