// ClientRouter conserva este módulo entre páginas: cada inicialización debe
// retirar los eventos y observadores asociados al documento anterior.
let cleanup: (() => void) | undefined;
function init() {
  cleanup?.();
  const controller = new AbortController();
  const { signal } = controller;
  const systemTheme = matchMedia('(prefers-color-scheme: dark)');
  // El almacenamiento puede estar bloqueado; el tema del sistema es el respaldo.
  function storedTheme() {
    try {
      return localStorage.getItem('jcmf-theme');
    } catch {
      return null;
    }
  }
  const toggle = document.querySelector<HTMLButtonElement>('.theme-toggle');
  function applyTheme(theme: string) {
    document.documentElement.dataset.theme = theme;
    const label =
      theme === 'dark' ? toggle?.dataset.lightLabel : toggle?.dataset.darkLabel;
    if (label && toggle) {
      toggle.setAttribute('aria-label', label);
      toggle.title = label;
    }
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute(
        'content',
        getComputedStyle(document.documentElement)
          .getPropertyValue('--bg')
          .trim(),
      );
  }
  const stored = storedTheme();
  applyTheme(
    stored === 'dark' || stored === 'light'
      ? stored
      : systemTheme.matches
        ? 'dark'
        : 'light',
  );
  toggle?.addEventListener(
    'click',
    () => {
      const theme =
        document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      applyTheme(theme);
      try {
        localStorage.setItem('jcmf-theme', theme);
      } catch {}
    },
    { signal },
  );
  systemTheme.addEventListener(
    'change',
    (event) => {
      if (!storedTheme()) applyTheme(event.matches ? 'dark' : 'light');
    },
    { signal },
  );
  const menu = document.querySelector<HTMLButtonElement>('.menu-toggle');
  const mobileNav = document.querySelector<HTMLElement>('#mobile-nav');
  function setMenu(open: boolean) {
    if (!menu || !mobileNav) return;
    if (open) {
      mobileNav.hidden = false;
      // Se reinicia la animación de entrada; el cierre sigue siendo inmediato.
      mobileNav.classList.remove('nav-enter');
      void mobileNav.offsetWidth;
      mobileNav.classList.add('nav-enter');
    } else {
      mobileNav.hidden = true;
      mobileNav.classList.remove('nav-enter');
    }
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute(
      'aria-label',
      (open ? menu.dataset.closeLabel : menu.dataset.openLabel) || '',
    );
  }
  menu?.addEventListener(
    'click',
    () => setMenu(menu.getAttribute('aria-expanded') !== 'true'),
    { signal },
  );
  document.addEventListener(
    'keydown',
    (event) => {
      if (
        event.key === 'Escape' &&
        menu?.getAttribute('aria-expanded') === 'true'
      ) {
        setMenu(false);
        menu.focus();
      }
    },
    { signal },
  );
  document.addEventListener(
    'click',
    (event) => {
      if (!(event.target as Element).closest('.site-header')) setMenu(false);
    },
    { signal },
  );
  matchMedia('(min-width: 901px)').addEventListener(
    'change',
    () => setMenu(false),
    { signal },
  );
  // Mejora progresiva: el contenido permanece visible sin JS o sin observador.
  // Solo se oculta lo que está bajo el viewport y cada revelado ocurre una vez.
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let observer: IntersectionObserver | undefined;
  if (!reduced.matches && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('reveal-pending');
            observer?.unobserve(entry.target);
          }
        }),
      { threshold: 0.08 },
    );
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
      if (el.getBoundingClientRect().top > innerHeight) {
        el.classList.add('reveal-pending');
        observer!.observe(el);
      }
    });
  }
  // Cambiar la preferencia de movimiento nunca debe dejar contenido oculto.
  const showAll = () => {
    observer?.disconnect();
    document
      .querySelectorAll('.reveal-pending')
      .forEach((el) => el.classList.remove('reveal-pending'));
  };
  reduced.addEventListener('change', showAll, { signal });
  document
    .querySelectorAll<HTMLButtonElement>('[data-filter]')
    .forEach((button) =>
      button.addEventListener(
        'click',
        () => {
          const category = button.dataset.filter;
          document
            .querySelectorAll('[data-filter]')
            .forEach((el) =>
              el.setAttribute('aria-pressed', String(el === button)),
            );
          let count = 0;
          const entering: HTMLElement[] = [];
          document
            .querySelectorAll<HTMLElement>('[data-category]')
            .forEach((el) => {
              const visible =
                category === 'all' || category === el.dataset.category;
              if (!visible) {
                el.hidden = true;
                el.classList.remove('filter-enter');
                return;
              }
              count++;
              // Un resultado recién filtrado debe ser visible inmediatamente.
              const wasHidden = el.hidden;
              el.hidden = false;
              el.classList.remove('reveal-pending');
              if (wasHidden) entering.push(el);
            });
          // La entrada se desvanece por columnas; la salida no se retiene.
          entering.forEach((el) => el.classList.remove('filter-enter'));
          if (entering.length) {
            void document.body.offsetHeight;
            entering.forEach((el) => el.classList.add('filter-enter'));
          }
          const counter = document.querySelector('[data-project-count]');
          if (counter) counter.textContent = String(count);
        },
        { signal },
      ),
    );
  cleanup = () => {
    controller.abort();
    observer?.disconnect();
  };
}
document.addEventListener('astro:page-load', init);
document.addEventListener('astro:before-swap', (event) => {
  // Transferir el tema antes del intercambio evita destellos entre páginas.
  const next = (event as Event & { newDocument: Document }).newDocument;
  next.documentElement.dataset.theme = document.documentElement.dataset.theme;
  next.documentElement.classList.add('js');
  cleanup?.();
});
