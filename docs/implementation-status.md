# Estado de implementación

## Aplicación

La base técnica está implementada: App Router, motor compartido para 13/14 slides, IDs estables, configuración tipada, validación editorial, privacidad por token, rutas para PDF/medios privados, modo estático, exportación local con Playwright, variantes responsive, navegación por teclado/táctil, movimiento reducido, fuentes locales y guía de operación. Los archivos publicados de esta edición no se generan automáticamente en cada solicitud.

El HTML se conserva intacto en `references/` y sus recursos C3 se extrajeron a `public/brand/`. Se usan las tres órbitas, transiciones circulares y colores de capítulos del prototipo; el motor y los contenidos quedaron desacoplados. La disposición se refinó para escritorio y móvil a partir de la inspección visual y las pruebas de 390 px.

La migración visual aún no equivale a una reproducción cuadro por cuadro de todas las secuencias del HTML: quedan por trasladar y revisar algunas animaciones particulares por slide, ensamblajes fotográficos y el ritmo de revelación. La galería tipada ya permite configurar fotos y recorrerlas; el contenido real y su revisión visual dependen de que se entreguen los medios aprobados.

## Estado editorial 2026

La edición general queda bloqueada en producción. El validador muestra información pendiente por slide; no se sustituyó con cifras o evidencia inventadas. Las fichas de Applaudo, TechyWe, RSM, Ravn y Crecer son borradores: no acreditan apoyo, no contienen logos/eventos aprobados y no tienen tokens. Por ello no se emiten enlaces empresariales ni PDFs de distribución.

Para cambiar el estado hay que aportar y aprobar el contenido requerido, validar logos/permisos/contactos, ejecutar `npm run content:validate -- --edition 2026 --publish` y luego generar, revisar y versionar los PDFs. La revisión editorial no es parte de una publicación automática.

## Límites operativos que deben conocerse

- Los enlaces son credenciales transferibles: cualquiera que los reciba puede reenviarlos.
- La revocación de configuración basada en archivo entra en vigor al desplegar de nuevo; no hay almacenamiento dinámico para invalidación inmediata.
- Los PDFs privados se versionan dentro del repositorio privado para que Vercel los empaquete fuera de `public/`; restringir acceso al repositorio y vigilar el límite de tamaño de la función.
- ImageKit es opcional y su endpoint está preparado; faltan la configuración real de la cuenta y la carga de medios definitivos.
- No se hicieron cambios DNS, despliegues, publicación externa ni conexión de cuentas.
- El HTML adjunto y el guion definen narrativa/estilo, pero faltan datos, fotos, testimonios y logos empresariales definitivos. La forma de slides y el sistema de navegación están listos para recibirlos.

## Verificación automatizada

Los comandos `npm test`, `npm run typecheck`, `npm run build` y `npm run test:e2e` cubren esquemas, estados editoriales, hash de contenido, tokens, bloqueo de publicación, navegación, respuestas privadas, viewport móvil y PDF estático de 13/14 páginas. Consultar este documento de nuevo cuando la ficha editorial real esté disponible, porque su PDF y su enlace requieren una nueva validación y generación.
