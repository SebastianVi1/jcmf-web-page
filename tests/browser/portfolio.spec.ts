import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const slugs = [
  'terre-vista-centro',
  'safi-hotel',
  'idei',
  'hospital-muguerza-obispado',
  'dosax-city-doers',
  'one-development-group',
  'imobilem',
];

test('all seven project grids preserve images and fit desktop and mobile', async ({
  page,
}) => {
  for (const width of [375, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    for (const slug of slugs) {
      await page.goto('/proyectos/' + slug + '/');
      const photo = page.locator('.case-photo img');
      await expect(photo).toBeVisible();
      await expect
        .poll(() =>
          photo.evaluate((image) => (image as HTMLImageElement).naturalWidth),
        )
        .toBeGreaterThan(0);
      const ratios = await photo.evaluate((el) => {
        const image = el as HTMLImageElement;
        const box = image.getBoundingClientRect();
        return [
          box.width / box.height,
          image.naturalWidth / image.naturalHeight,
        ];
      });
      expect(Math.abs(ratios[0] - ratios[1])).toBeLessThan(0.01);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await expect(page.locator('.case-facts')).toBeVisible();
      if (slug === 'idei')
        await page.screenshot({
          path: 'test-results/idei-' + width + '.png',
          fullPage: true,
        });
    }
  }
});

test('portfolio composition and dark case study are accessible', async ({
  page,
}) => {
  await page.goto('/proyectos/');
  await expect(page.locator('.work-card')).toHaveCount(7);
  const cards = page.locator('.work-card');
  const second = await cards.nth(1).boundingBox();
  const third = await cards.nth(2).boundingBox();
  expect(Math.abs(second!.y - third!.y)).toBeLessThan(2);
  expect(third!.x).toBeGreaterThan(second!.x);
  for (const image of await page.locator('.portfolio-grid img').all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() => image.evaluate((el) => (el as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
  }
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({
    path: 'test-results/portfolio-desktop.png',
    fullPage: true,
  });
  await page.goto('/');
  await page
    .locator('.hero-real-photo img')
    .evaluate((el) => (el as HTMLImageElement).decode());
  await page.screenshot({ path: 'test-results/portfolio-home.png' });
  await page.getByRole('button', { name: 'Activar tema oscuro' }).click();
  await page.goto('/en/projects/safi-hotel/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(results.violations).toEqual([]);
  await page
    .locator('.case-photo img')
    .evaluate((el) => (el as HTMLImageElement).decode());
  await page.screenshot({ path: 'test-results/safi-dark.png', fullPage: true });
});
