import { test as base, expect } from '@playwright/test';

/**
 * Custom test fixtures for e2e tests
 */

// Extend the base test with custom fixtures
export const test = base.extend<{
  // Add custom fixtures here
  apiBaseUrl: string;
  clearCookiesBeforeTest: void;
}>({
  // API base URL fixture
  apiBaseUrl: async ({}, use) => {
    const baseUrl = process.env.E2E_BASE_URL || 'https://e2e-builder.preview.emergentagent.com';
    await use(baseUrl);
  },

  // Auto-clear cookies before each test
  clearCookiesBeforeTest: async ({ page }, use) => {
    await page.context().clearCookies();
    await use();
  },
});

export { expect };

/**
 * Test configuration options
 */
export const TestConfig = {
  // Timeouts
  defaultTimeout: 30000,
  navigationTimeout: 30000,
  actionTimeout: 15000,

  // Retry configuration
  retries: process.env.CI ? 2 : 0,

  // Screenshot settings
  screenshotOnFailure: true,

  // API endpoints
  endpoints: {
    auth: {
      session: '/api/auth/session',
      me: '/api/auth/me',
      logout: '/api/auth/logout',
      instance: '/api/auth/instance',
    },
    chat: {
      message: '/api/chat/message',
      sessions: '/api/chat/sessions',
      history: (id: string) => `/api/chat/history/${id}`,
      delete: (id: string) => `/api/chat/session/${id}`,
    },
    hub: {
      personas: '/api/hub/personas',
      personasApply: '/api/hub/personas/apply',
      personasDetect: '/api/hub/personas/detect',
      agents: '/api/hub/agents',
      kimiConfigure: '/api/hub/kimi/configure',
    },
    openclaw: {
      start: '/api/openclaw/start',
      stop: '/api/openclaw/stop',
      status: '/api/openclaw/status',
      token: '/api/openclaw/token',
      whatsappStatus: '/api/openclaw/whatsapp/status',
    },
    telegram: {
      status: '/api/telegram/status',
      configure: '/api/telegram/configure',
    },
    digest: {
      config: '/api/digest/config',
      trigger: '/api/digest/trigger',
      history: '/api/digest/history',
    },
  },
};
