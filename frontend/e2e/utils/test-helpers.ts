import { Page, expect } from '@playwright/test';

/**
 * Test utility functions for e2e tests
 */

/**
 * Wait for the page to be fully loaded and React hydrated
 */
export async function waitForPageReady(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Clear all cookies and storage for a fresh session
 */
export async function clearSession(page: Page): Promise<void> {
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Check if the user is redirected to login page
 */
export async function isOnLoginPage(page: Page): Promise<boolean> {
  const currentUrl = page.url();
  return currentUrl.includes('/login');
}

/**
 * Get the backend URL from environment
 */
export function getBackendUrl(): string {
  return process.env.REACT_APP_BACKEND_URL || 'https://e2e-builder.preview.emergentagent.com';
}

/**
 * Make an authenticated API request (requires valid session cookie)
 */
export async function authenticatedRequest(
  page: Page,
  method: string,
  endpoint: string,
  data?: any
): Promise<Response> {
  const backendUrl = getBackendUrl();
  const cookies = await page.context().cookies();
  const sessionCookie = cookies.find(c => c.name === 'session_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (sessionCookie) {
    headers['Cookie'] = `session_token=${sessionCookie.value}`;
  }

  const response = await fetch(`${backendUrl}${endpoint}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: 'include',
  });

  return response;
}

/**
 * Wait for and verify a toast/notification message
 */
export async function waitForToast(
  page: Page,
  expectedText: string | RegExp,
  timeout: number = 5000
): Promise<void> {
  const toast = page.locator('[role="alert"], [data-sonner-toast], .toast, .notification');
  await expect(toast.filter({ hasText: expectedText })).toBeVisible({ timeout });
}

/**
 * Take a screenshot with a descriptive name
 */
export async function takeScreenshot(
  page: Page,
  name: string
): Promise<void> {
  await page.screenshot({
    path: `e2e/screenshots/${name}-${Date.now()}.png`,
    fullPage: true,
  });
}

/**
 * Persona IDs available in the system
 */
export const PERSONA_IDS = [
  'neo',
  'cursor',
  'devin',
  'manus',
  'lovable',
  'perplexity',
  'claude-code',
  'notion-ai',
];

/**
 * Test data generators
 */
export const TestData = {
  generateSessionId: () => `test-session-${Date.now()}`,
  generateMessage: () => `Test message at ${new Date().toISOString()}`,
  generateEmail: () => `test-${Date.now()}@example.com`,
};
