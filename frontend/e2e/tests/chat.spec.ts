import { test, expect } from '@playwright/test';

/**
 * Chat Tests
 * Tests chat functionality and API endpoints
 */
test.describe('Chat', () => {
  test.describe('Chat API - Unauthenticated', () => {
    test('POST /chat/message requires authentication', async ({ request }) => {
      const response = await request.post('/api/chat/message', {
        data: { message: 'Hello' },
      });
      
      expect(response.status()).toBe(401);
    });

    test('GET /chat/sessions requires authentication', async ({ request }) => {
      const response = await request.get('/api/chat/sessions');
      expect(response.status()).toBe(401);
    });

    test('GET /chat/history requires authentication', async ({ request }) => {
      const response = await request.get('/api/chat/history/test-session');
      expect(response.status()).toBe(401);
    });

    test('DELETE /chat/session requires authentication', async ({ request }) => {
      const response = await request.delete('/api/chat/session/test-session');
      expect(response.status()).toBe(401);
    });
  });

  test.describe('Chat Page UI', () => {
    test('chat page redirects unauthenticated users', async ({ page }) => {
      await page.context().clearCookies();
      
      await page.goto('/chat');
      await page.waitForLoadState('networkidle');

      // Should redirect to login or show auth required
      const currentUrl = page.url();
      const pageContent = await page.textContent('body');
      
      const requiresAuth = 
        currentUrl.includes('/login') ||
        pageContent?.toLowerCase().includes('sign') ||
        pageContent?.toLowerCase().includes('login');
        
      expect(requiresAuth).toBeTruthy();
    });
  });

  test.describe('Chat API - Request Validation', () => {
    test('empty message returns error', async ({ request }) => {
      const response = await request.post('/api/chat/message', {
        data: { message: '' },
      });
      
      // Should return 400 (bad request) or 401 (auth required)
      expect([400, 401, 422]).toContain(response.status());
    });

    test('malformed request is handled gracefully', async ({ request }) => {
      const response = await request.post('/api/chat/message', {
        data: { invalid_field: 'test' },
      });
      
      // Should return appropriate error code
      expect([400, 401, 422]).toContain(response.status());
    });
  });
});
