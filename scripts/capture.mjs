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
await page.waitForFunction(
  () => !document.querySelector('.form-submit')?.disabled,
);
await page.screenshot({
  path: 'test-results/screenshots/contact-mobile.png',
  fullPage: true,
});
await page.locator('#type').click();
await page.screenshot({ path: 'test-results/screenshots/select-mobile.png' });
await page.keyboard.press('Escape');
await page.setViewportSize({ width: 1440, height: 1000 });
await page.goto('http://localhost:4321/nosotros/');
await page.screenshot({
  path: 'test-results/screenshots/about-desktop.png',
  fullPage: true,
});
await page.goto('http://localhost:4321/proyectos/');
await page.screenshot({
  path: 'test-results/screenshots/projects-desktop.png',
  fullPage: true,
});
await page.setViewportSize({ width: 1200, height: 630 });
await page.goto('http://localhost:4321/');
await page.addStyleTag({
  content:
    '.site-header{position:static}.header-inner{min-height:65px}.desktop-nav,.header-actions,.hero-bottom,.sector-strip,body>main>section:not(.hero),.site-footer{display:none!important}.hero{padding-top:20px}.hero-heading-row{margin-top:15px;gap:35px;grid-template-columns:1fr 275px}.hero-title{font-size:61px}.hero-summary .text-link{display:none}.hero-description{font-size:13px}.hero-visual{margin-top:20px}.architecture-hero svg{max-height:290px}.hero-visual figcaption{padding-block:12px}',
});
await page.screenshot({ path: 'public/social-card.png' });
await browser.close();
console.log('Minimal design screenshots and social card generated.');
