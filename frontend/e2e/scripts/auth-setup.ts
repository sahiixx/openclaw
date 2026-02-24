#!/usr/bin/env node
/**
 * Interactive Auth Setup Script
 * 
 * This script helps set up authentication for E2E tests by:
 * 1. Opening a browser to the login page
 * 2. Waiting for you to complete Google OAuth
 * 3. Saving the session state for tests
 * 
 * Usage: npx ts-node e2e/scripts/auth-setup.ts
 */

import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const AUTH_FILE = path.join(__dirname, '..', '.auth', 'user.json');
const BASE_URL = process.env.E2E_BASE_URL || 'https://e2e-builder.preview.emergentagent.com';

async function main() {
  console.log('🔐 E2E Auth Setup');
  console.log('==================');
  console.log('');
  console.log('This will open a browser for you to log in.');
  console.log('After logging in, your session will be saved for tests.');
  console.log('');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  await new Promise<void>((resolve) => {
    rl.question('Press Enter to continue...', () => {
      rl.close();
      resolve();
    });
  });

  console.log('');
  console.log('🌐 Opening browser...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Navigate to login
  await page.goto(`${BASE_URL}/login`);
  
  console.log('');
  console.log('👆 Please complete the login process in the browser.');
  console.log('   The script will wait for you to be redirected after login.');
  console.log('');

  // Wait for redirect away from login page (indicating successful auth)
  try {
    await page.waitForURL((url) => !url.toString().includes('/login'), {
      timeout: 300000, // 5 minutes
    });
    
    console.log('✅ Login detected!');
    
    // Wait a moment for cookies to be set
    await page.waitForTimeout(2000);
    
    // Save auth state
    const authDir = path.dirname(AUTH_FILE);
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }
    
    await context.storageState({ path: AUTH_FILE });
    
    console.log('');
    console.log('✅ Auth state saved to:', AUTH_FILE);
    console.log('');
    console.log('You can now run authenticated tests with:');
    console.log('  yarn e2e');
    console.log('');
    
  } catch (e) {
    console.error('');
    console.error('❌ Login timed out or was cancelled.');
    console.error('');
  }

  await browser.close();
}

main().catch(console.error);
