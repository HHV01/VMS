import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  const networkLogs = [];
  page.on('response', async (res) => {
    try {
      const req = res.request();
      const url = req.url();
      if (!url.includes('.png') && !url.includes('.svg') && !url.includes('.css') && !url.includes('.js') && !url.includes('.woff') && !url.includes('google')) {
        let postData = null;
        try { postData = req.postDataJSON() || req.postData(); } catch {}
        let body = null;
        try { body = await res.json(); } catch {
          try { body = await res.text(); } catch {}
        }
        networkLogs.push({
          url,
          method: req.method(),
          status: res.status(),
          postData,
          body,
        });
      }
    } catch {}
  });

  import('dotenv').then(d => d.config({ path: 'project/.env' }));
  const baseUrl = process.env.VMS_BASE_URL || 'http://localhost:3000';
  const username = process.env.VMS_USERNAME || '';
  const password = process.env.VMS_PASSWORD || '';

  console.log('1. Login...');
  await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  await page.locator('input[name="username"], input[type="text"]').first().fill(username);
  await page.locator('input[name="password"], input[type="password"]').first().fill(password);
  await page.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();
  await page.waitForURL((url) => !url.toString().includes('login'), { timeout: 15000 });

  console.log('2. Navigate to Smart Search...');
  await page.goto('http://180.148.1.242:8004/video-analytic/smart-search?search_mode=precision&time_preset=7d', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  console.log('3. Opening Bộ lọc nâng cao...');
  const advancedFilterBtn = page.getByRole('button', { name: /Bộ lọc nâng cao/i });
  if (await advancedFilterBtn.isVisible()) {
    await advancedFilterBtn.click();
    await page.waitForTimeout(2000);
  }

  const artifactsDir = path.resolve('artifacts');
  await page.screenshot({ path: path.join(artifactsDir, 'smart_search_filter_open.png'), fullPage: true });

  console.log('4. Inspecting all filter elements...');
  const filterElements = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('*')).map(el => {
      const text = el.textContent?.trim() || '';
      if (text.includes('Độ liên quan') || text.includes('Thời gian') || text.includes('Camera') || text.includes('Khu vực') || text.includes('Đối tượng') || text.includes('Sắp xếp')) {
        return {
          tagName: el.tagName,
          className: el.className,
          role: el.getAttribute('role'),
          ariaLabel: el.getAttribute('aria-label'),
          text: text.slice(0, 100),
          id: el.id,
        };
      }
      return null;
    }).filter(Boolean);
  });
  fs.writeFileSync(path.join(artifactsDir, 'smart_search_filter_dom.json'), JSON.stringify(filterElements, null, 2), 'utf8');

  console.log('5. Typing and submitting search for "người"...');
  const textarea = page.locator('textarea[name="prompt"]');
  await textarea.fill('người');
  await page.waitForTimeout(1000);

  const searchBtn = page.getByRole('button', { name: 'Tìm kiếm' });
  console.log('Search button disabled?:', await searchBtn.isDisabled());
  if (await searchBtn.isVisible() && !(await searchBtn.isDisabled())) {
    await searchBtn.click();
  } else {
    await textarea.press('Enter');
  }

  await page.waitForTimeout(6000);
  await page.screenshot({ path: path.join(artifactsDir, 'smart_search_results_live.png'), fullPage: true });

  fs.writeFileSync(path.join(artifactsDir, 'smart_search_all_network.json'), JSON.stringify(networkLogs, null, 2), 'utf8');
  console.log('✓ All network logs captured and saved!');

  await browser.close();
}

run().catch(console.error);
