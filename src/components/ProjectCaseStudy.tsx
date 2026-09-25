import type { Dictionary } from '../i18n';
import type { ProjectText } from '../data/projects';
import ProjectPhoto, { type ProjectPhotoProps } from './ProjectPhoto';

interface Props {
  title: string;
  content: ProjectText;
  category: string;
  mediaLabel: string;
  photo: ProjectPhotoProps;
  source?: { label: string; url: string };
  scopeProvided: boolean;
  copy: Dictionary['projects'];
  imageCaption: string;
}

/** Grid editorial compartido: imagen íntegra, ficha, contexto y alcance.
 * No se repite una fotografía simulando una galería con vistas inexistentes.
 */
export default function ProjectCaseStudy({
  title,
  content,
  category,
  mediaLabel,
  photo,
  source,
  scopeProvided,
  copy,
  imageCaption,
}: Props) {
  return (
    <div className="case-grid">
      <figure className="case-photo">
        <ProjectPhoto {...photo} mode="color" />
        <figcaption className="case-caption">
          <span>{imageCaption}</span>
          <a href={photo.src} target="_blank" rel="noreferrer">
            {copy.fullImage} <span aria-hidden="true">↗</span>
          </a>
        </figcaption>
      </figure>
      <aside className="case-facts" aria-label={copy.facts}>
        <p className="eyebrow">{copy.facts}</p>
        <dl>
          <div>
            <dt>{copy.sector}</dt>
            <dd>{category}</dd>
          </div>
          <div>
            <dt>{copy.location}</dt>
            <dd>{content.location || copy.locationValue}</dd>
          </div>
          <div>
            <dt>{copy.material}</dt>
            <dd>{mediaLabel}</dd>
          </div>
          <div>
            <dt>{copy.status}</dt>
            <dd>{copy.photoStatus}</dd>
          </div>
        </dl>
        <p className="case-disclaimer">{copy.verificationNote}</p>
      </aside>
      <section className="case-overview" data-reveal="line">
        <p className="eyebrow">{copy.overview}</p>
        <h2>{title}</h2>
        <p className="large-copy">{content.description}</p>
      </section>
      <section className="case-scope" data-reveal="line">
        <p className="eyebrow">
          {scopeProvided ? copy.providedScope : copy.scope}
        </p>
        <h2>{scopeProvided ? copy.intervention : copy.toDocument}</h2>
        <ul>
          {content.scope.map((item) => (
            <li key={item}>
              <span aria-hidden="true">+</span>
              {item}
            </li>
          ))}
        </ul>
        {scopeProvided && <p className="caption">{copy.scopeNote}</p>}
      </section>
      <section className="case-context" data-reveal="line">
        <div>
          <p className="eyebrow">{copy.research}</p>
          <h2>{copy.contextTitle}</h2>
        </div>
        <div>
          <p>{content.context || copy.noSource}</p>
          {source ? (
            <a
              className="text-link"
              href={source.url}
              target="_blank"
              rel="noreferrer"
            >
              {source.label}
              <span aria-hidden="true">↗</span>
            </a>
          ) : (
            <p className="caption">{copy.noSource}</p>
          )}
        </div>
      </section>
    </div>
  );
}
