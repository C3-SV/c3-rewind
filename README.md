# C3 Rewind

Aplicación Next.js para la experiencia anual de C3 Rewind. El motor de presentación es compartido por las ediciones generales y las experiencias privadas; contenido, configuración de destinatarios y recursos se mantienen fuera de los componentes.

## Estado de esta edición

La edición 2026 **no está editorialmente lista para distribución**. `/2026` muestra una vista pública de revisión, marcada y no indexable, para que el equipo revise las slides y pendientes. Cualquier persona con el enlace puede verla. Las rutas personalizadas y los PDFs siguen bloqueados hasta aprobar el contenido. No hay tokens reales ni PDFs privados versionados.

## Requisitos y ejecución local

- Node.js 20.9 o superior (Active LTS recomendado).
- npm.

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Abre `http://localhost:3000/2026`. La raíz redirige a la edición establecida en `REWIND_LATEST_EDITION`. El selector de previsualización local está en `/dev/preview/2026/general` y `/dev/preview/2026/<id-interno>`; esta ruta responde 404 en producción.

## Rutas

- `/` redirige a la edición más reciente.
- `/{edicion}` presenta la edición general.
- `/{edicion}/pdf` sirve el PDF general protegido por estado editorial y versión.
- `/{edicion}/p/{token}` valida el token en el servidor y presenta una única ficha privada.
- `/{edicion}/p/{token}/pdf` aplica la misma autorización al PDF.
- `/dev/preview/{edicion}/{id-interno}` es exclusivamente local.

Los tokens son credenciales transferibles: quien recibe el enlace puede reenviarlo. La revocación invalida también la URL del PDF.

## Comandos habituales

```powershell
npm run typecheck
npm test
npm run test:e2e
npm run content:validate -- --edition 2026
npm run content:validate -- --edition 2026 --publish
npm run token:create -- --edition 2026 --recipient applaudo
npm run token:revoke -- --edition 2026 --recipient applaudo
npm run token:rotate -- --edition 2026 --recipient applaudo
npm run pdf:general -- --edition 2026
npm run pdf:recipient -- --edition 2026 applaudo
npm run pdf:all -- --edition 2026
```

Los comandos de token guardan solo el hash; muestran el secreto una vez en terminal. Mantener la salida fuera de logs, tickets y Git. No ejecutar hasta que la ficha haya sido aprobada. El script de PDF requiere que `npm run dev` esté activo; los PDFs se generan localmente en `private/pdfs/` y no se incluyen en `public/`.

## Contenido y empresas

- Ediciones y narrativa: `src/content/{año}/` (JSON validado por Zod).
- Fichas privadas: `src/server/private/recipients.json`; no mover a `public/` ni importar desde componentes cliente.
- Imágenes locales privadas: `private/media/{id}/`; no usar una URL pública para evidencia privada.
- Logos oficiales: `public/brand/`.
- Estados editoriales: `pending`, `preliminary`, `validated`, `approved`.

Guía operativa: [estado de implementación](docs/implementation-status.md), [validación editorial](docs/editorial-checklist.md), [arquitectura](docs/architecture.md), [privacidad](docs/privacy.md), [PDF](docs/pdf.md) y [despliegue](docs/deployment-vercel.md).

## Referencias

El HTML de referencia se conserva sin cambios en `references/C3 Rewind 2026.html`; la hoja visual original extraída vive en `src/styles/rewind.css`. El guion editorial v3 tuvo prioridad para narrativa y datos, y el HTML más reciente para dirección visual. Los materiales de referencia no se sirven como rutas del sitio.
