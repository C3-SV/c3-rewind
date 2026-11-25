"use client";

import "./cierre.css";
import type { CSSProperties, ReactNode } from "react";
import { OC, polar } from "../../motion/orbit-geometry.ts";
import { Icon, LineChip, monogram } from "../primitives.tsx";
import { useScene } from "../scene-context.tsx";

const SAFE_DEST = /^(?:https:\/\/|mailto:)\S+$/;
const SITE = "https://c3.com.sv";
const INSTAGRAM = "https://www.instagram.com/c3.elsalvador";
const SIGNATURE = "Nos vemos en 2027.";

/** Message → warm paragraph + a closing signature line ("Nos vemos en 2027." is always kept). */
function splitMessage(raw: string): { body: string; sign: string } {
  const parts = (raw.trim().match(/[^.!?]+[.!?]+(?:\s+|$)/g) ?? [raw.trim()]).map((s) => s.trim()).filter(Boolean);
  const last = parts[parts.length - 1] ?? "";
  if (/^nos vemos/i.test(last)) return { body: parts.slice(0, -1).join(" "), sign: last };
  return { body: parts.join(" "), sign: SIGNATURE };
}

const BLUE = polar(OC.rOrbit, -OC.nodeAngle);
const PURPLE = polar(OC.rOrbit, OC.nodeAngle);
const END_A = polar(130, 30);
const END_B = polar(130, -30);
const SAT = (deg: number) => polar(205, deg);

/** The C3 isotipo, drawn at the real proportions (C 175/85, nodes on r150 at ±27°), built from its three lines coming together. */
function Symbol() {
  return (
    <svg className="cl-svg" viewBox="0 0 400 400" aria-hidden="true" focusable="false">
      <defs>
        <mask id="cl-cut" maskUnits="userSpaceOnUse" x="-60" y="-60" width="520" height="520">
          <rect x="-60" y="-60" width="520" height="520" fill="#fff" />
          <circle cx={BLUE.x} cy={BLUE.y} r="60" fill="#000" />
          <circle cx={PURPLE.x} cy={PURPLE.y} r="60" fill="#000" />
        </mask>
      </defs>
      {/* hairline field */}
      <circle className="cl-hair cl-hair--1 draw" cx="200" cy="200" r="205" pathLength={1} style={{ "--d": ".2s" } as CSSProperties} />
      <circle className="cl-hair cl-hair--2 draw" cx="200" cy="200" r="262" pathLength={1} style={{ "--d": ".5s" } as CSSProperties} />
      <circle className="cl-wave" cx="200" cy="200" r="175" />
      <circle className="cl-wave cl-wave--2" cx="200" cy="200" r="175" />
      <g className="cl-turn cl-turn--rev"><circle className="cl-orbit" cx="200" cy="200" r={OC.rOrbit} /></g>
      <g className="cl-turn cl-turn--slow">
        <circle className="cl-sat cl-sat--1" cx={SAT(-62).x} cy={SAT(-62).y} r="7" />
        <circle className="cl-sat cl-sat--2" cx={SAT(150).x} cy={SAT(150).y} r="5.5" />
        <circle className="cl-sat cl-sat--3" cx={SAT(232).x} cy={SAT(232).y} r="6" />
      </g>
      {/* the C */}
      <g mask="url(#cl-cut)">
        <path className="cl-c draw" d={`M${END_A.x} ${END_A.y} A130 130 0 1 1 ${END_B.x} ${END_B.y}`} pathLength={1} fill="none" strokeWidth="90" style={{ "--d": ".45s" } as CSSProperties} />
      </g>
      {/* the three lines */}
      <circle className="cl-n cl-n2" cx="200" cy="200" r="44" />
      <circle className="cl-n cl-n1" cx={BLUE.x} cy={BLUE.y} r="44" />
      <circle className="cl-n cl-n3" cx={PURPLE.x} cy={PURPLE.y} r="44" />
    </svg>
  );
}

function emphasizeYear(title: string): ReactNode[] {
  const words = title.split(" ");
  const first = words.shift() ?? "";
  const rest = words.join(" ");
  const em = (s: string): ReactNode => s.split(/(\d{4})/).map((p, i) => (/^\d{4}$/.test(p) ? <em key={i} className="cl-em">{p}</em> : p));
  return rest ? [first, em(rest)] : [em(first)];
}

export function CierreScene() {
  const { slide, recipient, partnerLogo, pdfHref, hidePdf, home } = useScene();
  const { body, sign } = splitMessage(recipient?.closingMessage?.trim() || slide.body || "");
  const dest = recipient ? (recipient.contactDestination && SAFE_DEST.test(recipient.contactDestination) ? recipient.contactDestination : null) : SITE;
  const label = recipient ? "Conversemos" : "Visitar c3.com.sv";
  const external = dest?.startsWith("https://");
  const printContact = recipient ? (dest ? dest.replace(/^mailto:/, "") : null) : "c3.com.sv";

  return (
    <article className="story-scene sc-cierre" data-slide-id={slide.id} aria-label={slide.title}>
      <div className="cl-ghost" aria-hidden="true">2027</div>

      <div className="cl-sym">
        <span className="cl-glow" aria-hidden="true" />
        <Symbol />
        {recipient && (
          <span className="cl-partner" role="img" aria-label={`Aliado: ${recipient.commercialName}`} title={recipient.commercialName}>
            <b>{partnerLogo ? <img src={partnerLogo} alt="" /> : monogram(recipient.commercialName)}</b>
            <i>{recipient.commercialName}</i>
          </span>
        )}
      </div>

      <div className="cl-chips" aria-label="Compite, Crea, Conecta">
        <span className="cl-chip cl-chip--1"><LineChip line="compite">Compite</LineChip></span>
        <span className="cl-chip cl-chip--2"><LineChip line="crea">Crea</LineChip></span>
        <span className="cl-chip cl-chip--3"><LineChip line="conecta">Conecta</LineChip></span>
      </div>

      <h1 className="cl-h" aria-label={slide.title}>
        {emphasizeYear(slide.title).map((line, i) => (
          <span className="ln cl-ln" key={i} aria-hidden="true"><span style={{ "--d": `${(2.05 + i * 0.2).toFixed(2)}s` } as CSSProperties}>{line}</span></span>
        ))}
      </h1>

      <p className="cl-msg rv" style={{ "--d": "2.8s" } as CSSProperties}>
        {body && <>{body} </>}<strong className="cl-sign">{sign}</strong>
      </p>

      <div className="cl-actions rv" style={{ "--d": "3.35s" } as CSSProperties}>
        <div className="cl-bar">
          {dest && (
            <a className="cl-go" href={dest} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
              <span className="cl-go__node" aria-hidden="true" />
              {label}
              <Icon name={recipient ? "msg" : "arrow"} />
            </a>
          )}
          <button type="button" className="cl-sec" onClick={home}><Icon name="restart" />Volver al inicio</button>
          {!hidePdf && <a className="cl-sec" href={pdfHref} download><Icon name="download" />Descargar PDF</a>}
        </div>
        <div className="cl-social">
          <a href={SITE} target="_blank" rel="noopener noreferrer"><Icon name="globe" />c3.com.sv</a>
          <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer"><Icon name="insta" />@c3.elsalvador</a>
        </div>
      </div>

      <p className="cl-print">
        {printContact && <span>{recipient ? "Conversemos" : "Visítanos"}: {printContact}</span>}
        <span>c3.com.sv · Instagram @c3.elsalvador</span>
      </p>
    </article>
  );
}
