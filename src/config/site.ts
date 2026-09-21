export const site = {
  name: 'JCMF Constructora',
  origin: import.meta.env.PUBLIC_SITE_URL?.replace(/\/$/, '') || '',
  indexable: import.meta.env.PUBLIC_INDEXABLE === 'true',
} as const;

export const canIndex = Boolean(site.origin && site.indexable);
