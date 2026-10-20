import { test, expect } from '@playwright/test';

/**
 * The phone menu once opened into nothing: the drawer sat inside the blurred
 * header, which clipped it to the header's own height. These tests open it the
 * way a visitor would and use it.
 */
test.describe('phone menu', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('opens a drawer that can be seen and used', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Open menu' }).click();
    const menu = page.locator('#mobile-menu');
    await expect(menu).toBeVisible();
    const box = await menu.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThan(400);
    await menu.getByRole('link', { name: 'Programs' }).click();
    await expect(page).toHaveURL(/\/programs$/);
    await expect(menu).toBeHidden();
  });

  test('closes with Escape', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Open menu' }).click();
    await expect(page.locator('#mobile-menu')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#mobile-menu')).toBeHidden();
  });
});

test('the hero names the Arena as the home of football and fitness', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/your home of\s*football and fitness/i);
  await expect(page.locator('body')).toContainText(/bring your\s*squad/i);
  await expect(page.locator('body')).not.toContainText(/let.s meet/i);
});
