export const locales = ['es', 'en'] as const;
export type Locale = (typeof locales)[number];
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
export function projectRoute(locale: Locale, slug: string) {
  return route(locale, 'projects') + slug + '/';
}
