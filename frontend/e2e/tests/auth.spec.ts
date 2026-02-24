import { test, expect } from '@playwright/test';

/**
 * Authentication Tests
 * Tests login flow, session handling, and protected routes
 */
test.describe('Authentication', () => {
  test.describe('Login Page', () => {
    test('displays login page correctly', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      // Should show the login page content
      await expect(page.locator('body')).toBeVisible();
      
      // Look for sign-in related content
      const pageContent = await page.textContent('body');
      expect(pageContent?.toLowerCase()).toMatch(/sign|login|google/i);
    });

    test('Google sign-in button is present and clickable', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      // Find Google auth button
      const googleButton = page.getByRole('button').filter({ hasText: /google/i });
      
      if (await googleButton.count() > 0) {
        await expect(googleButton.first()).toBeEnabled();
      } else {
        // Alternative: look for any sign-in button
        const signInButton = page.getByRole('button').filter({ hasText: /sign|login/i });
        await expect(signInButton.first()).toBeVisible();
      }
    });
  });

  test.describe('Protected Routes', () => {
    test('unauthenticated users are redirected from protected pages', async ({ page }) => {
      // Clear any existing session
      await page.context().clearCookies();

      // Try to access protected routes
      await page.goto('/chat');
      await page.waitForLoadState('networkidle');

      // Should redirect to login or show auth required message
      const currentUrl = page.url();
      const pageContent = await page.textContent('body');
      
      // Either redirected to login or showing access denied
      const isOnLoginOrAuthRequired = 
        currentUrl.includes('/login') ||
        pageContent?.toLowerCase().includes('sign') ||
        pageContent?.toLowerCase().includes('login') ||
        pageContent?.toLowerCase().includes('authenticate');
        
      expect(isOnLoginOrAuthRequired).toBeTruthy();
    });

    test('API returns 401 for protected endpoints without auth', async ({ request }) => {
      // Test protected endpoints (only GET endpoints)
      const protectedEndpoints = [
        '/api/chat/sessions',
        '/api/auth/me',
      ];

      for (const endpoint of protectedEndpoints) {
        const response = await request.get(endpoint);
        expect(response.status()).toBe(401);
      }
      
      // POST endpoints that require auth
      const protectedPostEndpoints = [
        { url: '/api/chat/message', data: { message: 'test' } },
        { url: '/api/digest/config', data: { enabled: true } },
      ];
      
      for (const { url, data } of protectedPostEndpoints) {
        const response = await request.post(url, { data });
        expect([401, 403]).toContain(response.status());
      }
    });
  });

  test.describe('Session Management', () => {
    test('session endpoint returns proper error without valid session', async ({ request }) => {
      const response = await request.get('/api/auth/me');
      expect(response.status()).toBe(401);
      
      const data = await response.json();
      expect(data).toHaveProperty('detail');
    });

    test('logout endpoint works correctly', async ({ request }) => {
      const response = await request.post('/api/auth/logout');
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.ok).toBe(true);
    });

    test('instance status endpoint is accessible', async ({ request }) => {
      const response = await request.get('/api/auth/instance');
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data).toHaveProperty('locked');
    });
  });
});
