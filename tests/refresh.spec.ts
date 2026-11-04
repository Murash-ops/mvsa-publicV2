import { test, expect, type Page } from '@playwright/test';
import { getAcademyPrograms } from '../src/lib/academy-programs';
import { getStory } from '../src/content/programs';

/**
 * The November refresh, as Murash asked for it:
 * - the home page is a shop window; booking lives on /book behind one Book button;
 * - the shop is easy to find (an animated bag that keeps still for reduced motion);
 * - What's on is on the home page and its own page;
 * - /book holds the Arena and the meeting room;
 * - every programme has its own shareable page, share card and register link,
 *   and no Academy page shows a fee, a Till number or payment instructions.
 */

const programs = getAcademyPrograms();
const WA = 'https://wa.me/254798258950?text=';

async function visibleBookLinksInHeader(page: Page) {
  return page.locator('header').getByRole('link', { name: /^book/i }).filter({ visible: true }).count();
}

test.describe('one Book button', () => {
  test('on a desktop, the header has exactly one Book, and it goes to /book', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    expect(await visibleBookLinksInHeader(page)).toBe(1);
    await expect(page.locator('header').getByTestId('nav-book').filter({ visible: true })).toHaveAttribute('href', '/book');
  });

  test('on a phone, Book stays in the bar (once) and is not repeated in the menu', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    expect(await visibleBookLinksInHeader(page)).toBe(1);
    await page.getByRole('button', { name: 'Open menu' }).click();
    await expect(page.locator('#mobile-menu').getByRole('link', { name: /^book/i })).toHaveCount(0);
  });

  test('the home page carries no booking widget and no primary Book button in the body', async ({ page }) => {
    await page.goto('/');
    const main = page.locator('main');
    for (const id of ['kickoff-picker', 'kickoff-cta', 'booking-offline', 'venue-grid', 'date-strip', 'slot-grid']) {
      await expect(main.getByTestId(id)).toHaveCount(0);
    }
    // Links to /book in the body are secondary: never the filled primary button.
    const bodyBookLinks = main.locator('a[href="/book"]');
    expect(await bodyBookLinks.count()).toBeGreaterThan(0);
    for (const link of await bodyBookLinks.all()) {
      await expect(link).not.toHaveClass(/\b(shine|btn-gold)\b/);
    }
  });

  test('the home page shows what is on, the programmes, the meeting room and the shop', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'What’s on', level: 2 })).toBeVisible();
    await expect(page.getByTestId('whats-on-item').first()).toBeVisible();
    await expect(page.getByTestId('program-tile')).toHaveCount(programs.length);
    await expect(page.locator('main a[href="/book#meeting-room"]')).toBeVisible();
    await expect(page.locator('main a[href="/shop"]').first()).toBeVisible();
  });
});

test.describe('the shop bag', () => {
  test('is in the desktop navigation, next to the word Shop, and swings', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const link = page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Shop' });
    await expect(link).toHaveAttribute('href', '/shop');
    const bag = link.getByTestId('shop-icon').locator('.shop-bag');
    await expect(bag).toBeAttached();
    expect(await bag.evaluate((el) => getComputedStyle(el).animationName)).toBe('bag-swing');
  });

  test('is visible in the phone header without opening the menu', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const link = page.locator('header').getByRole('link', { name: 'Shop' }).filter({ visible: true });
    await expect(link).toHaveCount(1);
    await expect(link.getByTestId('shop-icon')).toBeVisible();
  });

  test('keeps still for anyone who asks for reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const icon = page.getByRole('navigation', { name: 'Main' }).getByTestId('shop-icon');
    expect(await icon.locator('.shop-bag').evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
    expect(await icon.locator('.shop-spark').evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
  });

  test('is decorative: the link is named by its word', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('shop-icon').first()).toHaveAttribute('aria-hidden', 'true');
  });
});

test.describe("What's on", () => {
  test('has its own page with the current cards', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-11-04T09:00:00Z'));
    await page.goto('/whats-on');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/what’s on/i);
    expect(await page.getByTestId('whats-on-item').count()).toBeGreaterThan(0);
  });

  test('Extra Time is shown with its small print and never beside evening play', async ({ page }) => {
    await page.goto('/whats-on');
    const card = page.getByTestId('whats-on-item').filter({ hasText: 'Extra Time' });
    test.skip((await card.count()) === 0, 'Extra Time is not on today (it runs 1–30 November 2026)');
    await expect(card.getByTestId('whats-on-small-print')).toHaveText('Valid on bookings 6am–6pm, 1–30 Nov 2026.');
    await expect(card).not.toContainText(/night|evening|midnight|floodlit|under the lights/i);
  });

  test('yoga is donation-based, never free', async ({ page }) => {
    for (const path of ['/whats-on', '/programs/community-yoga']) {
      await page.goto(path);
      const text = await page.locator('main').innerText();
      expect(text).toMatch(/donation/i);
      expect(text).not.toMatch(/\bfree\b[^.]*yoga|yoga[^.]*\bfree\b/i);
    }
  });
});

test.describe('/book', () => {
  test('holds both the Arena and the meeting room', async ({ page }) => {
    await page.goto('/book');
    await expect(page.locator('#arena')).toBeAttached();
    const room = page.getByTestId('meeting-room');
    await expect(room).toBeVisible();
    await expect(room.getByRole('img', { name: /meeting room/i })).toBeVisible();
    // No capacity figure and no room price are published.
    await expect(room).not.toContainText(/\bK(SH|ES)\b|\bseats? \d|\d+ (people|seats|chairs)/i);
  });

  test('the meeting room hands over to WhatsApp with what the visitor picked', async ({ page }) => {
    await page.goto('/book');
    const room = page.getByTestId('meeting-room');
    const cta = room.getByTestId('meeting-room-cta');
    await expect(cta).toHaveAttribute('href', `${WA}${encodeURIComponent("Hi MVSA, I'd like to book the meeting room. Is it free?")}`);
    await room.getByRole('button', { name: /^Training/ }).click();
    await room.getByLabel(/which day/i).fill('2026-11-07');
    await room.getByLabel(/how many people/i).fill('20');
    const href = (await cta.getAttribute('href')) ?? '';
    expect(decodeURIComponent(href.split('?text=')[1])).toBe(
      "Hi MVSA, I'd like to book the meeting room for a training on Saturday 7 November, for about 20 people. Is it free?"
    );
  });

  test('the nav link to the meeting room lands on it', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Meeting room' }).click();
    await expect(page).toHaveURL(/\/book#meeting-room$/);
    await expect(page.getByTestId('meeting-room')).toBeInViewport();
  });
});

test.describe('programme pages', () => {
  for (const program of programs) {
    const story = getStory(program.slug)!;
    test(`${program.name} has a clean link, its own share card, a share bar and a register link`, async ({ page, request }) => {
      expect(program.slug).toMatch(/^[a-z]+(-[a-z]+)*$/);
      await page.goto(`/programs/${program.slug}`);
      await expect(page.getByRole('heading', { level: 1 })).toContainText(story.headline[0].replace('&', '').trim());

      // Its own Open Graph image, made for this programme.
      const og = await page.locator('meta[property="og:image"]').getAttribute('content');
      expect(og).toContain(`/programs/${program.slug}/opengraph-image`);
      const image = await request.get(new URL(og!).pathname + new URL(og!).search);
      expect(image.status()).toBe(200);
      expect(image.headers()['content-type']).toContain('image/png');
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', `https://www.mvsa.co.ke/programs/${program.slug}`);

      // Register: WhatsApp to the arena line, message filled in.
      const register = page.getByTestId('register-cta');
      await expect(register).toHaveAttribute('href', `${WA}${encodeURIComponent(story.register.message)}`);
      if (program.type !== 'arena') {
        expect(story.register.message).toBe(`Hi MVSA, I'd like to register for ${program.name}`);
      }

      // Share: WhatsApp and copy link.
      const share = page.getByTestId('share-bar').first();
      await expect(share.getByTestId('share-whatsapp')).toHaveAttribute('href', /^https:\/\/wa\.me\/\?text=.*mvsa\.co\.ke%2Fprograms%2F/);
      await expect(share.getByTestId('share-copy')).toBeVisible();
    });
  }

  test('copy link puts the page address on the clipboard and says so', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/programs/chess-club');
    await page.getByTestId('share-copy').first().click();
    await expect(page.getByTestId('share-copy').first()).toHaveText('Link copied');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('https://www.mvsa.co.ke/programs/chess-club');
  });

  test('the Football Academy also offers the online form', async ({ page }) => {
    await page.goto('/programs/football-academy');
    await expect(page.getByTestId('register-online')).toHaveAttribute('href', 'https://forms.gle/GpmVs2tDkw2MLuDD7');
  });

  test('no Academy or chess page shows a fee, a Till number or payment instructions', async ({ page }) => {
    for (const program of programs.filter((p) => p.type === 'academy')) {
      await page.goto(`/programs/${program.slug}`);
      const text = await page.locator('main').innerText();
      expect(text, program.name).not.toMatch(/\bK(SH|ES|sh)\b|\bTill\b|M-?Pesa|pay ?bill|buy goods|\bfees?\b|\d+\s?\/\s?(month|term|session)/i);
    }
  });

  test('old links to programme pages still work', async ({ page }) => {
    await page.goto('/programs/football_academy');
    await expect(page).toHaveURL(/\/programs\/football-academy$/);
    await page.goto('/programs/chess');
    await expect(page).toHaveURL(/\/programs\/chess-club$/);
  });

  test('holiday training lays out the week, day by day', async ({ page }) => {
    await page.goto('/programs/holiday-training');
    for (const day of ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']) {
      await expect(page.locator('main li').filter({ hasText: new RegExp(`^${day}`) })).toHaveCount(1);
    }
    await expect(page.locator('main')).toContainText('11am–1pm');
    await expect(page.locator('main')).toContainText('19 December');
  });

  test('chess leads with "Chess Club" and welcomes first-timers', async ({ page }) => {
    await page.goto('/programs/chess-club');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/chess\s*club/i);
    await expect(page.locator('main')).toContainText('First time? Just come at 10am.');
  });

  test('every programme photo has a description, and children only ever appear in duotone', async ({ page }) => {
    for (const program of programs) {
      await page.goto(`/programs/${program.slug}`);
      for (const img of await page.locator('main .prog-hero img').all()) {
        expect((await img.getAttribute('alt'))?.length ?? 0, program.name).toBeGreaterThan(10);
      }
    }
    await page.goto('/programs/football-academy');
    await expect(page.locator('.prog-hero .duotone img')).toHaveCount(1);
  });
});
