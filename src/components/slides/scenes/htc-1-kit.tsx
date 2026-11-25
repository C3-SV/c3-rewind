"use client";

import type { CSSProperties } from "react";
import "./htc-1-kit.css";
import { Ribbon, monogram } from "../primitives.tsx";
import { useScene } from "../scene-context.tsx";

/** Renders copy that may carry editorial placeholders like "[NOMBRE]": placeholders become quiet dashed spans. */
export function Brackets({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\])/g).filter(Boolean);
  return (
    <>
      {parts.map((part, index) => (/^\[[^\]]+\]$/.test(part)
        ? <span className="pend" key={index}>{part}</span>
        : <span key={index}>{part}</span>))}
    </>
  );
}

/** Recipient ribbon, only for companies that supported the hackathon. */
export function HtcRibbon({ delay = 4.8 }: { delay?: number }) {
  const { recipient } = useScene();
  if (!recipient || !recipient.supportedEvents.some((event) => /htc|hackathon|turismo/i.test(event))) return null;
  return (
    <div className="hx-ribbon rv" style={{ "--d": `${delay}s` } as CSSProperties}>
      <Ribbon name={recipient.commercialName} mono={monogram(recipient.commercialName)} />
    </div>
  );
}

/**
 * The HTC route: a hairline path that draws itself while an orange node travels it.
 * Coordinates are in em (1 unit = 1em of the scene), so it scales with the stage.
 * Two stacked svgs: the route sits under the clock/medal, the node rides above everything.
 */
export function Route({ vb, d, start, className = "", style }: { vb: string; d: string; start: [number, number]; className?: string; style?: CSSProperties }) {
  return (
    <>
      <svg className={`hx-svg hx-svg--route ${className}`} viewBox={vb} preserveAspectRatio="xMinYMin meet" aria-hidden="true" focusable="false" style={style}>
        <path className="hx-ghost" d={d} />
        <path className="hx-line" d={d} pathLength={1} />
        <circle className="hx-dot" cx={start[0]} cy={start[1]} r={0.5} />
      </svg>
      <svg className={`hx-svg hx-svg--node ${className}`} viewBox={vb} preserveAspectRatio="xMinYMin meet" aria-hidden="true" focusable="false" style={style}>
        <g className="hx-ride" style={{ offsetPath: `path("${d}")` }}>
          <circle className="hx-ping" r={1} />
          <circle className="hx-node" r={1} />
        </g>
      </svg>
    </>
  );
}
