# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: basic.spec.ts >> booking page should show venues
- Location: tests\basic.spec.ts:3:5

# Error details

```
Error: page.goto: Target page, context or browser has been closed
Call log:
  - navigating to "http://localhost:3000/book", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('booking page should show venues', async ({ page }) => {
> 4  |   await page.goto('http://localhost:3000/book');
     |              ^ Error: page.goto: Target page, context or browser has been closed
  5  |   
  6  |   // Wait for the venues to load
  7  |   await expect(page.locator('text=NO VENUES AVAILABLE')).not.toBeVisible({ timeout: 10000 });
  8  |   
  9  |   // Check for the seeded venue
  10 |   await expect(page.locator('text=Main Arena Turf')).toBeVisible();
  11 | });
  12 | 
```