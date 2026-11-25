# Notas de revisión final (frontend-design)

Pedido del usuario: usar la guía frontend-design como revisión al final. Checklist a aplicar slide por slide, con capturas:

- Una sola cosa memorable por slide; el resto, quieto y disciplinado.
- Evitar tics de plantilla: kicker en MAYÚSCULAS sobre cada titular, metadatos unidos con «·», «→» en todos los botones, números 01/02/03 donde el contenido no es una secuencia, un solo radio y una sola sombra para todo, tarjetas idénticas, un acento en una sola palabra del titular.
- Tipografía como protagonista (escala dramática, pesos con intención), líneas < 80 caracteres.
- Movimiento: una secuencia orquestada por slide; nada de fade-up en cada bloque ni hover en todo.
- Estructura visual (bordes, etiquetas, numeración) solo si codifica información.
- Copy: voz activa, CTA que dice qué ocurre, nombres consistentes en todo el flujo; dato antes que adjetivo.
- Piso de calidad: móvil, foco visible, movimiento reducido, contraste ≥ 4.5:1.

## Hallazgos (se completa tras el workflow)

### Revisión (24 nov 2026)
Verificado: tsc limpio, 20 tests unitarios y 14 e2e (escritorio + móvil, PDF 13/14 páginas, navegación rápida, privacidad) en verde. Capturas 1600×900 y 390×844 de las 13 slides generales y de Gracias/Tu huella en versión empresa.

Corregido en esta pasada
- Cifras: la «N» hueca gigante del odómetro leía como una letra; ahora termina en «00».
- Gracias (móvil): «Gracias» se salía del lienzo; ahora escala por ancho.
- Conecta (móvil): la frase final se pisaba con el conector; ancho acotado.
- Portada: el carrusel chocaba con los botones; el fade de la derecha llega antes.
- Vista estática/PDF: el escenario medía 0 px de ancho (páginas invisibles) y la impresión era lenta y de 16 MB; corregido, fotos reducidas a 2000 px, grano desactivado al imprimir (≈10 MB, ~22 s).
- Escenas: `overflow: clip` en la raíz; el botón de capítulo sigue accesible en móvil.

Pendiente / a vigilar (con la guía frontend-design)
- Tics de plantilla que aún aparecen en varias slides: kicker en MAYÚSCULAS sobre el titular, «·» entre metadatos, «→» en botones y enlaces «Ver Compite →». Conviene quitar la mitad y dejar el kicker solo donde identifica la línea.
- Una sola cosa memorable por slide: Portada, Somos 36 y Etapa lo logran; Cifras y Voces siguen dependiendo de placeholders (el texto pendiente se ve enorme en Voces).
- Fotos: solo hay 2 reales (Copa y HTC); el resto son marcos diseñados. Al llegar fotos, revisar recortes (`focalPoint`).
- Móvil: Gracias, Etapa, Somos 36 y Voces tienen decoración que sobresale del lienzo (recortada) y Gracias/Voces ~5% más altas que el viewport.
- Falta una pasada manual de movimiento (tiempos y pausas) en navegador real; las capturas solo muestran fotogramas.
- Ya no se usan agentes grandes: ajustes futuros se hacen en línea o con Haiku.
