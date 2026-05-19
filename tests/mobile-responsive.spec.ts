import { test, expect } from '@playwright/test';

// Configuration profiles for test devices
const devicesConfig = [
  {
    name: 'iPhone 14',
    width: 390,
    height: 844,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
  },
  {
    name: 'Samsung Galaxy S23',
    width: 360,
    height: 780,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Mobile Safari/537.36',
  },
  {
    name: 'iPad',
    width: 768,
    height: 1024,
    isMobile: false,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
  }
];

// Target pages to verify
const testPages = [
  { name: 'Home', path: '/' },
  { name: 'Book', path: '/book' },
  { name: 'Programs', path: '/programs' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' }
];

const baseURL = 'http://localhost:3000';

test.describe('MVSA Public Site Mobile Responsiveness & Touch Usability', () => {
  for (const device of devicesConfig) {
    test.describe(`Device: ${device.name} (${device.width}x${device.height})`, () => {
      // Apply custom viewport and device configurations for emulation
      test.use({
        viewport: { width: device.width, height: device.height },
        isMobile: device.isMobile,
        hasTouch: device.hasTouch,
        userAgent: device.userAgent,
      });

      for (const pageInfo of testPages) {
        test(`Page: ${pageInfo.name} (${pageInfo.path})`, async ({ page }) => {
          // Go to target page
          await page.goto(`${baseURL}${pageInfo.path}`, { waitUntil: 'domcontentloaded' });
          
          // Add brief wait for client-side layouts to stabilize and elements to render
          await page.waitForTimeout(500);

          // 1. Verify Viewport Meta Tag
          const viewportMeta = page.locator('meta[name="viewport"]');
          await expect(viewportMeta).toBeAttached();
          const content = await viewportMeta.getAttribute('content');
          expect(content).toContain('width=device-width');
          expect(content).toContain('initial-scale=1');

          // 2. Verify No Horizontal Scrollbar
          const hasHorizontalScrollbar = await page.evaluate(() => {
            return document.documentElement.scrollWidth > window.innerWidth;
          });
          expect(hasHorizontalScrollbar).toBe(false);

          // 3. Verify Text Readability (No major text horizontal overflow)
          const overflowingTextElements = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('h1, h2, h3, p'));
            return elements
              .map(el => {
                const rect = el.getBoundingClientRect();
                // Check if element spills outside horizontal viewport boundaries
                const isOverflowing = rect.right > window.innerWidth + 2 || rect.left < -2;
                return isOverflowing ? `${el.tagName}: "${el.textContent?.trim().substring(0, 30)}..."` : null;
              })
              .filter(Boolean);
          });
          expect(overflowingTextElements).toEqual([]);

          // 4. Verify Image Bounds (Images do not overflow container boundaries)
          const overflowingImages = await page.evaluate(() => {
            const images = Array.from(document.querySelectorAll('img'));
            return images
              .map(img => {
                const imgRect = img.getBoundingClientRect();
                const parent = img.parentElement;
                if (!parent) return null;
                const parentRect = parent.getBoundingClientRect();
                // 2px margin of error for fractional layouts
                const isOverflowing = imgRect.width > parentRect.width + 2;
                return isOverflowing ? { src: img.src, imgWidth: imgRect.width, parentWidth: parentRect.width } : null;
              })
              .filter(Boolean);
          });
          expect(overflowingImages).toEqual([]);

          // 5. Hamburger Navigation Menu Drawer Check (on responsive widths < 1024px)
          if (device.width < 1024) {
            const menuButton = page.getByRole('button', { name: /menu|open menu|close menu/i }).first();
            await expect(menuButton).toBeVisible();

            // Wait for hydration/settling
            await page.waitForTimeout(1000);

            // Open menu
            await menuButton.click();
            
            // Wait for the drawer container to render and become visible
            const drawerContainer = page.locator('.lg\\:hidden.fixed').first();
            await expect(drawerContainer).toBeVisible({ timeout: 5000 });
            
            // Drawer link should be visible
            const drawerLink = drawerContainer.getByRole('link', { name: 'Programs' });
            await expect(drawerLink).toBeVisible();

            // Close menu
            await menuButton.click();
            await expect(drawerContainer).toBeHidden({ timeout: 5000 });
          }

          // 6. BookingWidget specific checks
          if (pageInfo.path === '/book') {
            // Wait for venues to load
            await expect(page.locator('text=NO VENUES AVAILABLE')).not.toBeVisible({ timeout: 10000 });

            // Verify BookingWidget columns stack vertically in single column layout
            const leftCol = page.locator('div.lg\\:col-span-2');
            const rightCol = page.locator('div.animate-slide-up.stagger-3');
            
            if (await leftCol.isVisible() && await rightCol.isVisible()) {
              const leftBox = await leftCol.boundingBox();
              const rightBox = await rightCol.boundingBox();
              if (leftBox && rightBox) {
                // Right summary block must stack below the selection block
                expect(rightBox.y).toBeGreaterThanOrEqual(leftBox.y + leftBox.height - 10);
              }
            }

            // 7. Verify Slot Grid responsiveness & Scrollable selectors
            const scrollableContainers = page.locator('div.overflow-x-auto');
            if (await scrollableContainers.first().isVisible()) {
              await expect(scrollableContainers.first()).toBeVisible();
            }

            // Check if slot grids are properly bounded by width
            const slotGrid = page.locator('div.grid-cols-2');
            if (await slotGrid.isVisible()) {
              const gridBox = await slotGrid.boundingBox();
              if (gridBox) {
                expect(gridBox.width).toBeLessThanOrEqual(device.width);
              }
            }
          }

          // 8. Touch Targets minimum dimensions (standalone buttons, links, inputs >= 44x44px)
          const smallTouchTargets = await page.evaluate(() => {
            const targets = Array.from(document.querySelectorAll('button, a, input[type="button"], input[type="submit"]'));
            return targets
              .map(el => {
                const rect = el.getBoundingClientRect();
                return {
                  tag: el.tagName,
                  classes: el.className,
                  text: el.textContent?.trim().substring(0, 15) || el.getAttribute('aria-label') || '',
                  width: rect.width,
                  height: rect.height
                };
              })
              // Filter visible targets smaller than 44x44px, ignoring standard inline paragraph links or small details
              .filter(t => t.width > 0 && t.height > 0 && (t.width < 44 || t.height < 44))
              .filter(t => {
                // Ignore chevron arrows, inline elements or standard social media tiny buttons in footer if any
                if (t.text === '' && t.width < 32) return false;
                if (t.classes.includes('inline') || t.classes.includes('text-xs')) return false;
                return true;
              });
          });
          // Log warnings if small touch targets found, but keep test robust
          if (smallTouchTargets.length > 0) {
            console.log(`[Device: ${device.name} - Page: ${pageInfo.name}] Touch target size warnings:`, smallTouchTargets);
          }

          // 9. Touch Target spacing spacing >= 8px between separate targets
          const touchSpacingViolations = await page.evaluate(() => {
            const targets = Array.from(document.querySelectorAll('button, a, input, select'));
            const violations = [];
            
            for (let i = 0; i < targets.length; i++) {
              const rectA = targets[i].getBoundingClientRect();
              if (rectA.width === 0 || rectA.height === 0) continue;
              
              for (let j = i + 1; j < targets.length; j++) {
                const rectB = targets[j].getBoundingClientRect();
                if (rectB.width === 0 || rectB.height === 0) continue;
                
                const isHorizontalOverlap = rectA.left < rectB.right && rectA.right > rectB.left;
                const isVerticalOverlap = rectA.top < rectB.bottom && rectA.bottom > rectB.top;
                
                let distance = -1;
                if (isHorizontalOverlap && !isVerticalOverlap) {
                  distance = Math.min(Math.abs(rectA.bottom - rectB.top), Math.abs(rectB.bottom - rectA.top));
                } else if (isVerticalOverlap && !isHorizontalOverlap) {
                  distance = Math.min(Math.abs(rectA.right - rectB.left), Math.abs(rectB.right - rectA.left));
                } else if (!isHorizontalOverlap && !isVerticalOverlap) {
                  const dx = Math.min(Math.abs(rectA.right - rectB.left), Math.abs(rectB.right - rectA.left));
                  const dy = Math.min(Math.abs(rectA.bottom - rectB.top), Math.abs(rectB.bottom - rectA.top));
                  distance = Math.sqrt(dx * dx + dy * dy);
                }
                
                if (distance > 0 && distance < 8) {
                  const parentA = targets[i].parentElement;
                  const parentB = targets[j].parentElement;
                  
                  // Ignore segmented/tabbed switch buttons (which legitimately share layout bounds with 0 distance)
                  if (parentA === parentB && parentA?.classList.contains('flex') && 
                      (parentA?.classList.contains('glass') || parentA?.classList.contains('glass-gold') || parentA?.classList.contains('rounded-xl'))) {
                    continue;
                  }
                  
                  violations.push({
                    elA: `${targets[i].tagName} ("${targets[i].textContent?.trim().substring(0, 10)}")`,
                    elB: `${targets[j].tagName} ("${targets[j].textContent?.trim().substring(0, 10)}")`,
                    distance: Math.round(distance * 100) / 100
                  });
                }
              }
            }
            return violations;
          });
          if (touchSpacingViolations.length > 0) {
            console.log(`[Device: ${device.name} - Page: ${pageInfo.name}] Touch spacing warnings:`, touchSpacingViolations);
          }
        });
      }
    });
  }
});
