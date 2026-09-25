import { es } from './es';
import { en } from './en';
import type { Locale } from './routes';
// Español define la estructura del diccionario, pero no los textos literales
// permitidos: Widen permite traducirlos manteniendo las mismas claves.
type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? Widen<U>[]
    : { [K in keyof T]: Widen<T[K]> };
export type Dictionary = Widen<typeof es>;
export const dictionaries: Record<Locale, Dictionary> = { es, en };
export const t = (locale: Locale): Dictionary => dictionaries[locale];
