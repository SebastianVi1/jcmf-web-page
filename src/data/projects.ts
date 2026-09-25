import type { Locale } from '../i18n/routes';
import type { ImageMetadata } from 'astro';
import terreVista from '../assets/images/torre_vista_centro.webp';
import safiHotel from '../assets/images/safi_hotel.jpg';
import idei from '../assets/images/idei.jpg';
import muguerza from '../assets/images/hospital_mugureza_obispado.jpg';
import dosax from '../assets/images/dosax_city_doers.jpg';
import one from '../assets/images/one_development_group.jpg';
import imobilem from '../assets/images/Inmobilem.webp';

export type Category =
  | 'residential'
  | 'industrial'
  | 'infrastructure'
  | 'building'
  | 'hospitality'
  | 'healthcare';
export type ProjectText = {
  title: string;
  description: string;
  scope: string[];
  imageAlt?: string;
  budget?: string;
  location?: string;
  context?: string;
};
export type Project = {
  slug: string;
  category: Category;
  visual: 'tower' | 'hall' | 'bridge';
  image?: ImageMetadata;
  mediaType?: 'photo' | 'reference';
  position?: string;
  scopeProvided?: boolean;
  source?: { label: string; url: string };
  content: Record<Locale, ProjectText>;
};
// Las fuentes documentan el contexto público, no prueban la participación de JCMF.
// Conservar importes originales en datos, pero no publicarlos sin validar su formato.
export const projects: Project[] = [
  {
    slug: 'safi-hotel',
    category: 'hospitality',
    image: safiHotel,
    mediaType: 'photo',
    position: '65% 45%',
    scopeProvided: true,
    source: {
      label: 'SAFI Royal Luxury · Metropolitan',
      url: 'https://safihotel.com/safi-monterrey-metropolitan/',
    },

    content: {
      es: {
        title: 'Hotel SAFI Metropolitan',
        description:
          'Una fachada de vidrio que conecta hospitalidad y ciudad. La escala de la torre contrasta con la actividad del acceso y la plaza comercial.',
        imageAlt:
          'Acceso y fachada de vidrio del Hotel SAFI Metropolitan, con palmeras y comercios.',
        location: 'San Pedro Garza García, N.L.',
        context:
          'SAFI presenta Metropolitan como un hotel en San Pedro Garza García conectado con Metropolitan Center. Su oferta incluye hospedaje, restaurantes y espacios para eventos.',
        scope: [
          'Obra civil',
          'Demoliciones',
          'Obra blanca',
          'Instalaciones eléctricas',
          'HVAC',
        ],
      },
      en: {
        title: 'Hotel SAFI Metropolitan',
        description:
          'A glazed facade connecting hospitality and city life. The scale of the tower contrasts with the activity around the entrance and retail plaza.',
        imageAlt:
          'SAFI Metropolitan hotel entrance and glazed facade, with palms and shops.',
        location: 'San Pedro Garza García, N.L.',
        context:
          'SAFI describes Metropolitan as a hotel in San Pedro Garza García connected to Metropolitan Center, with accommodation, restaurants and event spaces.',
        scope: [
          'Civil works',
          'Demolition',
          'Interior finishing',
          'Electrical installations',
          'HVAC',
        ],
      },
    },
    visual: 'tower',
  },
  {
    slug: 'terre-vista-centro',
    category: 'building',
    image: terreVista,
    mediaType: 'photo',
    position: '50% 52%',
    source: {
      label: 'Monterrey Vertical · Vista Centro',
      url: 'https://monterreyvertical.com/property/departamentos-en-preventa-cerca-del-tec-de-monterrey/',
    },
    content: {
      es: {
        title: 'Terre Vista Centro (TOTUS)',
        description:
          'Ritmo horizontal, concreto expuesto y un patio que organiza la vida del edificio. La imagen proporcionada es el punto de partida de esta ficha.',
        imageAlt:
          'Fachada de Terre Vista Centro (TOTUS), balcones y ventanales desde el patio central.',
        location: 'Ubicación por confirmar',
        context:
          'Una ficha inmobiliaria menciona Torre Vista Centro en Monterrey. La coincidencia con este archivo y la denominación TOTUS requieren confirmación; no se atribuyen sus datos técnicos a esta obra.',
        scope: [
          'Participación y fechas de ejecución pendientes de documentar.',
        ],
      },
      en: {
        title: 'Terre Vista Centro (TOTUS)',
        description:
          'Horizontal rhythm, exposed concrete and a courtyard at the heart of the building. The supplied image is the starting point for this entry.',
        imageAlt:
          'Terre Vista Centro (TOTUS) balconies and glazing viewed from the central courtyard.',
        location: 'Location awaiting confirmation',
        context:
          'A property listing mentions Torre Vista Centro in Monterrey. Its match to this file and the TOTUS name need confirmation; its technical details are not attributed to this project.',
        scope: ['Involvement and execution dates awaiting documentation.'],
      },
    },
    visual: 'tower',
  },
  {
    slug: 'idei',
    category: 'building',
    image: idei,
    mediaType: 'photo',
    position: '50% 58%',
    scopeProvided: true,
    source: {
      label: 'IDEI · Portafolio oficial',
      url: 'https://idei.com.mx/',
    },
    content: {
      es: {
        title: 'IDEI · Desarrollos verticales',
        description:
          'Verticalidad, estructura y envolventes que dialogan con el paisaje urbano. Un registro visual asociado al portafolio de IDEI.',
        imageAlt:
          'Dos torres de oficinas con fachadas de vidrio y elementos estructurales expuestos.',
        location: 'Edificio específico por confirmar',
        context:
          'IDEI publica un portafolio de desarrollos residenciales, comerciales y de usos mixtos. El nombre del archivo identifica a la empresa, no confirma la torre fotografiada.',
        budget: '+22.1MDP|22021-Actual',
        scope: [
          'Obra civil',
          'Fachada',
          'Remodelaciones',
          'Demoliciones',
          'Múltiples torres',
        ],
      },
      en: {
        title: 'IDEI · Vertical developments',
        description:
          'Height, structure and envelopes in dialogue with the urban landscape. A visual reference associated with IDEI’s portfolio.',
        imageAlt:
          'Two office towers with glazed facades and exposed structural elements.',
        location: 'Specific building to be confirmed',
        context:
          'IDEI publishes a portfolio of residential, commercial and mixed-use developments. The filename identifies the company, not the specific tower shown.',
        scope: [
          'Civil works',
          'Facade',
          'Remodelling',
          'Demolition',
          'Multiple towers',
        ],
      },
    },
    visual: 'tower',
  },
  {
    slug: 'hospital-muguerza-obispado',
    category: 'healthcare',
    image: muguerza,
    mediaType: 'photo',
    position: '50% 70%',
    source: {
      label: 'CHRISTUS MUGUERZA · Hospital Alta Especialidad',
      url: 'https://www.christusmuguerza.com.mx/hospital-alta-especialidad',
    },
    content: {
      es: {
        title: 'CHRISTUS MUGUERZA · Obispado',
        description:
          'Una fachada histórica de proporciones sólidas y detalles ornamentales. La imagen reúne el carácter institucional y la memoria del edificio.',
        imageAlt:
          'Fachada histórica del Hospital Muguerza, acceso central y ventanas verticales.',
        location: 'Obispado, Monterrey, N.L.',
        context:
          'El sitio oficial identifica el Hospital Alta Especialidad en Miguel Hidalgo y Costilla 2525, colonia Obispado, Monterrey. Esta información describe la institución, no el alcance de JCMF.',
        scope: [
          'Participación y fechas de ejecución pendientes de documentar.',
        ],
      },
      en: {
        title: 'CHRISTUS MUGUERZA · Obispado',
        description:
          'A historic facade with solid proportions and ornamental details, reflecting the building’s institutional character and architectural memory.',
        imageAlt:
          'Historic Hospital Muguerza facade with a central entrance and vertical windows.',
        location: 'Obispado, Monterrey, N.L.',
        context:
          'The official site locates Hospital Alta Especialidad at Miguel Hidalgo y Costilla 2525, Obispado, Monterrey. This describes the institution, not JCMF’s scope.',
        scope: ['Involvement and execution dates awaiting documentation.'],
      },
    },
    visual: 'tower',
  },
  {
    slug: 'dosax-city-doers',
    category: 'residential',
    image: dosax,
    mediaType: 'reference',
    position: '50% 55%',
    source: {
      label: 'DOSAX City Doers · Sitio oficial',
      url: 'https://dosax.mx/',
    },
    content: {
      es: {
        title: 'DOSAX · City Doers',
        description:
          'Una torre que se recorta sobre la ciudad al anochecer. Luz, altura y una base activa articulan esta referencia visual.',
        imageAlt:
          'Torre de vivienda iluminada al anochecer, con la ciudad y montañas al fondo.',
        location: 'Desarrollo específico por confirmar',
        context:
          'DOSAX desarrolla proyectos inmobiliarios en Monterrey y publica propuestas como Históricah e Icónicah. El archivo recibido no especifica a cuál corresponde esta imagen.',
        scope: [
          'Participación y fechas de ejecución pendientes de documentar.',
        ],
      },
      en: {
        title: 'DOSAX · City Doers',
        description:
          'A tower rising over the city at dusk. Light, height and an active base shape this supplied visual reference.',
        imageAlt:
          'Illuminated residential tower at dusk with the city and mountains behind it.',
        location: 'Specific development to be confirmed',
        context:
          'DOSAX develops real estate in Monterrey and lists projects including Históricah and Icónicah. The supplied filename does not identify which development is shown.',
        scope: ['Involvement and execution dates awaiting documentation.'],
      },
    },
    visual: 'tower',
  },
  {
    slug: 'one-development-group',
    category: 'residential',
    image: one,
    mediaType: 'reference',
    position: '50% 50%',
    source: {
      label: 'ONE Development Group · Sitio oficial',
      url: 'https://www.odg.com.mx/',
    },
    content: {
      es: {
        title: 'ONE Development Group',
        description:
          'Dos volúmenes residenciales enmarcan un espacio abierto. Una composición de terrazas, vegetación y fachadas de ritmo constante.',
        imageAlt:
          'Imagen de referencia de dos torres residenciales con terrazas y un patio entre ellas.',
        location: 'Desarrollo específico por confirmar',
        context:
          'ONE es una desarrolladora mexicana con proyectos en Monterrey, San Pedro y destinos costeros. La imagen está asociada al nombre de la empresa; el desarrollo concreto está pendiente de identificar.',
        scope: [
          'Participación y fechas de ejecución pendientes de documentar.',
        ],
      },
      en: {
        title: 'ONE Development Group',
        description:
          'Two residential volumes frame an open space, composed of terraces, planting and facades with a measured rhythm.',
        imageAlt:
          'Reference image of two residential towers with terraces and a shared courtyard.',
        location: 'Specific development to be confirmed',
        context:
          'ONE is a Mexican developer with projects in Monterrey, San Pedro and coastal destinations. The image is linked to the company name; the specific development remains unidentified.',
        scope: ['Involvement and execution dates awaiting documentation.'],
      },
    },
    visual: 'tower',
  },
  {
    slug: 'imobilem',
    category: 'residential',
    image: imobilem,
    mediaType: 'reference',
    position: '50% 50%',
    source: {
      label: 'Imóbilem · Perfil del desarrollador',
      url: 'https://imobilem.com/themost/equipo/',
    },
    content: {
      es: {
        title: 'Imóbilem · Desarrollo inmobiliario',
        description:
          'Torres, basamento y terrazas escalonadas componen una imagen de ciudad. El material recibido se presenta como referencia visual.',
        imageAlt:
          'Referencia visual de dos torres con fachadas de vidrio y terrazas iluminadas.',
        location: 'Desarrollo específico por confirmar',
        context:
          'La presentación de Imóbilem describe una desarrolladora regiomontana orientada a vivienda y espacios industriales. La coincidencia con el archivo «Inmobilem.webp» es una interpretación del nombre, pendiente de confirmar.',
        scope: [
          'Participación y fechas de ejecución pendientes de documentar.',
        ],
      },
      en: {
        title: 'Imóbilem · Real estate development',
        description:
          'Towers, a podium and stepped terraces compose an urban scene. The supplied material is presented as a visual reference.',
        imageAlt:
          'Visual reference of two towers with glazed facades and illuminated terraces.',
        location: 'Specific development to be confirmed',
        context:
          'Imóbilem’s profile describes a Monterrey developer focused on housing and industrial spaces. The match to “Inmobilem.webp” is inferred from the filename and awaits confirmation.',
        scope: ['Involvement and execution dates awaiting documentation.'],
      },
    },
    visual: 'tower',
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

// Los conceptos anteriores conservan su URL, pero no se mezclan con las obras con imagen.
export const portfolioProjects = projects.filter((project) =>
  Boolean(project.image),
);
