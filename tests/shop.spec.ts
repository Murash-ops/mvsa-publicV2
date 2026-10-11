import { test, expect } from '@playwright/test';
import { catalogue, orderMessage, orderUrl } from '../src/content/shop';

/**
 * The shop takes no money and stores no order. These tests hold that line:
 * the page must never look like a checkout, and the ordering link must carry
 * the item into WhatsApp so reception knows what the message is about.
 */

test('the shop says so when there is nothing to sell', async ({ page }) => {
  test.skip(catalogue.length > 0, 'the catalogue has items, so the empty state is not shown');

  await page.goto('/shop');

  await expect(page.getByRole('heading', { name: 'The shop is being set up' })).toBeVisible();
  // No prices, no basket, nothing that reads as a checkout.
  await expect(page.getByText(/KES/)).toHaveCount(0);
  await expect(page.getByRole('link', { name: /message reception/i })).toBeVisible();
});

test('an empty catalogue is not linked from the navigation', async ({ page }) => {
  test.skip(catalogue.length > 0, 'the catalogue has items, so the link belongs there');

  await page.goto('/');

  await expect(page.getByRole('navigation').getByRole('link', { name: 'Shop' })).toHaveCount(0);
});

test('every item hands over to WhatsApp with its own name in the message', async ({ page }) => {
  test.skip(catalogue.length === 0, 'nothing to order yet');

  await page.goto('/shop');

  for (const item of catalogue.filter((i) => i.available !== false)) {
    const link = page.getByRole('link', { name: /order on whatsapp/i }).first();
    await expect(link).toBeVisible();
    expect(orderUrl('254798258950', item)).toContain('wa.me/254798258950');
    expect(orderMessage(item)).toContain(item.name);
  }

  // The page must say plainly that nothing is bought here.
  await expect(page.getByText(/nothing is bought on this page/i)).toBeVisible();
});

test('the order message names the item and never invents a quantity', () => {
  const item = {
    id: 'test-item',
    name: 'Training Bib',
    description: 'A bib.',
    priceKes: 1500,
  };

  const message = orderMessage(item);
  expect(message).toContain('Training Bib');
  expect(message).toContain('KES 1,500');
  // It ends on the customer's own name, not a number we guessed for them.
  expect(message.trimEnd()).toMatch(/My name is$/);
  expect(message).not.toMatch(/quantity|\bx\s?\d/i);
});
