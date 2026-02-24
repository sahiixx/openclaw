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
| `yarn e2e:auth-setup` | Interactive auth setup (opens browser) |
| `yarn e2e:auth-tests` | Run only authenticated tests |

## Test Structure

```
e2e/
├── tests/
│   ├── smoke.spec.ts               # Basic health checks (5 tests)
│   ├── auth.spec.ts                # Auth flows (7 tests)
│   ├── authenticated-flows.spec.ts # Auth flow docs (5 tests)
│   ├── authenticated-features.spec.ts # Auth-required tests (8 tests, skipped without auth)
│   ├── hub.spec.ts                 # AI Hub functionality (11 tests)
│   ├── chat.spec.ts                # Chat features (7 tests)
│   ├── openclaw.spec.ts            # Gateway tests (8 tests)
│   ├── setup-page.spec.ts          # Setup page UI (10 tests)
│   └── digest.spec.ts              # Daily digest (4 tests)
├── fixtures/
│   ├── base.fixture.ts             # Custom test fixtures
│   └── auth.fixture.ts             # Auth helpers
├── utils/
│   └── test-helpers.ts             # Utility functions
├── scripts/
│   └── auth-setup.ts               # Interactive auth setup
├── .auth/                          # Auth state storage (gitignored)
├── global-setup.ts                 # Pre-test auth setup
└── reports/                        # Test reports (gitignored)
```

## Authentication for Tests

### Option 1: Environment Variable (Recommended for CI)

```bash
# Set session token as environment variable
export TEST_SESSION_TOKEN="your-session-token"
yarn e2e
```

For GitHub Actions, add `TEST_SESSION_TOKEN` as a repository secret.

### Option 2: Interactive Setup (Development)

```bash
# Opens browser for you to login
yarn e2e:auth-setup

# Then run authenticated tests
yarn e2e:auth-tests
```

### Option 3: Manual Cookie Setup

1. Login to the app in your browser
2. Copy `session_token` cookie value from DevTools
3. Create `e2e/.auth/user.json`:
```json
{
  "cookies": [{
    "name": "session_token",
    "value": "YOUR_TOKEN_HERE",
    "domain": "e2e-builder.preview.emergentagent.com",
    "path": "/",
    "httpOnly": true,
    "secure": true,
    "sameSite": "None"
  }],
  "origins": []
}
```

## CI/CD Integration

Two GitHub Actions workflows are included:

### `.github/workflows/e2e-tests.yml`
- Runs on push to main/develop
- Full test suite with Chromium
- Multi-browser tests on main branch
- Uploads test reports as artifacts

### `.github/workflows/pr-checks.yml`
- Runs on pull requests
- Quick smoke tests only
- Lint checks

### GitHub Secrets Required

| Secret | Description |
|--------|-------------|
| `TEST_SESSION_TOKEN` | Optional: Session token for authenticated tests |

### GitHub Variables

| Variable | Description |
|----------|-------------|
| `E2E_BASE_URL` | Optional: Override base URL for tests |

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

### Authenticated Test Example

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authenticated Features', () => {
  test('can access user data', async ({ request }) => {
    const response = await request.get('/api/auth/me');
    expect(response.ok()).toBeTruthy();
  });
});
```

## Debugging

1. **UI Mode**: `yarn e2e:ui` - Interactive test runner with time-travel debugging
2. **Debug Mode**: `yarn e2e:debug` - Opens inspector for step-by-step debugging
3. **Headed Mode**: `yarn e2e:headed` - Watch tests run in browser
4. **Trace Viewer**: After test failure, use trace files for debugging
5. **Screenshots**: Automatically captured on failure in `e2e/test-results/`

## Best Practices

1. **Use stable selectors**: Prefer `data-testid`, roles, and text over CSS selectors
2. **Wait for network**: Use `waitForLoadState('networkidle')` for API-dependent pages
3. **Isolate tests**: Each test should be independent
4. **Use fixtures**: Share setup code via fixtures
5. **Assert meaningfully**: Test user-visible behavior, not implementation details
6. **Skip gracefully**: Use `test.skip()` for tests requiring unavailable resources
