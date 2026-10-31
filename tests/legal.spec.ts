import { test, expect } from '@playwright/test';

/**
 * Meta will not take the "MVSA automation" app live without a privacy policy
 * and data-deletion instructions at public URLs. These pages must stay up.
 */
test('the privacy policy covers what Meta and the Data Protection Act ask for', async ({ page }) => {
  await page.goto('/privacy');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/privacy\s*policy/i);
  const body = page.locator('main');
  await expect(body).toContainText('Last updated 31 October 2026');
  await expect(body).toContainText('Data Protection Act, 2019');
  await expect(body).toContainText('Office of the Data Protection Commissioner');
  await expect(body).toContainText('We do not sell your details');
  await expect(body).toContainText('0798 258 950');
  await expect(body.getByRole('link', { name: 'how to ask for deletion' })).toHaveAttribute('href', '/data-deletion');
});

test('the data-deletion page says how to ask, and how long it takes', async ({ page }) => {
  await page.goto('/data-deletion');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/delete\s*your data/i);
  const body = page.locator('main');
  await expect(body).toContainText('Delete my data');
  await expect(body).toContainText('within 30 days');
  await expect(body).toContainText('Settings → Apps and Websites');
  await expect(body.getByRole('link', { name: '0798 258 950' }).first()).toHaveAttribute(
    'href',
    /wa\.me\/254798258950\?text=Delete%20my%20data/,
  );
});

test('the footer links to both pages', async ({ page }) => {
  await page.goto('/');
  const footer = page.locator('footer');
  await expect(footer.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy');
  await expect(footer.getByRole('link', { name: 'Delete your data' })).toHaveAttribute('href', '/data-deletion');
});
