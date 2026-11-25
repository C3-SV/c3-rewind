# C3 Rewind visual system

Full art direction and the scene contract live in `docs/art-direction.md`. Summary:

## Mode
Experience: one immersive story at a time; HUD and controls stay quiet while each slide's composition leads.

## Authority
Design System C3 (artifact «C3») for identity; `references/C3 Rewind 2026.html` for composition/motion intent; c3.com.sv for the current digital language; guion v3 (`src/content/2026/general.json`) for narrative.

## Idea: the symbol in motion
The orbit field is built from the isotipo's geometry (crescent r175/r85, node orbit r150, Compite/Conecta at ±27°, Crea at the centre, navy halos that "bite"). It glides between per-slide poses, turns into the three lines in «Una nueva etapa», and reunites in the close. The "bite" (a node seated in a photo/panel corner) is the signature device.

## Motion (4 levels)
Narrative (iris from the click point + orbit poses + shared elements) · internal (staggered reveals, counters, assemblies, masks) · ambient (slow carousel/orbits, pausable) · micro (hover/focus). Everything resolves to its final frame for PDF and `prefers-reduced-motion`.

## Layout
One unit per slide (`1cqw`, larger in portrait). Scenes use `em`, grid layouts and `@container rw (max-aspect-ratio: 1/1)` for purpose-built mobile compositions. Static/PDF = one 1600×900 page per slide.

## Rules
Navy canvas; Montserrat 800/900 display + Poppins body; line colours Compite blue, Crea teal, Conecta purple; Copa blue+purple; HTC orange+navy. Official logos only (`public/brand`). No fake photos or data: photo slots are designed frames until `edition.photos` is filled; pending data shows quietly only in review/dev.
