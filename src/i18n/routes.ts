export const locales = ['es', 'en'] as const;
export type Locale = (typeof locales)[number];
// Fuente única de rutas para navegación, páginas estáticas y metadatos SEO.
// Español vive en la raíz; inglés usa /en/. Conservar la barra final.
export const routeMap = {
  home: { es: '/', en: '/en/' },
  about: { es: '/nosotros/', en: '/en/about/' },
  projects: { es: '/proyectos/', en: '/en/projects/' },
  contact: { es: '/contacto/', en: '/en/contact/' },
  privacy: { es: '/privacidad/', en: '/en/privacy/' },
} as const;
export type PageKey = keyof typeof routeMap;
export function route(locale: Locale, key: PageKey) {
  return routeMap[key][locale];
}
/** Los slugs proceden del catálogo de proyectos y se conservan al cambiar idioma. */
export function projectRoute(locale: Locale, slug: string) {
  return route(locale, 'projects') + slug + '/';
}
