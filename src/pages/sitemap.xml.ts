import type { APIRoute } from 'astro';
import { routeMap, locales, projectRoute } from '../i18n/routes';
import { projects } from '../data/projects';
import { site, canIndex } from '../config/site';
const escapeXml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('"', '&quot;');
export const GET: APIRoute = () => {
  const entries = [
    ...Object.values(routeMap),
    ...projects.map((project) => ({
      es: projectRoute('es', project.slug),
      en: projectRoute('en', project.slug),
    })),
  ];
  const urls = canIndex
    ? entries
        .flatMap((entry) =>
          locales.map(
            (locale) =>
              `<url><loc>${escapeXml(site.origin + entry[locale])}</loc>${locales.map((lang) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${escapeXml(site.origin + entry[lang])}"/>`).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(site.origin + entry.es)}"/></url>`,
          ),
        )
        .join('')
    : '';
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
