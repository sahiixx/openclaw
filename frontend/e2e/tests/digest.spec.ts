import { test, expect } from '@playwright/test';

/**
 * Digest Feature Tests
 * Tests the daily digest configuration and API endpoints
 */
test.describe('Daily Digest', () => {
  test.describe('Protected Endpoints', () => {
    test('GET /digest/config requires authentication', async ({ request }) => {
      const response = await request.get('/api/digest/config');
      expect([401, 403]).toContain(response.status());
    });

    test('POST /digest/config requires authentication', async ({ request }) => {
      const response = await request.post('/api/digest/config', {
        data: {
          enabled: true,
          scheduled_time: '09:00',
        },
      });
      expect([401, 403]).toContain(response.status());
    });

    test('POST /digest/trigger requires authentication', async ({ request }) => {
      const response = await request.post('/api/digest/trigger');
      expect([401, 403]).toContain(response.status());
    });

    test('GET /digest/history requires authentication', async ({ request }) => {
      const response = await request.get('/api/digest/history');
      expect([401, 403]).toContain(response.status());
    });
  });
});
