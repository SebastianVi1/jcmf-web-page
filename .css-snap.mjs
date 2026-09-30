import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
const out = process.argv[2];
mkdirSync(out, { recursive: true });
const settle = async (page) => {
  await page.evaluate(async () => {
    for (const img of document.images) img.loading = 'eager';
    await new Promise((res) => {
      let y = 0;
      const step = () => {
        y += 700;
        scrollTo(0, y);
        if (y < document.body.scrollHeight) requestAnimationFrame(step);
        else res();
      };
      step();
    });
    scrollTo(0, 0);
    await Promise.all(
      [...document.images].map((i) =>
        i.complete
          ? null
          : new Promise((r) => {
              i.onload = i.onerror = r;
            }),
      ),
    );
    await document.fonts.ready;
  });
  await page.waitForTimeout(600);
};
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: 'reduce',
  colorScheme: 'light',
});
for (const [name, path] of [
  ['home', '/'],
  ['projects', '/proyectos/'],
  ['detail', '/proyectos/safi-hotel/'],
  ['about', '/nosotros/'],
  ['contact', '/contacto/'],
  ['home-en', '/en/'],
]) {
  await page.goto('http://localhost:4322' + path, { waitUntil: 'networkidle' });
  await settle(page);
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
}
const mobile = await browser.newPage({
  viewport: { width: 375, height: 812 },
  reducedMotion: 'reduce',
  colorScheme: 'light',
});
await mobile.goto('http://localhost:4322/', { waitUntil: 'networkidle' });
await settle(mobile);
const height = await mobile.evaluate(
  () => document.documentElement.scrollHeight,
);
console.log('mobile scrollHeight:', height);
await mobile.screenshot({ path: `${out}/home-mobile.png`, fullPage: true });
await browser.close();
