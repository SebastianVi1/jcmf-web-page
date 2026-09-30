import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 375, height: 812 },
  reducedMotion: 'reduce',
});
await page.goto('http://localhost:4322/', { waitUntil: 'networkidle' });
const info = await page.evaluate(() =>
  [...document.querySelectorAll('main > section, main > div, footer')].map(
    (el) => ({
      cls: el.className.toString().slice(0, 32),
      top: Math.round(el.getBoundingClientRect().top + scrollY),
      h: Math.round(el.getBoundingClientRect().height),
    }),
  ),
);
console.log(JSON.stringify(info));
await browser.close();
