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
    // Any link to /book in the body is secondary: never the filled primary button.
    for (const link of await main.locator('a[href^="/book"]').all()) {
      await expect(link).not.toHaveClass(/\b(shine|btn-gold)\b/);
    }
    // The hero points to the programmes, and the close is one contact line.
    await expect(main.getByRole('link', { name: 'See the programmes' })).toHaveAttribute('href', '/programs');
    await expect(main.getByTestId('closing-contact')).toHaveText(/^Call or WhatsApp 0798 258 950$/);
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

test('nothing unconfirmed is claimed: no Wi-Fi, lockers or changing rooms, no ages for football', async ({ page }) => {
  for (const path of ['/', '/about', '/book', '/programs/football-academy', '/programs/community-yoga']) {
    await page.goto(path);
    const text = await page.locator('main').innerText();
    expect(text, path).not.toMatch(/wi-?fi|lockers|changing rooms|mats and blocks/i);
  }
  await page.goto('/programs/football-academy');
  await expect(page.locator('main')).not.toContainText(/ages? 6|6 to 16|6–16|boys and girls/i);
  await expect(page.getByTestId('register-cta')).toHaveAttribute('href', /^https:\/\/wa\.me\/254798258950/);
});

test.describe('Extra Time on /book', () => {
  test('during 1–30 November the picker opens on a daytime hour, marks 6am–6pm and asks for Extra Time', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-11-10T05:00:00Z')); // 08:00 in Nairobi
    await page.route('**/public/slots**', (route) => route.abort());
    await page.goto('/book');
    const picker = page.getByTestId('kickoff-picker');
    await expect(picker.getByRole('button', { name: '09:00' })).toHaveAttribute('aria-pressed', 'true');
    await expect(picker.locator('[data-extra-time="true"]')).toHaveCount(9); // 09:00 to 17:00
    await expect(picker.getByRole('button', { name: '18:00' })).not.toHaveAttribute('data-extra-time', 'true');
    await expect(page.getByTestId('extra-time-legend')).toBeVisible();
    const href = (await page.getByTestId('kickoff-cta').getAttribute('href')) ?? '';
    expect(decodeURIComponent(href.split('?text=')[1])).toBe(
      'Hi MVSA, I would like to book the Arena today at 09:00, with Extra Time. Is it available?'
    );
    // An evening hour never asks for Extra Time.
    await picker.getByRole('button', { name: '20:00' }).click();
    const evening = (await page.getByTestId('kickoff-cta').getAttribute('href')) ?? '';
    expect(decodeURIComponent(evening.split('?text=')[1])).toBe('Hi MVSA, I would like to book the Arena today at 20:00. Is it available?');
  });

  test('from 1 December the picker is back to 20:00 with no marks', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-12-02T05:00:00Z'));
    await page.route('**/public/slots**', (route) => route.abort());
    await page.goto('/book');
    const picker = page.getByTestId('kickoff-picker');
    await expect(picker.getByRole('button', { name: '20:00' })).toHaveAttribute('aria-pressed', 'true');
    await expect(picker.locator('[data-extra-time="true"]')).toHaveCount(0);
    await expect(page.getByTestId('extra-time-legend')).toHaveCount(0);
  });

  test('the Extra Time note is on /book while it runs, with its hours', async ({ page }) => {
    const today = new Date(Date.now() + 3 * 3600_000).toISOString().slice(0, 10);
    test.skip(today < '2026-11-01' || today > '2026-11-30', 'Extra Time is not running today');
    await page.goto('/book');
    await expect(page.getByTestId('extra-time-note')).toContainText('+30 MIN FREE');
    await expect(page.getByTestId('extra-time-note')).toContainText('6am–6pm, 1–30 Nov');
  });

  test('unavailable hours and the live-times link stay readable (WCAG AA)', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-12-02T12:00:00Z')); // 15:00 in Nairobi: morning hours are past
    await page.route('**/public/slots**', (route) => route.abort());
    await page.goto('/book');
    const ratio = async (selector: string) =>
      page.locator(selector).first().evaluate((el) => {
        const rgb = (c: string) => (c.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
        const lum = ([r, g, b]: number[]) => {
          const f = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
          return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
        };
        let bgEl: Element | null = el;
        let bg = 'rgba(0, 0, 0, 0)';
        while (bgEl && /rgba\(0, 0, 0, 0\)|transparent/.test(bg)) {
          bg = getComputedStyle(bgEl).backgroundColor;
          bgEl = bgEl.parentElement;
        }
        const a = lum(rgb(getComputedStyle(el).color));
        const b = lum(rgb(bg));
        return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      });
    expect(await ratio('[data-testid="kickoff-picker"] button:disabled')).toBeGreaterThanOrEqual(4.5);
    expect(await ratio('[data-testid="retry-availability"]')).toBeGreaterThanOrEqual(4.5);
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
  test('holds both the Arena and the meeting room, one tap apart', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/book');
    await expect(page.getByTestId('venue-grid').or(page.getByTestId('booking-offline'))).toBeVisible();
    const roomTab = page.getByTestId('book-tab-room');
    await expect(roomTab).toBeInViewport();
    await roomTab.click();
    await expect(roomTab).toHaveAttribute('aria-pressed', 'true');
    const room = page.getByTestId('meeting-room');
    await expect(room).toBeVisible();
    await expect(page).toHaveURL(/#meeting-room$/);
    await expect(room.getByRole('img', { name: /meeting room/i })).toBeVisible();
    // The price from brand.md; no capacity figure, nothing unconfirmed.
    await expect(room.getByTestId('meeting-room-price')).toHaveText('KSH 1,000 an hour');
    await expect(room).not.toContainText(/\bseats? \d|\d+ (people|seats|chairs)|wi-?fi/i);
    await page.getByTestId('book-tab-pitch').click();
    await expect(room).toBeHidden();
  });

  test('the meeting room hands over to WhatsApp with what the visitor picked', async ({ page }) => {
    await page.goto('/book#meeting-room');
    const room = page.getByTestId('meeting-room');
    const cta = room.getByTestId('meeting-room-cta');
    await expect(cta).toHaveAttribute('href', `${WA}${encodeURIComponent("Hi MVSA, I'd like to book the meeting room. Is it available?")}`);
    await expect(room).toBeVisible();
    await room.getByRole('button', { name: /^Training/ }).click();
    await room.getByLabel(/which day/i).fill('2026-11-07');
    await room.getByLabel(/how many people/i).fill('20');
    const href = (await cta.getAttribute('href')) ?? '';
    expect(decodeURIComponent(href.split('?text=')[1])).toBe(
      "Hi MVSA, I'd like to book the meeting room for a training on Saturday 7 November, for about 20 people. Is it available?"
    );
  });

  test('the nav link to the meeting room lands on it', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Meeting room' }).click();
    await expect(page).toHaveURL(/\/book#meeting-room$/);
    await expect(page.getByTestId('book-tab-room')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('meeting-room')).toBeVisible();
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
      expect(story.register.message).toMatch(/^Hi MVSA, (I'd like|please tell me)/);
      if (['football-academy', 'holiday-training', 'chess-club', 'community-yoga'].includes(program.slug)) {
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

  test('chess leads with "Chess Club", welcomes first-timers and asks people to WhatsApp for details', async ({ page }) => {
    await page.goto('/programs/chess-club');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/chess\s*club/i);
    await expect(page.locator('main')).toContainText('First time? Just come at 10am.');
    await expect(page.getByRole('heading', { name: 'Your first Saturday' })).toBeVisible();
    await expect(page.getByTestId('register-cta')).toContainText('WhatsApp us for details');
    for (const heading of await page.locator('main h2').allInnerTexts()) {
      expect(heading).not.toMatch(/your move|boards are set|take a seat/i);
    }
  });

  test('dance is coming soon: no ages, no times, and an "Ask us" instead of Register', async ({ page }) => {
    await page.goto('/programs/dance');
    const main = page.locator('main');
    await expect(main).toContainText(/coming soon/i);
    await expect(main).not.toContainText(/ages?\s*6|6–16|register/i);
    await expect(page.getByTestId('register-cta')).toContainText('Ask us');
  });

  test('boxing says only what is confirmed', async ({ page }) => {
    await page.goto('/programs/boxing');
    const main = page.locator('main');
    await expect(main).toContainText('Sundays');
    await expect(main).toContainText('WhatsApp us for details');
    await expect(main).not.toContainText(/adults|pad work|conditioning/i);
  });

  test('every programme page has a section of its own', async ({ page }) => {
    const titles = new Set<string>();
    for (const program of programs.filter((p) => !['boxing', 'dance'].includes(p.slug))) {
      await page.goto(`/programs/${program.slug}`);
      const title = await page.getByTestId('program-feature').getByRole('heading', { level: 2 }).innerText();
      titles.add(title.toLowerCase());
    }
    expect(titles.size).toBe(programs.length - 2);
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
