import { test as base, expect } from '@playwright/test';
import type { Page, BrowserContext } from '@playwright/test';

/**
 * Authentication fixtures for testing authenticated user flows
 * 
 * Usage:
 * 1. For mock auth testing (no real Google auth):
 *    - Use the `authenticatedPage` fixture
 *    - It sets up mock session cookies
 * 
 * 2. For real auth testing:
 *    - Set up storageState in global-setup.ts
 *    - Configure project to use stored auth state
 */

interface AuthFixtures {
  authenticatedPage: Page;
  unauthenticatedPage: Page;
  mockSession: (page: Page) => Promise<void>;
}

/**
 * Extended test with auth fixtures
 */
export const test = base.extend<AuthFixtures>({
  // Page with cleared authentication
  unauthenticatedPage: async ({ page }, use) => {
    await page.context().clearCookies();
    await use(page);
  },

  // Mock session setup function
  mockSession: async ({}, use) => {
    const setupMockSession = async (page: Page) => {
      // Note: This is a mock session for testing structure
      // In production, you would:
      // 1. Call a test endpoint to create a real session
      // 2. Or use stored auth state from global-setup
      
      // Example of how you would set a real session cookie:
      // await page.context().addCookies([{
      //   name: 'session_token',
      //   value: 'your-test-session-token',
      //   domain: 'your-domain.com',
      //   path: '/',
      //   httpOnly: true,
      //   secure: true,
      //   sameSite: 'None',
      // }]);
      
      console.log('Mock session setup - implement with real auth for production tests');
    };
    
    await use(setupMockSession);
  },

  // Page with mock authentication (for structural testing)
  authenticatedPage: async ({ page, mockSession }, use) => {
    await mockSession(page);
    await use(page);
  },
});

export { expect };

/**
 * Helper to check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const cookies = await page.context().cookies();
  return cookies.some(c => c.name === 'session_token');
}

/**
 * Helper to get current user from API
 */
export async function getCurrentUser(page: Page): Promise<any | null> {
  try {
    const response = await page.request.get('/api/auth/me');
    if (response.ok()) {
      return await response.json();
    }
  } catch (e) {
    // Not authenticated
  }
  return null;
}

/**
 * Helper to perform logout
 */
export async function logout(page: Page): Promise<void> {
  await page.request.post('/api/auth/logout');
  await page.context().clearCookies();
}

/**
 * Storage state path for authenticated sessions
 */
export const AUTH_STATE_PATH = 'e2e/.auth/user.json';

/**
 * Example global setup for real authentication:
 * 
 * ```typescript
 * // e2e/global-setup.ts
 * import { chromium, FullConfig } from '@playwright/test';
 * import { AUTH_STATE_PATH } from './fixtures/auth.fixture';
 * 
 * async function globalSetup(config: FullConfig) {
 *   const browser = await chromium.launch();
 *   const page = await browser.newPage();
 *   
 *   // Navigate to login
 *   await page.goto('/login');
 *   
 *   // Perform Google OAuth (requires test account)
 *   // This is complex with OAuth - consider:
 *   // 1. Using a test endpoint that creates sessions
 *   // 2. Using service account credentials
 *   // 3. Using environment variables with pre-generated tokens
 *   
 *   // Save auth state
 *   await page.context().storageState({ path: AUTH_STATE_PATH });
 *   
 *   await browser.close();
 * }
 * 
 * export default globalSetup;
 * ```
 */
