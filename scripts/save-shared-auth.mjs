import { chromium } from '@playwright/test';
import { config as loadEnv } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

loadEnv({ path: 'project/.env' });

async function loginOnce() {
  const baseUrl = process.env.VMS_BASE_URL || 'http://180.148.1.242:8004';
  const username = process.env.VMS_USERNAME || '';
  const password = process.env.VMS_PASSWORD || '';

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Logging in once...');
  await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  await page.getByRole('textbox', { name: /tên đăng nhập|username/i }).or(page.locator('input[type="text"]').first()).fill(username);
  await page.getByRole('textbox', { name: /mật khẩu|password/i }).or(page.locator('input[type="password"]').first()).fill(password);
  await page.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();
  await page.waitForURL(url => !url.toString().includes('login'), { timeout: 15000 });

  const artifactsDir = path.resolve('artifacts');
  if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });
  const authFile = path.join(artifactsDir, '.vms-shared-auth.json');

  await context.storageState({ path: authFile });
  console.log('✓ Successfully saved storageState to:', authFile);

  await browser.close();
}

loginOnce().catch(console.error);
