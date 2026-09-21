import type { APIRoute } from 'astro';
import { site, canIndex } from '../config/site';
export const GET: APIRoute = () =>
  new Response(
    canIndex
      ? `User-agent: *\nAllow: /\nSitemap: ${site.origin}/sitemap.xml\n`
      : 'User-agent: *\nDisallow: /\n',
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
