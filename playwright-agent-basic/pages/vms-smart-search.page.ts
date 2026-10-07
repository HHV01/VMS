import { Page, Locator, expect } from '@playwright/test';
import { requireEnv } from '../utils/env';
import { SMART_SEARCH_API_MAP } from '../utils/smart-search-api.map';

const baseUrl = () => requireEnv('VMS_BASE_URL').replace(/\/+$/, '');

/**
 * VMS Smart Search - Page Object Model (POM)
 * Bám sát đặc tả PSD_BecaVMS.docx mục 10.3.5 và Chốt BA:
 * - Natural Language Query & Thẻ "AI phân tích" (có nút x xóa nhanh)
 * - Advanced Filter: Phân cấp Bố cục -> Khu vực -> Camera, Thời gian, Sự kiện AI, Đặc điểm đối tượng
 * - Slider Độ liên quan (Relevance Score) 2 đầu kéo
 * - Kết quả: Grid/List, Thẻ kết quả (% Relevance, Tags, Timestamp, Camera), Menu ⋮, Playback Modal
 */
export class VmsSmartSearchPage {
  readonly page: Page;

  // ===== 1. THANH TÌM KIẾM TỰ NHIÊN (NL SEARCH) =====
  readonly searchTextarea: Locator;
  readonly searchButton: Locator;
  readonly clearSearchButton: Locator;
  readonly queryLengthWarning: Locator;
  readonly unsupportedWarningBanner: Locator;
  readonly aiParsedChipsContainer: Locator;
  readonly aiParsedChips: Locator;

  // ===== 2. BỘ LỌC NÂNG CAO (ADVANCED FILTER PANEL) =====
  readonly advancedFilterPanel: Locator;
  readonly toggleAllFiltersButton: Locator;
  readonly resetButton: Locator;
  readonly applyFilterButton: Locator;

  // 2.1 Khu vực & Camera
  readonly layoutSelector: Locator;
  readonly areaSelector: Locator;
  readonly cameraSelector: Locator;

  // 2.2 Thời gian
  readonly timePresetToday: Locator;
  readonly timePresetYesterday: Locator;
  readonly timePreset24h: Locator;
  readonly timePreset7Days: Locator;
  readonly dateFromInput: Locator;
  readonly dateToInput: Locator;
  readonly allDayCheckbox: Locator;
  readonly timeValidationMessage: Locator;

  // 2.3 Đặc điểm đối tượng & Sự kiện AI
  readonly addObjectButton: Locator;
  readonly objectTypeDropdown: Locator;
  readonly objectColorDropdown: Locator;
  readonly objectLogicToggle: Locator; // AND / OR

  // 2.4 Slider Độ liên quan (Relevance 2-Handle Slider)
  readonly relevanceSection: Locator;
  readonly relevanceBadge: Locator;
  readonly relevanceRangeLabel: Locator;
  readonly relevanceSliderTrack: Locator;
  readonly relevanceMinHandle: Locator;
  readonly relevanceMaxHandle: Locator;

  // ===== 3. VÙNG KẾT QUẢ (RESULTS AREA) =====
  readonly resultsSummaryText: Locator;
  readonly sortDropdown: Locator;
  readonly gridViewToggle: Locator;
  readonly listViewToggle: Locator;
  readonly resultCards: Locator;
  readonly resultTable: Locator;
  readonly emptyStateText: Locator;
  readonly loadingIndicator: Locator;
  readonly paginationContainer: Locator;
  readonly nextBatchButton: Locator;
  readonly prevBatchButton: Locator;

  // ===== 4. CHI TIẾT & PLAYBACK MODAL =====
  readonly playbackModal: Locator;
  readonly playbackVideoPlayer: Locator;
  readonly playbackBoundingBox: Locator;
  readonly incidentCreateButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // 1. NL Search
    this.searchTextarea = page.locator('textarea[name="prompt"]').or(page.getByRole('textbox', { name: /mô tả điều cần tìm|tìm kiếm|ví dụ/i })).first();
    this.searchButton = page.getByRole('button', { name: /^tìm kiếm$/i }).or(page.locator('button[aria-label="Tìm kiếm"]')).first();
    this.clearSearchButton = page.getByRole('button', { name: /xóa|clear/i }).or(page.locator('[data-testid="clear-search"]')).first();
    this.queryLengthWarning = page.getByText(/Nội dung tìm kiếm quá dài/i).or(page.locator('[data-testid="query-length-warning"]')).first();
    this.unsupportedWarningBanner = page.getByText(/Một số điều kiện chưa được hỗ trợ/i).or(page.locator('[data-testid="unsupported-warning"]')).first();
    this.aiParsedChipsContainer = page.locator('[data-testid="ai-parsed-chips"], [class*="ai-chips"], [class*="applied-conditions"]');
    this.aiParsedChips = page.locator('[data-testid="ai-chip"], [class*="chip"], [class*="tag"]').filter({ has: page.locator('button, [class*="close"], [class*="remove"]') });

    // 2. Advanced Filter
    this.advancedFilterPanel = page.locator('[data-testid="advanced-filter-panel"], aside, [class*="filter-panel"]').first();
    this.toggleAllFiltersButton = page.getByRole('button', { name: /bộ lọc nâng cao|mở rộng tất cả|thu hẹp tất cả|collapse|expand/i }).first();
    this.resetButton = page.getByRole('button', { name: /đặt lại|reset/i }).first();
    this.applyFilterButton = page.getByRole('button', { name: /áp dụng bộ lọc|áp dụng|apply/i }).first();

    // 2.1 Hierarchy
    this.layoutSelector = page.getByRole('combobox', { name: /bố cục|layout/i }).or(page.locator('[data-testid="layout-select"]')).first();
    this.areaSelector = page.getByRole('combobox', { name: /khu vực|area/i }).or(page.locator('[data-testid="area-select"]')).first();
    this.cameraSelector = page.getByRole('combobox', { name: /camera/i }).or(page.locator('[data-testid="camera-select"]')).first();

    // 2.2 Time
    this.timePresetToday = page.getByRole('button', { name: /^hôm nay$/i }).or(page.getByText('Hôm nay')).first();
    this.timePresetYesterday = page.getByRole('button', { name: /^hôm qua$/i }).or(page.getByText('Hôm qua')).first();
    this.timePreset24h = page.getByRole('button', { name: /24 giờ qua/i }).or(page.getByText('24 giờ qua')).first();
    this.timePreset7Days = page.getByRole('button', { name: /7 ngày qua|7d/i }).or(page.getByText('7 ngày qua')).first();
    this.dateFromInput = page.getByRole('textbox', { name: /từ ngày|from/i }).or(page.locator('input[type="date"], [data-testid="date-from"]').first());
    this.dateToInput = page.getByRole('textbox', { name: /đến ngày|to/i }).or(page.locator('input[type="date"], [data-testid="date-to"]').nth(1));
    this.allDayCheckbox = page.getByRole('checkbox', { name: /cả ngày|all day/i }).or(page.locator('[data-testid="all-day-checkbox"]')).first();
    this.timeValidationMessage = page.getByText(/Hệ thống chỉ hỗ trợ truy xuất trong thời gian 30 ngày/i).first();

    // 2.3 Object Attributes
    this.addObjectButton = page.getByRole('button', { name: /thêm đối tượng|\+ đối tượng/i }).first();
    this.objectTypeDropdown = page.getByRole('combobox', { name: /loại đối tượng|đối tượng/i }).first();
    this.objectColorDropdown = page.getByRole('combobox', { name: /màu sắc|màu/i }).first();
    this.objectLogicToggle = page.getByRole('button', { name: /AND|OR/i }).first();

    // 2.4 Relevance Slider & Mode Controls
    this.relevanceSection = page.locator('[data-testid="relevance-filter-section"], :has-text("Độ liên quan")').first();
    this.relevanceBadge = this.relevanceSection.locator('[data-testid="badge"], [class*="badge"]').first();
    this.relevanceRangeLabel = page.locator('[data-testid="relevance-range-label"]').or(page.locator('text=/\d+%\s*–\s*\d+%/')).first();
    this.relevanceSliderTrack = page.locator('[role="slider"]').or(page.locator('[class*="slider"]')).first();
    this.relevanceMinHandle = page.locator('[role="slider"]').first();
    this.relevanceMaxHandle = page.locator('[role="slider"]').nth(1);

    // 3. Results Area
    this.resultsSummaryText = page.locator('text=/\d+\s*kết quả\s*·\s*\d+\s*camera\s*·\s*\d+\s*khu vực/i').or(page.locator('[data-testid="results-summary"]')).first();
    this.sortDropdown = page.getByRole('button', { name: /sắp xếp/i }).or(page.locator('button[aria-label="Sắp xếp"]')).first();
    this.gridViewToggle = page.getByRole('button', { name: /grid|lưới/i }).or(page.locator('[data-testid="view-grid"]')).first();
    this.listViewToggle = page.getByRole('button', { name: /list|danh sách/i }).or(page.locator('[data-testid="view-list"]')).first();
    this.resultCards = page.locator('[data-testid="result-card"], [data-slot="card"][role="button"], [class*="result-card"]');
    this.resultTable = page.getByRole('table').or(page.locator('[data-testid="result-table"]')).first();
    this.emptyStateText = page.getByText(/Không tìm thấy kết quả phù hợp|Không tìm thấy sự kiện nào/i).first();
    this.loadingIndicator = page.locator('[class*="loading"], [class*="spinner"], [role="progressbar"]');
    this.paginationContainer = page.locator('[data-testid="pagination"], [class*="pagination"]');
    this.nextBatchButton = page.getByRole('button', { name: /trang sau|tiếp|next/i }).first();
    this.prevBatchButton = page.getByRole('button', { name: /trang trước|trước|prev/i }).first();

    // 4. Modal & Playback
    this.playbackModal = page.getByRole('dialog', { name: /chi tiết sự kiện|playback/i }).or(page.locator('[data-testid="playback-modal"]')).first();
    this.playbackVideoPlayer = this.playbackModal.locator('video, [class*="player"]').first();
    this.playbackBoundingBox = this.playbackModal.locator('[data-testid="bounding-box"], [class*="bounding-box"]').first();
    this.incidentCreateButton = this.playbackModal.getByRole('button', { name: /tạo sự vụ|incident/i }).first();
  }

  // ===== ĐIỀU HƯỚNG & SETUP =====
  async navigate(url?: string) {
    await this.page.goto(url || `${baseUrl()}/video-analytic/smart-search?search_mode=precision&time_preset=7d`, {
      waitUntil: 'domcontentloaded',
    });
    // Ẩn badge nổi (nếu có từ dev/test env)
    await this.page.addStyleTag({ content: '#lovable-badge, [class*="lovable-badge"] { display: none !important; }' }).catch(() => {});
  }

  async waitForPageLoad(timeout = 15000) {
    await this.searchTextarea.waitFor({ state: 'visible', timeout });
  }

  async login(username: string, password: string) {
    await this.page.goto(`${baseUrl()}/login`, { waitUntil: 'domcontentloaded' });
    await this.page.getByRole('textbox', { name: 'Tên đăng nhập' }).fill(username);
    await this.page.getByRole('textbox', { name: 'Mật khẩu' }).fill(password);
    await this.page.locator('button[type="submit"]').click();
    await this.page.waitForURL((url) => !url.toString().includes('login'), { timeout: 10000 });
  }

  // ===== THAO TÁC TÌM KIẾM NL =====
  async searchNL(query: string) {
    await this.searchTextarea.fill(query);
    if (await this.searchButton.isVisible()) {
      await this.searchButton.click();
    } else {
      await this.searchTextarea.press('Enter');
    }
  }

  async clearQuery() {
    await this.searchTextarea.clear();
  }

  async removeParsedChip(index: number) {
    const chips = await this.aiParsedChips.all();
    if (index < chips.length) {
      const closeBtn = chips[index].locator('button, [class*="close"], [class*="remove"]').first();
      await closeBtn.click();
    }
  }

  // ===== THAO TÁC SLIDER ĐỘ LIÊN QUAN =====
  /**
   * Thiết lập khoảng min - max cho Slider Độ liên quan 2 đầu kéo
   */
  async setRelevanceRange(min: number, max: number) {
    const minHandle = this.relevanceMinHandle;
    const maxHandle = this.relevanceMaxHandle;

    if (await minHandle.isVisible() && await maxHandle.isVisible()) {
      // Dùng keyboard navigation qua aria-valuenow để test điều khiển chuẩn xác
      await minHandle.focus();
      await this.page.keyboard.press('Home'); // Đưa về 0
      for (let i = 0; i < min; i++) {
        await this.page.keyboard.press('ArrowRight');
      }

      await maxHandle.focus();
      await this.page.keyboard.press('End'); // Đưa về 100
      for (let i = 100; i > max; i--) {
        await this.page.keyboard.press('ArrowLeft');
      }
    }
  }

  async getRelevanceRangeLabel(): Promise<string> {
    return (await this.relevanceRangeLabel.textContent())?.trim() || '';
  }

  // ===== KẾT QUẢ & VERIFICATION HELPERS =====
  async getResultCount(): Promise<number> {
    return await this.resultCards.count();
  }

  /**
   * Lấy danh sách % Relevance từ tất cả card kết quả đang hiển thị
   */
  async getResultRelevances(): Promise<number[]> {
    const cards = await this.resultCards.all();
    const scores: number[] = [];
    for (const card of cards) {
      const text = await card.locator('[data-testid*="relevance"], [class*="relevance"], [class*="badge"]:has-text("%")').first().textContent().catch(() => '');
      const match = text?.match(/(\d+)%/);
      if (match) {
        scores.push(parseInt(match[1], 10));
      }
    }
    return scores;
  }

  /**
   * Lấy tags thuộc tính AI của từng card kết quả
   */
  async getResultTags(): Promise<string[][]> {
    const cards = await this.resultCards.all();
    const allTags: string[][] = [];
    for (const card of cards) {
      const tagElements = card.locator('[data-testid*="tag"], [class*="tag"], [class*="badge"]');
      const tags = await tagElements.allTextContents();
      allTags.push(tags.map(t => t.trim()).filter(t => t.length > 0));
    }
    return allTags;
  }

  /**
   * Helper tính expected relevance theo công thức BA:
   * Relevance (%) = số tiêu chí khớp / số tiêu chí tìm kiếm * 100
   */
  expectedRelevance(totalQueryCriteria: number, matchedCriteria: number): number {
    if (totalQueryCriteria <= 0) return 0;
    return Math.round((matchedCriteria / totalQueryCriteria) * 100);
  }

  /**
   * Mock API phản hồi Smart Search qua page.route
   */
  async mockSearchApi(responseBody: any, status = 200) {
    await this.page.route(SMART_SEARCH_API_MAP.SEARCH_ENDPOINT_PATTERN, async (route) => {
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(responseBody),
      });
    });
  }
}
