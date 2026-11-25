import { OC, crescentPath, polar } from "../../motion/orbit-geometry.ts";

/**
 * The designed stand-in for the group photo: ONE picture (not a fake photo) built from the C3 symbol —
 * a monumental isotipo, hairline orbits carrying exactly 36 nodes (one per person) and lens-bokeh discs in the line colours.
 * It is delivered as a data-URI so the 36 tiles can each show their own slice of the same image
 * (background-size: 600% 600%), exactly like the real photo will be.
 */
const RNG = (n: number) => { const x = Math.sin(n * 9301 + 49297) * 233280; return x - Math.floor(x); };
const TAU = Math.PI / 180;
const COLS = ["#6fa0dd", "#33beac", "#9aa4e0"];

type Layout = { w: number; h: number; cx: number; cy: number; s: number; rings: [number, number, number]; node: number; bokeh: number; bk: [number, number] };

function picture(L: Layout): string {
  const { w, h, cx, cy, s, rings, node, bokeh, bk } = L;
  const blue = polar(OC.rOrbit, -OC.nodeAngle);
  const purple = polar(OC.rOrbit, OC.nodeAngle);
  const HALO = 57, NODE = 44; // official isotipo proportions (400-box)

  const stars: string[] = [];
  let k = 0;
  rings.forEach((r, ri) => {
    for (let i = 0; i < 12; i++) {
      const a = (i * 30 + ri * 13 + (RNG(k + 1) - 0.5) * 12) * TAU;
      const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
      const rad = node * (0.7 + RNG(k + 3) * 0.8) * (ri === 0 ? 1.12 : ri === 1 ? 1 : 0.9);
      const col = COLS[(i + ri) % 3];
      stars.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(rad * 4.2).toFixed(1)}" fill="${col}" fill-opacity=".16"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rad.toFixed(1)}" fill="${col}"/>`);
      k++;
    }
  });

  const discs: string[] = [];
  for (let i = 0; i < bokeh; i++) {
    const r = bk[0] + RNG(i + 40) * (bk[1] - bk[0]);
    const x = RNG(i + 70) * w, y = RNG(i + 100) * h * 0.82;
    const col = i % 5 === 4 ? "#ffffff" : COLS[i % 3];
    discs.push(`<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(0)}" fill="${col}" fill-opacity="${(0.05 + RNG(i + 5) * 0.09).toFixed(2)}" stroke="${col}" stroke-opacity="${(0.2 + RNG(i + 9) * 0.25).toFixed(2)}" stroke-width="1.4"/>`);
  }

  const ringEls = rings.map((r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#fff" stroke-opacity=".16" stroke-width="1.2"/>`).join("");
  const dots = [`<circle cx="${cx}" cy="${cy}" r="${rings[0] * 0.5}" fill="none" stroke="#fff" stroke-opacity=".08" stroke-width="1" stroke-dasharray="2 14" stroke-linecap="round"/>`].join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b1a35"/><stop offset=".5" stop-color="#16305a"/><stop offset="1" stop-color="#245a9c"/></linearGradient>
<radialGradient id="gt" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#33beac" stop-opacity=".62"/><stop offset="1" stop-color="#33beac" stop-opacity="0"/></radialGradient>
<radialGradient id="gp" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#6d6fd0" stop-opacity=".7"/><stop offset="1" stop-color="#4f5ba9" stop-opacity="0"/></radialGradient>
<radialGradient id="gb" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#6fa0dd" stop-opacity=".5"/><stop offset="1" stop-color="#6fa0dd" stop-opacity="0"/></radialGradient>
<radialGradient id="gw" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff" stop-opacity=".3"/><stop offset=".6" stop-color="#cfe0ff" stop-opacity=".08"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<linearGradient id="cf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#bcd2f5"/></linearGradient>
<mask id="cm" maskUnits="userSpaceOnUse" x="-100" y="-100" width="600" height="600"><rect x="-100" y="-100" width="600" height="600" fill="#fff"/><circle cx="${blue.x}" cy="${blue.y}" r="${HALO}" fill="#000"/><circle cx="${purple.x}" cy="${purple.y}" r="${HALO}" fill="#000"/></mask>
</defs>
<rect width="${w}" height="${h}" fill="url(#bg)"/>
<circle cx="${w * 0.12}" cy="${h * 0.95}" r="${Math.max(w, h) * 0.55}" fill="url(#gt)"/>
<circle cx="${w * 0.92}" cy="${h * 0.08}" r="${Math.max(w, h) * 0.5}" fill="url(#gp)"/>
<circle cx="${cx}" cy="${cy}" r="${Math.max(w, h) * 0.46}" fill="url(#gb)"/>
${discs.join("")}
${ringEls}${dots}
${stars.join("")}
<circle cx="${cx}" cy="${cy}" r="${OC.rOut * s * 1.65}" fill="url(#gw)"/>
<g transform="translate(${cx} ${cy}) scale(${s}) translate(-200 -200)">
<g mask="url(#cm)"><path d="${crescentPath((OC.rOut + OC.rIn) / 2)}" fill="none" stroke="url(#cf)" stroke-width="${OC.rOut - OC.rIn}" stroke-linecap="butt"/></g>
<circle cx="${blue.x}" cy="${blue.y}" r="${NODE}" fill="#205298"/>
<circle cx="${purple.x}" cy="${purple.y}" r="${NODE}" fill="#4f5ba9"/>
<circle cx="200" cy="200" r="${NODE}" fill="#33beac"/>
</g>
</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg.replace(/\n/g, ""))}")`;
}

/** Landscape (16:9) and portrait compositions. Both keep the symbol clear of the bottom text zone and the top-right orbit accent. */
export const PICTURE_L = picture({ w: 1600, h: 900, cx: 960, cy: 326, s: 1.26, rings: [330, 440, 570], node: 6.5, bokeh: 26, bk: [30, 120] });
export const PICTURE_P = picture({ w: 390, h: 844, cx: 186, cy: 318, s: 0.78, rings: [165, 222, 288], node: 3.8, bokeh: 20, bk: [14, 46] });
