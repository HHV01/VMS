import { Page, Locator } from '@playwright/test';
import { requireEnv } from '../utils/env';

/**
 * VMS Object Counting - trang "Đếm đối tượng".
 * Module phân tích camera: xem kết quả đếm đối tượng theo quy tắc Crossline / Area / Lane.
 */
const baseUrl = () => requireEnv('VMS_BASE_URL').replace(/\/+$/, '');

export class VmsObjectCountingPage {
  readonly page: Page;

  // ===== ĐIỀU HƯỚNG / HEADER =====
  // ponytail: locator theo text tiếng Việt. ceiling: vỡ khi UI đổi ngôn ngữ. upgrade: khi FE thêm data-testid
  readonly pageHeading: Locator;

  // ===== BỘ LỌC / FILTER =====
  readonly cameraSelector: Locator;
  readonly dateFromPicker: Locator;
  readonly dateToPicker: Locator;
  readonly ruleTypeSelector: Locator;
  readonly searchButton: Locator;
  readonly exportButton: Locator;

  // ===== BẢNG KẾT QUẢ =====
  readonly dataTable: Locator;
  readonly tableRow: Locator;
  readonly tableEmptyState: Locator;

  // ===== BIỂU ĐỒ =====
  readonly chartContainer: Locator;

  // ===== LOADING =====
  readonly loadingIndicator: Locator;

  constructor(page: Page) {
    this.page = page;

    this.pageHeading = page
      .getByRole('heading', { name: /Đếm đối tượng/i })
      .or(page.getByText('Đếm đối tượng').first());

    // ponytail: locator camera dùng combobox/select chung. ceiling: vỡ nếu UI dùng custom dropdown không có role. upgrade: khi FE thêm data-testid="camera-select"
    this.cameraSelector = page
      .getByRole('combobox', { name: /camera/i })
      .or(page.locator('[data-testid="camera-select"], select[name*="camera"]').first());

    this.dateFromPicker = page
      .getByRole('textbox', { name: /từ ngày|from|bắt đầu/i })
      .or(page.locator('input[type="date"]').first());

    this.dateToPicker = page
      .getByRole('textbox', { name: /đến ngày|to|kết thúc/i })
      .or(page.locator('input[type="date"]').nth(1));

    this.ruleTypeSelector = page
      .getByRole('combobox', { name: /loại quy tắc|rule|crossline|area/i })
      .or(page.locator('[data-testid="rule-type-select"]').first());

    this.searchButton = page
      .getByRole('button', { name: /tìm kiếm|lọc|search|filter|xem/i })
      .first();

    this.exportButton = page.getByRole('button', { name: /xuất|export/i }).first();

    // ponytail: locator bảng bắt cả table, grid, list vì VMS có thể dùng nhiều layout. ceiling: không verify cột/hàng cụ thể. upgrade: khi FE thêm data-testid cho container bảng
    this.dataTable = page
      .getByRole('table')
      .or(page.locator('[class*="table"],[class*="grid"],[class*="list"],[data-testid*="table"],[data-testid*="grid"],[role="grid"]').first());

    this.tableRow = page.getByRole('row').filter({ hasNot: page.getByRole('columnheader') });

    this.tableEmptyState = page
      .getByText(/không có dữ liệu|no data|không tìm thấy|chưa có dữ liệu|empty/i)
      .first();

    this.chartContainer = page
      .locator('[class*="chart"], canvas, svg[class*="chart"]')
      .first();

    this.loadingIndicator = page.locator(
      '[class*="loading"], [class*="spinner"], [role="progressbar"]',
    );
  }

  // ===== ĐIỀU HƯỚNG =====
  async navigate() {
    await this.page.goto(`${baseUrl()}/video-analytic/object-counting`, {
      waitUntil: 'domcontentloaded',
    });
  }

  async waitForPageLoad(timeout = 20000) {
    await this.pageHeading.first().waitFor({ state: 'visible', timeout });
  }

  async login(username: string, password: string) {
    await this.page.goto(`${baseUrl()}/login`, { waitUntil: 'domcontentloaded' });
    await this.page.getByRole('textbox', { name: 'Tên đăng nhập' }).fill(username);
    await this.page.getByRole('textbox', { name: 'Mật khẩu' }).fill(password);
    await this.page.locator('button[type="submit"]').click();
    await this.page.waitForURL((url) => !url.toString().includes('login'), { timeout: 10000 });
  }

  // ===== TRẠNG THÁI =====
  async isPageLoaded(): Promise<boolean> {
    try {
      await this.pageHeading.first().waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  async getPageUrl(): Promise<string> {
    return this.page.url();
  }

  async isTableVisible(): Promise<boolean> {
    try {
      // Bắt cả table, grid, list card, và bất kỳ container dữ liệu nào
      const tableVisible = await this.dataTable.first().isVisible();
      if (tableVisible) return true;
      // Fallback: tìm bất kỳ row/card nào có số đếm
      const hasRows = (await this.tableRow.count()) > 0;
      return hasRows;
    } catch {
      return false;
    }
  }

  async getTableRowCount(): Promise<number> {
    try {
      return await this.tableRow.count();
    } catch {
      return 0;
    }
  }

  async isEmptyState(): Promise<boolean> {
    try {
      return await this.tableEmptyState.isVisible({ timeout: 3000 });
    } catch {
      return false;
    }
  }

  async isChartVisible(): Promise<boolean> {
    try {
      return await this.chartContainer.isVisible({ timeout: 3000 });
    } catch {
      return false;
    }
  }

  // ===== BỘ LỌC =====
  async waitForLoading(timeout = 15000) {
    const loader = this.loadingIndicator.first();
    try {
      await loader.waitFor({ state: 'visible', timeout: 1500 });
      await loader.waitFor({ state: 'hidden', timeout });
    } catch {
      // Không có loader thì bỏ qua.
    }
  }

  async selectCamera(cameraName: string) {
    const sel = this.cameraSelector.first();
    if (await sel.isVisible()) {
      await sel.click();
      await this.page.getByRole('option', { name: cameraName }).first().click();
    }
  }

  async clickSearch() {
    const btn = this.searchButton.first();
    if (await btn.isVisible()) {
      await btn.click();
      await this.waitForLoading();
    }
  }

  async clickExport() {
    const btn = this.exportButton.first();
    if (await btn.isVisible()) await btn.click();
  }
}
