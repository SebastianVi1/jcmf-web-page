import type { Locale } from '../i18n/routes';
export type Category = 'residential' | 'industrial' | 'infrastructure';
type ProjectText = { title: string; description: string; scope: string[] };
export type Project = {
  slug: string;
  category: Category;
  visual: 'tower' | 'hall' | 'bridge';
  content: Record<Locale, ProjectText>;
};
export const projects: Project[] = [
  {
    slug: 'horizonte',
    category: 'residential',
    visual: 'tower',
    content: {
      es: {
        title: 'Horizonte residencial',
        description:
          'Un ejercicio conceptual de vivienda vertical donde estructura, luz y espacios abiertos conviven. Esta ficha muestra cómo se presentará el alcance de una obra real.',
        scope: [
          'Estructura de concreto',
          'Áreas comunes',
          'Acabados e instalaciones',
        ],
      },
      en: {
        title: 'Horizonte residences',
        description:
          'A vertical housing concept where structure, light and open spaces coexist. This entry demonstrates how the scope of a real project will be presented.',
        scope: [
          'Concrete structure',
          'Common spaces',
          'Finishes and installations',
        ],
      },
    },
  },
  {
    slug: 'nexo',
    category: 'industrial',
    visual: 'hall',
    content: {
      es: {
        title: 'Nexo industrial',
        description:
          'Un espacio conceptual para conectar operación, logística y crecimiento. La propuesta explora una estructura modular adaptable a distintas necesidades industriales.',
        scope: [
          'Estructura de acero',
          'Pavimentos industriales',
          'Redes e instalaciones',
        ],
      },
      en: {
        title: 'Nexo industrial',
        description:
          'A concept connecting operations, logistics and growth. The proposal explores a modular structure adaptable to different industrial needs.',
        scope: [
          'Steel structure',
          'Industrial paving',
          'Networks and installations',
        ],
      },
    },
  },
  {
    slug: 'conexion',
    category: 'infrastructure',
    visual: 'bridge',
    content: {
      es: {
        title: 'Conexión urbana',
        description:
          'Una propuesta conceptual de infraestructura que acerca espacios y personas. El contenido servirá como base para documentar soluciones, retos y resultados verificados.',
        scope: ['Obra civil', 'Urbanización', 'Infraestructura hidráulica'],
      },
      en: {
        title: 'Urban connection',
        description:
          'An infrastructure concept that brings spaces and people together. This content will provide a basis for documenting verified solutions, challenges and outcomes.',
        scope: ['Civil works', 'Urban development', 'Water infrastructure'],
      },
    },
  },
];
