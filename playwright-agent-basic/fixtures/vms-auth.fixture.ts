import { test as base, expect } from './base.fixture';
import { requireEnv } from '../utils/env';
import * as fs from 'fs';
import * as path from 'path';

const AUTH_FILE = path.resolve(process.cwd(), 'artifacts', 'auth-storage-state.json');

export const test = base.extend({
  page: async ({ browser }, use) => {
    const baseUrl = requireEnv('VMS_BASE_URL').replace(/\/+$/, '');
    const username = requireEnv('VMS_USERNAME');
    const password = requireEnv('VMS_PASSWORD');

    let context;
    if (fs.existsSync(AUTH_FILE)) {
      try {
        context = await browser.newContext({
          storageState: AUTH_FILE,
          viewport: { width: 1920, height: 1080 },
          ignoreHTTPSErrors: true,
        });
      } catch {
        context = await browser.newContext({
          viewport: { width: 1920, height: 1080 },
          ignoreHTTPSErrors: true,
        });
      }
    } else {
      context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        ignoreHTTPSErrors: true,
      });
    }

    const page = await context.newPage();

    // Kiểm tra session bằng cách truy cập trang chính hoặc validate
    try {
      await page.goto(`${baseUrl}/video-analytic/smart-search?search_mode=precision&time_preset=7d`, { waitUntil: 'domcontentloaded' });
      if (page.url().includes('/login')) {
        // Thực hiện đăng nhập chuẩn
        const usernameInput = page.getByRole('textbox', { name: /tên đăng nhập|username/i }).or(page.locator('input[type="text"]').first());
        const passwordInput = page.getByRole('textbox', { name: /mật khẩu|password/i }).or(page.locator('input[type="password"]').first());
        const submitBtn = page.locator('button[type="submit"], button:has-text("Đăng nhập")').first();

        await usernameInput.fill(username);
        await passwordInput.fill(password);
        await submitBtn.click();
        await page.waitForURL((url) => !url.toString().includes('login'), { timeout: 15000 });

        // Lưu storage state cho các lần chạy sau
        const authDir = path.dirname(AUTH_FILE);
        if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });
        await context.storageState({ path: AUTH_FILE });
      }
    } catch {
      // Fallback nếu trang chưa sẵn sàng
    }

    // Ẩn lovable badge nổi nếu có
    await page.addStyleTag({ content: '#lovable-badge, [class*="lovable-badge"] { display: none !important; }' }).catch(() => {});

    await use(page);
    await context.close();
  },
});

export { expect };

