import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  timeout: 30000,

  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'landing-site',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3000',
      },
      testMatch: /landing\/.*/,
    },
    {
      name: 'admin-dashboard',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3001',
      },
      testMatch: /admin\/.*/,
    },
  ],

  webServer: [
    {
      command: 'pnpm dev:landing',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 60000,
    },
    {
      command: 'pnpm dev:admin',
      url: 'http://localhost:3001',
      reuseExistingServer: !process.env.CI,
      timeout: 60000,
    },
  ],
});
