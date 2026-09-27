import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import sharp from 'sharp';

async function seek(page: Page, progress: number) {
  await page.evaluate((value) => {
    const host = document.querySelector<HTMLElement>('[data-construction]')!;
    const stage = host.querySelector<HTMLElement>('.construction-stage')!;
    const start =
      host.getBoundingClientRect().top +
      scrollY -
      parseFloat(getComputedStyle(stage).top);
    scrollTo({
      top: start + value * 0.9 * (host.offsetHeight - stage.offsetHeight),
      behavior: 'instant',
    });
  }, progress);
  await expect
    .poll(
      async () =>
        Number(await page.locator('canvas').getAttribute('data-progress')),
      { timeout: 30000 },
    )
    .toBeCloseTo(progress, 2);
}

test('construction is visible, reversible, idle when stopped, and cleans up during navigation', async ({
  page,
}, testInfo) => {
  test.setTimeout(120000);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('[data-construction]')).toHaveAttribute(
    'data-mode',
    'ready',
    { timeout: 60000 },
  );
  const initialStats = await sharp(
    await page.locator('canvas').screenshot(),
  ).stats();
  expect(
    Math.max(
      ...initialStats.channels.slice(0, 3).map((channel) => channel.stdev),
    ),
  ).toBeGreaterThan(8);
  await seek(page, 0.55);
  await expect(page.locator('[data-construction-phase]')).toHaveText('Muros');
  const screenshot = await page.locator('canvas').screenshot();
  const stats = await sharp(screenshot).stats();
  expect(
    Math.max(...stats.channels.slice(0, 3).map((channel) => channel.stdev)),
  ).toBeGreaterThan(8);
  await page.screenshot({ path: testInfo.outputPath('structure.png') });
  await seek(page, 1);
  await expect(page.locator('[data-construction-phase]')).toHaveText(
    'Edificio terminado',
  );
  await seek(page, 0.55);
  await expect(page.locator('[data-construction-phase]')).toHaveText('Muros');
  await expect
    .poll(
      async () => {
        const frames = await page.locator('canvas').getAttribute('data-frames');
        await page.waitForTimeout(1200);
        return (
          (await page.locator('canvas').getAttribute('data-frames')) === frames
        );
      },
      { timeout: 15000 },
    )
    .toBe(true);
  await page
    .locator('.desktop-nav')
    .getByRole('link', { name: 'Nosotros' })
    .click();
  await expect(page.locator('canvas')).toHaveCount(0);
  await page
    .locator('.desktop-nav')
    .getByRole('link', { name: 'Inicio', exact: true })
    .click();
  await expect(page.locator('[data-construction]')).toHaveAttribute(
    'data-mode',
    'ready',
    { timeout: 60000 },
  );
  await expect(page.locator('canvas')).toHaveCount(1);
  expect(errors).toEqual([]);
});

test('mobile English dark scene fits, changes theme and supports the keyboard skip link', async ({
  page,
}, testInfo) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => localStorage.setItem('jcmf-theme', 'dark'));
  await page.goto('/en/');
  await expect(page.locator('[data-construction]')).toHaveAttribute(
    'data-mode',
    'ready',
    { timeout: 60000 },
  );
  await seek(page, 0.45);
  await expect(page.locator('[data-construction-phase]')).toHaveText('Walls');
  const boxes = await page.evaluate(() => {
    const rect = (selector: string) => {
      const { top, bottom, left, right } = document
        .querySelector(selector)!
        .getBoundingClientRect();
      return { top, bottom, left, right };
    };
    return {
      text: rect('.construction-copy'),
      scene: rect('canvas'),
      footer: rect('.construction-footer'),
      overflow: document.documentElement.scrollWidth > innerWidth,
    };
  });
  expect(boxes.text.bottom).toBeLessThanOrEqual(boxes.scene.top + 1);
  expect(boxes.scene.bottom).toBeLessThanOrEqual(boxes.footer.top + 1);
  expect(boxes.overflow).toBe(false);
  await page.screenshot({ path: testInfo.outputPath('mobile-dark.png') });
  const stats = await sharp(await page.locator('canvas').screenshot()).stats();
  expect(
    Math.max(...stats.channels.slice(0, 3).map((channel) => channel.stdev)),
  ).toBeGreaterThan(8);
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  const axe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(axe.violations).toEqual([]);
  await page.locator('[data-construction-skip]').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#capacidades')).toBeFocused();
  await expect(page.locator('#services-title')).toBeInViewport();
});

test('reduced motion never downloads the model or the scene module and remains static', async ({
  page,
}) => {
  const downloads: string[] = [];
  page.on('request', (request) => {
    if (/building\.glb|ConstructionScene/.test(request.url()))
      downloads.push(request.url());
  });
  await page.goto('/');
  await expect(page.locator('[data-construction]')).toHaveAttribute(
    'data-mode',
    'static',
  );
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.locator('.construction-poster-complete')).toBeVisible();
  expect(
    await page
      .locator('.construction-poster-complete')
      .evaluate(
        (image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
      ),
  ).toBe(true);
  await page.evaluate(() => scrollTo(0, 300));
  const action = page.locator('.construction-actions a').first();
  await action.hover();
  await expect(action.locator('svg')).toHaveCSS('transform', 'none');
  expect(downloads).toEqual([]);
});

test('a failed model keeps navigation usable and can be retried', async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.route('**/models/building.glb', (route) => route.abort());
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Reintentar' })).toBeVisible();
  await expect(page.locator('[data-construction]')).toHaveAttribute(
    'data-mode',
    'static',
  );
  await expect(
    page.getByRole('link', { name: 'Explorar proyectos', exact: true }),
  ).toBeVisible();
  await page.unroute('**/models/building.glb');
  await page.getByRole('button', { name: 'Reintentar' }).click();
  await expect(page.locator('[data-construction]')).toHaveAttribute(
    'data-mode',
    'ready',
    { timeout: 60000 },
  );
});

test('late model loading preserves the layout and catches up to the current scroll', async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/models/building.glb', async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto('/');
  await expect(page.locator('[data-construction]')).toHaveAttribute(
    'data-mode',
    'loading',
  );
  await expect(page.locator('.construction-poster-start')).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Explorar proyectos', exact: true }),
  ).toBeVisible();
  const height = await page
    .locator('[data-construction]')
    .evaluate((host) => host.getBoundingClientRect().height);
  await page.evaluate(() => {
    const host = document.querySelector<HTMLElement>('[data-construction]')!;
    const stage = host.querySelector<HTMLElement>('.construction-stage')!;
    scrollTo({
      top:
        host.offsetTop -
        parseFloat(getComputedStyle(stage).top) +
        0.63 * (host.offsetHeight - stage.offsetHeight),
      behavior: 'instant',
    });
  });
  release();
  await expect(page.locator('[data-construction]')).toHaveAttribute(
    'data-mode',
    'ready',
    { timeout: 60000 },
  );
  await expect
    .poll(
      async () =>
        Number(await page.locator('canvas').getAttribute('data-progress')),
      { timeout: 30000 },
    )
    .toBeCloseTo(0.7, 2);
  expect(
    await page
      .locator('[data-construction]')
      .evaluate((host) => host.getBoundingClientRect().height),
  ).toBe(height);
});

test('WebGL unavailable uses a completed poster without fetching the model', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (type === 'webgl2') return null;
      return Reflect.apply(original, this, [type, ...args]);
    } as typeof original;
  });
  let downloaded = false;
  page.on('request', (request) => {
    if (request.url().includes('building.glb')) downloaded = true;
  });
  await page.goto('/');
  await expect(page.locator('[data-construction]')).toHaveAttribute(
    'data-mode',
    'static',
  );
  await expect(page.locator('.construction-poster-complete')).toBeVisible();
  expect(downloaded).toBe(false);
});

test('changing motion preference and losing context release the canvas', async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.locator('[data-construction]')).toHaveAttribute(
    'data-mode',
    'ready',
    { timeout: 60000 },
  );
  await seek(page, 0.35);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.locator('[data-construction]')).toHaveAttribute(
    'data-mode',
    'static',
  );
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('[data-construction]')).toHaveAttribute(
    'data-mode',
    'ready',
    { timeout: 60000 },
  );
  await page.locator('canvas').evaluate((canvas: HTMLCanvasElement) => {
    canvas
      .getContext('webgl2')!
      .getExtension('WEBGL_lose_context')!
      .loseContext();
  });
  await expect(page.getByRole('button', { name: 'Reintentar' })).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
});
