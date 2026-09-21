# JCMF Constructora

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
