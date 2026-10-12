import { test, expect } from '@playwright/test';
import { catalogue, draft, orderMessage, orderUrl, shopIsListed } from '../src/content/shop';

/**
 * The shop takes no money and stores no order. These tests hold that line:
 * the page must never look like a checkout, the ordering link must carry the
 * item into WhatsApp so reception knows what the message is about, and a
 * draft list must not publish a price or get linked from the navigation.
 */

test('the shop says so when there is nothing to sell', async ({ page }) => {
  test.skip(catalogue.length > 0, 'the catalogue has items, so the empty state is not shown');

  await page.goto('/shop');

  await expect(page.getByRole('heading', { name: 'The shop is being set up' })).toBeVisible();
  // No prices, no basket, nothing that reads as a checkout.
  await expect(page.getByText(/KES/)).toHaveCount(0);
  await expect(page.getByRole('link', { name: /message reception/i })).toBeVisible();
});

test('the shop is linked from the navigation only once its list is real', async ({ page }) => {
  await page.goto('/');

  const link = page.getByRole('navigation').getByRole('link', { name: 'Shop' });
  await expect(link).toHaveCount(shopIsListed ? 1 : 0);
});

test('a draft list says it is a draft and publishes no price', async ({ page }) => {
  test.skip(!draft || catalogue.length === 0, 'the list is not a draft');

  await page.goto('/shop');

  await expect(page.getByText(/^Draft\./)).toBeVisible();
  // A draft must not put a figure on the page that reception has to honour.
  await expect(page.getByText(/KES/)).toHaveCount(0);
  // Every card asks instead.
  await expect(page.getByText('Ask', { exact: true })).toHaveCount(catalogue.length);
});

test('every item hands over to WhatsApp with its own name in the message', async ({ page }) => {
  test.skip(catalogue.length === 0, 'nothing to order yet');

  await page.goto('/shop');

  const available = catalogue.filter((i) => i.available !== false);
  await expect(page.getByRole('link', { name: /order on whatsapp/i })).toHaveCount(available.length);

  for (const item of available) {
    const url = orderUrl('254798258950', item);
    expect(url).toContain('wa.me/254798258950');
    await expect(page.locator(`a[href="${url}"]`)).toBeVisible();
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

test('a draft item carries no price, so nothing is advertised early', () => {
  test.skip(!draft, 'the list is not a draft');

  for (const item of catalogue) {
    expect(item.priceKes, `${item.name} has a price while the list is a draft`).toBeUndefined();
  }
});
