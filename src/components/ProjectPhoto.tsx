import { useEffect, useRef, useState, type CSSProperties } from 'react';

export interface ProjectPhotoProps {
  src: string;
  srcSet?: string;
  sizes?: string;
  width: number;
  height: number;
  alt: string;
  errorLabel: string;
  priority?: boolean;
  position?: string;
  mode?: 'reveal' | 'color';
}

/**
 * Fotografía reutilizable. Astro entrega URLs optimizadas, nunca se importa
 * astro:assets en el navegador. CSS controla color/zoom incluso antes de hidratar.
 * El enlace y su nombre accesible pertenecen a la tarjeta que contiene la imagen.
 */
export default function ProjectPhoto({
  src,
  srcSet,
  sizes,
  width,
  height,
  alt,
  errorLabel,
  priority = false,
  position = '50% 50%',
  mode = 'reveal',
}: ProjectPhotoProps) {
  const image = useRef<HTMLImageElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // Una imagen puede fallar antes de client:visible; recuperar también ese caso.
    const element = image.current;
    setFailed(Boolean(element?.complete && element.naturalWidth === 0));
  }, [src]);

  return (
    <span
      className="project-photo"
      data-mode={mode}
      data-failed={failed || undefined}
      style={{ '--photo-position': position } as CSSProperties}
    >
      <img
        ref={image}
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        width={width}
        height={height}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        onError={() => setFailed(true)}
        onLoad={() => setFailed(false)}
      />
      {failed && (
        <span className="project-photo-error" role="status">
          {errorLabel}
        </span>
      )}
    </span>
  );
}
