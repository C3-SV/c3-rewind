"use client";

import "./voces.css";
import { Fragment, useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { Icon, Lines, Photo, type Tone } from "../primitives.tsx";
import { useScene, visibleStatus } from "../scene-context.tsx";

type LineKey = "crea" | "compite" | "conecta";
type Voice = { text: string; person: string; role: string; pendingText: boolean; pendingName: boolean };

const INTERVAL = 9000;
const LINES: LineKey[] = ["crea", "compite", "conecta", "crea"];
const TONES: Tone[] = ["crea", "compite", "conecta", "crea"];
const ROLES = ["Fundador/a", "Líder de área", "Colaborador/a", "Colaborador/a"];
const GUIDE = "[MENSAJE BREVE: qué aprendió, qué momento lo marcó o a quién agradece]";
const isPending = (s: string) => /\[|\]/.test(s);
const lenClass = (t: string) => (t.length <= 80 ? "vo-q--s" : t.length <= 150 ? "vo-q--m" : "vo-q--l");

/** Voice → words, each one a span so the message can type itself in. */
function Words({ text }: { text: string }) {
  return (
    <>
      {text.split(/\s+/).map((w, k) => (
        <Fragment key={k}>{k > 0 && " "}<span className="w" style={{ "--k": k } as CSSProperties}>{w}</span></Fragment>
      ))}
    </>
  );
}

export function VocesScene() {
  const { slide, showDraft, staticMode, reducedMotion, active } = useScene();

  const quotes = slide.blocks.flatMap((b) => (b.type === "quote" && visibleStatus(b.status, showDraft) ? [b] : []));
  const voices: Voice[] = quotes.slice(0, 4).map((q, i) => ({
    text: q.text,
    person: q.person,
    role: q.role && !isPending(q.role) ? q.role : ROLES[i],
    pendingText: isPending(q.text),
    pendingName: isPending(q.person),
  }));
  if (showDraft) {
    for (let i = voices.length; i < 4; i++) voices.push({ text: GUIDE, person: "[NOMBRE]", role: ROLES[i], pendingText: true, pendingName: true });
  }
  const n = voices.length;
  const grid = staticMode || reducedMotion;

  const [idx, setIdx] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [playing, setPlaying] = useState(true);
  const [cycle, setCycle] = useState(0);
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const idxRef = useRef(0);
  const rootRef = useRef<HTMLElement>(null);
  const thumbs = useRef<Array<HTMLButtonElement | null>>([]);

  /** Go to a message; the circular reveal grows out of that message's own thumbnail. */
  const goTo = useCallback((to: number) => {
    if (n < 2) return;
    const t = ((to % n) + n) % n;
    if (t === idxRef.current) return;
    const root = rootRef.current;
    const th = thumbs.current[t];
    if (root && th) {
      const r = root.getBoundingClientRect();
      const b = th.getBoundingClientRect();
      if (r.width > 0) setOrigin({ x: ((b.left + b.width / 2 - r.left) / r.width) * 100, y: ((b.top + b.height / 2 - r.top) / r.height) * 100 });
    }
    setPrev(idxRef.current);
    idxRef.current = t;
    setIdx(t);
    setCycle((c) => c + 1);
  }, [n]);

  // fresh start each time the slide is entered
  useEffect(() => {
    if (!active) return;
    idxRef.current = 0;
    setIdx(0); setPrev(null); setOrigin(null); setPlaying(true); setCycle((c) => c + 1);
  }, [active]);

  // autoplay: elapsed time only counts while playing, visible and not globally paused
  useEffect(() => {
    if (!active || grid || !playing || n < 2) return;
    let elapsed = 0;
    const id = window.setInterval(() => {
      const root = rootRef.current;
      if (!root || document.hidden || root.closest(".is-paused")) return;
      elapsed += 200;
      if (elapsed >= INTERVAL) { elapsed = 0; goTo(idxRef.current + 1); }
    }, 200);
    return () => window.clearInterval(id);
  }, [active, grid, playing, n, cycle, goTo]);

  // the previous message stays underneath while the new one opens over it
  useEffect(() => {
    if (prev === null) return;
    const id = window.setTimeout(() => setPrev(null), 1500);
    return () => window.clearTimeout(id);
  }, [prev]);

  const title = slide.title;
  const colon = title.indexOf(":");
  const head: [string, string] = colon > 0 ? [title.slice(0, colon + 1), title.slice(colon + 1).trim()] : [title.replace(/\s+\S+$/, ""), title.split(" ").pop() ?? ""];
  const rootStyle = origin ? ({ "--vx": `${origin.x.toFixed(1)}%`, "--vy": `${origin.y.toFixed(1)}%` } as CSSProperties) : undefined;
  const controls = !grid && n > 1;

  return (
    <article
      ref={rootRef}
      className={`story-scene sc-voces${grid ? " vo--grid" : ""}${playing ? "" : " vo--paused"}`}
      data-slide-id={slide.id}
      data-n={n}
      aria-label={slide.title}
      style={rootStyle}
    >
      <div className="vo-bg" aria-hidden="true">
        <Photo slot="grupo" label="foto grupal" clean />
        <div className="vo-veil" />
      </div>

      <h1 className="vo-h">
        <Lines lines={[head[0], <em key="g" className="vo-em">{head[1]}</em>]} delay={0.25} step={0.2} />
      </h1>

      <div className="vo-stage" aria-live={controls && playing ? "off" : "polite"}>
        {voices.map((v, i) => {
          const line = LINES[i % LINES.length];
          const current = i === idx;
          return (
            <article
              key={i}
              className={`voice vo-c--${line}${current ? " on" : ""}${i === prev && !current ? " was" : ""}`}
              aria-hidden={!grid && !current ? true : undefined}
              aria-label={`Mensaje de ${v.person}`}
            >
              <div className="vo-fig">
                <span className="vo-ring vo-ring--1" aria-hidden="true" />
                <span className="vo-ring vo-ring--2" aria-hidden="true" />
                <span className="vo-sat" aria-hidden="true" />
                <div className="vo-pt bite"><Photo slot={`voz${i + 1}`} circle clean label="retrato" tone={TONES[i % TONES.length]} /></div>
                <span className="vo-node" aria-hidden="true" />
              </div>
              <div className="vo-body">
                <span className="vo-qg" aria-hidden="true">“</span>
                <blockquote className={`vo-q ${lenClass(v.text)}${v.pendingText ? " is-pend" : ""}`}>
                  <p><Words text={v.text} /></p>
                </blockquote>
                <p className="vo-who">
                  <b className={v.pendingName ? "is-pend" : undefined}>{v.person}</b>
                  <span>{v.role}</span>
                </p>
              </div>
            </article>
          );
        })}
      </div>

      {controls && (
        <div className="vo-rail rv" style={{ "--d": "1.7s" } as CSSProperties} role="group" aria-label="Mensajes del equipo">
          <button type="button" className="vo-nb" onClick={() => goTo(idx - 1)} aria-label="Mensaje anterior"><Icon name="back" /></button>
          <div className="vo-ths">
            {voices.map((v, i) => (
              <button
                key={i}
                type="button"
                ref={(el) => { thumbs.current[i] = el; }}
                className="vo-th"
                onClick={() => goTo(i)}
                aria-label={`Mensaje ${i + 1} de ${n}: ${v.person}`}
                aria-current={i === idx ? "true" : undefined}
              >
                <span className="vo-th__pt"><Photo slot={`voz${i + 1}`} circle clean small tone={TONES[i % TONES.length]} /></span>
                <svg className="vo-th__ring" viewBox="0 0 44 44" aria-hidden="true" focusable="false">
                  <circle className="trk" cx="22" cy="22" r="20.5" />
                  {i === idx && <circle className="prg" key={cycle} cx="22" cy="22" r="20.5" pathLength={1} />}
                </svg>
              </button>
            ))}
          </div>
          <button type="button" className="vo-nb" onClick={() => goTo(idx + 1)} aria-label="Mensaje siguiente"><Icon name="arrow" /></button>
          <button type="button" className="vo-nb vo-pp" onClick={() => setPlaying((p) => !p)} aria-pressed={!playing} aria-label={playing ? "Pausar mensajes" : "Reanudar mensajes"}>
            <Icon name={playing ? "pause" : "play"} />
          </button>
          <span className="vo-count" aria-hidden="true">{String(idx + 1).padStart(2, "0")} <i>/</i> {String(n).padStart(2, "0")}</span>
        </div>
      )}
    </article>
  );
}
