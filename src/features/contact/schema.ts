import { z } from 'zod';
import type { Dictionary } from '../../i18n';
// Identificadores estables; copy.types contiene las etiquetas en este mismo orden.
export const projectTypes = [
  'civil',
  'building',
  'installations',
  'other',
] as const;
/**
 * Crea la validación con mensajes del idioma activo, sin acoplarla a React.
 * Al conectar un servicio real, validar también en el servidor: esta comprobación
 * del navegador mejora la experiencia, pero no es una barrera de seguridad.
 */
export function contactSchema(errors: Dictionary['contact']['errors']) {
  return z.object({
    name: z.string().trim().min(2, errors.name).max(100, errors.name),
    email: z.string().trim().pipe(z.email(errors.email).max(254, errors.email)),
    company: z.string().trim().max(150, errors.company),
    type: z.enum(projectTypes, { error: errors.type }),
    message: z
      .string()
      .trim()
      .min(20, errors.message)
      .max(3000, errors.message),
    consent: z.boolean().refine((value) => value, errors.consent),
  });
}
