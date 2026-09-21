import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const routes = [
  '/',
  '/nosotros/',
  '/proyectos/',
  '/contacto/',
  '/privacidad/',
  '/en/',
  '/en/about/',
  '/en/projects/',
  '/en/contact/',
  '/en/privacy/',
  '/proyectos/horizonte/',
  '/proyectos/nexo/',
  '/proyectos/conexion/',
  '/en/projects/horizonte/',
  '/en/projects/nexo/',
  '/en/projects/conexion/',
];
test('all routes render semantic localized pages without broken internal links', async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const links = new Set<string>();
  for (const route of routes) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('html')).toHaveAttribute(
      'lang',
      route.startsWith('/en/') ? 'en' : 'es',
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    );
    for (const href of await page
      .locator('a[href^="/"]')
      .evaluateAll((els) => els.map((el) => el.getAttribute('href')!)))
      links.add(href);
  }
  for (const href of links)
    expect((await request.get(href)).status(), href).toBe(200);
  expect(errors).toEqual([]);
  expect((await request.get('/missing-page/')).status()).toBe(404);
});
test('theme and locale survive client navigation and preserve project', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Activar tema oscuro' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page
    .locator('.desktop-nav')
    .getByRole('link', { name: 'Proyectos' })
    .click();
  await expect(page).toHaveURL(/\/proyectos\//);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page
    .getByRole('link', { name: 'Explorar proyecto: Horizonte residencial' })
    .click();
  await page.getByRole('link', { name: 'Switch to English' }).click();
  await expect(page).toHaveURL(/\/en\/projects\/horizonte\//);
  await expect(page.locator('h1')).toHaveText('Horizonte residences');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});
test('filters work after client navigation and restore all projects', async ({
  page,
}) => {
  await page.goto('/');
  await page
    .locator('.desktop-nav')
    .getByRole('link', { name: 'Proyectos' })
    .click();
  await page.getByRole('button', { name: 'Industrial', exact: true }).click();
  await expect(page.locator('.project-card:visible')).toHaveCount(1);
  await expect(page.locator('[data-project-count]')).toHaveText('1');
  await expect(page.locator('.project-card:visible h3')).toHaveText(
    'Nexo industrial',
  );
  await page.getByRole('button', { name: 'Todos', exact: true }).click();
  await expect(page.locator('.project-card:visible')).toHaveCount(3);
});
test('form errors focus first field and valid demo never sends a request', async ({
  page,
}) => {
  const writes: string[] = [];
  page.on('request', (r) => {
    if (r.method() === 'POST') writes.push(r.url());
  });
  await page.goto('/contacto/');
  await page.getByRole('button', { name: 'Validar mi proyecto' }).click();
  await expect(page.locator('#name')).toBeFocused();
  await expect(page.locator('#name-error')).toContainText('Escribe tu nombre');
  await page.getByLabel('Nombre completo').fill('Ana Pérez');
  await page.getByLabel('Correo electrónico').fill('ana@example.com');
  await page.getByLabel('Tipo de proyecto').selectOption('building');
  await page
    .getByLabel('Cuéntanos sobre tu proyecto')
    .fill('Queremos construir un espacio residencial con áreas comunes.');
  await page.locator('#consent').check();
  await page.getByRole('button', { name: 'Validar mi proyecto' }).click();
  await expect(page.locator('.form-status')).toContainText(
    'no se ha enviado ningún mensaje',
  );
  await expect(page.locator('#name')).toHaveValue('Ana Pérez');
  expect(writes).toEqual([]);
  expect(
    await page.evaluate(() =>
      Object.keys(localStorage).filter((k) => k !== 'jcmf-theme'),
    ),
  ).toEqual([]);
});
test('mobile navigation, Escape, focus and no overflow in both languages', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir menú' }).click();
  await expect(page.locator('#mobile-nav')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#mobile-nav')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Abrir menú' })).toBeFocused();
  await page.getByRole('button', { name: 'Abrir menú' }).click();
  await page
    .locator('#mobile-nav')
    .getByRole('link', { name: 'Nosotros' })
    .click();
  await expect(page).toHaveURL(/nosotros/);
  await expect(page.locator('#mobile-nav')).toBeHidden();
  for (const width of [320, 375, 768]) {
    await page.setViewportSize({ width, height: 812 });
    for (const route of [
      '/',
      '/en/',
      '/proyectos/',
      '/en/about/',
      '/contacto/',
      '/en/contact/',
    ]) {
      await page.goto(route);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        route + ' at ' + width,
      ).toBe(true);
    }
  }
});
test('content and navigation are available without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 375, height: 812 },
  });
  const page = await context.newPage();
  await page.goto('http://localhost:4321/');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('.desktop-nav')).toBeVisible();
  await page.goto('http://localhost:4321/proyectos/');
  await expect(page.locator('.project-card:visible')).toHaveCount(3);
  await page.goto('http://localhost:4321/contacto/');
  await expect(page.locator('noscript p')).toContainText('Activa JavaScript');
  await context.close();
});
for (const theme of ['light', 'dark']) {
  test(
    'accessibility: ' + theme + ' pages and form errors',
    async ({ page }) => {
      await page.addInitScript(
        (theme) => localStorage.setItem('jcmf-theme', theme),
        theme,
      );
      for (const route of [
        '/',
        '/nosotros/',
        '/proyectos/',
        '/contacto/',
        '/en/contact/',
      ]) {
        await page.goto(route);
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze();
        expect(
          results.violations.map((v) => ({
            id: v.id,
            nodes: v.nodes.map((n) => n.target),
          })),
          route,
        ).toEqual([]);
      }
      await page.getByRole('button', { name: 'Validate my project' }).click();
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      expect(results.violations).toEqual([]);
    },
  );
}
test('reduced motion disables animations and keyboard skip works', async ({
  page,
}) => {
  await page.goto('/');
  expect(
    await page
      .locator('.hero-title')
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe('none');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
});
