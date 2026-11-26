# Configuración privada por empresa

La presentación y sus 14 slides privadas se comparten. La ficha de la empresa aporta el nombre y logo de apertura, agradecimiento, eventos apoyados, evidencia, personas, testimonios y cierre. No se copia una página ni un componente por empresa.

## Origen de los datos

`src/server/private/recipients.json` es un catálogo público de borradores vacíos. No agregar allí datos reales, hashes activos ni contenido confidencial. Para trabajar localmente, copiarlo a `src/server/private/recipients.local.json`, que Git ignora, y establecer en `.env.local`:

```dotenv
REWIND_RECIPIENTS_FILE=src/server/private/recipients.local.json
```

Next y los comandos de validación, token y PDF leen el mismo archivo. Los comandos cargan `.env.local`. Si se configura otro archivo, debe permanecer fuera de `public/`; para Next debe estar dentro del proyecto. El archivo configurado se incluye en el artefacto de servidor mediante file tracing. Un archivo ignorado no llega por sí solo a un build remoto: hay que suministrarlo de forma privada al entorno que construye y ejecuta la aplicación. No se ha conectado un servicio para hacerlo ni se han añadido fichas reales.

## Campos

| Campo | Uso y aprobación |
| --- | --- |
| `id`, `edition` | Identidad interna única por año. `id` usa minúsculas, números y guiones. |
| `commercialName`, `officialName` | Nombre visible y nombre oficial opcional. El nombre oficial no se envía al navegador. |
| `logo` | Nombre de imagen local, o URL HTTPS del logo público oficial. El logo local se guarda junto a los medios de la empresa. |
| `status` | `draft`, `review` o `published`. Publicar requiere completar y aprobar la ficha. |
| `tokenHash`, `active` | Los gestiona el comando de credenciales. No guardar el token claro en el JSON. |
| `welcomeMessage`, `closingMessage` | Mensajes aprobados y no vacíos de agradecimiento y cierre. |
| `supportedEvents` | IDs internos de los eventos que la empresa realmente apoyó. |
| `enabledByEvent` | Cada evento apoyado debe tener el mismo ID, tipo de aporte y descripción no vacía. No declarar aportes sin respaldo. |
| `impact` | Cifras y etiquetas con estado editorial. Solo `approved` se envía a la experiencia final. |
| `media` | Imágenes con nombre de archivo, texto alternativo y estado editorial. Solo se sirve evidencia `approved`. No admite URL pública ni directorios. |
| `people` | Personas reconocidas con nombre y rol, revisadas como parte de la aprobación de la ficha. |
| `testimonials` | Texto, persona y `permission`. Los testimonios sin permiso no se envían al navegador ni al PDF. |
| `contactDestination` | Destino aprobado de cierre, HTTPS o `mailto:`. |
| `c3Owner` | Responsable interno. No se envía al navegador. |

Los tipos de aporte admitidos son `financial`, `venue`, `prizes`, `mentors`, `judges` y `other`. Una imagen local usa AVIF, JPEG, PNG o WebP y vive en `private/media/{año}/{id}/{archivo}`. El logo local no necesita duplicarse en la lista de evidencia. Nunca poner evidencia confidencial en `public/` ni en un CDN público: una bandera `private` no protege un archivo que ya tiene una URL pública. Las fotos de la edición general son recursos públicos; la evidencia protegida pertenece a `media` de la empresa.

## Revisar, emitir y revocar

1. Completar únicamente datos y medios aprobados. Revisar en `/dev/preview/{año}/{id}`; estas rutas responden 404 en producción.
2. Ejecutar `npm run content:validate -- --edition 2026 --recipient <id> --publish`. La edición privada también exige aprobar su slide exclusiva `huella`.
3. Emitir con `npm run token:create -- <id> --edition 2026`. Si ya existe un enlace, usar explícitamente `token:rotate`; `create` no lo reemplaza. Guardar el enlace mostrado fuera de Git y los logs.
4. Generar con `npm run pdf:recipient -- --edition 2026 <id>`. La exportación usa solo contenido final y falla si una imagen no carga. Revisar el PDF antes de distribuirlo.
5. Revocar con `npm run token:revoke -- <id> --edition 2026`. No ejecutar comandos de credenciales simultáneamente sobre el mismo archivo. En despliegues con configuración incluida en el build, distribuir la nueva configuración requiere reconstruir y desplegar.

La página, sus imágenes y el PDF comparten la validación del token y el bloqueo editorial. Los hashes no se comparten entre destinatarios activos de una edición. No existe un listado público ni un selector de empresas en producción. El enlace sigue siendo una credencial transferible: cualquier persona que lo reciba puede usarlo.
