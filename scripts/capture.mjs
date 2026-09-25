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
    '.site-header{position:static}.header-inner{min-height:65px}.desktop-nav,.header-actions,.hero-bottom,.sector-strip,body>main>section:not(.masthead),.site-footer{display:none!important}.masthead-content{min-height:565px;padding-block:30px}.masthead .hero-title{font-size:108px}.masthead-footer{margin-top:24px}.masthead-actions{margin-top:18px}',
});
await page.screenshot({ path: 'public/social-card.png' });
await browser.close();
console.log('Blue architectural design screenshots and social card generated.');
