---
version: alpha
name: JCMF Constructora — Minimal
description: Arquitectura serena, espacio editorial y trazos que se convierten en materia.
colors:
  primary: '#245c88'
  background: '#f4f7fa'
  surface: '#e6edf3'
  text: '#14283c'
  muted: '#52677b'
  border: '#c7d5e1'
  brandInk: '#14283c'
  darkBackground: '#0c1724'
  darkSurface: '#132438'
  darkText: '#f0f4f8'
  darkAccent: '#9ac9ee'
  darkBrandInk: '#2f6ea8'
typography:
  display:
    fontFamily: 'Oswald Variable, Arial Narrow, sans-serif'
  body:
    fontFamily: 'DM Sans Variable, Arial, sans-serif'
  construction:
    fontFamily: 'Bebas Neue, Oswald Variable, Arial Narrow, sans-serif'
rounded:
  DEFAULT: '2px'
spacing:
  page-max: '1280px'
  mobile-gutter: '23px'
components:
  button:
    rounded: '2px'
  card:
    rounded: '0px'
---

# JCMF Constructora — design_minimal

## Overview

Portada 3D, septiembre 2026: la secuencia de construcción sustituye la fotografía
inicial y el pabellón de la introducción, según `plan-3d.md`. Esta decisión
actualiza las descripciones históricas del hero fotográfico que siguen abajo.
La identidad azul y las fuentes existentes se conservan; el cierre de la escena
usa Bebas Neue para dar protagonismo al nombre solicitado en mayúsculas.

Variante solicitada en una rama independiente de `modern_design`. Público: clientes y responsables de obra que necesitan entender capacidades, ver referencias y contactar. Registro corporativo de marca; español/inglés; contexto mexicano según el CV, con proyectos y contactos explícitamente provisionales.

Dirección: una monografía arquitectónica de espacios habitables. Fotografías e imágenes proporcionadas tienen el papel principal; el pabellón y los trazos animados acompañan como estudios conceptuales. El hero fotográfico combina tipografía condensada monumental y contraste cinematográfico; la estructura conceptual acompaña la introducción.

Se descartó un mero cambio de colores: se rediseñan composición del inicio, cabeceras interiores, servicios en filas, portafolio escalonado y cierre. La expresión se concentra en la escena y los trazos; las cifras de prueba se etiquetan explícitamente como ficticias.

## Colors

La escena utiliza los materiales originales del GLB proporcionado: fachada clara,
vidrio azul, vegetación y amarillo de seguridad. El fondo transparente deja ver
`--bg`; ninguna paleta se duplica en React. La luz lee tokens CSS: cielo #f1faff,
rebote #7498a6 y principal #ffffff en claro; #c6e4fa, #52677b y #f0f4f8 en oscuro.
Exposición 1.1/1.2, entorno de estudio con intensidad 0.55, luz hemisférica 0.65
y direccional 2.5. No hay posprocesado ni sombras dinámicas.

Concreto claro #f4f7fa, superficie azul gris #e6edf3, tinta #14283c, texto secundario #52677b y azul técnico #245c88. Oscuro azul noche: #0c1724, #132438, texto #f0f4f8 y acero claro #9ac9ee. Contraste antes que desaturación estética.

El logo de cabecera y pie usa --brand-ink: #14283c en claro y #2f6ea8 en oscuro, un azul marino
sobre el fondo nocturno con 3.4:1 de contraste (petición del usuario: el logo no se presenta en
blanco). La micro-letra .brand-caption usa --muted en ambos temas para conservar 4.5:1 y jerarquía
secundaria; el punto de marca mantiene --accent.

Fuente canónica: `src/styles/tokens.css` (modelo B). Documento refleja valores; componentes comparten CSS y no duplican temas React. Mapa: primary → --accent → acciones; background → --bg → documento; surface → --surface → visuales; text → --ink → titulares; muted → --muted → lectura secundaria; border → --line → separadores. Meta theme-color lee --bg computado.

Materiales SVG se gestionan también con tokens --model-top/front/side/glass/slat/ground/tree/line. Cambian con el tema; no se aplica un filtro global. --error/--success se acompañan siempre de texto. Scrollbar global con estados y forced-colors.

## Typography

Bebas Neue 400, autoalojada y cargada desde el componente de portada, es la fuente
del cierre JCMF CONSTRUCTORA. Token `--font-construction`; mayúsculas, espaciado 0
y altura de línea 0.95. El resto de los titulares conserva Oswald.

Oswald Variable peso 500 para titulares, de proporción condensada y carácter estructural; DM Sans Variable para lectura. Autoalojadas, español e inglés completos, fallback Arial. Titular inicial Oswald en mayúsculas, 72–156 px en escritorio y 48–76 px móvil; interior 36–76 px. Cuerpo 16–22 px, controles 12–14 px y etiquetas técnicas 9–11 px.

Los renglones de hero están agrupados para entradas suaves, sin dividir caracteres ni alterar su lectura accesible. Textos con anchura natural y sin alturas fijas.

## Layout

La portada usa un único escenario abierto y centrado a todo el ancho, sin texto
ni acciones promocionales sobre el modelo. JCMF Constructora es el H1 debajo del
lienzo: aparece suavemente entre el 78% y el 98% de la construcción. Firma casi
de borde a borde, con margen propio de 24px. Tamaños JCMF/Constructora por banda:
272/272px desde 1800px, 210/210px en escritorio, 160/160px hasta 1400px,
128/128px hasta 1100px, 100/100px hasta 900px y 84/84px hasta 700px.
Hasta 600px se compone en dos líneas: 256/88px, 184/64px hasta 479px y
160/56px hasta 360px. Son escalas fijas, sin tipografía dependiente de vw.
Su espacio siempre está reservado, sin saltos al aparecer. En la versión estática
el nombre siempre es visible. Pausa y salto a capacidades son controles compactos.

Tokens `--construction-*`: cabecera 89px (77px en móvil), margen inferior 24px
(12px en móvil), altura `100svh - cabecera - margen`, recorrido 300svh,
separación 28px (16px hasta 900px), nombre 232px (288px desde 1800px, 184px hasta
1400px, 152px hasta 1100px, 124px hasta 900px, 108px hasta 700px, 348px hasta
600px, 256px hasta 479px, 224px hasta 360px) y pie 76px (72px hasta 900px).
La vista estática tiene altura mínima 660px.

Máximo 1280 px, márgenes fluidos 24–96 px y 23 px móvil. Secciones 80–130 px. Hero: fotografía de fondo a todo el ancho, titular monumental alineado a izquierda, resumen y dos acciones debajo. Estudio conceptual junto a la introducción corporativa. Portafolio: índice de obras en tres columnas con fotografía 4:3, número de catálogo y regla inferior; dos columnas entre 600 y 1100 px y una sola columna en móvil. No hay tarjeta destacada: todas las obras comparten escala y la jerarquía se resuelve con espacio, reglas y numeración, sin depender de first-child dentro de las islas React.

Nosotros: hero con símbolo de volumen; proyectos: capas de un plano; contacto: pórtico abierto. PageHero comparte semántica y espaciado; HeroMark concentra las variantes. Servicios como filas con icono/título/descripción/enlace, adaptados a móvil.

Breakpoints 1100, 900 y 600 px. Controles de cabecera de 44 px. Sin scroll interceptado. SVG y mensajes reservan espacio; HTML visible sin JavaScript. No se pierde el estado de idioma o tema al navegar.

## Elevation & Depth

Sin sombras decorativas ni tarjetas flotantes. Espacio, superficies suaves y separadores definen jerarquía. Profundidad solo en el pabellón y las ilustraciones; CTA de superficie mineral en lugar de un bloque de alto contraste.

## Shapes

Controles casi rectos, radio 2 px. Círculos para acciones compactas y CTA. Iconos de trazo fino con nombres accesibles en sus botones. Tarjetas sin borde exterior ni recuadro interior al hacer hover; se conserva el foco visible de teclado.

## Components

ConstructionHero entrega HTML estático, imágenes WebP transparentes y enlaces.
ConstructionIsland carga React Three Fiber y GSAP solo con movimiento permitido,
WebGL2 disponible y viewport de al menos 660px de alto. ConstructionScene es dueña
del GLB, entorno y controlador. Los recursos se liberan al navegar, fallar o
cambiar las preferencias. No se instala un segundo package.json de la entrega 3D.

La animación sigue el scroll nativo mediante ScrollTrigger (scrub 0.35); el último
10% del recorrido mantiene el edificio completo. Cámara ortográfica fija con
encuadre estable para toda la rotación, incluyendo grúa y andamios. Construcción,
trabajadores y maquinaria son reversibles y dependen solo del scroll. Tras 700ms
sin desplazamiento, el conjunto gira una vuelta cada 120s y flota con amplitud
0.25 y período 7.5s. El botón de pausa detiene ambos movimientos; también se
suspenden fuera de pantalla o al ocultar la pestaña. R3F renderiza bajo demanda,
activada durante scroll o movimiento en reposo. DPR máximo 1.5 y 1 en móvil.

Los posters provienen de la misma escena. Sin JavaScript, movimiento reducido,
WebGL o en ventanas bajas se muestra el edificio terminado sin recorrido largo.
El respaldo de carga muestra el terreno; errores mantienen enlaces y permiten
reintentar. La preferencia de movimiento reducido evita descargar el motor 3D
y el modelo. El enlace a capacidades permite omitir la secuencia con teclado.
El terreno existe desde el progreso cero; se omite su aparición desde vacío
en la entrega original, conservando la excavación y las siguientes etapas.

Portafolio: `src/lib/project-media.ts` concentra la optimización local. `ProjectCard.astro` adapta los datos a `WorkCard.tsx`; `ProjectCaseStudy.tsx` compone el detalle y ambos reutilizan `ProjectPhoto.tsx`. El HTML se genera en compilación y React hidrata cuando es visible. Datos y fuentes en src/data/projects.ts; referencias de investigación en PORTFOLIO.md. No se infiere autoría de una imagen ni se presenta una visualización como fotografía de obra concluida.

Tarjetas 4:3 con encuadre por imagen en portafolio, inicio y relacionadas. Blanco y negro en reposo, color con hover o foco; 900 ms de filtro y 1200 ms de zoom 1.025 con --ease. En táctil se presentan a color. El índice del portafolio estrecha la flecha de la imagen a 36 px y coloca el número de catálogo en .project-badge; el título gana subrayado progresivo de 600 ms al hover o foco, con texto alternativo en forced-colors. Detalle: grid de 12 columnas, imagen completa sin recorte en 8 columnas y ficha en 4; contexto y alcance debajo. En móvil todo sigue el orden natural. El detalle muestra color constante, sin zoom. Espacio reservado y mensaje localizado de error sin perder navegación.

Conservar navegación, formulario React/Zod, filtros, 404, SEO, idiomas y dos temas. Select explícitamente nativo. Formulario síncrono de demostración sin almacenamiento o envío; botón inactivo hasta hidratar; errores vinculados y foco al primer inválido.

Movimiento finito:

- Hero por renglones: 1100 ms, desplazamiento de 25% de su propia línea, escalonado 130 ms. Fotografía con acercamiento inicial 1.045 → 1 en 1800 ms, una sola vez; acciones aparecen con 260 ms de retraso.
- Aparición secundaria: 1200 ms y 9 px.
- Trazado SVG: 2300 ms con pathLength normalizado; masas aparecen en 1800 ms, desplazamiento 10 px.
- Hero interior: línea de separación dibujada en 1800 ms.
- Scroll: elevación 14 px y opacidad en 800 ms; máscara de imagen 1400 ms y reglas 1500 ms.
- Hover: subrayado progresivo 600 ms, zoom de imagen 1.025 en 1000 ms, giro leve de flechas/CTA.
- Easing compartido cubic-bezier(.22,1,.36,1). Transiciones de página Astro, con lectura sin saltos.

Reduced motion elimina animaciones, transiciones, clip y scroll suave. Todas las ilustraciones son decorativas y los títulos permanecen semánticos. La única excepción al movimiento finito es el giro y flotación pausables de la escena 3D, solicitado para la portada; reduced motion lo elimina por completo. No hay paralaje agresivo ni dependencia de movimiento para operar.

## Do's and Don'ts

- Mantener el contenido factual y la condición conceptual de las imágenes.
- Tratar el espacio en blanco como separación útil, no como ausencia de contenido.
- Cambiar valores únicamente desde tokens y reflejarlos aquí.
- Modo oscuro azul noche/acero solicitado por el usuario; modo claro concreto/azul técnico. No importar la composición de modern_design.
- No añadir una segunda hoja de overrides: global.css es la implementación compartida.
- Verificar ambos idiomas, paletas, móvil, teclado y reducción de movimiento.

## Evolución de portada — septiembre 2026

Decisión solicitada: modo oscuro azul noche/acero, titulares más firmes y portada fotográfica.
Tokens exclusivos de portada: --hero-bg #101d28, --hero-ink #ffffff, --hero-muted #e0e8ef,
--hero-shade #07121ee0, --hero-shade-end #07121e55, --hero-line #ffffff70,
--hero-button-ink #122333 y --hero-button-hover #dceaf5.
Son constantes en ambos temas para mantener contraste sobre la imagen.
Geometría: --hero-height 740px, --hero-space clamp(36px, 5vw, 76px),
--hero-title-size clamp(72px, 10.8vw, 156px); móvil mínimo 680px con altura natural si el contenido crece.
La fotografía reutiliza el adaptador WebP y usa sizes=100vw, carga prioritaria y dimensiones explícitas.
Se presenta como referencia; no implica autoría ni obra ejecutada. El texto es ES/EN sin métricas inventadas.

El tema claro evoluciona también a azul por solicitud del usuario: fondos de concreto frío,
acento técnico, materiales SVG y scrollbars coherentes. Favicon y meta theme-color inicial
reflejan --accent y --bg; el script de tema actualiza el meta desde CSS computado.
README describe la identidad actual; el historial de PLAN conserva las propuestas anteriores.

## Galería editorial inferior

HomeShowcase añade dos perspectivas en color, elegidas por slug estable desde projects.ts
(Hospital Muguerza y ONE), después del portafolio. Reutiliza ProjectMedia y su tratamiento
de error, dimensiones y WebP; no añade fuentes externas ni datos de autoría.
Composición 1.35:1, fotos 4:3 y 4:5; una columna en móvil.
--visual-gap clamp(28px, 5vw, 72px) y --visual-offset 96px pertenecen a tokens.css.
Los enlaces son nativos con foco visible, descripciones localizadas y etiquetas de referencia.

## Cifras ilustrativas del prototipo

HomeMetrics muestra tres datos ficticios solicitados para explorar el diseño (25+, 80,000 m², 15).
El encabezado, la nota visible y cada etiqueta explican su condición de ejemplo en ES/EN;
no se incorporan al SEO, datos estructurados ni fichas de proyectos.
Son texto estático, sin contadores o peticiones; un dl mantiene su relación semántica.
--metric-size clamp(48px, 5.8vw, 84px) y --metrics-gap clamp(24px, 4vw, 56px)
definen tamaño y separación; tres columnas pasan a una en móvil.
Reemplazar por evidencia aprobada o retirar el bloque antes de publicar; indexación desactivada.

## Equipo de referencia

Nosotros muestra ocho cargos y una línea de nombre debajo de cada cargo.
Los registros role/name viven en about.team (es.ts/en.ts), conservando la misma estructura
en ambos idiomas. Los nombres siguen como «Nombre por confirmar» hasta disponer de aprobación;
se retiró el registro vacío y se completaron los cargos faltantes en inglés.
.team-name comparte --muted y la fuente de lectura; la cuadrícula sigue siendo 4/2 columnas.

## Movimiento de la portada y galería

tokens.css define --motion-photo 1800ms, --motion-title 1100ms,
--motion-reveal 800ms y --motion-feedback 350ms. Son animaciones finitas de transform/opacity.
Las flechas responden tanto al puntero como al foco; no se retrasa ni bloquea la navegación.
La galería comparte la máscara de revelado existente, sin nuevos observadores.
prefers-reduced-motion elimina también el zoom y los desplazamientos de interacción.

## Índice de obras — septiembre 2026

Solicitud del usuario: grid más compacto, fotografías más pequeñas y composición más limpia.
Se retira la obra destacada de 16:9 a todo el ancho y su variante data-featured: el portafolio
es ahora un índice uniforme de tres columnas (dos entre 600 y 1100 px, una en móvil) con
fotografía 4:3, esquema de 402 px de ancho a 1440 px de viewport frente a los 620 px anteriores.
Cada tarjeta lleva número de catálogo en .project-badge (01–07, aria-hidden: es jerarquía visual,
no información nueva), flecha de 36 px, metadatos en 9 px y regla inferior que pasa a --accent.
Las tarjetas del inicio y las relacionadas conservan su escala; .work-card .project-image unifica
el encuadre en 4:3 y desaparecen las reglas duplicadas de home/relacionadas y el 4:5 residual.
ProjectCard recibe index y sizes; cada cuadrícula declara su reparto de ancho para que el navegador
descargue la variante WebP necesaria (hasta 480 px en escritorio en lugar de 800 px).
Los títulos de tarjeta incorporan el subrayado progresivo de 600 ms ya documentado para hover.
La última fila queda incompleta con siete obras: se acepta como cierre editorial, sin rellenar
con contenido inventado ni escalas alternativas.
