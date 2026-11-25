# Estado de implementación

## Aplicación

La base técnica está implementada: App Router, motor compartido para 13/14 slides, IDs estables, configuración tipada, validación editorial, privacidad por token, rutas para PDF/medios privados, modo estático, exportación local con Playwright, variantes responsive, navegación por teclado/táctil, movimiento reducido, fuentes locales y guía de operación. Los archivos publicados de esta edición no se generan automáticamente en cada solicitud.

El HTML se conserva intacto en `references/` y sus recursos C3 se extrajeron a `public/brand/`. Se usan las tres órbitas, transiciones circulares y colores de capítulos del prototipo; el motor y los contenidos quedaron desacoplados. La disposición se refinó para escritorio y móvil a partir de la inspección visual y las pruebas de 390 px.

La migración visual aún no equivale a una reproducción cuadro por cuadro de todas las secuencias del HTML: quedan por trasladar y revisar algunas animaciones particulares por slide, ensamblajes fotográficos y el ritmo de revelación. La galería tipada ya permite configurar fotos y recorrerlas; el contenido real y su revisión visual dependen de que se entreguen los medios aprobados.

## Estado editorial 2026

La edición 2026 sigue en borrador. Por solicitud del equipo, `/2026` muestra una vista pública de revisión marcada como tal, no indexable y con pendientes visibles. Cualquiera con el enlace puede acceder; no debe compartirse fuera del equipo si los borradores son sensibles. No se sustituyó información pendiente por evidencia inventada. Las fichas empresariales siguen sin aprobar y no se emiten enlaces empresariales ni PDFs privados.

Para cambiar el estado hay que aportar y aprobar el contenido requerido, validar logos/permisos/contactos, ejecutar `npm run content:validate -- --edition 2026 --publish` y luego generar, revisar y versionar los PDFs. La revisión editorial no es parte de una publicación automática.

## Límites operativos que deben conocerse

- Los enlaces son credenciales transferibles: cualquiera que los reciba puede reenviarlos.
- La revocación de configuración basada en archivo entra en vigor al desplegar de nuevo; no hay almacenamiento dinámico para invalidación inmediata.
- El repositorio es público. `.gitignore` excluye los archivos reales de `private/pdfs/` y `private/media/`; no versionar datos de destinatarios aprobados. Las rutas privadas de Vercel requieren un origen privado para esos archivos antes de activar experiencias reales.
- ImageKit es opcional y su endpoint está preparado; faltan la configuración real de la cuenta y la carga de medios definitivos.
- El código está en el repositorio público `C3-SV/c3-rewind`, rama `main`; la vista de revisión se sirve en `https://c3-rewind.vercel.app/2026`. El dominio oficial de C3 todavía no está configurado.
- El HTML adjunto y el guion definen narrativa/estilo, pero faltan datos, fotos, testimonios y logos empresariales definitivos. La forma de slides y el sistema de navegación están listos para recibirlos.

## Verificación automatizada

Los comandos `npm test`, `npm run typecheck`, `npm run build` y `npm run test:e2e` cubren esquemas, estados editoriales, hash de contenido, tokens, bloqueo de publicación, navegación, respuestas privadas, viewport móvil y PDF estático de 13/14 páginas. Consultar este documento de nuevo cuando la ficha editorial real esté disponible, porque su PDF y su enlace requieren una nueva validación y generación.
