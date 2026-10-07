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
      if (!url.includes('.png') && !url.includes('.svg') && !url.includes('.css') && !url.includes('.js') && !url.includes('.woff')) {
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

  console.log('1. Navigating to login page...');
  await page.goto('http://180.148.1.242:8004/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  console.log('2. Logging in...');
  const usernameInput = page.getByRole('textbox', { name: /tên đăng nhập|username/i }).or(page.locator('input[type="text"]').first());
  const passwordInput = page.getByRole('textbox', { name: /mật khẩu|password/i }).or(page.locator('input[type="password"]').first());
  const submitBtn = page.locator('button[type="submit"], button:has-text("Đăng nhập")').first();

  await usernameInput.fill('becamex');
  await passwordInput.fill('becamex@123');
  await submitBtn.click();
  await page.waitForURL((url) => !url.toString().includes('login'), { timeout: 15000 });
  console.log('✓ Login successful! Current URL:', page.url());

  console.log('3. Navigating to Smart Search target URL...');
  const targetUrl = 'http://180.148.1.242:8004/video-analytic/smart-search?search_mode=precision&time_preset=7d';
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const artifactsDir = path.resolve('artifacts');
  if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });

  await page.screenshot({ path: path.join(artifactsDir, 'smart_search_live.png'), fullPage: true });
  console.log('✓ Screenshot saved to artifacts/smart_search_live.png');

  // DOM Inspection
  const domInfo = await page.evaluate(() => {
    const textareas = Array.from(document.querySelectorAll('textarea, input[type="text"]')).map(el => ({
      tagName: el.tagName,
      id: el.id,
      name: el.getAttribute('name'),
      placeholder: el.getAttribute('placeholder'),
      value: el.value || '',
      className: el.className,
      ariaLabel: el.getAttribute('aria-label'),
      testId: el.getAttribute('data-testid'),
    }));

    const buttons = Array.from(document.querySelectorAll('button')).map(el => ({
      text: el.innerText.trim(),
      className: el.className,
      ariaLabel: el.getAttribute('aria-label'),
      testId: el.getAttribute('data-testid'),
      disabled: el.disabled,
    }));

    const sliders = Array.from(document.querySelectorAll('[role="slider"], input[type="range"], [class*="slider"]')).map(el => ({
      role: el.getAttribute('role'),
      ariaValuenow: el.getAttribute('aria-valuenow'),
      ariaValuemin: el.getAttribute('aria-valuemin'),
      ariaValuemax: el.getAttribute('aria-valuemax'),
      className: el.className,
      testId: el.getAttribute('data-testid'),
    }));

    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, [class*="title"], [class*="heading"]')).map(el => el.textContent?.trim());

    return {
      title: document.title,
      url: window.location.href,
      textareas,
      buttons: buttons.filter(b => b.text.length > 0),
      sliders,
      headings: headings?.filter(h => h && h.length > 0),
      bodyHtmlSnippet: document.body.innerHTML.slice(0, 10000),
    };
  });

  fs.writeFileSync(path.join(artifactsDir, 'smart_search_dom_info.json'), JSON.stringify(domInfo, null, 2), 'utf8');
  fs.writeFileSync(path.join(artifactsDir, 'smart_search_network.json'), JSON.stringify(networkLogs, null, 2), 'utf8');
  console.log('✓ DOM info and Network logs saved!');

  // Try performing a search
  console.log('4. Performing sample search for "xe máy"...');
  const searchInput = page.locator('textarea, input[placeholder*="tìm"], input[type="text"]').first();
  if (await searchInput.isVisible()) {
    await searchInput.fill('xe máy');
    const searchBtn = page.locator('button:has-text("Tìm kiếm"), button[type="submit"]').first();
    if (await searchBtn.isVisible()) {
      await searchBtn.click();
    } else {
      await searchInput.press('Enter');
    }
    await page.waitForTimeout(4000);
    await page.screenshot({ path: path.join(artifactsDir, 'smart_search_results.png'), fullPage: true });

    // Capture results card DOM
    const resultsDom = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('[data-slot="card"], [class*="card"], [class*="item"], [role="button"]')).map(el => ({
        innerText: el.textContent?.trim(),
        ariaLabel: el.getAttribute('aria-label'),
        className: el.className,
        innerHTML: el.innerHTML.slice(0, 500),
      }));
      return cards;
    });
    fs.writeFileSync(path.join(artifactsDir, 'smart_search_cards_dom.json'), JSON.stringify(resultsDom, null, 2), 'utf8');
    console.log('✓ Results screenshot & cards saved!');
  }

  await browser.close();
  console.log('=== INSPECTION COMPLETED ===');
}

run().catch(err => {
  console.error('Inspection error:', err);
  process.exit(1);
});
