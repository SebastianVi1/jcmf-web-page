# Portada 3D: construcción vinculada al scroll

## Propuesta

Sustituir la fotografía inicial por una escena de construcción a todo el ancho, integrada con la identidad actual de JCMF. Al desplazarse, el visitante verá el terreno transformarse en el edificio terminado; al subir, la secuencia retrocederá.

El recorrido será breve: aproximadamente **tres alturas de pantalla de desplazamiento**, con acceso directo a servicios y proyectos. Se reutilizarán el edificio, los trabajadores y el controlador de `3d_models/construction_complete`.

## Diseño y composición

- Escena abierta, sin tarjeta ni marco, con estética de maqueta arquitectónica: fachadas claras, vidrio azul, iluminación suave y trabajadores como detalles secundarios.
- Mantener Oswald para titulares y DM Sans para lectura. Paleta existente: concreto `#f4f7fa`, superficie `#e6edf3`, tinta `#14283c`, azul `#245c88`, noche `#0c1724` y acero `#9ac9ee`.
- Mostrar **JCMF Constructora** como H1, acompañado del texto introductorio y los enlaces actuales a proyectos y contacto.
- Escritorio: texto superpuesto a la izquierda y edificio desplazado hacia la derecha dentro del mismo lienzo. Reservar zonas de encuadre para que ninguna fase invada el texto.
- Móvil: texto arriba y maqueta debajo, dentro de una composición continua. Tipografía por tamaños definidos en breakpoints, sin escalado dependiente del ancho.
- Añadir una etiqueta discreta de etapa y la aclaración «Visualización conceptual», traducidas al inglés. El modelo no se presentará como una obra ejecutada por JCMF.
- Retirar el pabellón SVG de la introducción del inicio para concentrar la expresión visual en una sola escena. Conservar servicios, portafolio, galería y demás contenido.

```text
Escritorio                         Móvil
+----------------------------+     +-----------------+
| Cabecera actual            |     | Cabecera actual |
| JCMF          Escena 3D     |     | JCMF + resumen  |
| Resumen       a todo       |     | Acciones        |
| Acciones      el ancho     |     | Escena 3D       |
| Etapa / acceso a servicios |     | Etapa / acceso  |
+----------------------------+     +-----------------+
```

## Escena y secuencia

- Crear una cámara ortográfica a tres cuartos, tomando como base la vista existente. Calcular el encuadre usando los límites de todas las fases, incluida la grúa.
- Aplicar una variación de azimut máxima de 8° durante la construcción; en móvil, cámara fija para preservar espacio y legibilidad.
- Usar iluminación hemisférica, luz direccional y reflejos de estudio mediante `RoomEnvironment` y PMREM. Mantener materiales y texturas del GLB; adaptar fondo e iluminación al tema.
- Evitar posprocesado y sombras dinámicas inicialmente. El acabado dependerá del encuadre, los materiales y la luz.
- Respetar los intervalos del controlador existente:

| Progreso del modelo | Etapa                                      |
| ------------------- | ------------------------------------------ |
| 0–15 %              | Preparación del terreno                    |
| 15–20 %             | Cimentación                                |
| 20–40 %             | Estructura                                 |
| 40–60 %             | Muros                                      |
| 60–75 %             | Ventanas                                   |
| 75–90 %             | Acabados                                   |
| 90–100 %            | Retiro de trabajadores y entorno terminado |

- Reservar el último 10 % del recorrido de scroll para contemplar el edificio completo.
- Trabajadores y maquinaria dependerán del mismo progreso. No habrá movimiento autónomo cuando el desplazamiento se detenga.

## Integración técnica

- Añadir mediante Bun `three`, `@react-three/fiber`, `gsap` y los tipos necesarios, compatibles con React 19. Mantener un único conjunto de dependencias y lockfile en la raíz.
- Integrar una envoltura Astro en `src/views/Home.astro`: título, textos, enlaces e imagen de respaldo renderizados como HTML. Una isla React cargará la escena exclusivamente en las portadas ES/EN.
- Llevar el controlador y las rutas de trabajadores a un módulo de producción tipado, conservando los originales como fuente. Publicar el GLB y posters WebP locales.
- Definir una única entrada mutable `progress: 0..1`. GSAP actualizará esa referencia; el controlador aplicará transformaciones absolutas sin provocar renders React por fotograma.
- Usar una sección con `position: sticky` y espacio de recorrido reservado. ScrollTrigger observará el desplazamiento nativo, con `scrub: 0.35`, sin interceptar rueda, gestos o teclado. Eliminar el suavizado adicional del componente original para evitar retraso acumulado. [Documentación de ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/).
- Renderizar bajo demanda, invalidando desde la actualización de GSAP. Detener trabajo fuera de pantalla y con la pestaña oculta. Limitar DPR a 1,5 en escritorio y 1 en móvil. [Rendimiento de React Three Fiber](https://r3f.docs.pmnd.rs/advanced/scaling-performance).
- Limpiar timelines, observadores y recursos propios al desmontar y durante las transiciones Astro. Restaurar el progreso desde la posición real al regresar, redimensionar o cambiar de idioma.
- Centralizar los nuevos tokens en la hoja existente y documentar composición, movimiento y adaptación de tema en `DESIGN.md`.

## Resiliencia y verificación

- Mostrar un poster inicial mientras carga el modelo; sustituirlo únicamente tras el primer fotograma válido. Mantener siempre disponibles los enlaces.
- Sin JavaScript, con movimiento reducido o sin WebGL: mostrar el edificio terminado como imagen estática, sin recorrido extendido. Con movimiento reducido, evitar descargar el motor y el GLB.
- Ante fallo de carga, conservar el poster y ofrecer «Reintentar». Reservar la geometría desde el inicio para evitar saltos de contenido.
- Incluir un enlace nativo a servicios para saltar la secuencia, con foco correctamente trasladado. Canvas decorativo, contenido equivalente en HTML y textos ES/EN sin anuncios continuos durante el scroll.
- Probar avance y retroceso deterministas, extremos del progreso, carga tardía, error de GLB, pérdida de contexto, cambio de tema y navegación de ida y vuelta.
- Verificar con Playwright capturas y píxeles del canvas en varias etapas, ambos idiomas y temas, escritorio y móvil; comprobar encuadre, ausencia de solapamientos, teclado y movimiento reducido.
- Ejecutar typecheck, pruebas unitarias, E2E, formato y build. Actualizar las pruebas que actualmente esperan el hero y el pabellón anteriores.
- Medir tiempo de carga y coste de renderizado del modelo actual de unos 6,7 MB; documentar resultados sin prometer FPS no medidos. Entregar la implementación con el servidor de desarrollo en segundo plano en `http://localhost:4321`.

**Supuestos acordados:** reemplazar la portada fotográfica y usar un recorrido breve. Se conservarán la geometría y las etapas del modelo suministrado; el trabajo se concentra en integración, presentación y rendimiento, sin nuevas rutas ni cambios al formulario.

## Implementación y verificación

Implementado el 26 de septiembre de 2026 en la rama `3d-animation`.

- Motor y recursos: Three.js 0.180.0, React Three Fiber 9.8.1 y GSAP 3.15.0;
  controlador absoluto, rutas de trabajadores y modelo local. Commit `0b7c8b1`.
- Portada ES/EN: composición responsive, cámara ortográfica, luz de estudio,
  scroll reversible, carga condicional, posters, reintento y limpieza al navegar.
  Commit `92b8ebb`.
- Ajuste respecto a la entrega original: el terreno permanece visible desde
  progreso cero; la excavación conserva sus intervalos. Ventanas de menos de
  660px de alto usan el respaldo estático para mantener la lectura accesible.
- `bun run test`: 12 pruebas aprobadas.
- `bun run test:e2e`: 26 pruebas aprobadas, incluyendo siete escenarios 3D,
  los dos idiomas y temas, móvil, teclado, accesibilidad automatizada, imágenes
  y píxeles del canvas, reversibilidad, reposo, carga lenta, reintento, falta de
  WebGL, pérdida de contexto, navegación y movimiento reducido.
- `bun run check`: 0 errores, 0 warnings; dos hints en archivos de correo
  preexistentes y ajenos a esta integración.
- `bun run build`: correcto, 27 páginas estáticas. La advertencia de tamaño
  corresponde al chunk 3D diferido: aproximadamente 1,04 MB sin comprimir y
  289 KB gzip. No se descarga bajo movimiento reducido.
- GLB: 6.679.364 bytes. Posters inicial/final: aproximadamente 18/47 KB.
  Smoke test del build en Chromium local: escena lista en 2.028 ms, petición
  del GLB en 37 ms y ningún error de JavaScript. Estas cifras de localhost
  no representan una conexión móvil ni garantizan FPS en dispositivos reales.
  Un sondeo adicional con viewport móvil registró 435 llamadas de dibujo WebGL
  al actualizar la escena hasta aproximadamente el 50%; el reposo sin renders
  continuos se comprueba mediante E2E. No se ha medido una GPU móvil física.
- Prettier pasa en todos los archivos de la implementación. `format:check`
  global señala siete archivos previos: cuatro skills, `opencode.json`,
  `src/config/mailAuth.ts` y `src/features/contact/mailConfig.ts`.
- Auditoría estática premium estricta: 0 incidencias. Lint de `DESIGN.md`:
  0 errores, con nueve avisos sobre tokens heredados no referenciados por el
  frontmatter de componentes; su correspondencia CSS permanece documentada.
- Cambios previos de correo, base de datos, `.gitignore` y fuentes de
  `3d_models` conservados fuera de los commits de esta implementación.

Las capturas del navegador se guardan en `test-results/`; los posters se
regeneran con `node scripts/capture-construction.mjs`. El servidor de desarrollo
se inicia en segundo plano con `bun run dev -- --background` y sirve la web en
http://localhost:4321.
