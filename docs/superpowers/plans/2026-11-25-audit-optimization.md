# C3 Rewind: auditoría y optimización

**Objetivo:** conservar identidad y narrativa, reducir trabajo invisible y garantizar que cada ruta privada y PDF solo entregue contenido autorizado y aprobado.

**Decisión:** mejorar el motor existente, sin nueva infraestructura ni dependencias. Se descartan reescrituras, bibliotecas de animación y duplicación por empresa. El usuario autoriza auditar, priorizar e implementar; no desplegar ni añadir funciones sociales.

## Prioridades y alcance

- [x] P1 / esfuerzo medio: probar y corregir filtros editoriales antes de serializar contenido; alinear permisos de página, imágenes y PDF. Archivos: `src/content`, `src/server`, rutas y pruebas unitarias.
- [x] P1 / esfuerzo bajo: corregir pausa global/móvil, foco en controles ocultos y fragmentos URL inválidos. Archivos: player, hook, navegación, contexto, estilos y e2e.
- [x] P1 / esfuerzo medio: medir DOM y recursos; montar escena actual, vecinas y saliente; preparar imágenes de ese conjunto. Mantener todas las páginas en render estático. Archivos: player, primitivas y e2e.
- [x] P2 / esfuerzo bajo: reducir variantes de fuentes a los caracteres usados y esperas excesivas en Somos36; verificar composiciones móvil/escritorio y movimiento reducido.
- [x] P1 / esfuerzo medio: centralizar configuración privada fuera del JSON de ejemplo público, reforzar CLI y exportación PDF; documentar incorporación sin datos inventados.
- [x] Validación: pruebas unitarias, TypeScript, navegador desktop/móvil, PDFs de 13/14 páginas, build de producción y comparación medible con límites explícitos.

## Riesgos a comprobar

Navegación rápida durante transiciones; hash inválido; pausa antes de cambiar de slide; modo de movimiento reducido; fotos aún sin cargar al exportar; configuración privada sin aprobar; token revocado; datos pendientes serializados; fotografías privadas en contenido general.

## Condiciones de trabajo

El directorio no expone metadatos Git estándar (`git status` responde que no es un repositorio). Se modifica el checkout actual sin commits ni operaciones destructivas. Las métricas locales no equivalen a Core Web Vitals de usuarios reales. El lanzador Impeccable no está disponible por permisos de caché/red: se usan los documentos visuales existentes y Playwright.

Validación y límites registrados en docs/audit-2026-11-25.md. Metadatos Git localizados posteriormente en .gitdata; se respetan los cambios existentes.
