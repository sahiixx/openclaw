import { test, expect } from '@playwright/test';

/**
 * Smoke Tests - Basic application health checks
 * These tests verify the app loads and basic navigation works
 */
test.describe('Smoke Tests', () => {
  test('application loads successfully', async ({ page }) => {
    await page.goto('/');
    
    // Wait for React to hydrate
    await page.waitForLoadState('networkidle');
    
    // App should be visible
    await expect(page.locator('body')).toBeVisible();
  });

  test('login page is accessible', async ({ page }) => {
    await page.goto('/login');
    
    await page.waitForLoadState('networkidle');
    
    // Should show login UI elements
    await expect(page.locator('body')).toBeVisible();
    
    // Look for Google sign-in button or similar auth elements
    const authButton = page.getByRole('button').filter({ hasText: /sign|google|login/i });
    await expect(authButton.first()).toBeVisible({ timeout: 10000 });
  });

  test('navigation to main routes works', async ({ page }) => {
    // Test that main routes don't 404
    const routes = ['/', '/login', '/hub', '/chat'];
    
    for (const route of routes) {
      const response = await page.goto(route);
      
      // Should not be a server error
      expect(response?.status()).toBeLessThan(500);
    }
  });

  test('API health check', async ({ request }) => {
    // Check backend is responding
    const response = await request.get('/api/');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('message');
  });

  test('public API endpoints are accessible', async ({ request }) => {
    // Personas endpoint (public)
    const personasResponse = await request.get('/api/hub/personas');
    expect(personasResponse.ok()).toBeTruthy();
    
    const personas = await personasResponse.json();
    expect(personas).toHaveProperty('personas');
    expect(personas.personas.length).toBeGreaterThan(0);

    // Agents endpoint (public)
    const agentsResponse = await request.get('/api/hub/agents');
    expect(agentsResponse.ok()).toBeTruthy();
    
    const agents = await agentsResponse.json();
    expect(agents).toHaveProperty('agents');
    expect(agents.agents.length).toBeGreaterThan(0);
  });
});
