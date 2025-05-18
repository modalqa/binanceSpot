import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 0,
  reporter: [['html'], ['list'], ['junit']],
  use: {
    trace: 'on-first-retry',
  },
});
