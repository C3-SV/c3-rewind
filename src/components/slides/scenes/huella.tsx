"use client";

import { useId, type CSSProperties, type ReactNode } from "react";
import { Icon, Lines, LineChip, Pending, Photo, monogram } from "../primitives.tsx";
import { useScene } from "../scene-context.tsx";
import "./huella.css";

/* ------------------------------------------------------------------ *
 * HUELLA — "Tu huella en 2026." (private / recipient only)
 * The C3 isotipo geometry, re-cast: the recipient photo is the centre,
 * the two nodes of the aperture become the pair C3 x <empresa>, joined by
 * the drawn orbit arc. A thread leaves the arc and hangs one narrative
 * block per supported event. Only what has support is affirmed.
 * Landscape units: system box S = 44em, 400-unit symbol box.
 * ------------------------------------------------------------------ */

const rad = (deg: number) => (deg * Math.PI) / 180;
const pt = (r: number, deg: number) => ({ x: +(200 + r * Math.cos(rad(deg))).toFixed(2), y: +(200 + r * Math.sin(rad(deg))).toFixed(2) });
const arc = (r: number, a: number, b: number) => { const p = pt(r, a), q = pt(r, b); return `M${p.x} ${p.y}A${r} ${r} 0 ${Math.abs(b - a) > 180 ? 1 : 0} ${b > a ? 1 : 0} ${q.x} ${q.y}`; };

const NODE_DEG = 27;
const ORB = 150;
const A = pt(ORB, -NODE_DEG);   // C3 isotipo node
const B = pt(ORB, NODE_DEG);    // company node
const M = pt(ORB, 0);           // the link's midpoint
const HALO = 52;

type Kind = "copa" | "htc" | "other";
const kindOf = (id: string): Kind => (/copa/i.test(id) ? "copa" : /htc|hackathon|turismo/i.test(id) ? "htc" : "other");
const EVENT: Record<Kind, { kicker: string; name: string; a: string }> = {
  copa: { kicker: "Copa II · ESEN", name: "la Copa Salvadoreña de Programación II", a: "copa" },
  htc: { kicker: "HTC Vol. 1 · Key Institute", name: "el Hackathon de Turismo Creativo Vol. 1", a: "htc" },
  other: { kicker: "Evento 2026", name: "un evento de C3", a: "other" },
};
const CONTRIB: Record<string, string> = {
  financial: "aporte económico", venue: "el espacio del evento", prizes: "los premios", mentors: "mentoría",
  judges: "su participación como jurado", other: "su apoyo",
};
const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

type EvBlock = { key: string; kind: Kind; contribution: string | null; description: string | null };

export function HuellaScene() {
  const { slide, recipient, partnerLogo, pdfHref, showDraft } = useScene();
  const uid = useId().replace(/[^a-z0-9]/gi, "");
  const name = recipient?.commercialName?.trim() || "Tu empresa";
  const mono = monogram(name);

  /* events: only those the recipient supports. enabledByEvent carries the contribution. */
  const ids = Array.from(new Set([...(recipient?.supportedEvents ?? []), ...(recipient?.enabledByEvent ?? []).map((e) => e.eventId)]));
  const blocks: EvBlock[] = ids.map((id) => {
    const e = recipient?.enabledByEvent.find((x) => x.eventId === id);
    return { key: id, kind: kindOf(id), contribution: e ? CONTRIB[e.contribution] ?? CONTRIB.other : null, description: e?.description?.trim() || null };
  });
  const draftEmpty = blocks.length === 0 && showDraft;

  /* approved-only sources */
  const mediaBase = pdfHref.replace(/\/pdf$/, "/media");
  const approvedMedia = (recipient?.media ?? []).filter((m) => m.status === "approved");
  const mediaUrl = (file: string) => (/^https:\/\//i.test(file) ? file : `${mediaBase}/${encodeURIComponent(file)}`);
  const impact = (recipient?.impact ?? []).filter((i) => i.status === "approved").slice(0, 3);
  const quotes = (recipient?.testimonials ?? []).filter((t) => t.permission && t.text.trim());
  const people = (recipient?.people ?? []).filter((p) => p.name.trim());
  const thanks = people.slice(0, 4).map((p) => p.name).join(", ");
  const heroMedia = approvedMedia[0];
  const satellites = approvedMedia.slice(1, 3);

  const dense = blocks.length > 1 || (blocks.length === 1 && impact.length > 0 && quotes.length > 0);
  const nBlocks = Math.max(1, blocks.length);
  const D = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

  return (
    <article className={`story-scene sc-huella hu hu--n${nBlocks}${dense ? " hu--dense" : ""}`} data-slide-id={slide.id} aria-label={slide.title}>
      <div className="hu-sys" aria-hidden={false}>
        {/* soft backdrop rings, behind the photo */}
        <svg className="hu-svg hu-svg--back" viewBox="0 0 400 400" aria-hidden="true" focusable="false">
          <defs>
            <mask id={`${uid}m`}>
              <rect width="400" height="400" fill="#fff" />
              <circle cx={A.x} cy={A.y} r={HALO + 4} fill="#000" />
              <circle cx={B.x} cy={B.y} r={HALO + 4} fill="#000" />
            </mask>
          </defs>
          <g mask={`url(#${uid}m)`}>
            <path className="hu-r hu-r--out draw" pathLength={1} style={D(0.5)} d={arc(175, 38, 322)} />
            <g className="hu-turn"><circle className="hu-dots" cx="200" cy="200" r="163" /></g>
          </g>
        </svg>

        <div className="hu-photo" style={D(0.35)}>
          {heroMedia ? (
            <div className="ph ph--c ph--clean" data-tone="conecta"><img src={mediaUrl(heroMedia.file)} alt={heroMedia.alt} /></div>
          ) : (
            <Photo slot="huella" label="foto del evento con su marca" tone="conecta" circle />
          )}
        </div>

        <svg className="hu-svg hu-svg--front" viewBox="0 0 400 400" aria-hidden="true" focusable="false">
          <circle className="hu-r hu-r--in draw" pathLength={1} style={D(0.9)} cx="200" cy="200" r="86" />
          <path className="hu-link draw" pathLength={1} style={D(1.5)} d={arc(ORB, -NODE_DEG, NODE_DEG)} />
          <circle className="hu-spark" cx={M.x} cy={M.y} r="7" />
          <circle className="hu-spark-p" cx={M.x} cy={M.y} r="7" />
          <path className="hu-thread draw" pathLength={1} style={D(2.0)} d={`M${M.x} ${M.y}H${M.x + 104}`} />
        </svg>

        {satellites.map((m, i) => {
          const p = pt(176, i === 0 ? 205 : 150);
          return (
            <div key={m.file} className="hu-sat rv-s" style={{ left: `${(p.x / 400) * 100}%`, top: `${(p.y / 400) * 100}%`, ...D(2.4 + i * 0.3) }}>
              <div className="ph ph--c ph--clean" data-tone="conecta"><img src={mediaUrl(m.file)} alt={m.alt} loading="lazy" /></div>
            </div>
          );
        })}

        {/* the pair: C3 isotipo + empresa, seated on the aperture nodes */}
        <div className="hu-pair hu-pair--c3 rv-s" style={{ left: `${(A.x / 400) * 100}%`, top: `${(A.y / 400) * 100}%`, ...D(1.0) }}>
          <img src="/brand/iso.png" alt="C3" width={128} height={128} />
        </div>
        <div className="hu-pair hu-pair--co rv-s" style={{ left: `${(B.x / 400) * 100}%`, top: `${(B.y / 400) * 100}%`, ...D(1.25) }}>
          {partnerLogo ? <img src={partnerLogo} alt={name} /> : <b aria-label={name}>{mono}</b>}
        </div>
      </div>

      <header className="hu-head">
        <div className="rv" style={D(0.2)}><LineChip line="conecta">Tu huella</LineChip></div>
        <h1 className="hu-h"><Lines lines={["Tu huella", "en 2026."]} delay={0.35} step={0.16} /></h1>
      </header>

      <div className="hu-evs">
        <span className="hu-trunk" aria-hidden="true" />
        {impact.length > 0 && (
          <section className="hu-ev hu-ev--impact" style={D(2.2)} aria-label="Cifras de los eventos que apoyaste">
            <i className="hu-mk" aria-hidden="true" />
            <ul className="hu-impact">
              {impact.map((i) => <li key={i.label}><b>{i.value}</b><span>{i.label}</span></li>)}
            </ul>
          </section>
        )}
        {blocks.map((b, i) => {
          const ev = EVENT[b.kind];
          const last = i === blocks.length - 1;
          const quote = last ? quotes[0] : undefined;
          const d0 = 2.5 + i * 0.9;
          return (
            <section key={b.key} className={`hu-ev hu-ev--${ev.a}`} style={D(d0)} aria-label={ev.kicker}>
              <i className="hu-mk" aria-hidden="true" />
              <p className="hu-ek">{ev.kicker}</p>
              <h2 className="hu-s">
                {name} apoyó <em>{ev.name}</em>{b.contribution ? <> con <b>{b.contribution}</b></> : null}.
              </h2>
              <dl className="hu-dl">
                {b.description && <Row k="Eso hizo posible" icon="spark">{b.description}</Row>}
                {last && thanks && <Row k="Gracias a" icon="heart">{thanks}</Row>}
              </dl>
              {quote && (
                <blockquote className="hu-q">
                  <Icon name="quote" />
                  <p>{quote.text}</p>
                  <footer>{quote.person}</footer>
                </blockquote>
              )}
            </section>
          );
        })}

        {draftEmpty && (
          <section className="hu-ev hu-ev--other hu-ev--draft" style={D(2.3)}>
            <i className="hu-mk" aria-hidden="true" />
            <h2 className="hu-s">
              {name} apoyó <em><Pending>evento</Pending></em> con <b><Pending>tipo de aporte</Pending></b>.
            </h2>
            <dl className="hu-dl">
              <Row k="Eso hizo posible" icon="spark"><Pending>qué habilitó</Pending></Row>
              <Row k="Gracias a" icon="heart"><Pending>nombres</Pending></Row>
            </dl>
          </section>
        )}

        {!draftEmpty && blocks.length === 0 && (
          <p className="hu-thanks">Gracias, {name}, por ser parte de este año.</p>
        )}
      </div>
    </article>
  );
}

function Row({ k, icon, children }: { k: string; icon: "spark" | "heart"; children: ReactNode }) {
  return (
    <div className="hu-row">
      <dt><Icon name={icon} />{k}</dt>
      <dd>{children}</dd>
    </div>
  );
}
