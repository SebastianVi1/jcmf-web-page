import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: 'no-preference',
});
page.on('pageerror', (error) => console.error(error.message));
await mkdir('test-results/construction', { recursive: true });
await mkdir('public/images/construction', { recursive: true });
try {
  await page.goto(process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:4321/');
  await page
    .locator('[data-construction][data-mode="ready"]')
    .waitFor({ timeout: 60000 });
  await page.locator('.construction-motion').click();
  const seek = async (value) => {
    await page.evaluate((p) => {
      const host = document.querySelector('[data-construction]');
      const stage = host.querySelector('.construction-stage');
      const top =
        host.getBoundingClientRect().top +
        scrollY -
        parseFloat(getComputedStyle(stage).top);
      scrollTo({
        top:
          top +
          (p === 1 ? 0.96 : p * 0.9) * (host.offsetHeight - stage.offsetHeight),
        behavior: 'instant',
      });
    }, value);
    await page.waitForFunction(
      (p) =>
        Math.abs(
          Number(document.querySelector('canvas').dataset.progress) - p,
        ) < 0.001,
      value,
    );
    await page.waitForTimeout(150);
  };
  for (const progress of [0, 0.35, 0.6, 1]) {
    await seek(progress);
    await page.screenshot({
      path: `test-results/construction/desktop-${progress}.png`,
    });
  }
  await page.setViewportSize({ width: 375, height: 812 });
  await page.getByRole('button', { name: 'Activar tema oscuro' }).click();
  await seek(1);
  await page.mouse.move(0, 0);
  await page.screenshot({
    path: 'test-results/construction/mobile-finale.png',
  });
  await page.getByRole('button', { name: 'Activar tema claro' }).click();
  await page.setViewportSize({ width: 1200, height: 1400 });
  await page.addStyleTag({
    content: `
    html, body, .construction-hero { background: transparent !important; }
    .construction-stage { height: 1200px !important; }
    .construction-visual { position: absolute !important; inset: 0 !important; margin: 0 !important; }
    .construction-brand, .construction-footer, .construction-poster, .construction-motion { visibility: hidden !important; }
  `,
  });
  for (const [name, progress] of [
    ['start', 0],
    ['complete', 1],
  ]) {
    await seek(progress);
    const buffer = await page
      .locator('canvas')
      .screenshot({ omitBackground: true });
    await sharp(buffer)
      .resize(1200, 1200)
      .webp({ quality: 88 })
      .toFile(`public/images/construction/${name}.webp`);
  }
  console.log(
    'Captured desktop stages and generated transparent construction posters.',
  );
} finally {
  await browser.close();
}
