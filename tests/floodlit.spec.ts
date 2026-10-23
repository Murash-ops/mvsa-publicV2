import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect } from '@playwright/test';

/**
 * The Floodlit design's promises: the picker asks for the Arena by name, the
 * motion stops for anyone who asks, the logo has a name, no child appears,
 * and nothing calls the bookable thing "the turf".
 */

test('the kick-off picker builds a WhatsApp request to book the Arena at that time', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-23T05:00:00Z')); // 08:00 in Nairobi
  await page.route('**/public/slots**', (route) => route.abort());
  await page.goto('/');

  const picker = page.getByTestId('kickoff-picker');
  await picker.getByRole('button', { name: '18:00' }).click();
  await expect(picker.getByRole('button', { name: '18:00' })).toHaveAttribute('aria-pressed', 'true');

  const cta = page.getByTestId('kickoff-cta');
  await expect(cta).toHaveText(/Ask for 18:00/);
  const href = (await cta.getAttribute('href')) ?? '';
  expect(href.startsWith('https://wa.me/254798258950?text=')).toBe(true);
  const message = decodeURIComponent(href.split('?text=')[1]);
  expect(message).toBe('Hi MVSA, I would like to book the Arena today at 18:00. Is it free?');
});

test('reduced motion stops the marquee', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  const marquee = page.getByTestId('marquee-track');
  await expect(marquee).toBeAttached();
  expect(await marquee.evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
});

test('with motion allowed the marquee runs', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const marquee = page.getByTestId('marquee-track');
  expect(await marquee.evaluate((el) => getComputedStyle(el).animationName)).not.toBe('none');
});

test('the logo carries the arena name for screen readers', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('link', { name: 'Mountain View Sports Arena, home' }).first()).toBeVisible();
  await expect(page.getByRole('img', { name: 'Mountain View Sports Arena' }).first()).toBeAttached();
  // The old raster logo and lockups are gone from the pages.
  await expect(page.locator('img[src*="logo.png"], img[src*="lockup"], img[src*="mark.webp"]')).toHaveCount(0);
});

test('the status pill says whether the Arena is open', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('status-pill')).toHaveText(/Open now · until midnight|Opens 06:00/);
});

function filesUnder(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });
}

test('no source file refers to the photographs of children (shots 24 to 35)', () => {
  const offenders = filesUnder(join(__dirname, '..', 'src'))
    .filter((file) => /\.(tsx?|css|json|md)$/.test(file))
    .filter((file) => /shot-(2[4-9]|3[0-5])\b/.test(readFileSync(file, 'utf8')));
  expect(offenders).toEqual([]);
});

const PAGES = ['/', '/book', '/programs', '/programs/football_academy', '/about', '/contact', '/shop'];

for (const path of PAGES) {
  test(`${path} never calls the Arena "the turf"`, async ({ page }) => {
    await page.goto(path);
    const text = (await page.locator('body').innerText()).toLowerCase();
    for (const banned of ['turf from', 'turf hire', 'book the turf', 'main arena turf', 'turf bookings']) {
      expect(text, `"${banned}" on ${path}`).not.toContain(banned);
    }
  });
}

test('every page shows no price but KES 1,500', async ({ page }) => {
  for (const path of PAGES.filter((p) => p !== '/book')) {
    await page.goto(path);
    const text = await page.locator('body').innerText();
    const prices = text.match(/KES\s?[\d,]+/gi) ?? [];
    for (const price of prices) expect(price.replace(/\s/g, ' ')).toMatch(/KES 1,500/i);
  }
});

test('the footer lists the five programmes', async ({ page }) => {
  await page.goto('/');
  const footer = page.locator('footer');
  for (const name of ['Football Academy', 'Chess Club', 'Boxing', 'Community Yoga', 'Dance & Rhythm']) {
    await expect(footer.getByRole('link', { name, exact: true })).toBeVisible();
  }
});

test('an unknown page is answered in the Arena style', async ({ page }) => {
  const response = await page.goto('/no-such-page');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Out of');
});

test('nothing on the page shimmers or glows: buttons are flat and still', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const cta = page.getByRole('link', { name: 'Book on WhatsApp' }).first();
  expect(await cta.evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
  expect(await cta.evaluate((el) => getComputedStyle(el).backgroundImage)).toBe('none');
  await expect(page.locator('.lights, .lamp-bar')).toHaveCount(0);
});
