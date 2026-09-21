---
version: alpha
name: JCMF Constructora — Minimal
description: Arquitectura serena, espacio editorial y trazos que se convierten en materia.
colors:
  primary: '#4b5f43'
  background: '#f8f7f3'
  surface: '#eeeee7'
  text: '#282e28'
  muted: '#62695e'
  border: '#d7dbd0'
  darkBackground: '#191e19'
  darkSurface: '#232a22'
  darkText: '#eeefe6'
  darkAccent: '#bdcbaa'
typography:
  display:
    fontFamily: 'Manrope Variable, Arial, sans-serif'
  body:
    fontFamily: 'DM Sans Variable, Arial, sans-serif'
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

Variante solicitada en una rama independiente de `modern_design`. Público: clientes y responsables de obra que necesitan entender capacidades, ver referencias y contactar. Registro corporativo de marca; español/inglés; contexto mexicano según el CV, con proyectos y contactos explícitamente provisionales.

Dirección: una monografía arquitectónica de espacios habitables. Fotografías e imágenes proporcionadas tienen el papel principal; el pabellón y los trazos animados acompañan como estudios conceptuales. El hero editorial combina fotografía y estructura, conservando una expresión sobria y documental.

Se descartó un mero cambio de colores: se rediseñan composición del inicio, cabeceras interiores, servicios en filas, portafolio escalonado y cierre. La expresión se concentra en la escena y los trazos; no se añaden métricas ni decoraciones sin significado.

## Colors

Marfil #f8f7f3, superficie mineral #eeeee7, carbón #282e28, texto secundario #62695e y oliva #4b5f43. Oscuro botánico: #191e19, #232a22, texto #eeefe6 y salvia #bdcbaa. Contraste antes que desaturación estética.

Fuente canónica: `src/styles/tokens.css` (modelo B). Documento refleja valores; componentes comparten CSS y no duplican temas React. Mapa: primary → --accent → acciones; background → --bg → documento; surface → --surface → visuales; text → --ink → titulares; muted → --muted → lectura secundaria; border → --line → separadores. Meta theme-color lee --bg computado.

Materiales SVG se gestionan también con tokens --model-top/front/side/glass/slat/ground/tree/line. Cambian con el tema; no se aplica un filtro global. --error/--success se acompañan siempre de texto. Scrollbar global con estados y forced-colors.

## Typography

Manrope Variable peso 400 para titulares; DM Sans Variable para lectura. Autoalojadas, español e inglés completos, fallback Arial. Titular inicial 62–99 px en escritorio y 40–70 px móvil; interior 36–76 px. Cuerpo 16–22 px, controles 12–14 px y etiquetas técnicas 9–11 px.

Los renglones de hero están agrupados para entradas suaves, sin dividir caracteres ni alterar su lectura accesible. Textos con anchura natural y sin alturas fijas.

## Layout

Máximo 1280 px, márgenes fluidos 24–96 px y 23 px móvil. Secciones 80–130 px. Hero: titular a izquierda, resumen a derecha, fotografía dominante y estructura conceptual debajo. Portafolio: una obra destacada horizontal y seis tarjetas verticales en dos columnas. Móvil vuelve a una columna. La variante destacada es explícita mediante data-featured, no depende de first-child dentro de las islas React.

Nosotros: hero con símbolo de volumen; proyectos: capas de un plano; contacto: pórtico abierto. PageHero comparte semántica y espaciado; HeroMark concentra las variantes. Servicios como filas con icono/título/descripción/enlace, adaptados a móvil.

Breakpoints 1100, 900 y 600 px. Controles de cabecera de 44 px. Sin scroll interceptado. SVG y mensajes reservan espacio; HTML visible sin JavaScript. No se pierde el estado de idioma o tema al navegar.

## Elevation & Depth

Sin sombras decorativas ni tarjetas flotantes. Espacio, superficies suaves y separadores definen jerarquía. Profundidad solo en el pabellón y las ilustraciones; CTA de superficie mineral en lugar de un bloque de alto contraste.

## Shapes

Controles casi rectos, radio 2 px. Círculos para acciones compactas y CTA. Iconos de trazo fino con nombres accesibles en sus botones. Tarjetas sin borde exterior ni recuadro interior al hacer hover; se conserva el foco visible de teclado.

## Components

Portafolio: `src/lib/project-media.ts` concentra la optimización local. `ProjectCard.astro` adapta los datos a `WorkCard.tsx`; `ProjectCaseStudy.tsx` compone el detalle y ambos reutilizan `ProjectPhoto.tsx`. El HTML se genera en compilación y React hidrata cuando es visible. Datos y fuentes en src/data/projects.ts; referencias de investigación en PORTFOLIO.md. No se infiere autoría de una imagen ni se presenta una visualización como fotografía de obra concluida.

Tarjetas 4:5 con encuadre por imagen; destacada 16:9 y tarjetas del inicio/relacionadas 4:3. Blanco y negro en reposo, color con hover o foco; 900 ms de filtro y 1200 ms de zoom 1.025 con --ease. En táctil se presentan a color. Detalle: grid de 12 columnas, imagen completa sin recorte en 8 columnas y ficha en 4; contexto y alcance debajo. En móvil todo sigue el orden natural. El detalle muestra color constante, sin zoom. Espacio reservado y mensaje localizado de error sin perder navegación.

Conservar navegación, formulario React/Zod, filtros, 404, SEO, idiomas y dos temas. Select explícitamente nativo. Formulario síncrono de demostración sin almacenamiento o envío; botón inactivo hasta hidratar; errores vinculados y foco al primer inválido.

Movimiento finito:

- Hero por renglones: 1350 ms, desplazamiento de 25% de su propia línea, escalonado 130 ms.
- Aparición secundaria: 1200 ms y 9 px.
- Trazado SVG: 2300 ms con pathLength normalizado; masas aparecen en 1800 ms, desplazamiento 10 px.
- Hero interior: línea de separación dibujada en 1800 ms.
- Scroll: elevación 14 px y opacidad en 1000–1100 ms; máscara de imagen 1400 ms y reglas 1500 ms.
- Hover: subrayado progresivo 600 ms, zoom de imagen 1.025 en 1000 ms, giro leve de flechas/CTA.
- Easing compartido cubic-bezier(.22,1,.36,1). Transiciones de página Astro, con lectura sin saltos.

Reduced motion elimina animaciones, transiciones, clip y scroll suave. Todas las ilustraciones son decorativas y los títulos permanecen semánticos. No hay loops, paralaje agresivo ni dependencia de movimiento para operar.

## Do's and Don'ts

- Mantener el contenido factual y la condición conceptual de las imágenes.
- Tratar el espacio en blanco como separación útil, no como ausencia de contenido.
- Cambiar valores únicamente desde tokens y reflejarlos aquí.
- No reutilizar azules del diseño anterior en favicon, meta o tarjeta social.
- No añadir una segunda hoja de overrides: global.css es la implementación compartida.
- Verificar ambos idiomas, paletas, móvil, teclado y reducción de movimiento.
