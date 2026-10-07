import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { test as base } from './base.fixture';
import { VmsSmartSearchPage } from '../pages/vms-smart-search.page';
import { requireEnv } from '../utils/env';

// Đăng nhập VMS một lần cho mỗi worker rồi mọi test dùng lại phiên đó.
// File phiên nằm trong outputDir của lần chạy (artifacts/, đã gitignore): Playwright xóa ở lần chạy sau,
// nên không dùng lại phiên cũ đã hết hạn, và worker khởi động lại sau test fail vẫn dùng lại được.
export const test = base.extend<object, { vmsStorageState: string }>({
  storageState: ({ vmsStorageState }, use) => use(vmsStorageState),
  vmsStorageState: [
    async ({ browser }, use, workerInfo) => {
      const file = join(workerInfo.project.outputDir, `.vms-auth-${workerInfo.parallelIndex}.json`);
      if (!existsSync(file)) {
        const page = await browser.newPage();
        await new VmsSmartSearchPage(page).login(requireEnv('VMS_USERNAME'), requireEnv('VMS_PASSWORD'));
        await page.context().storageState({ path: file });
        await page.context().close();
      }
      await use(file);
    },
    { scope: 'worker' },
  ],
});

export { expect } from './base.fixture';
