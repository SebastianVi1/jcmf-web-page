# Portafolio de ejemplo

## Alcance

Siete archivos locales incorporados. La página es una demostración: descripciones breves, sin cifras de obra, fechas o atribuciones no confirmadas. El equipo se dejó fuera por indicación del usuario. No se descargaron imágenes externas.

## Fuentes consultadas

Consulta: 21 de septiembre de 2026. Las fuentes describen edificios o desarrolladoras; no acreditan por sí mismas la participación de JCMF.

| Archivo                        | Referencia                                                                                                                       | Límite de la identificación                                                                                                                         |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| torre_vista_centro.webp        | [Vista Centro, Monterrey Vertical](https://monterreyvertical.com/property/departamentos-en-preventa-cerca-del-tec-de-monterrey/) | Fuente inmobiliaria secundaria. No confirma TOTUS ni la coincidencia exacta. Se conserva el nombre Terre Vista Centro proporcionado por el usuario. |
| safi_hotel.jpg                 | [SAFI Metropolitan](https://safihotel.com/safi-monterrey-metropolitan/)                                                          | Hotel y contexto de Metropolitan Center. Alcance de JCMF tomado del código del usuario, no del sitio del hotel.                                     |
| idei.jpg                       | [IDEI](https://idei.com.mx/)                                                                                                     | Empresa y tipos de desarrollo; torre exacta pendiente. Alcances existentes conservados.                                                             |
| hospital_mugureza_obispado.jpg | [CHRISTUS MUGUERZA Alta Especialidad](https://www.christusmuguerza.com.mx/hospital-alta-especialidad)                            | Nombre y ubicación institucional; participación pendiente. Se conserva el nombre original del archivo.                                              |
| dosax_city_doers.jpg           | [DOSAX City Doers](https://dosax.mx/)                                                                                            | Desarrolladora, no identificación definitiva de la torre. Imagen marcada como referencia.                                                           |
| one_development_group.jpg      | [ONE Development Group](https://www.odg.com.mx/)                                                                                 | Empresa; no se asigna arbitrariamente el nombre de un desarrollo al archivo.                                                                        |
| Inmobilem.webp                 | [Perfil Imóbilem](https://imobilem.com/themost/equipo/)                                                                          | Coincidencia inferida del nombre. Resultado indexado disponible; lectura directa devolvió acceso restringido. Proyecto exacto pendiente.            |

El importe original de IDEI `+22.1MDP|22021-Actual` se conserva en datos, pero no se publica: requiere confirmar formato y periodo. No se corrigió como si fuera un hecho verificado.

## Reutilización

1. Importar un archivo local en src/data/projects.ts.
2. Añadir un registro con slug estable, categoría, tipo de material, punto de enfoque y textos es/en. Separar descripción visual, contexto público y alcance proporcionado.
3. WorkCard recibe la imagen optimizada, enlaces y etiquetas. ProjectCaseStudy recibe la misma imagen, descripción, ficha, alcance y fuente. No necesita un componente distinto por edificio.
4. getProjectPhoto genera WebP de 480/800/1200/1600 px sin ampliar el original; sizes se adapta a la variante destacada, tarjeta o detalle.
5. Usar el componente para cada obra; no copiar su estructura ni simular varias fotografías recortando el mismo archivo.

Las imágenes verticales se conservan completas en el detalle. Hover/foco revela color en tarjetas; táctil conserva color; movimiento reducido elimina transiciones. Errores de carga mantienen dimensiones y el enlace a la ficha.

## Conciliación de diseño

| Regla anterior                | Evolución solicitada                  | Resolución                                                                                 |
| ----------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------ |
| Hero principalmente vectorial | Fotos reales con estructuras animadas | Fotografía dominante con estudio estructural secundario.                                   |
| Proyectos conceptuales        | Siete imágenes locales                | Galería de archivos proporcionados; concepto anterior fuera de la galería, URL conservada. |
| Detalle fijo 16:9             | Encajar fotografías verticales        | Grid responsivo con proporción original sin recorte.                                       |

Paleta, fuentes, accesibilidad y navegación compartidas se conservan. No hay efectos infinitos ni dependencias de animación nuevas.
