import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import type { Dictionary } from '../../i18n';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Pause,
  Play,
} from 'lucide-react';
import { createSteering, type SteerDirection, type Steering } from './progress';

export type ConstructionCopy = Dictionary['home']['construction'];
export type SceneProps = {
  host: HTMLElement;
  onReady: () => void;
  onError: () => void;
  phases: string[];
  paused: boolean;
  manual: boolean;
  lowPower: boolean;
  steering: Steering;
  steerEpoch: number;
};

const arrowKeys: Record<string, SteerDirection> = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
  ArrowDown: 'down',
};

export default function ConstructionIsland({
  copy,
}: {
  copy: ConstructionCopy;
}) {
  const anchor = useRef<HTMLDivElement>(null);
  const steering = useMemo(() => createSteering(), []);
  const [Scene, setScene] = useState<ComponentType<SceneProps> | null>(null);
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [status, setStatus] = useState<
    'static' | 'loading' | 'ready' | 'error'
  >('static');
  const [attempt, setAttempt] = useState(0);
  const [paused, setPaused] = useState(false);
  const [manual, setManual] = useState(false);
  const [lowPower, setLowPower] = useState(false);
  const [steerEpoch, setSteerEpoch] = useState(0);

  useEffect(() => {
    const section = anchor.current!.closest<HTMLElement>(
      '[data-construction]',
    )!;
    setHost(section);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const short = matchMedia('(max-height: 659px)');
    let cancelled = false;
    let generation = 0;
    let pending: (() => void) | null = null;
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
      const debugInfo = context.getExtension('WEBGL_debug_renderer_info');
      const renderer = debugInfo
        ? String(context.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL))
        : '';
      setLowPower(
        /swiftshader|llvmpipe|software|subzero|basic render/i.test(renderer),
      );
      context.getExtension('WEBGL_lose_context')?.loseContext();
      const start = () => {
        pending = null;
        if (cancelled || current !== generation) return;
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
      };
      // The scene module and the model parse are heavy. Wait until the page has
      // finished loading and the main thread is idle so the posters cover them
      // instead of freezing the page during startup.
      const idle = (callback: () => void) =>
        typeof window.requestIdleCallback === 'function'
          ? window.requestIdleCallback(callback, { timeout: 2000 })
          : window.setTimeout(callback, 200);
      const defer = () => {
        if (cancelled) return;
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (!entry.isIntersecting) return;
            observer.disconnect();
            pending = null;
            idle(start);
          },
          { rootMargin: '500px 0px' },
        );
        observer.observe(section);
        pending = () => observer.disconnect();
      };
      if (document.readyState === 'complete') defer();
      else {
        window.addEventListener('load', defer, { once: true });
        pending = () => window.removeEventListener('load', defer);
      }
    }
    const skip = section.querySelector<HTMLAnchorElement>(
      '[data-construction-skip]',
    )!;
    const focusTarget = () =>
      document
        .getElementById(skip.hash.slice(1))
        ?.focus({ preventScroll: true });
    skip.addEventListener('click', focusTarget);
    const releaseSteering = () => {
      steering.releaseAll();
      setSteerEpoch((value) => value + 1);
    };
    window.addEventListener('blur', releaseSteering);
    const stop = () => {
      cancelled = true;
      generation++;
      pending?.();
      pending = null;
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
      window.removeEventListener('blur', releaseSteering);
      document.removeEventListener('astro:before-swap', stop);
    };
  }, [attempt, steering]);

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

  // Fluid steering: held controls move continuously; a tap still glides. The
  // float keeps running; only the idle spin yields to manual control.
  const press = useCallback(
    (direction: SteerDirection) => {
      steering.press(direction);
      setManual(true);
      setSteerEpoch((value) => value + 1);
    },
    [steering],
  );
  const release = useCallback(
    (direction: SteerDirection) => {
      steering.release(direction);
      setSteerEpoch((value) => value + 1);
    },
    [steering],
  );
  const onSteerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const direction = arrowKeys[event.key];
    if (!direction) return;
    // Arrow keys steer the model instead of scrolling the page.
    event.preventDefault();
    press(direction);
  };
  const onSteerKeyUp = (event: KeyboardEvent<HTMLDivElement>) => {
    const direction = arrowKeys[event.key];
    if (direction) release(direction);
  };
  const controls = (direction: SteerDirection) => ({
    onPointerDown: () => press(direction),
    onPointerUp: () => release(direction),
    onPointerCancel: () => release(direction),
    onPointerLeave: () => release(direction),
    onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      press(direction);
    },
    onKeyUp: (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === 'Enter' || event.key === ' ') release(direction);
    },
  });
  const activate = (
    event: MouseEvent<HTMLButtonElement>,
    direction: SteerDirection,
  ) => {
    // Assistive technology may activate a button without pointer/key events.
    if (event.detail !== 0) return;
    press(direction);
    release(direction);
  };

  const motionLabel = paused
    ? copy.resume
    : manual
      ? copy.resumeSpin
      : copy.pause;

  return (
    <div className="construction-island" ref={anchor}>
      {Scene && host && (
        <Scene
          host={host}
          onReady={ready}
          onError={fail}
          phases={copy.phases}
          paused={paused}
          manual={manual}
          lowPower={lowPower}
          steering={steering}
          steerEpoch={steerEpoch}
        />
      )}
      {status === 'ready' && (
        <>
          <div
            className="construction-steer"
            role="group"
            aria-label={copy.steer}
            onKeyDown={onSteerKeyDown}
            onKeyUp={onSteerKeyUp}
          >
            <button
              type="button"
              className="construction-steer-up icon-button"
              aria-label={copy.steerUp}
              title={copy.steerUp}
              onClick={(event) => activate(event, 'up')}
              {...controls('up')}
            >
              <ArrowUp size={18} aria-hidden="true" />
              <span className="construction-tooltip" aria-hidden="true">
                {copy.steerUp}
              </span>
            </button>
            <button
              type="button"
              className="construction-steer-left icon-button"
              aria-label={copy.steerLeft}
              title={copy.steerLeft}
              onClick={(event) => activate(event, 'left')}
              {...controls('left')}
            >
              <ArrowLeft size={18} aria-hidden="true" />
              <span className="construction-tooltip" aria-hidden="true">
                {copy.steerLeft}
              </span>
            </button>
            <button
              type="button"
              className="construction-steer-down icon-button"
              aria-label={copy.steerDown}
              title={copy.steerDown}
              onClick={(event) => activate(event, 'down')}
              {...controls('down')}
            >
              <ArrowDown size={18} aria-hidden="true" />
              <span className="construction-tooltip" aria-hidden="true">
                {copy.steerDown}
              </span>
            </button>
            <button
              type="button"
              className="construction-steer-right icon-button"
              aria-label={copy.steerRight}
              title={copy.steerRight}
              onClick={(event) => activate(event, 'right')}
              {...controls('right')}
            >
              <ArrowRight size={18} aria-hidden="true" />
              <span className="construction-tooltip" aria-hidden="true">
                {copy.steerRight}
              </span>
            </button>
          </div>
          <button
            type="button"
            className="construction-motion icon-button"
            aria-label={motionLabel}
            title={motionLabel}
            onClick={() => {
              if (paused) {
                setPaused(false);
                setManual(false);
              } else if (manual) setManual(false);
              else setPaused(true);
            }}
          >
            {paused || manual ? (
              <Play size={18} aria-hidden="true" />
            ) : (
              <Pause size={18} aria-hidden="true" />
            )}
            <span className="construction-tooltip" aria-hidden="true">
              {motionLabel}
            </span>
          </button>
        </>
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
