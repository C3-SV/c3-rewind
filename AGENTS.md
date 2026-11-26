<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Git en este entorno

Este checkout guarda los metadatos en `.gitdata`, no en `.git`. Ejecuta Git desde la raíz con `git --git-dir=.gitdata --work-tree=.`; por ejemplo, `git --git-dir=.gitdata --work-tree=. status`. No crees ni renombres `.git` durante una sesión de Codex: el sandbox puede dejar de iniciar procesos. En un checkout convencional que tenga `.git`, usa Git normalmente.
