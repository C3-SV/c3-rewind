/**
 * Orbit geometry — derived from the official C3 symbol (isotipo), not invented.
 * In a 400-unit box centred at (200,200):
 *  - the "C" crescent has outer radius 175 and inner radius 85, opening to the right (±40°);
 *  - Compite (blue) and Conecta (purple) sit on the r=150 orbit at −27° / +27°, each with a navy halo that bites the crescent;
 *  - Crea (teal) sits at the centre.
 * The field keeps those proportions at every size and pose so the motif always reads as the symbol "in motion".
 */
export const OC = {
  box: 400, c: 200,
  rOut: 175, rIn: 85, rOrbit: 150,
  aperture: 40, nodeAngle: 27,
  node: 13, halo: 19,
} as const;

const rad = (deg: number) => (deg * Math.PI) / 180;
export const polar = (r: number, deg: number) => ({ x: +(OC.c + r * Math.cos(rad(deg))).toFixed(2), y: +(OC.c + r * Math.sin(rad(deg))).toFixed(2) });
/** Arc of radius r that leaves the aperture open on the right. */
export const crescentPath = (r: number) => {
  const a = polar(r, OC.aperture), b = polar(r, -OC.aperture);
  return `M${a.x} ${a.y} A${r} ${r} 0 1 1 ${b.x} ${b.y}`;
};
/** Arc on the node orbit trailing behind a node at `deg`, spanning `span` degrees. */
export const trailPath = (deg: number, span: number) => {
  const a = polar(OC.rOrbit, deg - span), b = polar(OC.rOrbit, deg);
  return `M${a.x} ${a.y} A${OC.rOrbit} ${OC.rOrbit} 0 0 1 ${b.x} ${b.y}`;
};

export type Accent = "none" | "compite" | "crea" | "conecta" | "all";
type PoseAxis = { x: number; y: number; d: number; o: number };
export type Pose = { land: PoseAxis; port: PoseAxis; acc: Accent };

/** x,y = centre in % of the stage; d = diameter in cqw (% of stage width); o = opacity. */
const P = (land: [number, number, number, number], port: [number, number, number, number], acc: Accent = "none"): Pose => ({
  land: { x: land[0], y: land[1], d: land[2], o: land[3] },
  port: { x: port[0], y: port[1], d: port[2], o: port[3] },
  acc,
});

/** One pose per slide id. A scene may own its own composition by setting o=0 and drawing with <OrbitNode>. */
export const POSES: Record<string, Pose> = {
  portada: P([68, 50, 50, 1], [50, 36, 112, 1], "all"),
  gracias: P([80, 52, 44, 0.9], [84, 78, 80, 0.5]),
  etapa: P([50, 50, 40, 0], [50, 50, 80, 0], "all"),
  cifras: P([92, 14, 30, 0.5], [88, 10, 56, 0.35]),
  "copa-col": P([97, 94, 28, 0.55], [92, 96, 70, 0.4], "compite"),
  "copa-uni": P([3, 94, 28, 0.55], [8, 96, 70, 0.4], "compite"),
  "htc-1": P([96, 6, 26, 0.55], [90, 4, 64, 0.4], "crea"),
  "htc-2": P([97, 96, 26, 0.55], [92, 97, 64, 0.4], "crea"),
  conecta: P([4, 92, 28, 0.55], [8, 94, 70, 0.4], "conecta"),
  huella: P([24, 50, 46, 0.9], [50, 28, 90, 0.7], "conecta"),
  somos36: P([93, 12, 24, 0.75], [86, 9, 56, 0.6]),
  voces: P([94, 12, 26, 0.65], [88, 8, 58, 0.45]),
  dos7: P([94, 14, 30, 0.7], [88, 10, 60, 0.5], "all"),
  cierre: P([50, 28, 36, 1], [50, 22, 96, 0.9], "all"),
};
export const DEFAULT_POSE: Pose = P([92, 14, 30, 0.4], [88, 10, 56, 0.3]);
