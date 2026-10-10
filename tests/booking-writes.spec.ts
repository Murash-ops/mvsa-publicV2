import { test, expect, type Page } from '@playwright/test';
import { MOCK_BOOKING, THREE_SLOTS, mockFailure, mockHold } from './fixtures/availability';

/**
 * The hold-then-confirm path, with booking writes ON.
 *
 * This project runs against the second dev server (see playwright.config.ts),
 * which sets MVSA_BOOKING_WRITES_ENABLED=true. The backend itself is never
 * called: /api/availability, /api/booking/hold and /api/booking/confirm are all
 * mocked in the browser.
 */

async function fillDetails(page: Page) {
  await page.getByRole('button', { name: /Start at 08:00/ }).click();
  await page.getByPlaceholder('e.g. Wyclife Osengo').fill('Jane Wanjiku');
  await page.getByPlaceholder('e.g. 0798258950').fill('0798258950');
}

test.describe('booking writes enabled', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/availability*', async (route) => {
      await route.fulfill({ json: THREE_SLOTS });
    });
  });

  test('holds the slot for fifteen minutes, then confirms it', async ({ page }) => {
    const holdBodies: unknown[] = [];

    await page.route('**/api/booking/hold', async (route) => {
      holdBodies.push(route.request().postDataJSON());
      await route.fulfill({ status: 201, json: mockHold() });
    });
    await page.route('**/api/booking/confirm', async (route) => {
      await route.fulfill({ status: 201, json: MOCK_BOOKING });
    });

    await page.goto('/book');
    await fillDetails(page);
    await page.getByTestId('hold-slot').click();

    await expect(page.getByTestId('hold-panel')).toBeVisible();
    await expect(page.getByTestId('hold-countdown')).toContainText('Held for another 1');

    // The hold request carries the slot's own start_at and a UUIDv4 intent key.
    const body = holdBodies[0] as Record<string, string>;
    expect(body.resource_id).toBe('res_turf');
    expect(body.start_at).toBe(THREE_SLOTS.slots[0].start_at);
    expect(body.intent_key).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );

    await page.getByTestId('confirm-booking').click();

    const confirmed = page.getByTestId('booking-confirmed');
    await expect(confirmed).toBeVisible();
    await expect(confirmed).toContainText('MVSA-7F3K2');
    await expect(confirmed).toContainText('due at reception');
  });

  test('confirm reuses the hold and the intent key from the hold step', async ({ page }) => {
    let holdIntentKey = '';
    let confirmBody: Record<string, string> = {};

    await page.route('**/api/booking/hold', async (route) => {
      holdIntentKey = (route.request().postDataJSON() as Record<string, string>).intent_key;
      await route.fulfill({ status: 201, json: mockHold() });
    });
    await page.route('**/api/booking/confirm', async (route) => {
      confirmBody = route.request().postDataJSON() as Record<string, string>;
      await route.fulfill({ status: 201, json: MOCK_BOOKING });
    });

    await page.goto('/book');
    await fillDetails(page);
    await page.getByTestId('hold-slot').click();
    await expect(page.getByTestId('hold-panel')).toBeVisible();
    await page.getByTestId('confirm-booking').click();
    await expect(page.getByTestId('booking-confirmed')).toBeVisible();

    expect(confirmBody.hold_id).toBe('hold_mock_1');
    expect(confirmBody.intent_key).toBe(holdIntentKey);
  });

  test('a 409 on confirm says the slot went and re-fetches availability', async ({ page }) => {
    let availabilityCalls = 0;
    await page.route('**/api/availability*', async (route) => {
      availabilityCalls += 1;
      await route.fulfill({ json: THREE_SLOTS });
    });
    await page.route('**/api/booking/hold', async (route) => {
      await route.fulfill({ status: 201, json: mockHold() });
    });
    await page.route('**/api/booking/confirm', async (route) => {
      await route.fulfill({
        status: 409,
        json: mockFailure(
          'conflict',
          'That time was taken while you were deciding. Pick another slot — the list has been refreshed.',
          'RESOURCE_UNAVAILABLE'
        ),
      });
    });

    await page.goto('/book');
    await expect(page.getByTestId('slot-grid')).toBeVisible();
    const callsBefore = availabilityCalls;

    await fillDetails(page);
    await page.getByTestId('hold-slot').click();
    await expect(page.getByTestId('hold-panel')).toBeVisible();
    await page.getByTestId('confirm-booking').click();

    const failure = page.getByTestId('action-failure');
    await expect(failure).toBeVisible();
    await expect(failure).toContainText('taken while you were deciding');

    // The dead hold is cleared and the diary is read again.
    await expect(page.getByTestId('hold-panel')).toHaveCount(0);
    await expect(page.getByTestId('booking-confirmed')).toHaveCount(0);
    await expect.poll(() => availabilityCalls).toBeGreaterThan(callsBefore);
  });

  test('a 409 on the hold itself is reported the same way', async ({ page }) => {
    await page.route('**/api/booking/hold', async (route) => {
      await route.fulfill({
        status: 409,
        json: mockFailure(
          'conflict',
          'That time was taken while you were deciding. Pick another slot — the list has been refreshed.',
          'RESOURCE_UNAVAILABLE'
        ),
      });
    });

    await page.goto('/book');
    await fillDetails(page);
    await page.getByTestId('hold-slot').click();

    await expect(page.getByTestId('action-failure')).toContainText('taken while you were deciding');
    await expect(page.getByTestId('hold-panel')).toHaveCount(0);
  });

  test('an unreachable backend during a hold offers the human route', async ({ page }) => {
    await page.route('**/api/booking/hold', async (route) => {
      await route.fulfill({
        status: 502,
        json: mockFailure('unreachable', 'We cannot reach the arena booking system right now.'),
      });
    });

    await page.goto('/book');
    await fillDetails(page);
    await page.getByTestId('hold-slot').click();

    await expect(page.getByTestId('action-failure')).toContainText('cannot reach the arena');
    await expect(page.getByTestId('hold-panel')).toHaveCount(0);
  });

  test('the backend asking for identity confirmation hands over to a human', async ({ page }) => {
    await page.route('**/api/booking/hold', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          outcome: 'identity_confirmation_required',
          message:
            'We already hold a booking record for this number, so reception needs to confirm it is you before booking again.',
        },
      });
    });

    await page.goto('/book');
    await fillDetails(page);
    await page.getByTestId('hold-slot').click();

    await expect(page.getByTestId('identity-handover')).toContainText('reception needs to confirm');
    await expect(page.getByTestId('hold-panel')).toHaveCount(0);
  });

  test('details are validated before anything is held', async ({ page }) => {
    let holdCalls = 0;
    await page.route('**/api/booking/hold', async (route) => {
      holdCalls += 1;
      await route.fulfill({ status: 201, json: mockHold() });
    });

    await page.goto('/book');
    await page.getByRole('button', { name: /Start at 08:00/ }).click();
    await page.getByPlaceholder('e.g. Wyclife Osengo').fill('Jane Wanjiku');
    await page.getByPlaceholder('e.g. 0798258950').fill('12345');
    await page.getByTestId('hold-slot').click();

    await expect(page.getByText('valid Kenyan phone number')).toBeVisible();
    expect(holdCalls).toBe(0);
  });
});
