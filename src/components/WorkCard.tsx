import ProjectPhoto, { type ProjectPhotoProps } from './ProjectPhoto';

interface Props {
  href: string;
  title: string;
  category: string;
  categoryKey: string;
  mediaLabel: string;
  viewLabel: string;
  photo: ProjectPhotoProps;
  /** Número de catálogo en el índice del portafolio; opcional en otras vistas. */
  index?: number;
}

/** Una tarjeta por obra; la navegación funciona desde el HTML, antes de hidratar. */
export default function WorkCard({
  href,
  title,
  category,
  categoryKey,
  mediaLabel,
  viewLabel,
  photo,
  index,
}: Props) {
  return (
    <article
      className="project-card work-card"
      data-category={categoryKey}
      data-reveal="image"
    >
      <a
        className="project-image"
        href={href}
        aria-label={viewLabel + ': ' + title}
      >
        <ProjectPhoto {...photo} />
        {index !== undefined && (
          <span className="project-badge" aria-hidden="true">
            {String(index).padStart(2, '0')}
          </span>
        )}
        <span className="project-image-arrow" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 19 19 5M5 5h14v14"
              stroke="currentColor"
              strokeWidth="1.3"
            />
          </svg>
        </span>
      </a>
      <div className="project-meta">
        <span>{category}</span>
        <span>{mediaLabel}</span>
      </div>
      <h3>
        <a href={href}>{title}</a>
      </h3>
      <span className="work-card-rule" aria-hidden="true" />
    </article>
  );
}
