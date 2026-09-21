import { es } from './es';
import { en } from './en';
import type { Locale } from './routes';
type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? Widen<U>[]
    : { [K in keyof T]: Widen<T[K]> };
export type Dictionary = Widen<typeof es>;
export const dictionaries: Record<Locale, Dictionary> = { es, en };
export const t = (locale: Locale): Dictionary => dictionaries[locale];
