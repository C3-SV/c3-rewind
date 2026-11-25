"use client";

import "./copa-col-kit.css";
import type { CSSProperties } from "react";
import { Counter, Icon, Pending, type IconName } from "../primitives.tsx";
import { useScene, visibleStatus } from "../scene-context.tsx";
import type { ContentBlock } from "../../../content/schema.ts";

/* Private helpers shared by the two Copa scenes (copa-col, copa-uni). */

export const isBracket = (s: string) => /^\s*\[.*\]\s*$/.test(s);

/** Does this recipient support the Copa (or the given edition of it)? Event ids are free-form in recipients.json. */
export function supportsCopa(events: string[] | undefined, which: "col" | "uni"): boolean {
  return (events ?? []).some((raw) => {
    const e = raw.toLowerCase();
    if (!e.startsWith("copa")) return false;
    const isCol = /col/.test(e), isUni = /uni/.test(e);
    if (isCol === isUni) return true;
    return which === "col" ? isCol : isUni;
  });
}

/** Greedy headline break: keeps lines under `max` characters. */
export function breakTitle(title: string, max: number): string[] {
  const out: string[] = [];
  let cur = "";
  for (const w of title.split(/\s+/)) {
    if (cur && (cur + " " + w).length > max) { out.push(cur); cur = w; } else cur = cur ? `${cur} ${w}` : w;
  }
  if (cur) out.push(cur);
  return out;
}

const CHECK = "M6 12.6l4 4L18.2 8";

/** Kinetic headline: masked lines, the last line rises letter by letter and is "accepted" by a node with a check. */
export function CopaTitle({ title, max = 13, delay = 0.45, acDelay = 2, className = "" }: { title: string; max?: number; delay?: number; acDelay?: number; className?: string }) {
  const lines = breakTitle(title, max);
  const last = lines[lines.length - 1];
  const head = lines.slice(0, -1);
  return (
    <h1 className={`ck-title ${className}`} aria-label={title}>
      {head.map((l, i) => (
        <span className="ln" aria-hidden="true" key={i}><span style={{ "--d": `${(delay + i * 0.14).toFixed(2)}s` } as CSSProperties}>{l}</span></span>
      ))}
      <span className="ck-lastrow" aria-hidden="true">
        <span className="ln ck-last">
          <span className="ck-chars" style={{ "--d": `${(delay + head.length * 0.14).toFixed(2)}s` } as CSSProperties}>
            {Array.from(last).map((c, i) => <span className="ck-ch" key={i} style={{ "--ci": i } as CSSProperties}>{c === " " ? " " : c}</span>)}
          </span>
        </span>
        <span className="ck-ac" style={{ "--d": `${acDelay}s` } as CSSProperties}>
          <svg viewBox="0 0 24 24"><path className="draw" pathLength={1} d={CHECK} style={{ "--d": `${acDelay + 0.35}s` } as CSSProperties} /></svg>
        </span>
      </span>
    </h1>
  );
}

/** A drawn verdict tick (pathLength 1, used with .draw). */
export function Tick({ delay = 0 }: { delay?: number }) {
  return <svg className="ck-tick" viewBox="0 0 24 24" aria-hidden="true"><path className="draw" pathLength={1} d={CHECK} style={{ "--d": `${delay.toFixed(2)}s` } as CSSProperties} /></svg>;
}

type StatBlock = Extract<ContentBlock, { type: "stat" }>;
const STAT_ICON: Record<string, IconName> = { estudiantes: "users", equipos: "team", colegios: "school", universidades: "school" };

/** Stats from slide.blocks. Pending values are quiet and only exist in review builds. */
export function CopaStats({ delay = 3, className = "" }: { delay?: number; className?: string }) {
  const { slide, showDraft } = useScene();
  const stats = slide.blocks.filter((b): b is StatBlock => b.type === "stat" && visibleStatus(b.status, showDraft));
  if (!stats.length) return null;
  return (
    <ul className={`ck-stats ${className}`}>
      {stats.map((s, i) => {
        const v = s.value.trim();
        const num = /^\d+$/.test(v) ? Number(v) : null;
        const d = delay + i * 0.18;
        const pend = num === null && isBracket(v);
        return (
          <li className="ck-stat rv" key={s.label} style={{ "--d": `${d.toFixed(2)}s` } as CSSProperties}>
            <b className={`ck-n${pend ? " is-pend" : ""}${num !== null && s.status !== "approved" ? " pv" : ""}`}>
              {num !== null ? <Counter to={num} delay={d * 1000 + 250} /> : pend ? <Pending>N</Pending> : v}
            </b>
            <span className="ck-l"><Icon name={STAT_ICON[s.label.toLowerCase()] ?? "users"} />{s.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
