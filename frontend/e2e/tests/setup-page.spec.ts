import { test, expect } from '@playwright/test';

/**
 * Setup Page Tests
 * Tests the main setup/landing page functionality
 */
test.describe('Setup Page', () => {
  test.describe('Page Load', () => {
    test('setup page loads correctly', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('body')).toBeVisible();
    });

    test('page has proper title', async ({ page }) => {
      await page.goto('/');
      
      // Should have a title
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
    });

    test('page displays main content', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Should display some main content
      const pageContent = await page.textContent('body');
      expect(pageContent?.length).toBeGreaterThan(100);
    });
  });

  test.describe('Navigation', () => {
    test('can navigate to hub from setup page', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Look for navigation link to hub
      const hubLink = page.getByRole('link', { name: /hub/i });
      const hubButton = page.getByRole('button', { name: /hub/i });

      const hasHubNav = (await hubLink.count()) > 0 || (await hubButton.count()) > 0;
      
      if (hasHubNav) {
        if (await hubLink.count() > 0) {
          await hubLink.first().click();
        } else {
          await hubButton.first().click();
        }
        
        await page.waitForLoadState('networkidle');
        expect(page.url()).toContain('/hub');
      }
    });

    test('can navigate to chat from setup page', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Look for navigation link to chat
      const chatLink = page.getByRole('link', { name: /chat/i });
      const chatButton = page.getByRole('button', { name: /chat/i });

      const hasChatNav = (await chatLink.count()) > 0 || (await chatButton.count()) > 0;
      
      if (hasChatNav) {
        // Clicking will redirect to login for unauthenticated users
        if (await chatLink.count() > 0) {
          await chatLink.first().click();
        } else {
          await chatButton.first().click();
        }
        
        await page.waitForLoadState('networkidle');
        // May redirect to login or show chat (if somehow authenticated)
        const currentUrl = page.url();
        expect(currentUrl.includes('/chat') || currentUrl.includes('/login')).toBeTruthy();
      }
    });
  });

  test.describe('UI Elements', () => {
    test('page has interactive elements', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Should have buttons or links
      const buttons = page.getByRole('button');
      const links = page.getByRole('link');

      const hasInteractiveElements = 
        (await buttons.count()) > 0 || (await links.count()) > 0;
        
      expect(hasInteractiveElements).toBeTruthy();
    });

    test('page displays status information', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Look for status-related content
      const pageContent = await page.textContent('body');
      
      // Should show some status or provider information
      const hasStatusContent = 
        pageContent?.toLowerCase().includes('status') ||
        pageContent?.toLowerCase().includes('connected') ||
        pageContent?.toLowerCase().includes('openclaw') ||
        pageContent?.toLowerCase().includes('telegram');
        
      expect(hasStatusContent).toBeTruthy();
    });
  });

  test.describe('Responsive Design', () => {
    test('page renders correctly on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('body')).toBeVisible();
      
      // No horizontal scrollbar (content fits)
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20); // Small tolerance
    });

    test('page renders correctly on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('body')).toBeVisible();
    });

    test('page renders correctly on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('body')).toBeVisible();
    });
  });
});
