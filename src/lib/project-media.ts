import { getImage } from 'astro:assets';
import type { Project } from '../data/projects';
import type { ProjectPhotoProps } from '../components/ProjectPhoto';

/** Adaptador de compilación: optimiza una vez y pasa solo datos serializables a React. */
export async function getProjectPhoto(project: Project, priority = false) {
  const source = project.image;
  if (!source) return undefined;
  const widths = [
    ...new Set(
      [480, 800, 1200, 1600].map((width) => Math.min(width, source.width)),
    ),
  ];
  const images = await Promise.all(
    widths.map((width) =>
      getImage({ src: source, width, format: 'webp', quality: 82 }),
    ),
  );
  return {
    src: images[images.length - 1].src,
    srcSet: images
      .map((image, index) => `${image.src} ${widths[index]}w`)
      .join(', '),
    sizes: priority
      ? '(max-width: 900px) calc(100vw - 46px), 65vw'
      : '(max-width: 600px) calc(100vw - 46px), 50vw',
    width: source.width,
    height: source.height,
    position: project.position,
    priority,
  } satisfies Omit<ProjectPhotoProps, 'alt' | 'errorLabel'>;
}
