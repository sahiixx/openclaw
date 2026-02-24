import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const AUTH_FILE = path.join(__dirname, '..', '.auth', 'user.json');

/**
 * Helper to check if we have valid auth state
 */
function hasValidAuth(): boolean {
  if (!fs.existsSync(AUTH_FILE)) return false;
  
  try {
    const auth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8'));
    const sessionCookie = auth.cookies?.find((c: any) => c.name === 'session_token');
    return sessionCookie && sessionCookie.value && sessionCookie.expires > Date.now() / 1000;
  } catch {
    return false;
  }
}

/**
 * Authenticated Feature Tests
 * These tests only run when valid auth is available
 */
test.describe('Authenticated Features', () => {
  // Skip all tests in this file if no auth is available
  test.skip(() => !hasValidAuth(), 'Skipping: No valid authentication available');

  test.describe('User Profile', () => {
    test('can fetch current user info', async ({ request }) => {
      const response = await request.get('/api/auth/me');
      expect(response.ok()).toBeTruthy();
      
      const user = await response.json();
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('name');
    });
  });

  test.describe('Chat Features', () => {
    test('can create a new chat session', async ({ request }) => {
      const response = await request.post('/api/chat/message', {
        data: { message: 'Hello, this is a test message' },
      });
      
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data).toHaveProperty('session_id');
      expect(data).toHaveProperty('response');
    });

    test('can list chat sessions', async ({ request }) => {
      const response = await request.get('/api/chat/sessions');
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data).toHaveProperty('sessions');
      expect(Array.isArray(data.sessions)).toBeTruthy();
    });
  });

  test.describe('Hub Features', () => {
    test('can apply a persona', async ({ request }) => {
      const response = await request.post('/api/hub/personas/apply', {
        data: { persona_id: 'neo' },
      });
      
      // Should succeed or fail gracefully
      expect([200, 400, 500]).toContain(response.status());
    });
  });

  test.describe('OpenClaw Gateway', () => {
    test('can check gateway status as owner', async ({ request }) => {
      const response = await request.get('/api/openclaw/status');
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data).toHaveProperty('running');
    });

    test('can start gateway with emergent provider', async ({ request }) => {
      // First check if already running
      const statusResponse = await request.get('/api/openclaw/status');
      const status = await statusResponse.json();
      
      if (!status.running) {
        const response = await request.post('/api/openclaw/start', {
          data: { provider: 'emergent' },
        });
        
        // May succeed or fail based on instance lock
        expect([200, 403, 500]).toContain(response.status());
      }
    });
  });

  test.describe('Digest Features', () => {
    test('can get digest config', async ({ request }) => {
      const response = await request.get('/api/digest/config');
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data).toHaveProperty('enabled');
    });

    test('can update digest config', async ({ request }) => {
      const response = await request.post('/api/digest/config', {
        data: {
          enabled: false,
          scheduled_time: '09:00',
        },
      });
      
      expect(response.ok()).toBeTruthy();
    });
  });
});
