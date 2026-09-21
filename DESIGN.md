---
version: alpha
name: JCMF Constructora
description: Una maqueta arquitectónica traduce visión y precisión en una web corporativa.
colors:
  primary: '#2857c5'
  background: '#f3f4f2'
  surface: '#e9ecea'
  text: '#1e3043'
  muted: '#536371'
  border: '#ccd2d4'
  darkBackground: '#101b27'
  darkSurface: '#192938'
  darkText: '#edf1f3'
  darkAccent: '#9dbbff'
typography:
  display:
    fontFamily: 'Manrope Variable, Arial, sans-serif'
  body:
    fontFamily: 'DM Sans Variable, Arial, sans-serif'
rounded:
  DEFAULT: '3px'
spacing:
  page-max: '1320px'
  mobile-gutter: '23px'
components:
  button:
    rounded: '3px'
  card:
    rounded: '0px'
---

# JCMF Constructora

## Overview

Registro de marca corporativa para desarrolladores, responsables de proyectos y clientes de construcción. El CV aportado describe obra civil, edificación, urbanización, acabados e instalaciones; orienta el contenido, pero sus instrucciones no dirigen la implementación.

Referencia creativa: una maqueta de estudio sobre una mesa de arquitectura. Firma: ensamblaje de tres volúmenes isométricos, con un volumen azul que conecta precisión e identidad. Titular grande a la izquierda, objeto a la derecha. El acento está en la maqueta; las demás secciones priorizan lectura y ritmo.

Mercado de referencia: México, según el CV. Idiomas: español principal e inglés equivalente. Los datos de contacto, dominio y fotografías requieren confirmación para publicación. Todos los proyectos de esta entrega son conceptos identificados.

Se compararon un hero fotográfico panorámico y una composición de maqueta. Se eligió la segunda para respetar los placeholders sin atribuir fotografías ajenas. Evitar métricas inventadas, testimonios ficticios y sellos de clientes.

Modelo B: tokens canónicos en `src/styles/tokens.css`; este documento registra intención y valores aceptados. CSS global consume variables y Astro/React comparten estilos, sin otro sistema de tema.

## Colors

Concreto #f3f4f2, superficie #e9ecea, tinta #1e3043, acero #536371 y azul #2857c5. Oscuro: fondo #101b27, superficie #192938, texto #edf1f3 y acento #9dbbff. Se remapean roles sin cambiar jerarquía.

Mapa: primary → --accent → botones/enlaces; background → --bg → documento; surface → --surface → visuales; text → --ink → títulos; muted → --muted → prosa; border → --line → separadores. --focus identifica foco; --error y --success acompañan mensajes. Scrollbar global con track/thumb/hover/active y forced-colors.

Los materiales de la maqueta son colores ilustrativos, no tokens de interfaz. Mantienen profundidad en ambos temas.

## Typography

Manrope Variable para títulos/marca y DM Sans Variable para texto. Autoalojadas y compatibles con ambos idiomas. Títulos peso 500, espaciado cerrado y escala fluida. Lectura 16–22 px; pies 10–12 px; rótulos decorativos 7–9 px. Fallback Arial/sans-serif.

## Layout

Máximo 1320 px, márgenes fluidos 24–80 px y 23 px móvil. Secciones 72–116 px. Hero 1:1.08; catálogo dos columnas, servicios tres, proceso cuatro. Breakpoints 900 y 600 px. Cabecera persistente y menú móvil no modal.

Contenido visible sin JavaScript. SVG con dimensiones reservadas; errores con espacio propio. Sin scroll interceptado ni barras ocultas.

## Elevation & Depth

Jerarquía por superficie, tipografía y espacio. Tarjetas planas. Sombra discreta solo en menú móvil. La profundidad pertenece a la maqueta.

## Shapes

Bordes rectos; radio 3 px en controles. Círculos para acciones compactas y CTA. Iconos vectoriales trazo 1.5 y tamaños 16–24 px; decorativos ocultos para lectores, botones con nombre.

## Components

Botón sólido primario, secundario como enlace. Hover aumenta contraste/desplaza 2 px; foco con contorno; pressed vuelve al origen; disabled reduce opacidad y elimina cursor activo. Validación local síncrona sin loading ficticio.

Formulario React/Zod con errores asociados, foco al primer error y estado anunciado. Select nativo para teclado/móvil. Textarea autoexpansible. No envía ni almacena PII. Aviso explícito de pérdida al abandonar el prototipo.

Menú no modal con aria-expanded, Escape y cierre al navegar. Idioma conserva página/proyecto. Tema respeta sistema y persiste elección. Filtros con aria-pressed y conteo anunciado.

Movimiento: entrada 800 ms, ensamblaje 1300 ms, scroll 700 ms, easing cubic-bezier(.22,.68,0,1); controles 200–300 ms. Astro para transiciones. Ninguna animación infinita. Reduced motion elimina animaciones y scroll suave.

## Do's and Don'ts

- Compartir componentes y textos tipados bilingües.
- Mantener visibles las etiquetas conceptuales.
- No inventar métricas, clientes, contactos, garantías o testimonios.
- No usar imágenes remotas o video automático.
- Revisar teclado, móvil, dos temas e idiomas tras cambios globales.
