"use client";

import type { CSSProperties } from "react";
import "./htc-1-kit.css";
import "./htc-1.css";
import { Counter, Icon, Lines, LineChip, Pending, Photo } from "../primitives.tsx";
import { useFacts, useScene, visibleStatus } from "../scene-context.tsx";
import { HtcRibbon, Route } from "./htc-1-kit.tsx";

/* Route in em, 1 unit = 1em. Landscape: 100 × 56.25 (the stage). Portrait: 36.36 × 30 (the cluster). */
const D_LAND = "M 46 17.7 C 45 28.5, 49 35.6, 55 38 C 59 39.6, 61 43.2, 68 43.2 H 95";
const D_PORT = "M 1.6 26 C 7 29.6, 13 29.6, 18.2 21 C 22 27.4, 29 29.6, 34.8 26";
const TICKS = Array.from({ length: 36 }, (_, i) => i);
const delay = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

export function Htc1Scene() {
  const { slide, showDraft } = useScene();
  const facts = useFacts();
  const stats = slide.blocks.flatMap((block) => (block.type === "stat" && visibleStatus(block.status, showDraft) ? [block] : []));
  const hoursFact = facts.find((fact) => fact.icon === "clock" && /\d+/.test(fact.text));
  const hours = hoursFact ? Number(hoursFact.text.match(/\d+/)![0]) : 0;
  const shownFacts = hours ? facts.filter((fact) => fact !== hoursFact) : facts;
  const [line1, line2 = ""] = slide.title.split(/\s(?=a una )/);
  const accent = line2.replace(/\.$/, "").split(" ");
  const lastWord = accent.pop() ?? "";

  return (
    <article className="story-scene sc-htc-1" data-slide-id={slide.id} aria-label={slide.title}>
      <div className="h1-ghost" aria-hidden="true">HTC</div>

      <div className="h1-col">
        <div className="h1-eyebrow">
          <span className="rv" style={delay(0.2)}><LineChip line="crea">{slide.chapterLabel}</LineChip></span>
          <p className="ev-k k-htc rv" style={delay(0.35)}>Hackathon de Turismo Creativo · Vol. 1</p>
        </div>
        <h1 className="h1-title">
          {line2
            ? <Lines delay={0.4} step={0.16} lines={[line1, <>{accent.join(" ")} <em>{lastWord}</em>.</>]} />
            : <Lines delay={0.4} lines={[slide.title]} />}
        </h1>
        {shownFacts.length > 0 && (
          <ul className="h1-facts rv" style={delay(1.3)}>
            {shownFacts.map((fact) => <li key={fact.text}><Icon name={fact.icon} />{fact.text}</li>)}
          </ul>
        )}
        {slide.body && <p className="h1-body rv" style={delay(1.1)}>{slide.body}</p>}
        <div className="h1-spacer" aria-hidden="true" />
        {stats.length > 0 && (
          <div className="h1-counts rv-f" style={delay(3.2)} role="list">
            {stats.map((stat, index) => {
              const n = Number(stat.value);
              return (
                <div className="h1-count" role="listitem" key={stat.label} style={delay(3.3 + index * 0.18)}>
                  <b className="disp">{Number.isFinite(n) ? <Counter to={n} delay={3300 + index * 180} duration={1400} /> : <Pending>{stat.value}</Pending>}</b>
                  <span>{stat.label}</span>
                </div>
              );
            })}
          </div>
        )}
        <div className="h1-tail">
          <div className="h1-coorg rv" style={delay(4.6)}>
            <span>Coorganiza</span>
            <i title="Logo de Poliédrica por validar">Poliédrica</i>
          </div>
          <HtcRibbon delay={5} />
        </div>
      </div>

      <div className="h1-cluster">
        <figure className="h1-pn h1-pn--2 bite" aria-label="02 · Equipo">
          <Photo slot="htc2" label="equipos trabajando" tone="htc" clean className="h1-ph" />
          <figcaption className="h1-lab"><i>02</i>Equipo</figcaption>
        </figure>
        <figure className="h1-pn h1-pn--1 bite2" aria-label="01 · Reto">
          <Photo slot="htc1" label="el reto" tone="htc" clean className="h1-ph" />
          <figcaption className="h1-lab"><i>01</i>Reto</figcaption>
        </figure>
        <figure className="h1-pn h1-pn--3 bite2" aria-label="03 · Propuesta">
          <Photo slot="htc3" label="la propuesta" tone="htc" clean className="h1-ph" />
          <figcaption className="h1-lab"><i>03</i>Propuesta</figcaption>
        </figure>

        <Route className="h1-route h1-route--l" vb="0 0 100 56.25" d={D_LAND} start={[46, 17.7]} />
        <Route className="h1-route h1-route--p" vb="0 0 36.36 30" d={D_PORT} start={[1.6, 26]} />

        {hours > 0 && (
          <div className="h1-clock" role="img" aria-label={`${hours} horas`}>
            <svg viewBox="-50 -50 100 100" aria-hidden="true" focusable="false">
              <circle className="h1-clock__veil" r="45" />
              <circle className="h1-clock__rim" r="44" />
              <circle className="h1-clock__echo h1-clock__echo--1" r="49" />
              <circle className="h1-clock__echo h1-clock__echo--2" r="49" />
              <g className="h1-clock__ticks">
                {TICKS.map((i) => <line key={i} x1="0" y1={i % 3 === 0 ? -35 : -37.5} x2="0" y2="-42" transform={`rotate(${i * 10})`} style={{ "--i": i } as CSSProperties} />)}
              </g>
              <circle className="h1-clock__track" r="29" />
              <circle className="h1-clock__arc" r="29" pathLength={1} transform="rotate(-90)" />
              <g className="h1-clock__orb"><circle cx="0" cy="-29" r="2.1" /></g>
            </svg>
            <div className="h1-clock__txt"><b className="disp"><Counter to={hours} delay={3500} duration={1500} /></b><small>horas</small></div>
          </div>
        )}
      </div>
    </article>
  );
}
