# Despliegue en Vercel

## Preparación

1. Mantener el repositorio privado.
2. Configurar el proyecto Vercel para Next.js y la rama aprobada.
3. Añadir variables de producción desde `.env.example`: `REWIND_LATEST_EDITION`, `REWIND_SITE_ORIGIN`, `REWIND_GENERAL_PUBLISHED=false`, `REWIND_INDEX_GENERAL=false` y, cuando aplique, `IMAGEKIT_URL_ENDPOINT`.
4. Antes de incluir credenciales reales, limitar y revisar los despliegues Preview: los JSON privados se empaquetan al construir. Producción rechaza borradores, y la vista de desarrollo responde 404.
5. Generar PDFs aprobados localmente y empaquetarlos fuera de `public/`; revisar el tamaño de la función.
6. Confirmar build y pruebas antes de asignar el dominio.

## Logs de acceso

Los tokens forman parte de la ruta privada. Next omite esas rutas del log de consola en desarrollo; Vercel, sin embargo, documenta que sus logs runtime registran la ruta real (`requestPath`). Mantener acceso a logs y despliegues limitado al equipo, revisar la retención de la cuenta y no habilitar un log drain sin redacción del segmento de token. Si la organización exige que ningún registro operativo contenga la ruta, debe acordarse un intercambio de enlace por sesión antes de usar enlaces privados.

## Dominio

En Vercel, añadir `rewind.c3.com.sv` como dominio del proyecto y seguir los registros DNS que indique el panel para esa cuenta. Los registros exactos dependen de la configuración del proyecto; no fijarlos en el repositorio. Activar HTTPS y configurar `REWIND_SITE_ORIGIN=https://rewind.c3.com.sv`.

No se han modificado DNS, creado servicios ni publicado el proyecto.

## Operación

Los archivos de `private/pdfs` y `private/media` se incluyen por las reglas de tracing de `next.config.ts`. Revisar artefacto desplegado para no superar el límite de función vigente del plan. Cuando se roten tokens o se cambie una ficha, construir y desplegar configuración nueva. Habilitar `REWIND_GENERAL_PUBLISHED` y la indexación solo después de aprobar la edición.
