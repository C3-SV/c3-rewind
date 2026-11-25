"use client";

import type { ComponentType } from "react";
import { PortadaScene } from "./portada.tsx";
import { GraciasScene } from "./gracias.tsx";
import { EtapaScene } from "./etapa.tsx";
import { CifrasScene } from "./cifras.tsx";
import { CopaColScene } from "./copa-col.tsx";
import { CopaUniScene } from "./copa-uni.tsx";
import { Htc1Scene } from "./htc-1.tsx";
import { Htc2Scene } from "./htc-2.tsx";
import { ConectaScene } from "./conecta.tsx";
import { HuellaScene } from "./huella.tsx";
import { Somos36Scene } from "./somos36.tsx";
import { VocesScene } from "./voces.tsx";
import { Dos7Scene } from "./dos7.tsx";
import { CierreScene } from "./cierre.tsx";

export type SceneDef = { Scene: ComponentType; theme: string; chapterAccent?: "compite" | "crea" | "conecta" };
/** Slide id → bespoke scene. Backgrounds/themes are CSS ([data-theme]); scenes may also draw their own backdrop inside .story-scene. */
export const SCENES: Record<string, SceneDef> = {
  "portada": { Scene: PortadaScene, theme: "p0" },
  "gracias": { Scene: GraciasScene, theme: "gr" },
  "etapa": { Scene: EtapaScene, theme: "et" },
  "cifras": { Scene: CifrasScene, theme: "ci" },
  "copa-col": { Scene: CopaColScene, theme: "co" },
  "copa-uni": { Scene: CopaUniScene, theme: "cu" },
  "htc-1": { Scene: Htc1Scene, theme: "h1" },
  "htc-2": { Scene: Htc2Scene, theme: "h2" },
  "conecta": { Scene: ConectaScene, theme: "cn" },
  "huella": { Scene: HuellaScene, theme: "hu" },
  "somos36": { Scene: Somos36Scene, theme: "eq" },
  "voces": { Scene: VocesScene, theme: "vo" },
  "dos7": { Scene: Dos7Scene, theme: "fu" },
  "cierre": { Scene: CierreScene, theme: "cl" },
};
