# PDF

Los documentos tienen una página horizontal 16:9 por slide activa, fondos preservados y diseño de impresión sin controles. Playwright genera los archivos en local y la ruta protegida solo entrega el archivo cuya versión coincide con el hash del contenido y destinatario actual.

1. Completa la ficha y medios aprobados.
2. Arranca `npm run dev`.
3. Ejecuta `npm run pdf:general -- --edition 2026`, `npm run pdf:recipient -- --edition 2026 <id>`, `npm run pdf:all -- --edition 2026` o `npm run pdf:edition -- 2026`.
4. Verifica páginas, tipografía y fotografías; conserva `private/pdfs/{año}-{id}.pdf` junto a su `.json` de metadatos.
5. Revisa el reporte de versión en `/2026/pdf` o la ruta PDF privada.

Los archivos privados están fuera de `public/`, dentro de `private/pdfs/`. Como el repositorio actual es público, Git ignora los PDFs generados y estos no llegan al deploy de Vercel. Por tanto, la descarga permanece bloqueada en producción. Antes de habilitarla, conectar almacenamiento privado compatible con S3 y entregar mediante una URL firmada de corta duración, o volver a alojar el código en un repositorio privado. No se ha integrado ese servicio. Deben caber dentro del límite de tamaño de funciones del plan contratado; optimizar imágenes y PDFs y validar el tamaño del artefacto de despliegue.

No se genera PDF bajo demanda. Si el hash no coincide, la ruta falla cerrada y devuelve 404 genérico hasta regenerar y desplegar los archivos actualizados. La generación requiere que el servidor local permita acceder a la ruta de previsualización de desarrollo.
