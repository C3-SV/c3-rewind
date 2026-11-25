# Despliegue en Vercel

## Preparación

1. El repositorio `C3-SV/c3-rewind` es público por decisión del equipo. No versionar tokens, credenciales, PDFs privados ni medios protegidos.
2. Configurar el proyecto Vercel para Next.js y la rama aprobada.
3. La vista pública de revisión se activa por defecto, está marcada como borrador y no se indexa. Cualquiera con el URL puede verla. Añadir `REWIND_GENERAL_PREVIEW=false` para volver a bloquear ediciones no aprobadas; para publicar una edición final, aprobar el contenido, poner `REWIND_GENERAL_PUBLISHED=true` y luego habilitar `REWIND_INDEX_GENERAL=true` solo si se desea indexarla.
4. Añadir variables de producción desde `.env.example`: `REWIND_LATEST_EDITION`, `REWIND_SITE_ORIGIN`, `REWIND_GENERAL_PUBLISHED=false`, `REWIND_GENERAL_PREVIEW=true`, `REWIND_INDEX_GENERAL=false` y, cuando aplique, `IMAGEKIT_URL_ENDPOINT`.
5. El repo es público: no agregar fichas reales, hashes activos, medios privados ni PDFs. El código actual solo contiene borradores vacíos; las rutas empresariales y de PDF siguen bloqueadas. Antes de activarlas, conectar un origen privado para su configuración y archivos.
6. Los PDFs generados localmente quedan ignorados por Git y no llegan a Vercel. Revisar la estrategia de almacenamiento privado antes de habilitar la descarga.
7. Confirmar build y pruebas antes de asignar el dominio.

## Logs de acceso

Los tokens forman parte de la ruta privada. Next omite esas rutas del log de consola en desarrollo; Vercel, sin embargo, documenta que sus logs runtime registran la ruta real (`requestPath`). Mantener acceso a logs y despliegues limitado al equipo, revisar la retención de la cuenta y no habilitar un log drain sin redacción del segmento de token. Si la organización exige que ningún registro operativo contenga la ruta, debe acordarse un intercambio de enlace por sesión antes de usar enlaces privados.

## Dominio

En Vercel, añadir `rewind.c3.com.sv` como dominio del proyecto y seguir los registros DNS que indique el panel para esa cuenta. Los registros exactos dependen de la configuración del proyecto; no fijarlos en el repositorio. Activar HTTPS y configurar `REWIND_SITE_ORIGIN=https://rewind.c3.com.sv`.

El proyecto está desplegado en `https://c3-rewind.vercel.app/2026`. No se modificó DNS ni se asignó el dominio oficial.

## Operación

En esta configuración pública, los archivos reales de `private/pdfs` y `private/media` no se versionan y por eso no se incluyen en el deploy. No habilitar descargas ni fichas reales hasta conectar almacenamiento privado. Habilitar `REWIND_GENERAL_PUBLISHED` y la indexación solo después de aprobar la edición.
