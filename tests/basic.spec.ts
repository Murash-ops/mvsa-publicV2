import { test, expect } from '@playwright/test';

test('booking page should show venues', async ({ page }) => {
  await page.goto('http://localhost:3000/book');
  
  // Wait for the venues to load
  await expect(page.locator('text=NO VENUES AVAILABLE')).not.toBeVisible({ timeout: 10000 });
  
  // Check for the seeded venue
  await expect(page.locator('text=Main Arena Turf').first()).toBeVisible();
});
