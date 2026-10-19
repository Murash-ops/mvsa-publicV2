import { test, expect } from '@playwright/test';
import { THREE_SLOTS } from './fixtures/availability';

test('booking page offers both bookable venues', async ({ page }) => {
  await page.route('**/api/availability*', async (route) => {
    await route.fulfill({ json: THREE_SLOTS });
  });

  await page.goto('/book');

  await expect(page.getByTestId('venue-grid')).toBeVisible();
  await expect(page.getByTestId('venue-grid')).toContainText('The Arena');
});
