"use client";

import "./dos7.css";
import type { CSSProperties, ReactNode } from "react";
import { Icon, Lines, type IconName } from "../primitives.tsx";
import { useScene, visibleStatus } from "../scene-context.tsx";

type LineKey = "compite" | "crea" | "conecta";
type Initiative = {
  key: string;
  line: LineKey;
  main: string;
  tag?: string;
  numeral?: string;
  soon: boolean;
  blurb?: string;
  full: string;
  icon: IconName;
};

const LINE_LABEL: Record<LineKey, string> = { compite: "Compite", crea: "Crea", conecta: "Conecta" };
const LINE_ORDER: Record<LineKey, number> = { crea: 0, compite: 1, conecta: 2 };
const SOON_ICONS: IconName[] = ["brief", "users"];

/** "Nueva edición del X" -> tag + X; trailing roman numeral -> its own glyph. Never invents a name. */
function describe(title: string, body: string, status: string, index: number, soonIndex: number): Initiative {
  const lower = body.trim().toLowerCase();
  const line: LineKey = lower === "compite" ? "compite" : lower === "crea" ? "crea" : "conecta";
  const soon = status === "pending";
  let main = title.trim();
  let tag: string | undefined;
  let numeral: string | undefined;
  const edition = main.match(/^nueva edici[oó]n del\s+(.+)$/i);
  if (edition) { tag = "Nueva edición"; main = edition[1]; }
  const roman = main.match(/^(.*\S)\s+(III|IV|II|V|I)$/);
  if (roman) { main = roman[1]; numeral = roman[2]; }
  const icon: IconName = line === "crea" ? "bulb" : line === "compite" ? "trophy" : SOON_ICONS[soonIndex % SOON_ICONS.length];
  return { key: `${index}-${title}`, line, main, tag, numeral, soon, blurb: soon || line === "conecta" ? body : undefined, full: title, icon };
}

/* ---------- split-flap digit ---------- */
function Half({ d, side, className = "" }: { d: string; side: "t" | "b"; className?: string }) {
  return <span className={`sf-h sf-${side} ${className}`}><i>{d}</i></span>;
}
function StaticCard({ d, i }: { d: string; i: number }) {
  return (
    <span className="sf" style={{ "--i": i } as CSSProperties}>
      <Half d={d} side="t" /><Half d={d} side="b" />
      <span className="sf-hinge" />
    </span>
  );
}
/** Mechanical flip: old top folds away, new bottom drops in. Final DOM state = the new digit. */
function FlipCard({ from, to, i }: { from: string; to: string; i: number }) {
  return (
    <span className="sf sf--flip" style={{ "--i": i } as CSSProperties}>
      <span className="sf-glow" />
      <Half d={to} side="t" className="sf-new" />
      <Half d={to} side="b" className="sf-new" />
      <Half d={from} side="b" className="sf-old" />
      <Half d={from} side="t" className="sf-fl1" />
      <Half d={to} side="b" className="sf-fl2" />
      <span className="sf-hinge" />
      <span className="sf-ring" /><span className="sf-ring sf-ring--2" />
    </span>
  );
}

export function Dos7Scene() {
  const { slide, edition, showDraft, recipient } = useScene();
  const m = slide.title.match(/^(\d{4})\s+(.*)$/);
  const year = m?.[1] ?? "2027";
  const rest = m?.[2] ?? slide.title;
  const words = rest.split(" ");
  const last = words.pop() ?? "";
  const first = words.join(" ");
  const prev = String(Number(year) - 1);

  let soonCount = 0;
  const initiatives = slide.blocks
    .flatMap((b, index) => (b.type === "initiative" && visibleStatus(b.status, showDraft) ? [{ b, index }] : []))
    .map(({ b, index }) => describe(b.title, b.body, b.status, index, b.status === "pending" ? soonCount++ : 0))
    .sort((a, b) => LINE_ORDER[a.line] - LINE_ORDER[b.line] || Number(a.soon) - Number(b.soon));

  const heading: ReactNode[] = first ? [first, <em key="l" className="d7-em">{last}</em>] : [<em key="l" className="d7-em">{last}</em>];

  return (
    <article className="story-scene sc-dos7" data-slide-id={slide.id} aria-label={slide.title}>
      <div className="d7-ghost" aria-hidden="true">{year}</div>

      <div className="d7-bd">
        <p className="kicker d7-kick rv-f" style={{ "--d": "2s" } as CSSProperties}>Lo que viene</p>
        <div className="d7-cards" role="img" aria-label={`De ${prev} a ${year}`}>
          {year.split("").map((d, i) => (i === year.length - 1
            ? <FlipCard key={i} from={prev[prev.length - 1]} to={d} i={i} />
            : <StaticCard key={i} d={d} i={i} />))}
          <span className="d7-scan" aria-hidden="true" />
        </div>
      </div>

      <h1 className="d7-h">
        <span className="sr-only">{year} </span>
        <Lines lines={heading} delay={2.15} step={0.18} />
      </h1>

      {initiatives.length > 0 ? (
        <ul className="d7-list" aria-label="Lo que viene en 2027">
          {initiatives.map((it, i) => (
            <li
              key={it.key}
              className={`d7-it d7-it--${it.line}${it.soon ? " d7-it--soon" : ""}`}
              style={{ "--i": i } as CSSProperties}
              aria-label={it.soon ? `${it.main}. ${it.blurb ?? ""}` : undefined}
            >
              <span className="d7-badge" aria-hidden="true">
                {it.numeral ? <b className="d7-num">{it.numeral}</b> : <Icon name={it.icon} />}
              </span>
              <div className="d7-txt">
                <p className="d7-line">{LINE_LABEL[it.line]}</p>
                <h3 className="d7-name">{it.main}{it.numeral && <span className="sr-only"> {it.numeral}</span>}</h3>
                {it.tag && <p className="d7-tag">{it.tag}</p>}
                {it.blurb && <p className="d7-blurb">{it.blurb}</p>}
                {it.soon && <span className="d7-sil" aria-hidden="true"><i /><i /></span>}
              </div>
            </li>
          ))}
        </ul>
      ) : slide.body ? (
        <p className="d7-body rv" style={{ "--d": "3s" } as CSSProperties}>{slide.body}</p>
      ) : null}
      {!recipient && edition === "2026" && <aside className="d7-invite"><strong>¿Creamos la próxima experiencia juntos?</strong><span>Estamos abiertos a nuevas ideas, retos, eventos y colaboraciones.</span></aside>}
    </article>
  );
}
