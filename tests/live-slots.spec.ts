import { test, expect, type Page } from '@playwright/test';

/**
 * The kick-off picker shows live hours from the venue's slots service: booked
 * and past hours can't be picked, and the request names the day. When the
 * service can't be reached, every hour stays pickable, as before.
 */

// 12:30 in Nairobi on Friday 23 October 2026.
const NOW = new Date('2026-10-23T09:30:00Z');

async function fakeSlots(page: Page, byDate: Record<string, Record<string, string>>) {
  const asked: string[] = [];
  await page.route('**/public/slots**', async (route) => {
    const date = new URL(route.request().url()).searchParams.get('date') ?? '';
    asked.push(date);
    const hours = byDate[date];
    if (!hours) return route.fulfill({ status: 503, json: { error: 'unavailable' } });
    return route.fulfill({ json: { date, updated_at: NOW.toISOString(), hours } });
  });
  return asked;
}

test('booked and past hours cannot be picked, and the live count shows', async ({ page }) => {
  await page.clock.setFixedTime(NOW);
  await fakeSlots(page, { '2026-10-23': { '19:00': 'free', '20:00': 'booked', '21:00': 'free', '22:00': 'booked' } });
  await page.goto('/');

  const picker = page.getByTestId('kickoff-picker');
  await expect(page.getByTestId('kickoff-live')).toHaveText(/Live: 2 hours free today/);
  await expect(picker.getByRole('button', { name: '20:00' })).toBeDisabled();
  await expect(picker.getByRole('button', { name: '20:00' })).toHaveAttribute('data-state', 'booked');
  await expect(picker.getByRole('button', { name: '11:00' })).toBeDisabled();
  await expect(picker.getByRole('button', { name: '11:00' })).toHaveAttribute('data-state', 'past');

  // The default 20:00 is booked, so the picker moved on to the next free hour.
  await expect(picker.getByRole('button', { name: '21:00' })).toHaveAttribute('aria-pressed', 'true');
  const href = (await page.getByTestId('kickoff-cta').getAttribute('href')) ?? '';
  expect(decodeURIComponent(href.split('?text=')[1])).toBe(
    'Hi MVSA, I would like to book the Arena today at 21:00. Is it free?'
  );
});

test('another day asks for that day by name', async ({ page }) => {
  await page.clock.setFixedTime(NOW);
  const asked = await fakeSlots(page, { '2026-10-23': {}, '2026-10-25': { '10:00': 'free', '20:00': 'free' } });
  await page.goto('/');

  await page.getByTestId('kickoff-days').getByRole('button', { name: 'Sun 25' }).click();
  await expect(page.getByTestId('kickoff-live')).toHaveText(/2 hours free on Sunday 25 October/);
  // Morning hours are not past on another day.
  await expect(page.getByTestId('kickoff-picker').getByRole('button', { name: '10:00' })).toBeEnabled();
  await expect(page.getByTestId('kickoff-cta')).toHaveText(/Ask for Sun 25 20:00/);
  const href = (await page.getByTestId('kickoff-cta').getAttribute('href')) ?? '';
  expect(decodeURIComponent(href.split('?text=')[1])).toBe(
    'Hi MVSA, I would like to book the Arena on Sunday 25 October at 20:00. Is it free?'
  );
  expect(asked).toContain('2026-10-25');
});

test('with the slots service down, every future hour stays pickable and nothing claims "booked"', async ({ page }) => {
  await page.clock.setFixedTime(NOW);
  await page.route('**/public/slots**', (route) => route.abort());
  await page.goto('/');

  const picker = page.getByTestId('kickoff-picker');
  await expect(picker.getByRole('button', { name: '20:00' })).toBeEnabled();
  await expect(page.getByTestId('kickoff-live')).toHaveCount(0);
  await expect(picker.locator('[data-state="booked"]')).toHaveCount(0);
});

test('after the default hour has gone, the picker starts on tomorrow', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-23T18:30:00Z')); // 21:30 in Nairobi
  await page.route('**/public/slots**', (route) => route.abort());
  await page.goto('/');

  await expect(page.getByTestId('kickoff-days').getByRole('button', { name: 'Tomorrow' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('kickoff-cta')).toHaveText(/Ask for Tomorrow 20:00/);
});

test('more than one hour: tap the next hour to add it, tap an end to drop it', async ({ page }) => {
  await page.clock.setFixedTime(NOW);
  await fakeSlots(page, { '2026-10-23': { '19:00': 'free', '20:00': 'free', '21:00': 'free', '22:00': 'booked' } });
  await page.goto('/');

  const picker = page.getByTestId('kickoff-picker');
  const cta = page.getByTestId('kickoff-cta');
  const message = async () => decodeURIComponent(((await cta.getAttribute('href')) ?? '').split('?text=')[1]);

  await expect(picker.getByRole('button', { name: '20:00' })).toHaveAttribute('aria-pressed', 'true');
  await picker.getByRole('button', { name: '21:00' }).click();
  await picker.getByRole('button', { name: '19:00' }).click();
  for (const time of ['19:00', '20:00', '21:00']) {
    await expect(picker.getByRole('button', { name: time })).toHaveAttribute('aria-pressed', 'true');
  }
  await expect(cta).toHaveText(/Ask for 19:00–22:00/);
  expect(await message()).toBe('Hi MVSA, I would like to book the Arena today from 19:00 to 22:00 (3 hours). Is it free?');

  // 22:00 is booked, so the range can't grow into it.
  await expect(picker.getByRole('button', { name: '22:00' })).toBeDisabled();

  // Tapping an end drops that hour; tapping elsewhere starts again.
  await picker.getByRole('button', { name: '19:00' }).click();
  await expect(cta).toHaveText(/Ask for 20:00–22:00/);
  await picker.getByRole('button', { name: '15:00' }).click();
  await expect(cta).toHaveText(/Ask for 15:00$/);
  await expect(picker.getByRole('button', { name: '20:00' })).toHaveAttribute('aria-pressed', 'false');
});

test('a range that runs to closing ends at midnight', async ({ page }) => {
  await page.clock.setFixedTime(NOW);
  await page.route('**/public/slots**', (route) => route.abort());
  await page.goto('/');

  const picker = page.getByTestId('kickoff-picker');
  await picker.getByRole('button', { name: '22:00' }).click();
  await picker.getByRole('button', { name: '23:00' }).click();
  const href = (await page.getByTestId('kickoff-cta').getAttribute('href')) ?? '';
  expect(decodeURIComponent(href.split('?text=')[1])).toBe(
    'Hi MVSA, I would like to book the Arena today from 22:00 to midnight (2 hours). Is it free?'
  );
});
