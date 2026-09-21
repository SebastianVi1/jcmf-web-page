// Configuración pública de compilación; nunca colocar secretos en variables PUBLIC_*.
export const site = {
  name: 'JCMF Constructora',
  origin: import.meta.env.PUBLIC_SITE_URL?.replace(/\/$/, '') || '',
  indexable: import.meta.env.PUBLIC_INDEXABLE === 'true',
} as const;

// Publicar un dominio no basta: la indexación requiere activación explícita.
// Layout, robots y sitemap comparten esta condición para proteger la demo.
export const canIndex = Boolean(site.origin && site.indexable);
