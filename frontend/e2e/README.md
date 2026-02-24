# E2E Testing Guide

This project uses **Playwright** for end-to-end testing.

## Quick Start

```bash
# Run all tests
yarn e2e

# Run tests in UI mode (interactive)
yarn e2e:ui

# Run tests with browser visible
yarn e2e:headed

# Debug tests
yarn e2e:debug
```

## Test Commands

| Command | Description |
|---------|-------------|
| `yarn e2e` | Run all tests headless |
| `yarn e2e:ui` | Open Playwright UI for interactive testing |
| `yarn e2e:headed` | Run tests with visible browser |
| `yarn e2e:debug` | Run in debug mode with inspector |
| `yarn e2e:chromium` | Run tests only in Chromium |
| `yarn e2e:firefox` | Run tests only in Firefox |
| `yarn e2e:webkit` | Run tests only in WebKit (Safari) |
| `yarn e2e:report` | View HTML test report |
| `yarn e2e:install` | Install browser binaries |

## Test Structure

```
e2e/
├── tests/
│   ├── smoke.spec.ts       # Basic health checks
│   ├── auth.spec.ts        # Authentication flows
│   ├── hub.spec.ts         # AI Hub functionality
│   ├── chat.spec.ts        # Chat features
│   ├── openclaw.spec.ts    # OpenClaw gateway tests
│   └── setup-page.spec.ts  # Setup page UI tests
├── fixtures/
│   └── base.fixture.ts     # Custom test fixtures
├── utils/
│   └── test-helpers.ts     # Utility functions
└── reports/                # Test reports (gitignored)
```

## Test Categories

### 1. Smoke Tests (`smoke.spec.ts`)
- Application loads successfully
- Basic navigation works
- API health check
- Public endpoints accessible

### 2. Authentication Tests (`auth.spec.ts`)
- Login page displays correctly
- Google sign-in button present
- Protected routes redirect unauthenticated users
- API returns 401 for protected endpoints
- Session management works

### 3. AI Hub Tests (`hub.spec.ts`)
- Personas API returns correct data
- Agents API with filtering
- Hub page UI loads

### 4. Chat Tests (`chat.spec.ts`)
- Chat API authentication
- Chat page access control
- Request validation

### 5. OpenClaw Tests (`openclaw.spec.ts`)
- Status endpoint
- Protected endpoint authentication
- Telegram/WhatsApp status

### 6. Setup Page Tests (`setup-page.spec.ts`)
- Page load and content
- Navigation
- UI elements
- Responsive design

## Configuration

The main configuration is in `playwright.config.ts`:

- **Base URL**: Set via `E2E_BASE_URL` env var or defaults to production
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Retries**: 2 retries on CI, 0 locally
- **Reporters**: HTML, JSON, List
- **Artifacts**: Screenshots on failure, video on retry

## Environment Variables

| Variable | Description | Default |
|----------|-------------|--------|
| `E2E_BASE_URL` | Base URL for tests | `https://e2e-builder.preview.emergentagent.com` |
| `CI` | Set in CI environment | - |

## Writing Tests

### Basic Test Example

```typescript
import { test, expect } from '@playwright/test';

test('example test', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
});
```

### API Test Example

```typescript
test('API returns correct data', async ({ request }) => {
  const response = await request.get('/api/hub/personas');
  expect(response.ok()).toBeTruthy();
  
  const data = await response.json();
  expect(data.personas.length).toBe(8);
});
```

### Using Fixtures

```typescript
import { test, expect, TestConfig } from '../fixtures/base.fixture';

test('using custom fixture', async ({ apiBaseUrl }) => {
  console.log('Testing against:', apiBaseUrl);
});
```

## CI/CD Integration

For GitHub Actions, add this to your workflow:

```yaml
- name: Install Playwright
  run: cd frontend && npx playwright install --with-deps chromium

- name: Run E2E Tests
  run: cd frontend && yarn e2e:chromium

- name: Upload Test Report
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: frontend/e2e/reports/html
```

## Debugging

1. **UI Mode**: `yarn e2e:ui` - Interactive test runner with time-travel debugging
2. **Debug Mode**: `yarn e2e:debug` - Opens inspector for step-by-step debugging
3. **Headed Mode**: `yarn e2e:headed` - Watch tests run in browser
4. **Trace Viewer**: After test failure, use trace files for debugging

## Best Practices

1. **Use stable selectors**: Prefer `data-testid`, roles, and text over CSS selectors
2. **Wait for network**: Use `waitForLoadState('networkidle')` for API-dependent pages
3. **Isolate tests**: Each test should be independent
4. **Use fixtures**: Share setup code via fixtures
5. **Assert meaningfully**: Test user-visible behavior, not implementation details
