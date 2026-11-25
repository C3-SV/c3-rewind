import type { Slide } from "../../content/schema.ts";

type Props = {
  slides: Slide[];
  activeIndex: number;
  paused: boolean;
  onGo: (index: number) => void;
  onPause: () => void;
  onHome: () => void;
  onFullscreen: () => void;
};

export function Navigation({ slides, activeIndex, paused, onGo, onPause, onHome, onFullscreen }: Props) {
  const chapters = [...new Set(slides.map((slide) => slide.chapter))];
  const current = slides[activeIndex];
  return (
    <nav className="rewind-nav" aria-label="Navegación del recorrido">
      <button className="nav-home" onClick={onHome} aria-label="Volver al inicio" disabled={activeIndex === 0}>C3</button>
      <button className="nav-step" onClick={() => onGo(activeIndex - 1)} aria-label="Slide anterior" disabled={activeIndex === 0}>←</button>
      <div className="chapter-progress" aria-label="Progreso por capítulos">
        {chapters.map((chapter) => {
          const indexes = slides.flatMap((slide, index) => slide.chapter === chapter ? [index] : []);
          const first = indexes[0] ?? 0;
          const active = current?.chapter === chapter;
          return (
            <div className={`progress-chapter${active ? " is-active" : ""}`} key={chapter}>
              <button className="chapter-jump" onClick={() => onGo(first)} aria-label={"Ir al capítulo " + slides[first]?.chapterLabel} aria-current={active ? "step" : undefined}>
                <span className="chapter-segments" aria-hidden="true">
                  {indexes.map((index) => <i className={index <= activeIndex ? "is-read" : ""} key={slides[index]?.id} />)}
                </span>
                <small>{slides[first]?.chapterLabel}</small>
              </button>
            </div>
          );
        })}
      </div>
      <span className="nav-count" aria-live="polite">{String(activeIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</span>
      <button className="nav-step" onClick={() => onGo(activeIndex + 1)} aria-label="Siguiente slide" disabled={activeIndex >= slides.length - 1}>→</button>
      <button className="nav-icon" onClick={onPause} aria-label={paused ? "Reanudar animaciones" : "Pausar animaciones"} aria-pressed={paused}>{paused ? "▶" : "Ⅱ"}</button>
      <button className="nav-icon" onClick={onFullscreen} aria-label="Pantalla completa">⛶</button>
    </nav>
  );
}
