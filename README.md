# JCMF Constructora

Ramas de diseño: modern_design conserva la propuesta original azul/isométrica; design_minimal contiene la evolución azul técnico/concreto y azul noche con portada fotográfica. La rama 3d-animation sustituye esa portada por una construcción vinculada al scroll con Three.js, React Three Fiber y GSAP. Conserva Oswald, los dos idiomas y las funciones del sitio. Cambiar de rama con Git permite comparar las propuestas; esta rama no publica cambios.

Sitio corporativo en Astro + React + TypeScript con placeholders. Incluye inicio, nosotros, catálogo, fichas de proyecto, contacto y privacidad en español e inglés. La identidad y sus reglas están en [DESIGN.md](DESIGN.md); el plan detallado y los pendientes de lanzamiento en [PLAN.md](PLAN.md).

## Desarrollo

Requiere Node >=22.12 y Bun. Ejecutar dentro de Ubuntu/WSL:

```sh
bun install
bun run dev -- --background
bun run astro dev status
bun run astro dev logs
bun run astro dev stop
```

La URL local aparece en el estado del servidor. Se usa background según AGENTS.md.

```sh
bun run check
bun run build
bun run test
bun run test:e2e
```

Las pruebas E2E esperan el servidor local en http://localhost:4321. Instalar Chromium de Playwright con `bunx playwright install chromium` si no existe.

## Arquitectura

- `src/config/site.ts`: marca y configuración SEO.
- `src/i18n/`: diccionarios tipados español/inglés y mapa de rutas.
- `src/data/projects.ts`: proyectos conceptuales y alcance por idioma.
- `src/components/`: navegación, marca, iconos, visuales SVG y CTA.
- `src/features/contact/`: única isla React, formulario y esquema Zod reutilizable.
- `src/layouts/SiteLayout.astro`: HTML, metadatos, tema y transiciones.
- `src/views/`: composición semántica de cada página.
- `src/pages/`: inicio, generación de rutas estáticas, 404, robots y sitemap.
- `src/styles/`: tokens canónicos y estilos compartidos.
- `src/scripts/site.ts`: menú, tema, filtros y revelados con limpieza de eventos.
- `tests/`: validación y pruebas de navegación/accesibilidad.

Astro genera HTML completo. React se hidrata solamente en contacto. Fuentes autoalojadas mediante Fontsource, sin imágenes ni servicios remotos.

## Contenido y traducción

Modificar los textos en `src/i18n/es.ts` y `en.ts`. TypeScript comprueba la misma estructura de claves. Añadir proyectos en `src/data/projects.ts`; sus rutas se generan automáticamente en ambos idiomas. El selector conserva página y proyecto.

Las ilustraciones son placeholders vectoriales propios, no fotografías de obras. Los roles de equipo son referencias; no se publican identidades ni estadísticas sin aprobación. El documento fuente es el CV empresarial aportado por el usuario, fechado 14 de abril de 2026.

## Formulario

La demostración valida en el navegador con Zod, conserva los campos ante errores y enfoca el primero incorrecto. No hace peticiones, no envía correo y no guarda datos. El estado válido nunca implica un mensaje enviado. El tema es la única preferencia persistida en localStorage.

Para producción: implementar endpoint y validar de nuevo en servidor, antispam/rate limit, proveedor de correo, estados de envío/error y aviso de privacidad aprobado. Nunca colocar secretos en variables PUBLIC_.

## SEO y publicación

Copiar `.env.example` a `.env` y configurar el dominio real solo cuando esté aprobado:

```dotenv
PUBLIC_SITE_URL=https://dominio-confirmado.example
PUBLIC_INDEXABLE=false
```

El ejemplo de dominio no es un dominio atribuido a JCMF. Dejar PUBLIC_INDEXABLE=false mientras existan placeholders. Sin dominio se omiten canonical y hreflang absolutos; robots y metadatos bloquean indexación. Noindex es una directiva para buscadores, no control de acceso.

Una vez aprobado el contenido y el dominio, activar PUBLIC_INDEXABLE=true y reconstruir. Se generan canonical, alternates, Open Graph, datos estructurados de organización, sitemap bilingüe y robots indexable. No se inventan LocalBusiness, direcciones, reseñas ni métricas.

Desplegar `dist/` en un hosting estático que sirva `404.html` con estado HTTP 404. Este trabajo no publica ni configura servicios externos.

## Verificación

El plan registra los resultados de compilación, tipos y revisión del navegador. Pruebas E2E cubren rutas, cambio de idioma/tema, móvil, formulario, filtros, contenido sin JavaScript y accesibilidad automatizada. Una revisión manual final de contenido y accesibilidad sigue siendo necesaria antes de publicar.

## Personalizar el diseño actual

- Paletas y escalas: editar `src/styles/tokens.css` y reflejar las decisiones en `DESIGN.md`.
- Portada: `ConstructionHero.astro` se integra en `src/views/Home.astro`; los textos viven en `home.construction` de ambos diccionarios. `src/features/construction` contiene la carga condicional, escena y controlador reversible.
- Galería inferior: `HomeShowcase.astro` selecciona slugs existentes; la procedencia sigue en `PORTFOLIO.md`.
- Cifras de diseño: `home.metrics` contiene ejemplos ficticios con etiquetas explícitas. Reemplazarlos por cifras aprobadas o retirar `HomeMetrics` antes de publicar.
- Equipo: cada registro de `about.team` tiene `role` y `name`. Sustituir los nombres por confirmar en ambos idiomas cuando estén aprobados.
- Animación: duraciones `--motion-*` en tokens; reglas en `global.css`. Movimiento reducido elimina los efectos.
- Capturas y tarjeta social: `node scripts/capture.mjs`; pruebas de la nueva portada en `tests/browser/home-design.spec.ts`.

## Construcción 3D

La portada usa `public/models/building.glb`, proporcionado en
`3d_models/construction_complete`. Se distribuye como visualización conceptual,
sin atribuirla a una obra real de JCMF. El modelo conserva sus materiales, etapas,
trabajadores y maquinaria; el terreno es visible antes de empezar el scroll.

El recorrido usa scroll nativo y tres alturas de pantalla. El último 10% mantiene
el edificio terminado. Con movimiento reducido, sin WebGL2, sin JavaScript o en
ventanas de menos de 660px de alto se muestra un poster estático. Los enlaces
permanecen disponibles durante la carga y ante errores. La escena solo se carga
en las portadas ES/EN. El scroll mueve la rotación del edificio de derecha a
izquierda a lo largo de la secuencia y el último cuadro es exactamente el frente
del edificio (la fachada de entrada queda de cara a la cámara). El giro
automático lento solo aparece con el scroll detenido y retoma desde la
orientación actual; mientras se hace scroll, la rotación la manda el recorrido.
La flotación corre siempre, en paralelo. El control de pausa detiene giro y
flotación; fuera de pantalla se suspenden automáticamente. El navegador puede
limitar los fotogramas de pestañas ocultas. La cámara describe un arco suave y
baja hacia la fachada durante la construcción. Entre el 78% y el 98%, el nombre
aparece detrás del edificio mediante fade y revelado vertical, sin desplazar el
contenido.

Un pad de flechas permite girar el edificio (izquierda/derecha) e inclinar la
vista (arriba/abajo). El control es fluido: mantener presionado gira de forma
continua y un toque corto da un impulso visible. Usar las flechas detiene el giro
automático —el edificio queda donde lo dejas— pero no la flotación; el botón de
reproducción reanuda el giro. Las flechas también funcionan con las teclas de
dirección y no desplazan la página.
El cierre usa Bebas Neue autoalojada, mayúsculas casi a todo el ancho y una
composición superior/inferior en móvil.

- `node scripts/capture-construction.mjs`: regenera los dos posters WebP y captura
  etapas de escritorio; requiere el servidor en http://localhost:4321.
- `bunx playwright test tests/browser/construction.spec.ts`: verifica la escena,
  reversibilidad, asentamiento de frente, flechas fluidas, giro y pausa, carga
  lenta, fallback, teclado y movimiento reducido.

El rendimiento está cuidado: la escena se carga hasta que la página termina de
cargar y el hilo principal queda libre, con los pósters cubriendo la espera, y el
bucle de render deja tiempo libre en equipos lentos (los renderizadores por
software arrancan con menor resolución de lienzo) para que la página nunca se
congele. Los scripts de captura fuerzan resolución completa mediante
`window.__JCMF_DPR` para que las imágenes versionadas no salgan borrosas.

No ejecutar capturas/E2E al mismo tiempo que `astro check`, builds o cambios de
dependencias: la reoptimización de Vite puede recargar páginas durante la prueba.
Si el servidor usa otro puerto, pasar `PLAYWRIGHT_BASE_URL=http://localhost:4322`
a los comandos de E2E y captura para verificar esa misma instancia.

Si Vite muestra `504 Outdated Optimize Dep` después de instalar fuentes o ejecutar comprobaciones,
reiniciar con `bun run astro dev stop` y `bun run dev -- --background` antes de probar el navegador.
