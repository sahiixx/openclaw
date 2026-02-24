import { test, expect } from '@playwright/test';

/**
 * AI Hub Tests
 * Tests the AI Hub functionality including personas and agents
 */
test.describe('AI Hub', () => {
  test.describe('Personas API', () => {
    test('returns list of personas', async ({ request }) => {
      const response = await request.get('/api/hub/personas');
      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(data).toHaveProperty('personas');
      expect(Array.isArray(data.personas)).toBeTruthy();
      expect(data.personas.length).toBe(8); // Should have 8 personas
    });

    test('personas have required properties', async ({ request }) => {
      const response = await request.get('/api/hub/personas');
      const data = await response.json();

      const requiredProps = ['id', 'name', 'description', 'category'];
      
      for (const persona of data.personas) {
        for (const prop of requiredProps) {
          expect(persona).toHaveProperty(prop);
        }
      }
    });

    test('persona detect endpoint works', async ({ request }) => {
      const response = await request.post('/api/hub/personas/detect', {
        data: { message: 'Write me a Python script' },
      });
      
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      // API returns persona_id and persona object with confidence
      expect(data).toHaveProperty('persona');
      expect(data).toHaveProperty('persona_id');
      expect(data).toHaveProperty('confidence');
    });

    test('persona apply requires authentication', async ({ request }) => {
      const response = await request.post('/api/hub/personas/apply', {
        data: { persona_id: 'neo' },
      });
      
      expect(response.status()).toBe(401);
    });
  });

  test.describe('Agents API', () => {
    test('returns list of agents', async ({ request }) => {
      const response = await request.get('/api/hub/agents');
      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(data).toHaveProperty('agents');
      expect(data).toHaveProperty('total');
      expect(data.total).toBe(50); // Should have 50 agents
    });

    test('agents have required properties', async ({ request }) => {
      const response = await request.get('/api/hub/agents');
      const data = await response.json();

      const requiredProps = ['id', 'name', 'description', 'industry', 'framework'];
      
      for (const agent of data.agents.slice(0, 10)) { // Check first 10
        for (const prop of requiredProps) {
          expect(agent).toHaveProperty(prop);
        }
      }
    });

    test('agents search works with query parameter', async ({ request }) => {
      const response = await request.get('/api/hub/agents?q=health');
      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(data).toHaveProperty('agents');
      
      // Results should be filtered by search query
      if (data.agents.length > 0) {
        const hasHealthRelated = data.agents.some(
          (agent: any) => 
            agent.name.toLowerCase().includes('health') ||
            agent.description.toLowerCase().includes('health') ||
            agent.industry.toLowerCase().includes('health')
        );
        expect(hasHealthRelated).toBeTruthy();
      }
    });

    test('agents filter by industry works', async ({ request }) => {
      const response = await request.get('/api/hub/agents?industry=Finance');
      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(data).toHaveProperty('agents');
      
      // All results should be finance-related
      for (const agent of data.agents) {
        expect(agent.industry).toBe('Finance');
      }
    });

    test('agents filter by framework works', async ({ request }) => {
      const response = await request.get('/api/hub/agents?framework=CrewAI');
      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(data).toHaveProperty('agents');
      
      // All results should use CrewAI
      for (const agent of data.agents) {
        expect(agent.framework).toBe('CrewAI');
      }
    });
  });

  test.describe('Hub Page UI', () => {
    test('hub page loads correctly', async ({ page }) => {
      await page.goto('/hub');
      await page.waitForLoadState('domcontentloaded');

      // Page should be visible
      await expect(page.locator('body')).toBeVisible();
    });

    test('hub page displays tabs or sections', async ({ page }) => {
      await page.goto('/hub');
      await page.waitForLoadState('domcontentloaded');

      // Look for tab elements or section headers
      const pageContent = await page.textContent('body');
      
      // Should contain hub-related content or be redirected to login
      const currentUrl = page.url();
      const hasHubContent = 
        pageContent?.toLowerCase().includes('persona') ||
        pageContent?.toLowerCase().includes('agent') ||
        pageContent?.toLowerCase().includes('hub') ||
        pageContent?.toLowerCase().includes('ai') ||
        currentUrl.includes('/login'); // Redirected to login is valid
        
      expect(hasHubContent).toBeTruthy();
    });
  });
});
