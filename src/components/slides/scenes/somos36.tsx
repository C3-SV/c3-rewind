"use client";

import "./somos36.css";
import type { CSSProperties } from "react";
import { Counter, Icon, Lines } from "../primitives.tsx";
import { useScene } from "../scene-context.tsx";
import { resolveMediaSource } from "../../../lib/media.ts";
import { PICTURE_L, PICTURE_P } from "./somos36-art.tsx";

/* ------------------------------------------------------------------ *
 * SOMOS 36 — the group photo is the protagonist. 36 tiles (6×6) scatter
 * in tinted in the line colours, the tint flashes out, the gaps close,
 * a light sweeps across and the number lands.
 * ------------------------------------------------------------------ */

const rnd = (n: number) => { const x = Math.sin(n * 9301 + 49297) * 233280; return x - Math.floor(x); };
const TINT = ["#205298", "#33beac", "#4f5ba9"];
const ORDER = [...Array(36).keys()].sort((a, b) => rnd(a + 3) - rnd(b + 3));

/** Deterministic tile choreography (same on server and client). Tiles leave from outside their own cell, radially. */
const TILES = Array.from({ length: 36 }, (_, i) => {
  const r = Math.floor(i / 6), c = i % 6;
  const dx = (c - 2.5) / 2.5, dy = (r - 2.5) / 2.5;
  return {
    i, r, c, o: ORDER.indexOf(i),
    rx: (dx * (16 + rnd(i + 11) * 22) + (rnd(i + 57) - 0.5) * 12).toFixed(1),
    ry: (dy * (10 + rnd(i + 23) * 14) + (rnd(i + 31) - 0.5) * 8).toFixed(1),
    rot: (rnd(i + 91) * 90 - 45).toFixed(0),
    tint: TINT[(r + c) % 3],
    diag: r + c,
  };
});

export function Somos36Scene() {
  const { slide, photos, imageKitEndpoint, showDraft } = useScene();
  const media = photos.grupo;
  const real = media && (showDraft || media.status === "approved") ? media : undefined;
  const src = real ? resolveMediaSource(real, imageKitEndpoint) : null;
  const objectPosition = real?.focalPoint ? `${real.focalPoint.x}% ${real.focalPoint.y}%` : undefined;

  const parts = slide.title.split(/ (?=hay )/);
  const body = (slide.body ?? "").replace(/^Somos 36\.\s*/, "");
  const mosStyle = src ? undefined : ({ "--pic-l": PICTURE_L, "--pic-p": PICTURE_P } as CSSProperties);

  return (
    <article className="story-scene sc-somos36" data-slide-id={slide.id} data-real={src ? "" : undefined} aria-label={slide.title}>
      <div className="sm-back" aria-hidden="true" />

      <div className="sm-photo" style={mosStyle} {...(src && real ? { role: "img", "aria-label": real.alt } : { "aria-hidden": true })}>
        <div className="sm-whole">{src && <img src={src} alt="" style={{ objectPosition }} />}</div>
        <div className="sm-mos" data-slot="grupo">
          {TILES.map((t) => (
            <div
              className="sm-t"
              key={t.i}
              style={{ "--col": t.c, "--row": t.r, "--o": t.o, "--rx": `${t.rx}em`, "--ry": `${t.ry}em`, "--rot": `${t.rot}deg`, "--tint": t.tint, "--diag": t.diag } as CSSProperties}
            >
              {src && <img src={src} alt="" loading="eager" style={{ objectPosition }} />}
            </div>
          ))}
        </div>
        <div className="sm-sweep" />
      </div>
      <div className="sm-veil" aria-hidden="true" />

      <div className="sm-copy">
      <div className="sm-who">
        <p className="kicker sm-kick"><Icon name="users" />Somos</p>
        <p className="sm-n"><Counter to={36} delay={1700} duration={900} /></p>
        <i className="sm-ring" aria-hidden="true" />
      </div>

      <div className="sm-tx">
        <h1 className="sm-h"><Lines lines={parts} delay={1.8} step={0.12} /></h1>
        {body && <p className="sm-p rv">{body}</p>}
      </div>
      </div>
    </article>
  );
}
