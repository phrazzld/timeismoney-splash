import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: './e2e',
  timeout: 60 * 1000, // 60 seconds timeout for each test
  expect: {
    timeout: 10 * 1000, // Timeout for expect() assertions
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI, // Fail if test.only is committed in CI
  retries: process.env.CI ? 2 : 0, // Retry on CI
  workers: process.env.CI ? 1 : undefined, // Restrict workers on CI
  reporter: 'html', // Generates an HTML report

  use: {
    baseURL: NEXT_PUBLIC_SITE_URL,
    actionTimeout: 10 * 1000, // Timeout for actions like click, fill
    navigationTimeout: 30 * 1000, // Timeout for page navigation
    trace: 'on-first-retry', // Collect trace when retrying the failed test
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Can add more browsers later:
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],

  // Configure webServer to start the Next.js app automatically for testing
  webServer: {
    command: 'pnpm dev',
    url: NEXT_PUBLIC_SITE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes for the server to start
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
