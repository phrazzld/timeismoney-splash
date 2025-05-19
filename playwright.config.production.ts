import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.test.local') });

const NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: './e2e',
  timeout: 60 * 1000,
  expect: {
    timeout: 10 * 1000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: NEXT_PUBLIC_SITE_URL,
    actionTimeout: 10 * 1000,
    navigationTimeout: 30 * 1000,
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Run production build for E2E tests
  webServer: {
    command: 'pnpm build && NODE_ENV=production pnpm start',
    url: NEXT_PUBLIC_SITE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180 * 1000, // 3 minutes for build + start
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      ...process.env,
      NODE_ENV: 'production',
      NEXT_PUBLIC_GA_MEASUREMENT_ID: 'G-TEST123456',
    },
  },
});
