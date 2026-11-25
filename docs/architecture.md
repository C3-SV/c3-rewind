# Arquitectura

## Aplicación compartida

Next.js App Router resuelve rutas y contenido en el servidor. `src/components/rewind` maneja estado de navegación y URL; `src/components/slides` traduce contenido tipado a escenas; `src/components/motion` mantiene el motivo de órbitas; `src/components/ui` contiene los controles. El CSS conserva las composiciones específicas del HTML y agrega tokens compartidos y adaptaciones, sin framework de utilidades.

La navegación se apoya en IDs estables de slide (`portada`, `gracias`, `etapa`, `cifras`, `copa-col`, `copa-uni`, `htc-1`, `htc-2`, `conecta`, `huella`, `somos36`, `voces`, `dos7`, `cierre`). Los JSON controlan orden, activación y contenido. `huella` es privada y el resolver produce 13 slides generales o 14 privadas. El bloque `gallery` implementa navegación manual accesible en pantalla y representa todas las imágenes aprobadas en el render estático/PDF.

## Datos y límites de confianza

Zod valida JSON de edición y fichas. `src/server/private/recipients.json`, `private/media/` y `private/pdfs/` solo se importan o leen en módulos del servidor. El componente cliente recibe únicamente la ficha ya autorizada para la URL actual. No hay endpoint público de listado. Cada edición usa un hash SHA-256 de un token aleatorio de 256 bits.

Los estados editoriales permiten revisión gradual. En desarrollo se marcan pendientes; producción filtra bloques no aprobados y rechaza una edición o una empresa que no cumpla el umbral definido. La lista exacta de pendientes se obtiene con `npm run content:validate -- --edition 2026`.

## Decisiones del stack

- Next.js 16 App Router y React 19; TypeScript estricto y Zod.
- CSS propio para preservar máscaras, capas, órbitas, escenas y medios; se omite Tailwind porque no aporta al CSS original y sumaría una capa de configuración.
- Sin GSAP ni Motion runtime: el recorrido es manual y las secuencias existentes son CSS; el estado de transición tiene un solo temporizador cancelable.
- Playwright se usa solo durante generación local y pruebas. Los PDFs son estáticos, no se generan en cada petición.
- Sin base de datos ni servicio de medios obligatorio. El esquema de medios distingue `local` e `imagekit`; la URL pública se transforma con el endpoint opcional configurado y cae al `src` local hasta que dicho endpoint esté disponible.

## Futuras ediciones

Agregar `src/content/2027/general.json`, registrar el año en el catálogo de ediciones y sumar fichas bajo ese año. Mantener IDs estables y ejecutar los validadores. No duplicar presentación ni aplicación por empresa. El `REWIND_LATEST_EDITION` dirige `/` a la edición actual.
