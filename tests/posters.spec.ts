import { test, expect, type Page } from '@playwright/test';
import { deflateSync } from 'node:zlib';

/**
 * Downloadable posters, on the :3002 dev server that reads the test-only rows
 * in tests/fixtures/whats-on-posters.json. The poster file is served here by
 * page.route, so no fake poster is ever added to public/.
 */

/** A small solid-green PNG, made here so no image file is checked in. */
function png(width = 40, height = 60): Buffer {
  const crcTable = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  const crc = (buf: Buffer) => {
    let c = 0xffffffff;
    for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type: string, data: Buffer) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type), data]);
    const sum = Buffer.alloc(4);
    sum.writeUInt32BE(crc(body));
    return Buffer.concat([len, body, sum]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) raw.set([45, 80, 22], y * (width * 3 + 1) + 1 + x * 3);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

async function servePoster(page: Page) {
  await page.route('**/posters/test-community-yoga.png', (route) =>
    route.fulfill({ status: 200, contentType: 'image/png', body: png() }),
  );
}

test.beforeEach(async ({ page }) => servePoster(page));

test('a card with a poster has a Download poster link that saves a clearly named file', async ({ page }) => {
  await page.goto('/whats-on');
  const yoga = page.getByTestId('whats-on-item').filter({ hasText: 'Community Yoga' });
  const link = yoga.getByTestId('poster-download');
  await expect(link).toHaveText(/Download poster/);
  await expect(link).toHaveAttribute('href', '/posters/test-community-yoga.png');
  await expect(link).toHaveAttribute('download', 'mvsa-test-community-yoga.png');
  // Saved under the poster's own file name. Where download is ignored (iPhone, in-app browsers), it opens the file instead.
  await expect(link).toHaveAttribute('target', '_blank');

  const [download] = await Promise.all([page.waitForEvent('download'), link.click()]);
  expect(download.suggestedFilename()).toBe('mvsa-test-community-yoga.png');
});

test('a poster that is not on the site is left off; the card still shows', async ({ page }) => {
  await page.goto('/whats-on');
  const chess = page.getByTestId('whats-on-item').filter({ hasText: 'Chess Club' });
  await expect(chess).toBeVisible();
  await expect(chess.getByTestId('poster-download')).toHaveCount(0);
});

test('What’s on links to /posters when there are posters', async ({ page }) => {
  await page.goto('/whats-on');
  await page.getByTestId('all-posters-link').click();
  await expect(page).toHaveURL(/\/posters$/);
});

test('/posters lists only the posters showing now, full size and easy to save', async ({ page }) => {
  await page.goto('/posters');
  const posters = page.getByTestId('poster');
  await expect(posters).toHaveCount(1); // not Chess (no file) and not Old Event (ended)
  await expect(posters.first()).toContainText('Community Yoga');
  const img = posters.first().locator('img');
  await expect(img).toHaveAttribute('src', '/posters/test-community-yoga.png'); // the real file, not a resized copy
  await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBe(40);
  await expect(posters.first().getByTestId('poster-open')).toHaveAttribute('href', '/posters/test-community-yoga.png');
  await expect(posters.first().getByTestId('poster-download')).toHaveAttribute('download', 'mvsa-test-community-yoga.png');
});
