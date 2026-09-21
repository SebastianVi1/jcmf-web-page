let cleanup: (() => void) | undefined;
function init() {
  cleanup?.();
  const controller = new AbortController();
  const { signal } = controller;
  const systemTheme = matchMedia('(prefers-color-scheme: dark)');
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
    mobileNav.hidden = !open;
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
          document
            .querySelectorAll<HTMLElement>('[data-category]')
            .forEach((el) => {
              el.hidden =
                category !== 'all' && category !== el.dataset.category;
              if (!el.hidden) {
                count++;
                el.classList.remove('reveal-pending');
              }
            });
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
  const next = (event as Event & { newDocument: Document }).newDocument;
  next.documentElement.dataset.theme = document.documentElement.dataset.theme;
  next.documentElement.classList.add('js');
  cleanup?.();
});
