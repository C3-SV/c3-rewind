# PDF

Los documentos tienen una página horizontal 16:9 por slide activa, fondos preservados y diseño de impresión sin controles. Playwright genera los archivos en local y la ruta protegida solo entrega el archivo cuya versión coincide con el hash del contenido y destinatario actual.

1. Completa la ficha y medios aprobados.
2. Arranca `npm run dev`.
3. Ejecuta `npm run pdf:general -- --edition 2026`, `npm run pdf:recipient -- --edition 2026 <id>`, `npm run pdf:all -- --edition 2026` o `npm run pdf:edition -- 2026`.
4. Verifica páginas, tipografía y fotografías; conserva `private/pdfs/{año}-{id}.pdf` junto a su `.json` de metadatos.
5. Revisa el reporte de versión en `/2026/pdf` o la ruta PDF privada.

Los archivos privados están fuera de `public/`, dentro de `private/pdfs/`, y se empaquetan mediante `outputFileTracingIncludes` para la función de ruta. Para que Vercel pueda incluirlos, el repositorio privado versiona el PDF generado junto a su metadato; limitar quién tiene acceso al repositorio. Deben caber dentro del límite de tamaño de funciones del plan de Vercel contratado; optimizar imágenes y PDFs. Antes de añadir más empresas, validar el tamaño del artefacto de despliegue. Si se supera el límite, migrar a un bucket privado compatible con S3 y entregar mediante URL firmada de corta duración. No se ha integrado ese servicio.

No se genera PDF bajo demanda. Si el hash no coincide, la ruta falla cerrada y devuelve 404 genérico hasta regenerar y desplegar los archivos actualizados. La generación requiere que el servidor local permita acceder a la ruta de previsualización de desarrollo.
