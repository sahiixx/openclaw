import { test, expect } from '@playwright/test';

/**
 * OpenClaw/Moltbot Gateway Tests
 * Tests the OpenClaw setup and status endpoints
 */
test.describe('OpenClaw Gateway', () => {
  test.describe('Status API', () => {
    test('GET /openclaw/status returns valid response', async ({ request }) => {
      const response = await request.get('/api/openclaw/status');
      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(data).toHaveProperty('running');
      expect(typeof data.running).toBe('boolean');
    });

    test('status includes provider info when running', async ({ request }) => {
      const response = await request.get('/api/openclaw/status');
      const data = await response.json();

      if (data.running) {
        // When running, should have additional info
        expect(data).toHaveProperty('provider');
        expect(data).toHaveProperty('controlUrl');
      }
    });
  });

  test.describe('Protected Endpoints', () => {
    test('POST /openclaw/start requires authentication', async ({ request }) => {
      const response = await request.post('/api/openclaw/start', {
        data: { provider: 'emergent' },
      });
      
      expect(response.status()).toBe(401);
    });

    test('POST /openclaw/stop requires authentication', async ({ request }) => {
      const response = await request.post('/api/openclaw/stop');
      expect(response.status()).toBe(401);
    });

    test('GET /openclaw/token requires authentication', async ({ request }) => {
      const response = await request.get('/api/openclaw/token');
      // Returns 401 (not auth) or 404 (not running)
      expect([401, 404]).toContain(response.status());
    });
  });

  test.describe('WhatsApp Status', () => {
    test('GET /openclaw/whatsapp/status returns valid response', async ({ request }) => {
      const response = await request.get('/api/openclaw/whatsapp/status');
      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      // Should have status information
      expect(typeof data).toBe('object');
    });
  });

  test.describe('Telegram Status', () => {
    test('GET /telegram/status returns valid response', async ({ request }) => {
      const response = await request.get('/api/telegram/status');
      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(data).toHaveProperty('connected');
    });

    test('POST /telegram/configure requires authentication', async ({ request }) => {
      const response = await request.post('/api/telegram/configure', {
        data: { bot_token: 'test-token' },
      });
      
      expect(response.status()).toBe(401);
    });
  });
});
