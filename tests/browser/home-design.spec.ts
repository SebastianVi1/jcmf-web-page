import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('large uppercase brand fits at responsive breakpoints', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  for (const width of [
    320, 360, 361, 375, 479, 480, 600, 601, 700, 701, 900, 901, 1100, 1101,
    1400, 1401, 1799, 1800, 1920,
  ]) {
    await page.setViewportSize({ width, height: 1000 });
    const title = page.locator('.construction-title');
    await expect(title).toHaveCSS('text-transform', 'uppercase');
    await expect(title).toHaveCSS('font-family', /Bebas Neue/);
    const fits = await title.evaluate((element) => {
      const box = element.getBoundingClientRect();
      const parent = element.parentElement!.getBoundingClientRect();
      return (
        box.left >= parent.left &&
        box.right <= parent.right &&
        box.top >= parent.top &&
        box.bottom <= parent.bottom &&
        document.documentElement.scrollWidth <= innerWidth
      );
    });
    expect(fits, `Brand must fit at ${width}px`).toBe(true);
  }
});

test('home remains readable and navigable across locales, themes and narrow screens', async ({
  page,
}) => {
  test.setTimeout(90000);
  for (const theme of ['light', 'dark']) {
    await page.addInitScript(
      (value) => localStorage.setItem('jcmf-theme', value),
      theme,
    );
    for (const locale of ['es', 'en']) {
      for (const width of [375, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto(locale === 'es' ? '/' : '/en/');
        await page.evaluate(() => document.fonts.ready);
        await page
          .locator('.construction-poster-complete')
          .evaluate((el) => (el as HTMLImageElement).decode());
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        await expect(page.locator('.construction-brand')).toHaveCSS(
          'opacity',
          '1',
        );
        await expect(page.locator('.metrics-grid > div')).toHaveCount(3);
        await expect(page.locator('#metrics-note')).toContainText(
          locale === 'es' ? 'Datos ficticios' : 'Fictional figures',
        );
        for (const image of await page.locator('.visual-gallery img').all()) {
          await image.scrollIntoViewIfNeeded();
          await expect
            .poll(() =>
              image.evaluate((el) => (el as HTMLImageElement).naturalWidth),
            )
            .toBeGreaterThan(0);
        }
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        const violations = (
          await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
            .analyze()
        ).violations;
        expect(
          violations.map(({ id, nodes }) => ({
            id,
            targets: nodes.map(({ target }) => target),
          })),
        ).toEqual([]);
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({
          path:
            'test-results/home-' + locale + '-' + theme + '-' + width + '.png',
          fullPage: true,
        });
        const primary = page
          .locator(
            `.section-heading a[href="${locale === 'es' ? '/proyectos/' : '/en/projects/'}"]`,
          )
          .first();
        await primary.focus();
        await page.keyboard.press('Enter');
        await expect(page).toHaveURL(
          locale === 'es' ? /\/proyectos\/$/ : /\/en\/projects\/$/,
        );
      }
    }
  }
});

test('hero remains usable when its static poster cannot load', async ({
  page,
}) => {
  await page.route('**/*', (route) =>
    route.request().resourceType() === 'image'
      ? route.abort()
      : route.continue(),
  );
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator('.construction-poster-complete')
        .evaluate(
          (el) =>
            el.getAnimations().filter((a) => a.playState === 'running').length,
        ),
    )
    .toBe(0);
  await expect(page.locator('.construction-skip')).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.construction-poster-complete')).toHaveCSS(
    'animation-name',
    'none',
  );
  const link = page.locator('.construction-skip');
  await link.focus();
  await expect(link.locator('svg')).toHaveCSS('transform', 'none');
  await page.keyboard.press('Enter');
  await expect(page.locator('#capacidades')).toBeFocused();
});

test('team roles have editable name placeholders in both languages', async ({
  page,
}) => {
  for (const locale of ['es', 'en']) {
    await page.goto(locale === 'es' ? '/nosotros/' : '/en/about/');
    await expect(page.locator('.team-grid article')).toHaveCount(8);
    for (const person of await page.locator('.team-grid article').all()) {
      await expect(person.locator('h3')).not.toBeEmpty();
      await expect(person.locator('.team-name')).toHaveText(
        locale === 'es' ? 'Nombre por confirmar' : 'Name to be confirmed',
      );
    }
  }
});
