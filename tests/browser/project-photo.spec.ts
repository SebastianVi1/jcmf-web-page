import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('photo reveals color on hover and keyboard focus, and links to localized detail', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/proyectos/');
  const card = page
    .locator('.project-card')
    .filter({ hasText: 'Terre Vista Centro (TOTUS)' });
  const photo = card.locator('img');
  await card.scrollIntoViewIfNeeded();
  await expect
    .poll(() => photo.evaluate((el) => (el as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(0);
  await expect(photo).toHaveCSS('filter', 'grayscale(1)');
  await photo.hover();
  await expect(card.locator('.photo-corners')).toHaveCount(0);
  await expect(photo).toHaveCSS('filter', 'grayscale(0)');
  await card.screenshot({ path: 'test-results/totus-color.png' });
  await page.mouse.move(0, 0);
  await expect(photo).toHaveCSS('filter', 'grayscale(1)');
  await card.screenshot({ path: 'test-results/totus-monochrome.png' });
  const link = card.locator('a.project-image');
  await link.focus();
  await expect(photo).toHaveCSS('filter', 'grayscale(0)');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/proyectos\/terre-vista-centro\//);
  await expect(page.locator('h1')).toHaveText('Terre Vista Centro (TOTUS)');
  await expect(page.locator('.case-photo img')).toHaveAttribute(
    'loading',
    'eager',
  );
  await page.getByRole('link', { name: 'Switch to English' }).click();
  await expect(page).toHaveURL(/\/en\/projects\/terre-vista-centro\//);
  await expect(page.locator('.case-caption')).toContainText('Supplied image');
  // Medir contraste en el estado final, no durante los revelados de scroll.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.reveal-pending')).toHaveCount(0);
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});

test('photo stays usable on touch screens and respects reduced motion', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.goto('http://localhost:4321/proyectos/');
  const photo = page
    .locator('.project-card')
    .filter({ hasText: 'Terre Vista Centro (TOTUS)' })
    .locator('img');
  await photo.scrollIntoViewIfNeeded();
  await expect
    .poll(() => photo.evaluate((el) => (el as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(0);
  await photo.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await expect(photo).toHaveCSS('filter', 'grayscale(0)');
  await expect(photo).toHaveCSS('transform', 'none');
  await expect(photo).toHaveCSS('transition-duration', '0s');
  await page.screenshot({ path: 'test-results/totus-mobile.png' });
  await photo.tap();
  await expect(page).toHaveURL(/terre-vista-centro/);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await context.close();
});

test('photo failure preserves the card and project navigation', async ({
  page,
}) => {
  await page.route('**/*', (route) =>
    route.request().resourceType() === 'image' &&
    route.request().url().includes('torre_vista_centro')
      ? route.abort()
      : route.continue(),
  );
  await page.goto('/proyectos/');
  const card = page
    .locator('.project-card')
    .filter({ hasText: 'Terre Vista Centro (TOTUS)' });
  await card.scrollIntoViewIfNeeded();
  await expect(card.getByRole('status')).toContainText('No se pudo cargar');
  await expect(card.locator('.project-photo')).toHaveAttribute(
    'data-failed',
    'true',
  );
  await card.locator('h3 a').click();
  await expect(page.locator('h1')).toHaveText('Terre Vista Centro (TOTUS)');
});
