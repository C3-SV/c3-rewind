# Revisión editorial y publicación

`npm run content:validate -- --edition 2026` muestra los estados y notas aún abiertos. `--publish` aplica el bloqueo para publicación. No reemplazar pendientes con cifras aproximadas, logos no autorizados, fotos de stock presentadas como evento, citas inventadas o texto no confirmado.

## Versión general

- Aprobar texto, nombres, cifras exactas y derechos de imagen/citas.
- Confirmar materiales oficiales y disponibilidad de fotografías reales.
- Resolver notas de cada slide y cambiar estado a `approved`.
- Confirmar exactamente 13 slides activas para el público general; `huella` debe permanecer solo para destinatarios.
- Ejecutar `npm run content:validate -- --edition 2026 --publish`.
- Habilitar `REWIND_GENERAL_PUBLISHED=true` solo en el entorno de producción tras aprobar.

## Versión empresarial

Completar una ficha individual en `src/server/private/recipients.json`: nombre oficial y comercial, logo, evento(s), aporte y resultado, impacto, fotos autorizadas, personas/testimonios con permisos, mensajes de apertura y cierre, contacto y responsable C3. Publicación exige ficha `published`, token activo, aportes descritos, logo, mensaje de bienvenida/cierre, contacto y por lo menos una foto aprobada. Validar con `npm run content:validate -- --edition 2026 --recipient <id>` y generar PDF solo después.

Los borradores iniciales Applaudo, TechyWe, RSM, Ravn y Crecer no implican apoyo confirmado ni están disponibles públicamente.

## Cierre de edición

Ejecutar typecheck, pruebas unitarias y de navegador, revisión visual escritorio/móvil, y comprobar 13 páginas general y 14 privadas. Contrastar los PDF contra la versión del contenido antes del despliegue. Mantener indexación apagada salvo autorización editorial explícita para la versión general.
