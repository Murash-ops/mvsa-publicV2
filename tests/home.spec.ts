import { test, expect } from '@playwright/test';

test('the home page leads with the KES 1,500 turf price', async ({ page }) => {
  await page.goto('/');
  const price = page.getByTestId('pricing-headline');
  await expect(price).toContainText('From KES 1,500');
  await expect(price).toContainText('per hour');
});

test('the home page never shows the morning rate, which reception offers by hand', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).not.toContainText('1,200');
  await expect(page.locator('body')).not.toContainText('1200');
});
