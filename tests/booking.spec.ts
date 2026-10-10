import { test, expect } from '@playwright/test';
import { THREE_SLOTS, mockAvailability, mockFailure } from './fixtures/availability';

/**
 * Booking page behaviour with booking writes OFF (the default posture).
 *
 * Every spec mocks this site's own /api/availability route, so no backend and
 * no token are involved.
 */

test.describe('booking page', () => {
  test('shows live start times, each slot price and the handover', async ({ page }) => {
    await page.route('**/api/availability*', async (route) => {
      await route.fulfill({ json: THREE_SLOTS });
    });

    await page.goto('/book');

    await expect(page.getByTestId('slot-grid')).toBeVisible();
    await expect(page.getByRole('button', { name: /Start at 08:00/ })).toBeVisible();

    // Each slot shows the price the backend quoted for it, not one site-wide rate.
    await expect(page.getByTestId('slot-grid')).toContainText('KES 1,200');
    await expect(page.getByTestId('slot-grid')).toContainText('KES 1,500');
    await expect(page.getByTestId('slot-grid')).toContainText('+20m handover');

    // An unbookable slot is shown as taken, not hidden.
    await expect(page.getByTestId('slot-grid')).toContainText('Taken');
    await expect(page.getByTestId('backend-unreachable')).toHaveCount(0);
  });

  test('both bookable venues are offered', async ({ page }) => {
    await page.route('**/api/availability*', async (route) => {
      await route.fulfill({ json: THREE_SLOTS });
    });

    await page.goto('/book');

    const venues = page.getByTestId('venue-grid');
    await expect(venues).toContainText('Main Arena Turf');
    await expect(venues).toContainText('Meeting Room / Conference Hall');
  });

  test('an unreachable backend is reported, never shown as fully booked', async ({ page }) => {
    await page.route('**/api/availability*', async (route) => {
      await route.fulfill({
        status: 502,
        json: mockFailure('unreachable', 'We cannot reach the arena booking system right now.'),
      });
    });

    await page.goto('/book');

    const notice = page.getByTestId('backend-unreachable');
    await expect(notice).toBeVisible();
    await expect(notice).toContainText('cannot reach the arena booking system');
    await expect(notice).toContainText('does not mean the arena is full');

    // The honest failure replaces the slot grid and the empty-diary message.
    await expect(page.getByTestId('slot-grid')).toHaveCount(0);
    await expect(page.getByTestId('slots-empty')).toHaveCount(0);

    // ...and the phone and WhatsApp route is offered instead.
    await expect(notice.getByTestId('whatsapp-route')).toBeVisible();
    await expect(notice.getByTestId('phone-route')).toBeVisible();
  });

  test('retrying after an outage shows the slots', async ({ page }) => {
    let call = 0;
    await page.route('**/api/availability*', async (route) => {
      call += 1;
      if (call === 1) {
        await route.fulfill({
          status: 502,
          json: mockFailure('unreachable', 'We cannot reach the arena booking system right now.'),
        });
        return;
      }
      await route.fulfill({ json: THREE_SLOTS });
    });

    await page.goto('/book');
    await expect(page.getByTestId('backend-unreachable')).toBeVisible();

    await page.getByTestId('retry-availability').click();

    await expect(page.getByTestId('slot-grid')).toBeVisible();
    await expect(page.getByTestId('backend-unreachable')).toHaveCount(0);
  });

  test('a genuinely empty diary is distinguished from an outage', async ({ page }) => {
    await page.route('**/api/availability*', async (route) => {
      await route.fulfill({ json: mockAvailability([]) });
    });

    await page.goto('/book');

    const empty = page.getByTestId('slots-empty');
    await expect(empty).toBeVisible();
    await expect(empty).toContainText('Nothing of that length is left on this date');
    await expect(page.getByTestId('backend-unreachable')).toHaveCount(0);
  });

  test('with writes off the handover says plainly that nothing is reserved', async ({ page }) => {
    await page.route('**/api/availability*', async (route) => {
      await route.fulfill({ json: THREE_SLOTS });
    });

    await page.goto('/book');

    const handover = page.getByTestId('whatsapp-handover');
    await expect(handover).toBeVisible();
    await expect(handover).toContainText('this does not hold the slot');
    await expect(handover.getByTestId('whatsapp-route')).toBeVisible();
    await expect(page.getByTestId('hold-slot')).toHaveCount(0);
  });

  test('selecting a slot shows that slot own price in the summary', async ({ page }) => {
    await page.route('**/api/availability*', async (route) => {
      await route.fulfill({ json: THREE_SLOTS });
    });

    await page.goto('/book');
    await page.getByRole('button', { name: /Start at 08:20/ }).click();

    await expect(page.getByTestId('price-total')).toHaveText('KES 1,500');
  });
});

test.describe('contact page', () => {
  test('is honest that nothing is stored and hands the message to WhatsApp', async ({ page }) => {
    await page.goto('/contact');

    await expect(page.getByTestId('inquiry-disclosure')).toContainText('not stored on this site');

    await page.getByPlaceholder('Jane Wanjiku').fill('Jane Wanjiku');
    await page.getByPlaceholder('07xxxxxxxx').fill('0798258950');
    await page.getByPlaceholder('Enter details about your inquiry...').fill(
      'Is the turf free on Saturday morning?'
    );

    // The submit opens WhatsApp in a new tab; stop it from actually navigating.
    await page.context().route('https://wa.me/**', async (route) => {
      await route.fulfill({ status: 200, body: 'ok' });
    });
    await page.getByTestId('inquiry-submit').click();

    const handover = page.getByTestId('inquiry-handover');
    await expect(handover).toBeVisible();
    await expect(handover).toContainText('ready in WhatsApp');
    await expect(handover).toContainText('Nothing was stored on this site');
  });
});
