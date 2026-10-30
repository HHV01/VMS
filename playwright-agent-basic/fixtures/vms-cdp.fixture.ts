import { test as base, expect } from '@playwright/test';
import { chromium, Page } from '@playwright/test';

export const test = base.extend<{ livePage: Page }>({
  livePage: async ({}, use) => {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const context = browser.contexts()[0] || (await browser.newContext());
    let page = context.pages().find(p => p.url().includes('object-counting'));
    if (!page) {
      page = await context.newPage();
      await page.goto('http://180.148.1.242:8004/video-analytic/object-counting', { waitUntil: 'domcontentloaded' });
    }
    await use(page);
  },
});

export { expect };
