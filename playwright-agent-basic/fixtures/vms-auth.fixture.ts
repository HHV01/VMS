import { test as base } from './base.fixture';
import { chromium } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    try {
      const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 3000 });
      const context = browser.contexts()[0] || (await browser.newContext());
      let livePage = context.pages().find(p => p.url().includes('180.148.1.242'));
      if (!livePage) {
        livePage = await context.newPage();
        await livePage.goto('http://180.148.1.242:8004/video-analytic/object-counting', { waitUntil: 'domcontentloaded' });
      }
      await use(livePage);
    } catch {
      await use(page);
    }
  },
});

export { expect } from './base.fixture';

