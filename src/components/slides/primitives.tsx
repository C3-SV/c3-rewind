"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { resolveMediaSource } from "../../lib/media.ts";
import { useScene, useFacts } from "./scene-context.tsx";

/* ---------- icons (stroke, 24px) ---------- */
const IC = {
  arrow: "M5 12h14M13 6l6 6-6 6", back: "M19 12H5M11 6l-6 6 6 6", pause: "M9 5v14M15 5v14", play: "M8 5l11 7-11 7z",
  download: "M12 4v11M7 10l5 5 5-5M5 20h14", restart: "M3 12a9 9 0 1 0 3-6.7M3 4v5h5",
  msg: "M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.5A8 8 0 1 1 21 12z",
  globe: "M3 12h18M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18",
  cal: "M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM3 10h18M8 3v4M16 3v4",
  pin: "M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21zM12 7a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z",
  clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2",
  users: "M9 4.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6",
  team: "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5", school: "M2 9l10-5 10 5-10 5zM6 11v5c3 2 9 2 12 0v-5",
  flag: "M5 21V4h12l-2 4 2 4H5", trophy: "M8 4h8v5a4 4 0 0 1-8 0zM8 6H4a3 3 0 0 0 4 4M16 6h4a3 3 0 0 1-4 4M12 13v4M8 21h8M9 17h6",
  bulb: "M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z",
  brief: "M5 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zM9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18",
  quote: "M6 7h5v5c0 3-2 5-5 5v-2.2c1.6 0 2.6-1.2 2.6-2.8H6zM13 7h5v5c0 3-2 5-5 5v-2.2c1.6 0 2.6-1.2 2.6-2.8H13z",
  cam: "M5 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zM8 7l2-3h4l2 3M12 10a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z",
  insta: "M8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM17.5 6.5h.01",
  code: "M8 7l-5 5 5 5M16 7l5 5-5 5", heart: "M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z",
  spark: "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6",
  link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
  full: "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5", info: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 11v6M12 7.5h.01",
} as const;
export type IconName = keyof typeof IC;
const FILLED = new Set<IconName>(["play", "quote"]);
export function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  return (
    <svg className={`ic ${className}`} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={IC[name]} {...(FILLED.has(name) ? { fill: "currentColor", stroke: "none" } : {})} />
    </svg>
  );
}

/* ---------- reveals ---------- */
/** Masked line-by-line headline reveal. */
export function Lines({ lines, delay = 0.3, step = 0.15, className = "" }: { lines: ReactNode[]; delay?: number; step?: number; className?: string }) {
  return (
    <>
      {lines.map((line, i) => (
        <span className={`ln ${className}`} key={i}><span style={{ "--d": `${(delay + i * step).toFixed(2)}s` } as CSSProperties}>{line}</span></span>
      ))}
    </>
  );
}

/* ---------- counters ---------- */
/** Counts 0→to while the slide is active. Server/static/reduced-motion render the final value. */
export function Counter({ to, delay = 0, duration = 1500, className = "", suffix = "" }: { to: number; delay?: number; duration?: number; className?: string; suffix?: string }) {
  const { active, staticMode, reducedMotion } = useScene();
  const [value, setValue] = useState(to);
  const raf = useRef(0);
  useEffect(() => {
    if (staticMode || reducedMotion || !active) { setValue(to); return; }
    setValue(0);
    let t0 = 0;
    const wait = window.setTimeout(() => {
      const step = (t: number) => {
        if (!t0) t0 = t;
        const p = Math.min(1, (t - t0) / duration);
        setValue(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf.current = requestAnimationFrame(step);
      };
      raf.current = requestAnimationFrame(step);
    }, delay);
    return () => { window.clearTimeout(wait); cancelAnimationFrame(raf.current); };
  }, [active, staticMode, reducedMotion, to, delay, duration]);
  return <span className={className} aria-label={`${to}${suffix}`}><span aria-hidden="true">{value}{suffix}</span></span>;
}

/** A pending editorial value. Quiet by design; only rendered where draft content is allowed. */
export function Pending({ children = "N" }: { children?: ReactNode }) {
  const { showDraft } = useScene();
  if (!showDraft) return null;
  return <span className="pend" title="Dato por validar">[{children}]</span>;
}

/* ---------- photo frame ---------- */
export type Tone = "navy" | "compite" | "crea" | "conecta" | "copa" | "htc";
/** Designed frame that becomes the real photo the moment `slot` is filled in the edition. Never fakes a photo. */
export function Photo({ slot, label, tone = "navy", circle = false, small = false, clean = false, className = "", style, children }: {
  slot: string; label?: string; tone?: Tone; circle?: boolean; small?: boolean; clean?: boolean; className?: string; style?: CSSProperties; children?: ReactNode;
}) {
  const { photos, imageKitEndpoint, showDraft } = useScene();
  const media = photos[slot];
  const real = media && (showDraft || media.status === "approved") ? media : undefined;
  const id = `g${slot.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <div className={`ph${circle ? " ph--c" : ""}${small ? " ph--sm" : ""}${clean ? " ph--clean" : ""} ${className}`} data-tone={tone} data-slot={slot} style={style}>
      <div className="ph__art" aria-hidden="true">
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id={`${id}a`} cx="22%" cy="12%" r="90%"><stop offset="0" stopColor="#fff" stopOpacity=".26" /><stop offset=".6" stopColor="#fff" stopOpacity="0" /></radialGradient>
            <linearGradient id={`${id}b`} x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#0c1830" stopOpacity=".75" /><stop offset="1" stopColor="#0c1830" stopOpacity="0" /></linearGradient>
          </defs>
          <rect width="400" height="300" fill={`url(#${id}a)`} />
          <rect width="400" height="300" fill={`url(#${id}b)`} />
          <g fill="none" stroke="#fff" strokeOpacity=".16" strokeWidth="1">
            <circle cx="300" cy="120" r="150" /><circle cx="300" cy="120" r="96" /><circle cx="300" cy="120" r="54" strokeOpacity=".24" />
          </g>
          <circle cx="300" cy="120" r="9" fill="#fff" fillOpacity=".5" />
        </svg>
      </div>
      {real && <img src={resolveMediaSource(real, imageKitEndpoint)} alt={real.alt} loading="lazy" style={{ objectPosition: real.focalPoint ? `${real.focalPoint.x}% ${real.focalPoint.y}%` : undefined }} />}
      {showDraft && !real && label && <span className="ph__tag"><Icon name="cam" /><span className="l">Foto · {label}</span></span>}
      {children}
    </div>
  );
}

/* ---------- facts (date · venue · duration) ---------- */
export function FactRow({ className = "", style }: { className?: string; style?: CSSProperties }) {
  const facts = useFacts();
  if (!facts.length) return null;
  return <div className={`meta ${className}`} style={style}>{facts.map((fact) => <span key={fact.text}><Icon name={fact.icon} />{fact.text}</span>)}</div>;
}

export function LineChip({ line, children }: { line: "compite" | "crea" | "conecta"; children: ReactNode }) {
  return <span className={`chip c-${line}`}><span className="dot" />{children}</span>;
}

export function Ribbon({ name, mono }: { name: string; mono: string }) {
  return <div className="ribbon"><i>{mono}</i>Aquí estuvo {name}</div>;
}
export const monogram = (name: string) => (name.trim() || "E").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
