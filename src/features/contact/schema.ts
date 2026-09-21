import { z } from 'zod';
import type { Dictionary } from '../../i18n';
export const projectTypes = [
  'civil',
  'building',
  'installations',
  'other',
] as const;
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
