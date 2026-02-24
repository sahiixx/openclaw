import { chromium, FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const AUTH_DIR = path.join(__dirname, '.auth');
const AUTH_FILE = path.join(AUTH_DIR, 'user.json');

/**
 * Global Setup for Authenticated E2E Tests
 * 
 * This runs once before all tests to set up authentication.
 * 
 * For this app using Google OAuth, there are several approaches:
 * 
 * 1. TEST_SESSION_TOKEN env var (Recommended for CI)
 *    - Generate a long-lived session token
 *    - Set as GitHub secret
 *    - Tests use this token directly
 * 
 * 2. Test API Endpoint (Recommended for development)
 *    - Create /api/auth/test-session endpoint (dev only)
 *    - Generates sessions for test users
 * 
 * 3. Manual Auth State (Quick setup)
 *    - Login manually once
 *    - Export browser state
 *    - Commit .auth/user.json (careful with secrets)
 */
async function globalSetup(config: FullConfig) {
  // Ensure auth directory exists
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }

  // Check if we have a pre-configured session token
  const testSessionToken = process.env.TEST_SESSION_TOKEN;
  
  if (testSessionToken) {
    console.log('🔐 Using TEST_SESSION_TOKEN for authentication');
    
    // Create auth state with the session token
    const authState = {
      cookies: [
        {
          name: 'session_token',
          value: testSessionToken,
          domain: new URL(process.env.E2E_BASE_URL || 'https://e2e-builder.preview.emergentagent.com').hostname,
          path: '/',
          httpOnly: true,
          secure: true,
          sameSite: 'None' as const,
          expires: Date.now() / 1000 + 86400 * 7, // 7 days
        },
      ],
      origins: [],
    };
    
    fs.writeFileSync(AUTH_FILE, JSON.stringify(authState, null, 2));
    console.log('✅ Auth state saved to', AUTH_FILE);
    return;
  }

  // Check if auth file already exists and is valid
  if (fs.existsSync(AUTH_FILE)) {
    try {
      const existingAuth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8'));
      const sessionCookie = existingAuth.cookies?.find((c: any) => c.name === 'session_token');
      
      if (sessionCookie && sessionCookie.expires > Date.now() / 1000) {
        console.log('✅ Using existing auth state (not expired)');
        return;
      }
    } catch (e) {
      console.log('⚠️ Could not read existing auth file');
    }
  }

  // No auth available - create empty state for unauthenticated tests
  console.log('ℹ️ No authentication configured - tests will run unauthenticated');
  console.log('   To enable authenticated tests:');
  console.log('   1. Set TEST_SESSION_TOKEN environment variable, or');
  console.log('   2. Run: yarn e2e:auth-setup');
  
  const emptyState = { cookies: [], origins: [] };
  fs.writeFileSync(AUTH_FILE, JSON.stringify(emptyState, null, 2));
}

export default globalSetup;
