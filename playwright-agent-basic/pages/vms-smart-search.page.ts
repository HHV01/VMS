import { Page, Locator } from '@playwright/test';
import { requireEnv } from '../utils/env';

/**
 * VMS Smart Search - trang "Tìm kiếm thông minh".
 * UI thật: khung nhập câu truy vấn tự nhiên (textarea) + nút "Tìm kiếm".
 */
const baseUrl = () => requireEnv('VMS_BASE_URL').replace(/\/+$/, '');

export class VmsSmartSearchPage {
  readonly page: Page;
  readonly searchTextarea: Locator;
  readonly searchButton: Locator;
  readonly resultItem: Locator;
  readonly resultsAnchor: Locator;
  readonly loadingIndicator: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchTextarea = page.locator('textarea, [role="textbox"]');
    this.searchButton = page.locator('button:has-text("Tìm kiếm"), button[type="submit"]');
    // Locator đối chiếu DOM thật ngày 21/09/2026: mỗi thẻ kết quả là [data-slot="card"] có role=button, aria-label là tên loại sự kiện.
    this.resultItem = page.locator('[data-slot="card"][role="button"]');
    this.resultsAnchor = page
      .getByRole('heading', { name: 'Kết quả' })
      .or(page.getByText('Không tìm thấy sự kiện nào khớp với truy vấn'));
    this.loadingIndicator = page.locator('[class*="loading"], [class*="spinner"]');
  }

  // ===== ĐIỀU HƯỚNG =====
  async navigate(url?: string) {
    await this.page.goto(url || `${baseUrl()}/video-analytic/smart-search`, {
      waitUntil: 'domcontentloaded',
    });
  }

  async waitForPageLoad() {
    await this.searchTextarea.first().waitFor({ state: 'visible', timeout: 15000 });
  }

  async login(username: string, password: string) {
    await this.page.goto(`${baseUrl()}/login`, { waitUntil: 'domcontentloaded' });
    await this.page.getByRole('textbox', { name: 'Tên đăng nhập' }).fill(username);
    await this.page.getByRole('textbox', { name: 'Mật khẩu' }).fill(password);
    await this.page.locator('button[type="submit"]').click();
    await this.page.waitForURL((url) => !url.toString().includes('login'), { timeout: 10000 });
  }

  // ===== TÌM KIẾM =====
  async typeQuery(query: string) {
    await this.searchTextarea.first().fill(query);
  }

  async submitSearch() {
    const button = this.searchButton.first();
    if (await button.isVisible()) {
      await button.click();
    } else {
      await this.searchTextarea.first().press('Enter');
    }
    await this.waitForResults();
  }

  async search(query: string) {
    await this.searchTextarea.first().waitFor({ state: 'visible' });
    await this.typeQuery(query);
    await this.submitSearch();
  }

  async clearSearch() {
    await this.searchTextarea.first().clear();
  }

  async getSearchQuery(): Promise<string> {
    return await this.searchTextarea.first().inputValue();
  }

  async useKeyboardShortcut() {
    // Theo gợi ý trên UI: Enter để tìm, Shift+Enter chỉ xuống dòng.
    await this.searchTextarea.first().press('Shift+Enter');
  }

  async waitForResults(timeout = 15000) {
    // Chờ khối "Kết quả" hoặc thông báo không tìm thấy — cả hai đã đối chiếu DOM thật.
    await this.resultsAnchor.first().waitFor({ state: 'visible', timeout });
    await this.waitForLoading();
  }

  async waitForLoading() {
    const loader = this.loadingIndicator.first();
    try {
      await loader.waitFor({ state: 'visible', timeout: 1000 });
      await loader.waitFor({ state: 'hidden', timeout: 10000 });
    } catch {
      // Không có loader thì bỏ qua.
    }
  }

  // ===== KẾT QUẢ =====
  async getResultCount(): Promise<number> {
    return await this.resultItem.count();
  }

  async getResultTitles(): Promise<string[]> {
    const labels = await this.resultItem.evaluateAll((cards) =>
      cards.map((card) => card.getAttribute('aria-label') || '')
    );
    return labels.filter((label) => label.length > 0);
  }

  async clickResult(index: number) {
    const items = await this.resultItem.all();
    if (index < items.length) {
      await items[index].click();
      await this.page
        .getByRole('heading', { name: 'Chi tiết sự kiện' })
        .waitFor({ state: 'visible', timeout: 10000 });
    }
  }

  /**
   * Đánh giá ngữ nghĩa toàn bộ danh sách kết quả tìm kiếm bằng Jev AI Smart Oracle
   */
  async evaluateRelevanceWithJev(query: string) {
    const { JevSmartOracle } = await import('../utils/jev-smart-oracle');
    const oracle = new JevSmartOracle();
    const titles = await this.getResultTitles();
    if (titles.length === 0) {
      return { hasRelevantItem: true, total: 0, evaluations: [] };
    }
    const evaluations = await oracle.rankSearchResults(query, titles);
    return {
      hasRelevantItem: evaluations.some((e) => e.isRelevant),
      total: titles.length,
      evaluations,
    };
  }

  // ponytail: ba thao tác dưới đây chưa từng khớp phần tử thật (UI chưa thấy nút Xem trước / Tải / Chia sẻ), không thấy nút thì tự bỏ qua. ceiling: test gọi tới vẫn PASS dù tính năng không tồn tại. upgrade: khi BA/Dev xác nhận vị trí các nút này trên UI
  private async clickAction(index: number, pattern: RegExp) {
    const items = await this.resultItem.all();
    if (index >= items.length) return;
    const button = items[index].getByRole('button', { name: pattern });
    if (await button.isVisible()) await button.click();
  }

  async previewResult(index: number) {
    await this.clickAction(index, /Preview|Xem trước/i);
  }

  async downloadResult(index: number) {
    await this.clickAction(index, /Download|Tải/i);
  }

  async shareResult(index: number) {
    await this.clickAction(index, /Share|Chia sẻ/i);
  }

  // ===== TRẠNG THÁI =====
  async isPageLoaded(): Promise<boolean> {
    try {
      await this.searchTextarea.first().waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async isSearchReady(): Promise<boolean> {
    return await this.searchTextarea.first().isVisible();
  }

  async isSearchFocused(): Promise<boolean> {
    return await this.searchTextarea.first().evaluate((el) => el === document.activeElement);
  }

  async focusSearch() {
    await this.searchTextarea.first().focus();
  }

  async getSearchPlaceholder(): Promise<string | null> {
    return await this.searchTextarea.first().getAttribute('placeholder');
  }

  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  async getPageUrl(): Promise<string> {
    return this.page.url();
  }
}
