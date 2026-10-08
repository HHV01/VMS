import { config as loadEnv } from 'dotenv';
import { defineConfig, devices } from '@playwright/test';

loadEnv({ path: process.env.PROJECT_ENV_FILE || 'project/.env', quiet: true });
loadEnv({ path: '.env', quiet: true });

const DEFAULT_TIMEOUT = Number(process.env.DEFAULT_TIMEOUT || 30000);
const BASE_URL_ENV = process.env.BASE_URL_ENV || 'BASE_URL';
const BASE_URL = process.env[BASE_URL_ENV] || 'http://localhost:3000';
const HEADLESS = process.env.HEADED !== 'true';
const ARTIFACT_DIR = process.env.ARTIFACT_DIR || 'artifacts/test-results';

/**
 * Playwright Automation Config Settings Profile
 * Tối ưu hóa: Mặc định chỉ chạy Chromium để tăng tốc độ thực thi và độ ổn định cho VMS.
 * Bật CROSS_BROWSER=true khi cần kiểm thử thêm Firefox và WebKit trên CI nightly.
 * See https://playwright.dev/docs/test-configuration for reference.
 */
export default defineConfig({
  testDir: './tests',
  timeout: DEFAULT_TIMEOUT,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  workers: process.env.CI ? 4 : (process.env.WORKERS ? Number(process.env.WORKERS) : 2),
  outputDir: ARTIFACT_DIR,
  reporter: [
    ['json', { outputFile: `${ARTIFACT_DIR}/playwright-results.json` }],
    ['list'],
    ['html', { outputFolder: 'artifacts/html-report', open: 'never' }],
  ],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
    headless: HEADLESS,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    ...(process.env.CROSS_BROWSER === 'true'
      ? [
          {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
          },
          {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
          },
        ]
      : []),
  ],
});
