import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import sharp from 'sharp';
import { wrapPi } from '../../src/features/construction/progress';

async function openConstruction(page: Page, path = '/proyectos/') {
  await page.goto(path);
  await page.locator('.construction-intro').scrollIntoViewIfNeeded();
}

async function seek(page: Page, progress: number) {
  await page.evaluate((value) => {
    const host = document.querySelector<HTMLElement>('[data-construction]')!;
    const stage = host.querySelector<HTMLElement>('.construction-stage')!;
    const start =
      host.getBoundingClientRect().top +
      scrollY -
      parseFloat(getComputedStyle(stage).top);
    const range =
      host.offsetHeight -
      stage.offsetHeight -
      parseFloat(
        getComputedStyle(host).getPropertyValue('--construction-finale'),
      );
    scrollTo({
      top: start + (value === 1 ? 1.02 : value * 0.9) * range,
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

test('construction is visible, reversible, idle when paused, and cleans up during navigation', async ({
  page,
}, testInfo) => {
  test.setTimeout(120000);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await openConstruction(page);
  await expect(page.locator('[data-construction]')).toHaveAttribute(
    'data-mode',
    'ready',
    { timeout: 60000 },
  );
  await page.locator('.construction-motion').click();
  const initialAngle = await page
    .locator('canvas')
    .getAttribute('data-azimuth');
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
  await expect(page.locator('canvas')).not.toHaveAttribute(
    'data-azimuth',
    initialAngle!,
  );
  await expect(page.locator('canvas')).toHaveAttribute(
    'data-elevation',
    '0.42000',
  );
  await expect(page.locator('.construction-visual')).toHaveCSS('z-index', '1');
  await page.screenshot({ path: testInfo.outputPath('finished.png') });
  await expect(page.locator('[data-construction-phase]')).toHaveText(
    'Edificio terminado',
  );
  await seek(page, 0.55);
  await expect(page.locator('[data-construction-phase]')).toHaveText('Muros');
  await page.setViewportSize({ width: 1280, height: 900 });
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
    .getByRole('link', { name: 'Proyectos', exact: true })
    .click();
  await page.locator('.construction-intro').scrollIntoViewIfNeeded();
  await expect(page.locator('[data-construction]')).toHaveAttribute(
    'data-mode',
    'ready',
    { timeout: 60000 },
  );
  await expect(page.locator('canvas')).toHaveCount(1);
  expect(errors).toEqual([]);
});

test('continuous motion settles the finished building facing front and stops offscreen', async ({
  page,
}) => {
  test.setTimeout(150000);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await openConstruction(page);
  const host = page.locator('[data-construction]');
  const canvas = page.locator('canvas');
  await expect(host).toHaveAttribute('data-mode', 'ready', { timeout: 60000 });
  await seek(page, 1);
  await expect(host).toHaveAttribute('data-idle', 'running');
  await expect(canvas).toHaveAttribute('data-progress', '1.0000');
  // The finished building turns to face the camera and stops rotating while
  // the float continues.
  const azimuth = Number(await canvas.getAttribute('data-azimuth'));
  await expect
    .poll(
      async () =>
        wrapPi(Number(await canvas.getAttribute('data-yaw')) - azimuth),
      { timeout: 15000 },
    )
    .toBeCloseTo(0, 3);
  const yaw = await canvas.getAttribute('data-yaw');
  const lift = await canvas.getAttribute('data-lift');
  const before = await page.screenshot();
  await page.waitForTimeout(1000);
  await expect(canvas).toHaveAttribute('data-yaw', yaw!);
  await expect(canvas).not.toHaveAttribute('data-lift', lift!);
  expect((await page.screenshot()).equals(before)).toBe(false);
  await page.getByRole('button', { name: 'Pausar giro y flotación' }).click();
  await expect(host).toHaveAttribute('data-idle', 'paused');
  await page.waitForTimeout(200);
  const pausedYaw = await canvas.getAttribute('data-yaw');
  await page.waitForTimeout(1000);
  await expect(canvas).toHaveAttribute('data-yaw', pausedYaw!);
  await expect
    .poll(async () => {
      const frames = await canvas.getAttribute('data-frames');
      await page.waitForTimeout(1000);
      return (await canvas.getAttribute('data-frames')) === frames;
    })
    .toBe(true);
  await page.getByRole('button', { name: 'Reanudar giro y flotación' }).click();
  await expect(host).toHaveAttribute('data-idle', 'running');
  // Scrolling back leaves the facade settle and resumes the idle turn.
  await seek(page, 0.5);
  await page.waitForTimeout(200);
  const spinning = await canvas.getAttribute('data-yaw');
  await page.waitForTimeout(1000);
  await expect(canvas).not.toHaveAttribute('data-yaw', spinning!);
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await expect(host).toHaveAttribute('data-idle', 'paused');
  await page.waitForTimeout(1000);
  await expect
    .poll(async () => {
      const frames = await canvas.getAttribute('data-frames');
      await page.waitForTimeout(1000);
      return (await canvas.getAttribute('data-frames')) === frames;
    })
    .toBe(true);
  await seek(page, 0.5);
  await expect(host).toHaveAttribute('data-idle', 'running');
  await page.mouse.move(0, 0);
  const samples = await page.evaluate(async () => {
    const host = document.querySelector<HTMLElement>('[data-construction]')!;
    const canvas = host.querySelector('canvas')!;
    window.dispatchEvent(new Event('blur'));
    const poses = [];
    for (let i = 0; i < 12; i++) {
      scrollBy({ top: 10, behavior: 'instant' });
      await new Promise((resolve) => setTimeout(resolve, 100));
      poses.push({
        state: host.dataset.idle,
        yaw: canvas.dataset.yaw,
        lift: canvas.dataset.lift,
      });
    }
    return poses;
  });
  expect(samples.every(({ state }) => state === 'running')).toBe(true);
  expect(samples.at(-1)!.yaw).not.toBe(samples[0].yaw);
  expect(samples.at(-1)!.lift).not.toBe(samples[0].lift);
});

test('scroll drives the building turn from the right to the frontal finish', async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await openConstruction(page);
  const host = page.locator('[data-construction]');
  const canvas = page.locator('canvas');
  await expect(host).toHaveAttribute('data-mode', 'ready', { timeout: 60000 });
  const turn = async () => {
    const yaw = Number(await canvas.getAttribute('data-yaw'));
    const azimuth = Number(await canvas.getAttribute('data-azimuth'));
    return wrapPi(yaw - azimuth);
  };
  await seek(page, 0.15);
  await page.waitForTimeout(150);
  const start = await turn();
  await seek(page, 0.55);
  await page.waitForTimeout(150);
  const middle = await turn();
  await seek(page, 0.95);
  await page.waitForTimeout(150);
  const nearEnd = await turn();
  await seek(page, 1);
  await page.waitForTimeout(150);
  const finish = await turn();
  // The turn sweeps right to left with the scroll and ends on the facade.
  expect(start).toBeGreaterThan(1.2);
  expect(middle).toBeLessThan(start);
  expect(nearEnd).toBeLessThan(middle);
  expect(Math.abs(finish)).toBeLessThan(0.02);
});

test('arrow controls steer fluidly, keep the float, and hold the idle spin', async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await openConstruction(page);
  const host = page.locator('[data-construction]');
  const canvas = page.locator('canvas');
  await expect(host).toHaveAttribute('data-mode', 'ready', { timeout: 60000 });
  await seek(page, 0.3);
  await expect(host).toHaveAttribute('data-idle', 'running');
  const readYaw = async () => Number(await canvas.getAttribute('data-yaw'));
  const readLift = async () => Number(await canvas.getAttribute('data-lift'));
  const readElevation = async () =>
    Number(await canvas.getAttribute('data-elevation'));
  const right = page.getByRole('button', {
    name: 'Girar el edificio a la derecha',
  });
  await right.hover();
  const y0 = await readYaw();
  const l0 = await readLift();
  // Holding the control turns the model continuously (no steps) while the
  // float keeps running and nothing pauses.
  await page.mouse.down();
  await page.waitForTimeout(1200);
  const during = await page.evaluate(async () => {
    const canvas = document.querySelector('canvas')!;
    const values: string[] = [];
    for (let i = 0; i < 10; i++) {
      await new Promise((resolve) => setTimeout(resolve, 60));
      values.push(canvas.dataset.yaw!);
    }
    return values;
  });
  await page.mouse.up();
  expect(new Set(during).size).toBeGreaterThan(4);
  expect(await readLift()).not.toBe(l0);
  await expect(host).toHaveAttribute('data-idle', 'running');
  expect(wrapPi((await readYaw()) - y0)).toBeGreaterThan(0.3);
  // Releasing leaves the building where it is: the idle spin stays held and
  // only the tail of the steering glide remains.
  await page.waitForTimeout(1300);
  const held = await readYaw();
  await page.waitForTimeout(900);
  expect(Math.abs((await readYaw()) - held)).toBeLessThan(1e-3);
  // A quick tap still nudges the model.
  await right.click();
  await expect.poll(readYaw).toBeGreaterThan(held);
  const nudged = await readYaw();
  // Arrow keys steer the same way and never scroll the page.
  const scrollBefore = await page.evaluate(() => scrollY);
  await page
    .getByRole('button', { name: 'Girar el edificio a la izquierda' })
    .focus();
  await page.keyboard.down('ArrowLeft');
  await page.waitForTimeout(800);
  await page.keyboard.up('ArrowLeft');
  await expect.poll(readYaw).toBeLessThan(nudged);
  expect(await page.evaluate(() => scrollY)).toBe(scrollBefore);
  // Up and down tilt the view fluidly (held keys steer continuously).
  const base = await readElevation();
  await page
    .getByRole('button', { name: 'Inclinar la vista hacia arriba' })
    .focus();
  await page.keyboard.down('ArrowUp');
  await page.waitForTimeout(800);
  await page.keyboard.up('ArrowUp');
  await expect.poll(readElevation).toBeGreaterThan(base + 0.1);
  await page.keyboard.down('ArrowDown');
  await page.waitForTimeout(800);
  await page.keyboard.up('ArrowDown');
  await expect.poll(readElevation).toBeLessThan(base + 0.1);
  // The play button resumes the idle turn from the manual orientation.
  await page.getByRole('button', { name: 'Reanudar giro' }).click();
  await expect(host).toHaveAttribute('data-idle', 'running');
  await page.waitForTimeout(200);
  const spinning = await readYaw();
  await page.waitForTimeout(1000);
  expect(await readYaw()).not.toBe(spinning);
});

test('mobile English dark scene fits, changes theme and supports the keyboard skip link', async ({
  page,
}, testInfo) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => localStorage.setItem('jcmf-theme', 'dark'));
  await openConstruction(page, '/en/projects/');
  await expect(page.locator('[data-construction]')).toHaveAttribute(
    'data-mode',
    'ready',
    { timeout: 60000 },
  );
  await page.locator('.construction-motion').click();
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
      stage: rect('.construction-stage'),
      scene: rect('canvas'),
      footer: rect('.construction-footer'),
      overflow: document.documentElement.scrollWidth > innerWidth,
    };
  });
  expect(boxes.scene.top).toBeCloseTo(boxes.stage.top, 0);
  expect(boxes.scene.bottom).toBeLessThanOrEqual(boxes.stage.bottom);
  expect(boxes.scene.bottom).toBeLessThanOrEqual(boxes.footer.top + 1);
  expect(boxes.overflow).toBe(false);
  await page.screenshot({ path: testInfo.outputPath('mobile-dark.png') });
  const stats = await sharp(await page.locator('canvas').screenshot()).stats();
  expect(
    Math.max(...stats.channels.slice(0, 3).map((channel) => channel.stdev)),
  ).toBeGreaterThan(8);
  await seek(page, 1);
  await expect(page.locator('#construction-title')).toBeVisible();
  await page.mouse.move(0, 0);
  await page.screenshot({ path: testInfo.outputPath('mobile-finale.png') });
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await seek(page, 1);
  const axe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(axe.violations).toEqual([]);
  await page.locator('[data-construction-skip]').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#cta-title')).toBeFocused();
  await expect(page.locator('#cta-title')).toBeInViewport();
});

test('reduced motion never downloads the model or the scene module and remains static', async ({
  page,
}) => {
  const downloads: string[] = [];
  page.on('request', (request) => {
    if (/building\.glb|ConstructionScene/.test(request.url()))
      downloads.push(request.url());
  });
  await openConstruction(page);
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
  await expect(page.locator('.construction-motion')).toHaveCount(0);
  const action = page.locator('.construction-skip');
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
  await openConstruction(page);
  // The scene bootstrap is deferred until the page is idle, so the error can
  // appear a moment after load.
  await expect(page.getByRole('button', { name: 'Reintentar' })).toBeVisible({
    timeout: 15000,
  });
  await expect(page.locator('[data-construction]')).toHaveAttribute(
    'data-mode',
    'static',
  );
  await expect(
    page
      .locator('.desktop-nav')
      .getByRole('link', { name: 'Proyectos', exact: true }),
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
  await openConstruction(page);
  await expect(page.locator('[data-construction]')).toHaveAttribute(
    'data-mode',
    'loading',
  );
  await expect(page.locator('.construction-poster-start')).toBeVisible();
  await expect(
    page
      .locator('.desktop-nav')
      .getByRole('link', { name: 'Proyectos', exact: true }),
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
        0.63 *
          (host.offsetHeight -
            stage.offsetHeight -
            parseFloat(
              getComputedStyle(host).getPropertyValue('--construction-finale'),
            )),
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
  await openConstruction(page);
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
  await openConstruction(page);
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
