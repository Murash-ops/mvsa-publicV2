import { test, expect } from '@playwright/test';

const channel = 'https://www.youtube.com/@MountainViewSportsArena';

test('the home page says you can watch our games on YouTube, and links to MVSA TV', async ({ page }) => {
  await page.goto('/');
  const section = page.getByTestId('watch-games');
  await expect(section).toContainText('Watch our');
  await expect(section).toContainText('MVSA TV');
  const link = section.getByTestId('watch-games-link');
  await expect(link).toHaveAttribute('href', channel);
  await expect(link).toHaveAttribute('target', '_blank');
  // The channel only: no match is embedded on the site.
  await expect(page.locator('iframe[src*="youtube"]')).toHaveCount(0);
});

test('What’s on points to MVSA TV too', async ({ page }) => {
  await page.goto('/whats-on');
  const band = page.getByTestId('watch-games');
  await expect(band).toContainText('Watch our games on YouTube');
  await expect(band.getByTestId('watch-games-link')).toHaveAttribute('href', channel);
});

test('every page footer links to the YouTube channel', async ({ page }) => {
  await page.goto('/programs');
  await expect(page.getByTestId('footer-youtube')).toHaveAttribute('href', channel);
});
