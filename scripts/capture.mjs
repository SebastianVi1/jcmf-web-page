import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  colorScheme: 'light',
  reducedMotion: 'reduce',
});
await mkdir('test-results/screenshots', { recursive: true });
await page.goto('http://localhost:4321/');
await page.evaluate(() => document.fonts.ready);
await page.screenshot({
  path: 'test-results/screenshots/home-desktop.png',
  fullPage: true,
});
await page.getByRole('button', { name: 'Activar tema oscuro' }).click();
await page.screenshot({
  path: 'test-results/screenshots/home-dark.png',
  fullPage: true,
});
await page.getByRole('button', { name: 'Activar tema claro' }).click();
await page.setViewportSize({ width: 375, height: 812 });
await page.screenshot({
  path: 'test-results/screenshots/home-mobile.png',
  fullPage: true,
});
await page.goto('http://localhost:4321/en/contact/');
await page.waitForFunction(() => !document.querySelector('.form-submit')?.disabled);
await page.screenshot({
  path: 'test-results/screenshots/contact-mobile.png',
  fullPage: true,
});
await page.locator('#type').click();
await page.screenshot({ path: 'test-results/screenshots/select-mobile.png' });
await page.keyboard.press('Escape');
await page.setViewportSize({ width: 1200, height: 630 });
await page.goto('http://localhost:4321/');
await page.addStyleTag({
  content:
    '.site-header{position:static}.header-inner{min-height:75px}.desktop-nav,.header-actions,.hero-bottom,.sector-strip,.hero-buttons,body>main>section:not(.hero),.site-footer{display:none!important}.hero{padding-top:25px}.hero-title{font-size:84px}.hero-copy{padding-top:5px}.hero-description{font-size:15px}.architecture-hero svg{max-height:485px}.hero-visual{height:475px}',
});
await page.screenshot({ path: 'public/social-card.png' });
await browser.close();
console.log('Screenshots and social card generated.');
