import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
} from 'react';
import type { Dictionary } from '../../i18n';

export type ConstructionCopy = Dictionary['home']['construction'];
export type SceneProps = {
  host: HTMLElement;
  onReady: () => void;
  onError: () => void;
  phases: string[];
};

export default function ConstructionIsland({
  copy,
}: {
  copy: ConstructionCopy;
}) {
  const anchor = useRef<HTMLDivElement>(null);
  const [Scene, setScene] = useState<ComponentType<SceneProps> | null>(null);
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [status, setStatus] = useState<
    'static' | 'loading' | 'ready' | 'error'
  >('static');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const section = anchor.current!.closest<HTMLElement>(
      '[data-construction]',
    )!;
    setHost(section);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const short = matchMedia('(max-height: 659px)');
    let cancelled = false;
    let generation = 0;
    function configure() {
      const current = ++generation;
      setScene(null);
      const disabled = reduced.matches || short.matches;
      section.dataset.mode = disabled ? 'static' : 'loading';
      setStatus(disabled ? 'static' : 'loading');
      if (disabled) return;
      const probe = document.createElement('canvas');
      const context = probe.getContext('webgl2');
      if (!context) {
        section.dataset.mode = 'static';
        setStatus('error');
        return;
      }
      context.getExtension('WEBGL_lose_context')?.loseContext();
      import('./ConstructionScene')
        .then(({ default: Component }) => {
          if (!cancelled && current === generation) setScene(() => Component);
        })
        .catch((error: unknown) => {
          console.warn('Construction scene could not be initialized', error);
          if (!cancelled && current === generation) {
            section.dataset.mode = 'static';
            setStatus('error');
          }
        });
    }
    const skip = section.querySelector<HTMLAnchorElement>(
      '[data-construction-skip]',
    )!;
    const focusTarget = () =>
      document.getElementById('capacidades')?.focus({ preventScroll: true });
    skip.addEventListener('click', focusTarget);
    const stop = () => {
      cancelled = true;
      generation++;
      setScene(null);
    };
    configure();
    reduced.addEventListener('change', configure);
    short.addEventListener('change', configure);
    document.addEventListener('astro:before-swap', stop);
    return () => {
      stop();
      reduced.removeEventListener('change', configure);
      short.removeEventListener('change', configure);
      skip.removeEventListener('click', focusTarget);
      document.removeEventListener('astro:before-swap', stop);
    };
  }, [attempt]);

  const ready = useCallback(() => {
    if (!host?.isConnected) return;
    host.dataset.mode = 'ready';
    setStatus('ready');
  }, [host]);
  const fail = useCallback(() => {
    if (!host?.isConnected) return;
    host.dataset.mode = 'static';
    setScene(null);
    setStatus('error');
  }, [host]);

  return (
    <div className="construction-island" ref={anchor}>
      {Scene && host && (
        <Scene
          host={host}
          onReady={ready}
          onError={fail}
          phases={copy.phases}
        />
      )}
      {status === 'loading' && (
        <p className="construction-loading">{copy.loading}</p>
      )}
      {status === 'error' && (
        <div className="construction-error" aria-hidden="false">
          <p>{copy.error}</p>
          <button
            type="button"
            className="text-link"
            onClick={() => setAttempt((value) => value + 1)}
          >
            {copy.retry}
          </button>
        </div>
      )}
    </div>
  );
}
