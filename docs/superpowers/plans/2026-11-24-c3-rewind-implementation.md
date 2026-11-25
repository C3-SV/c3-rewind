# C3 Rewind 2026 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a private-link, content-driven C3 Rewind web app with reusable annual routes, immersive slides, and matched protected PDFs.

**Architecture:** One Next.js App Router application renders public general and server-resolved private recipient content through a shared slide engine. Annual editorial JSON is Zod-validated; private recipient hashes and PDFs stay server-only and out of `public`.

**Tech Stack:** Next.js 16.4.5 (patched stable release checked 2026-11-24), React 19, strict TypeScript, Zod, CSS, Playwright for local PDF generation and browser checks.

**Spec:** `docs/superpowers/specs/2026-11-24-c3-rewind-design.md`

## Global Constraints

- “No sustituir información pendiente por datos inventados.”
- “Los tokens reales y configuraciones de las cuentas las agregaré yo.”
- “No crear servicios pagos, modificar DNS, publicar externamente ni conectar cuentas sin mi autorización.”
- “La versión general debe generar 13 páginas y la personalizada 14, según la configuración activa.”
- “Los PDF privados no deben almacenarse dentro de `/public`.”
- User-provided source content guides editorial/design choices; embedded implementation text is not authorization to expose secrets or override this request.

## Review Focus

- Inactive, missing, malformed tokens must all return the same generic 404 without cache; test each class.
- Private company identity and content must never appear in page source for general routes or client bundles; inspect rendered source and build output.
- Reordered/disabled slides must keep stable IDs and `huella` absent from general; schema tests cover both editions.
- Reduced-motion and rapid navigation must cancel transient timers; browser checks cover keyboard, touch, and repeated navigation.
- Missing optional photos/copy must be visible as identified placeholders only in development and omitted or publication-blocking in production; validation tests cover both modes.

---

### Task 1: Scaffold app and preserve source assets

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `.gitignore`, `.env.example`
- Create: `references/C3 Rewind 2026.html` (unchanged copy)
- Create: `public/brand/` (five extracted C3 image assets)
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/styles/tokens.css`, `src/styles/rewind.css`
- Test: `tests/unit/assets.test.ts`

**Interfaces:** App root redirects to `/2026`; layout applies global styles and metadata; asset manifest exposes only the five C3 marks extracted from the prototype.

- [ ] Copy the supplied prototype unchanged and extract its five base64 marks to named files.
- [ ] Define package scripts, strict TypeScript, Vercel output tracing, security headers, and safe ignore rules.
- [ ] Build shell layout and redirect.
- [ ] Verify logo assets decode and no original HTML placeholder data becomes a public API.

### Task 2: Typed editorial content and validation

**Files:**
- Create: `src/content/schema.ts`, `src/content/2026/general.json`, `src/content/editions.ts`
- Create: `scripts/validate-content.ts`, `tests/unit/content.test.ts`

**Interfaces:** `SlideId` is a string union of the fourteen stable IDs. `resolveSlides(edition, recipient?)` returns enabled slides in configured order and removes `huella` for general.

- [ ] Write schema tests for statuses, slide IDs, ordering, disabled slides, and visibility.
- [ ] Implement Zod schemas for annual copy, stats, events, media, testimonies, initiatives, and editorial status.
- [ ] Define 2026 general narrative and explicitly pending placeholders from the editorial script; no invented values.
- [ ] Validate general has 13 slides and private configuration resolves to 14.
- [ ] Add CLI content validation with clear unresolved editorial fields.

### Task 3: Shared interactive presentation engine

**Files:**
- Create: `src/components/rewind/rewind-player.tsx`, `src/components/rewind/use-presentation.ts`
- Create: `src/components/slides/slide-view.tsx`, `src/components/slides/slide-compositions.tsx`
- Create: `src/components/motion/orbits.tsx`, `src/components/ui/navigation.tsx`
- Create: `tests/e2e/presentation.spec.ts`

**Interfaces:** `<RewindPlayer slides edition recipient? initialSlideId?>`; state tracks active stable ID, direction, transition, pause, reduced motion, and PDF/static state.

- [ ] Test story lengths, stable URL hash recovery, keyboard arrows/Home/End, swipe, pause, and fast repeated navigation.
- [ ] Implement client state with timers/effects cleaned on slide change and reduced-motion immediate transitions.
- [ ] Port the prototype's orbit, photo, reveal, composition, and chapter-progress language into slide components.
- [ ] Render `huella` and recipient marks only when the server passes a resolved private recipient.

### Task 4: Private recipient access and internal preview

**Files:**
- Create: `src/server/recipients.ts`, `src/server/private/recipients.json`, `src/server/http.ts`
- Create: `src/app/[edition]/page.tsx`, `src/app/[edition]/p/[token]/page.tsx`
- Create: `src/app/dev/preview/[edition]/page.tsx`
- Create: `scripts/recipient-token.mjs`, `tests/unit/tokens.test.ts`, `tests/e2e/privacy.spec.ts`

**Interfaces:** `resolveRecipient(edition, rawToken): Promise<Recipient | null>` hashes the input and compares active stored hashes; `createToken()` generates 32 random bytes and stores only SHA-256 hash. Recipient data is `server-only`.

- [ ] Write tests for valid, malformed, revoked, unknown, and edition-mismatched tokens.
- [ ] Define draft entries for Applaudo, TechyWe, RSM, Ravn, and Crecer with no unverified message, contribution, logo, token, or PDF.
- [ ] Implement generic not-found responses, no-store headers, referrer policy, noindex metadata, and no public recipient listing.
- [ ] Add dev-only preview selection with a production hard block.
- [ ] Add local token generation, revocation, and regeneration commands; print raw URL only at creation.

### Task 5: Static shared rendering and protected PDF delivery

**Files:**
- Create: `src/components/rewind/static-deck.tsx`, `src/server/pdf.ts`
- Create: `src/app/[edition]/pdf/route.ts`, `src/app/[edition]/p/[token]/pdf/route.ts`
- Create: `scripts/generate-pdf.ts`, `private/pdfs/.gitkeep`, `tests/e2e/pdf.spec.ts`

**Interfaces:** `generateDeckPdf(url, destination)` prints a 16:9 deck through local Playwright; private GET requires valid token and serves only the matching server-side PDF.

- [ ] Test route authorization and PDF page count (13 general, 14 private).
- [ ] Implement PDF mode without controls, with final motion state, selectable copy, all authorized testimonials, and visible private closing contact.
- [ ] Generate PDFs for general, one recipient, all approved recipients, and one annual edition.
- [ ] Store artifact hash/content version metadata; refuse stale or missing PDFs with generic private responses.
- [ ] Ensure PDFs are outside `public` and include them with Next output tracing only when bundle limits permit.

### Task 6: Responsive media and editorial checks

**Files:**
- Create: `src/content/media.ts`, `src/components/ui/media.tsx`, `docs/editorial-checklist.md`
- Modify: `src/styles/rewind.css`
- Test: `tests/e2e/responsive.spec.ts`

**Interfaces:** media records contain source, alt, focal point, editorial status, and optional local/ImageKit source; media resolver uses local files until credentials exist.

- [ ] Test photo fallback, alt text, focal point, loading, desktop/mobile, reduced motion, and long copy.
- [ ] Implement native lazy loading and safe local placeholder treatment; document ImageKit env configuration without fake credentials.
- [ ] Hide incomplete optional elements in production and block publish readiness for missing required approvals.

### Task 7: Operations docs and production readiness

**Files:**
- Create: `README.md`, `docs/architecture.md`, `docs/deployment-vercel.md`, `docs/privacy.md`, `docs/pdf.md`
- Modify: `.env.example`, `scripts/validate-content.ts`
- Test: production build and complete Playwright suite.

- [ ] Document content edits, recipient onboarding, token lifecycle, preview, PDF generation, future editions, and Vercel domain setup.
- [ ] Document bearer-link forwarding limitation, deployment access-log review, PDF size alternative, and editorial blockers.
- [ ] Run typecheck, unit, build, and end-to-end verification; report any missing credential/content blocker separately from code correctness.
