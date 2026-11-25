"use client";

import { useState } from "react";
import type { Slide } from "../../content/schema.ts";
import { Icon } from "../slides/primitives.tsx";
import type { Origin } from "../rewind/use-presentation.ts";

type Props = {
  slides: Slide[];
  activeIndex: number;
  paused: boolean;
  reducedMotion: boolean;
  fullscreen: boolean;
  nudgeNext: boolean;
  onGo: (index: number, origin?: Origin) => void;
  onPause: () => void;
  onFullscreen: () => void;
  originOf: (event: { clientX: number; clientY: number; detail?: number }) => Origin;
  notes: string[];
  showNotes: boolean;
};

const SEG_COLORS: Record<string, string[]> = {
  equipo: ["var(--compite-l)", "var(--crea)", "var(--conecta-l)"],
  futuro: ["var(--crea)", "var(--conecta-l)"],
};

/** Quiet HUD: logo-home, chapter progress (segments grouped by chapter), counter, prev/next. */
export function Navigation({ slides, activeIndex, paused, reducedMotion, fullscreen, nudgeNext, onGo, onPause, onFullscreen, originOf, notes, showNotes }: Props) {
  const [notesOpen, setNotesOpen] = useState(false);
  const current = slides[activeIndex];
  const chapters = [...new Set(slides.map((slide) => slide.chapter))];
  const click = (index: number) => (event: React.MouseEvent) => onGo(index, originOf(event));
  return (
    <>
      <nav className={`rw-hud${activeIndex === 0 ? " off" : ""}`} aria-label="Progreso del recorrido">
        <button className="rw-home nav-home" onClick={click(0)} aria-label="Volver al inicio"><img src="/brand/iso.png" alt="" /></button>
        <ol className="rw-chs" aria-label="Progreso por capítulos">
          {chapters.map((chapter) => {
            const idx = slides.flatMap((slide, i) => (slide.chapter === chapter ? [i] : []));
            const first = idx[0] ?? 0;
            const on = current?.chapter === chapter;
            const label = slides[first]?.chapterLabel;
            return (
              <li className={`rw-chap${on ? " on" : ""}`} data-ch={chapter} key={chapter}>
                <div className="rw-segs">
                  {idx.map((i, j) => (
                    <button key={slides[i]?.id} className={`rw-seg${i < activeIndex ? " vis" : ""}${i === activeIndex ? " cur" : ""}`} aria-label={`Ir a: ${slides[i]?.title}`} aria-current={i === activeIndex ? "step" : undefined} onClick={click(i)}
                      style={SEG_COLORS[chapter] ? ({ "--c": SEG_COLORS[chapter][j % SEG_COLORS[chapter].length] } as React.CSSProperties) : undefined}><i /></button>
                  ))}
                </div>
                <button className="rw-chap__n" onClick={click(first)} aria-label={`Ir al capítulo ${label}`}>{label}</button>
              </li>
            );
          })}
        </ol>
        <span className="nav-count" aria-live="polite">{String(activeIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</span>
      </nav>

      <div className="rw-nav">
        <button className="rw-nb rw-nb--ghost" onClick={onFullscreen} aria-label={fullscreen ? "Salir de pantalla completa" : "Pantalla completa"}><Icon name="full" /></button>
        <button className="rw-nb rw-nb--ghost" onClick={onPause} aria-pressed={paused || reducedMotion} aria-label={paused || reducedMotion ? "Reanudar animaciones" : "Pausar animaciones"} disabled={reducedMotion}><Icon name={paused || reducedMotion ? "play" : "pause"} /></button>
        <button className="rw-nb" onClick={click(activeIndex - 1)} aria-label="Slide anterior" disabled={activeIndex === 0}><Icon name="back" /></button>
        <button className={`rw-nb rw-nb--next${nudgeNext ? " nudge" : ""}`} onClick={click(activeIndex + 1)} aria-label="Siguiente slide" disabled={activeIndex >= slides.length - 1}><Icon name="arrow" /></button>
      </div>

      {showNotes && notes.length > 0 && (
        <>
          <button className="rw-notes-btn" aria-expanded={notesOpen} onClick={() => setNotesOpen((v) => !v)}>Pendientes ({notes.length})</button>
          {notesOpen && <aside className="editorial-notes"><b>Pendientes editoriales</b><ul>{notes.map((note) => <li key={note}>{note}</li>)}</ul></aside>}
        </>
      )}
    </>
  );
}
