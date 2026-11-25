# C3 Rewind 2026 Product Design

## Intent

Turn the latest C3 Rewind HTML into the reusable 2026 annual presentation app with a general edition, private company editions, and matched offline-generated PDFs. The user explicitly asked to proceed through implementation after analysis and planning.

## Goals

- Preserve the latest HTML's fourteen stable slide identities, orbit motif, C3 colors, motion, and editorial placeholders.
- Keep the general edition at thirteen slides and private editions at fourteen, with `huella` private-only.
- Load annual content from typed, validated files, with explicit editorial status.
- Enforce bearer-token access and no-store behavior for all private pages and PDFs.
- Support secure local token creation/revocation without storing raw tokens.
- Generate 16:9 PDFs locally with Playwright and distribute them only after server-side authorization.
- Leave the workspace runnable and deployment-ready without connecting accounts or deploying.

## Non-goals

- Publishing DNS, Vercel, or ImageKit credentials; paid storage; database; CMS/admin dashboard; finalized editorial data; invented event proof.
- Guaranteeing a recipient link cannot be forwarded. It is a bearer credential.

## Approaches considered

1. Keep a single static HTML file and add route wrappers. Fastest, but not maintainable for annual content, PDF generation, or server-only recipient resolution.
2. Use one Next.js App Router app, typed annual content, server-only recipient records, a shared client presentation engine, and generated private PDFs. Chosen because it matches the requested stack and separates public story content from private access while avoiding another service.
3. Add a database or private object store now. More flexible for revocation and large media, but it adds cost and account setup before C3 credentials or final assets exist.

## Architecture decisions

- Next.js App Router with strict TypeScript, current patched stable major, Zod content validation, CSS for composed motion, and Playwright only for local PDF generation and end-to-end checks.
- `src/content/<edition>` stores public annual content. Server-only recipient records are read only by server route loaders. Tokens are 256-bit random strings; SHA-256 hashes are stored, never originals.
- The token tool prints a new link once and stores only its hash. Revocation disables the record; regeneration replaces the hash and requires a deployment. The app returns the same generic not-found response for invalid, disabled, and unknown tokens.
- The same slide render path supports interactive and PDF modes. Private PDFs live outside `public/`, are included in the server output only when small enough, and are served by a token-validated Route Handler with `private, no-store` and `X-Robots-Tag` headers. If artifacts exceed Vercel's function limit, use private S3-compatible storage as a separately approved future change.
- Development-only preview controls are absent from production route trees. Production general publication and each private recipient require approved content.
- No analytics or third-party embeds are added. All source-provided image assets are local until C3 configures ImageKit.

## Constraints and open items

- The Google Doc and older prototype were read using the user's connected personal Drive account. Their content is reference material; the user's prompt remains the implementation authorization and higher-level constraint.
- Company messages, event contributions, images, exact impact figures, testimonials, publication approvals, and contact destinations remain editorially pending.
- Vercel and ImageKit credentials, DNS, and production recipient links will be provided by C3. Deployment logs may still capture requested URL paths at the platform edge; application code will avoid logging private paths and the deployment owner must review provider log retention/redaction.
- Vercel's documented standard function bundle limit is 250 MB uncompressed; PDF packaging must be checked on the final build. Playwright's browser binary is local development tooling and is not bundled into production functions.

## Source references

- Latest prototype: `references/C3 Rewind 2026.html` (copied unchanged from the supplied local file).
- Editorial source: C3 Rewind 2026 — Guion editorial v3, read from the connected Drive account.
- Prior prototype v3: C3_Rewind_2026_Prototipo_v3.html, read from the connected Drive account.
- C3 design and current public copy: https://c3.com.sv/
- Next.js November 2026 security release: https://nextjs.org/blog/november-2026-security-release
- Vercel function limits: https://vercel.com/docs/functions/limitations

