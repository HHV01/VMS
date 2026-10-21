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

  // ===== 1. THANH TÌM KIẾM TỰ NHIÊN (NL SEARCH) & UPLOAD ẢNH =====
  readonly searchTextarea: Locator;
  readonly searchButton: Locator;
  readonly clearSearchButton: Locator;
  readonly queryLengthWarning: Locator;
  readonly unsupportedWarningBanner: Locator;
  readonly aiParsedChipsContainer: Locator;
  readonly aiParsedChips: Locator;

  // 1.1 Upload Image
  readonly openUploadImageButton: Locator;
  readonly uploadImageModal: Locator;
  readonly uploadFileInput: Locator;
  readonly uploadDropzone: Locator;
  readonly uploadSaveButton: Locator;
  readonly uploadChangeImageButton: Locator;
  readonly uploadCloseButton: Locator;
  readonly uploadInfoText: Locator;

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
  readonly timePreset14Days: Locator;
  readonly timePreset30Days: Locator;
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
    this.searchButton = page.getByRole('button', { name: /^tìm kiếm$/i }).or(page.locator('button[aria-label="Tìm kiếm"], button:has-text("Tìm kiếm")')).first();
    this.clearSearchButton = page.getByRole('button', { name: /xóa|clear/i }).or(page.locator('[data-testid="clear-search"]')).first();
    this.queryLengthWarning = page.getByText(/Nội dung tìm kiếm quá dài/i).or(page.locator('[data-testid="query-length-warning"]')).first();
    this.unsupportedWarningBanner = page.getByText(/Một số điều kiện chưa được hỗ trợ/i).or(page.locator('[data-testid="unsupported-warning"]')).first();
    this.aiParsedChipsContainer = page.locator('[data-testid="ai-parsed-chips"], [class*="ai-chips"], [class*="applied-conditions"]');
    this.aiParsedChips = page.locator('[data-testid="ai-chip"], [class*="chip"], [class*="tag"]').filter({ has: page.locator('button, [class*="close"], [class*="remove"]') });

    // 1.1 Upload Image
    this.openUploadImageButton = page.locator('button[aria-label="Thêm ảnh"]').first();
    this.uploadImageModal = page.locator('[role="dialog"]').filter({ hasText: /Tìm bằng ảnh/i }).first();
    this.uploadFileInput = page.locator('input[type="file"]').first();
    this.uploadDropzone = this.uploadImageModal.locator('text=/Chọn ảnh hoặc kéo thả vào đây/i').first();
    this.uploadSaveButton = this.uploadImageModal.getByRole('button', { name: /lưu/i }).first();
    this.uploadChangeImageButton = this.uploadImageModal.getByRole('button', { name: /đổi ảnh/i }).first();
    this.uploadCloseButton = this.uploadImageModal.locator('button:has-text("✕"), button[aria-label="Close"], button.absolute').first();
    this.uploadInfoText = this.uploadImageModal.getByText(/JPG \/ PNG, tối đa 10 MB/i).first();

    // 2. Advanced Filter
    this.advancedFilterPanel = page.locator('[data-testid="advanced-filter-panel"], aside, [class*="filter-panel"], div:has(h2:has-text("Bộ lọc nâng cao"))').first();
    this.toggleAllFiltersButton = page.getByRole('button', { name: /bộ lọc nâng cao/i }).or(page.locator('button:has-text("Bộ lọc nâng cao")')).first();
    this.resetButton = page.getByRole('button', { name: /đặt lại|reset/i }).or(page.locator('button:has-text("Đặt lại")')).first();
    this.applyFilterButton = page.getByRole('button', { name: /áp dụng bộ lọc|áp dụng/i }).or(page.locator('button:has-text("Áp dụng bộ lọc")')).first();

    // 2.1 Hierarchy
    this.layoutSelector = page.getByRole('combobox', { name: /bố cục|layout/i }).or(page.locator('[data-testid="layout-select"]')).first();
    this.areaSelector = page.getByRole('combobox', { name: /khu vực|area/i }).or(page.locator('[data-testid="area-select"]')).first();
    this.cameraSelector = page.getByRole('combobox', { name: /camera/i }).or(page.locator('[data-testid="camera-select"]')).first();

    // 2.2 Time
    this.timePresetToday = page.locator('button:has-text("Hôm nay")').first();
    this.timePresetYesterday = page.locator('button:has-text("Hôm qua")').first();
    this.timePreset24h = page.locator('button:has-text("24 giờ qua")').first();
    this.timePreset7Days = page.locator('button:has-text("7 ngày gần nhất"), button:has-text("7 ngày qua")').first();
    this.timePreset14Days = page.locator('button:has-text("14 ngày gần nhất")').first();
    this.timePreset30Days = page.locator('button:has-text("30 ngày gần nhất")').first();
    this.dateFromInput = page.locator('input[placeholder="Từ"]').first();
    this.dateToInput = page.locator('input[placeholder="Đến"]').first();
    this.allDayCheckbox = page.getByRole('checkbox', { name: /cả ngày|all day/i }).or(page.locator('input[type="checkbox"]')).first();
    this.timeValidationMessage = page.getByText(/Hệ thống chỉ hỗ trợ truy xuất trong thời gian 30 ngày/i).first();

    // 2.3 Object Attributes
    this.addObjectButton = page.getByRole('button', { name: /thêm đối tượng|\+ đối tượng/i }).or(page.locator('button:has-text("+ Thêm đối tượng")')).first();
    this.objectTypeDropdown = page.getByRole('combobox', { name: /loại đối tượng|đối tượng/i }).first();
    this.objectColorDropdown = page.getByRole('combobox', { name: /màu sắc|màu/i }).first();
    this.objectLogicToggle = page.getByRole('button', { name: /AND|OR/i }).first();

    // 2.4 Relevance Slider & Mode Controls
    this.relevanceSection = page.locator('text=Độ liên quan').locator('..').first();
    this.relevanceBadge = this.relevanceSection.locator('[data-testid="badge"], [class*="badge"]').first();
    this.relevanceRangeLabel = page.locator('text=/\\d+%\\s*–\\s*\\d+%/').first();
    this.relevanceSliderTrack = page.locator('[role="slider"]').first();
    this.relevanceMinHandle = page.locator('[role="slider"]').first();
    this.relevanceMaxHandle = page.locator('[role="slider"]').nth(1);

    // 3. Results Area
    this.resultsSummaryText = page.locator('text=/\\d+\\s*(?:kết quả|đoạn video)/i').first();
    this.sortDropdown = page.locator('button[aria-label="Sắp xếp"]').or(page.getByRole('button', { name: /sắp xếp|độ liên quan/i })).first();
    this.gridViewToggle = page.locator('button:has(svg.lucide-grid-2x2), button:has(svg.lucide-layout-grid), button[aria-label*="Lưới"], button[aria-label*="grid"]').first();
    this.listViewToggle = page.locator('button:has(svg.lucide-list), button[aria-label*="Danh sách"], button[aria-label*="list"]').first();
    this.resultCards = page.locator('[data-slot="card"], [class*="card"]').filter({ has: page.locator('img, video, [class*="thumb"]') });
    this.resultTable = page.getByRole('table').or(page.locator('[data-testid="result-table"]')).first();
    this.emptyStateText = page.getByText(/Không tìm thấy kết quả phù hợp|Không tìm thấy đoạn video nào/i).first();
    this.loadingIndicator = page.locator('text=/Đang xếp hạng|Đang phân tích|Đang lục lọi/i');
    this.paginationContainer = page.locator('div:has(button):has-text("/")').filter({ hasText: /\d+\/\d+/ }).first();
    this.nextBatchButton = page.locator('button:has(svg.lucide-chevron-right), button:has-text("→")').first();
    this.prevBatchButton = page.locator('button:has(svg.lucide-chevron-left), button:has-text("←")').first();

    // 4. Modal & Playback
    this.playbackModal = page.getByRole('dialog', { name: /chi tiết sự kiện|playback/i }).or(page.locator('[data-testid="playback-modal"], [role="dialog"]')).first();
    this.playbackVideoPlayer = this.playbackModal.locator('video, [class*="player"]').first();
    this.playbackBoundingBox = this.playbackModal.locator('[data-testid="bounding-box"], [class*="bounding-box"]').first();
    this.incidentCreateButton = this.playbackModal.getByRole('button', { name: /tạo sự vụ|incident/i }).first();
  }

  // ===== ĐIỀU HƯỚNG & SETUP =====
  async navigate(url?: string) {
    const target = url || `${baseUrl()}/video-analytic/smart-search?search_mode=precision&time_preset=7d`;
    await this.page.goto(target, { waitUntil: 'domcontentloaded' });
    if (this.page.url().includes('/login')) {
      await this.login(requireEnv('VMS_USERNAME'), requireEnv('VMS_PASSWORD'));
      await this.page.goto(target, { waitUntil: 'domcontentloaded' });
    }
    // Ẩn badge nổi (nếu có từ dev/test env)
    await this.page.addStyleTag({ content: '#lovable-badge, [class*="lovable-badge"] { display: none !important; }' }).catch(() => {});
  }

  async waitForPageLoad(timeout = 15000) {
    await this.searchTextarea.waitFor({ state: 'visible', timeout });
  }

  async login(username: string, password: string) {
    await this.page.goto(`${baseUrl()}/login`, { waitUntil: 'domcontentloaded' });
    await this.page.waitForTimeout(500);
    const usernameInput = this.page.getByRole('textbox', { name: /tên đăng nhập|username/i }).or(this.page.locator('input[type="text"]').first());
    const passwordInput = this.page.getByRole('textbox', { name: /mật khẩu|password/i }).or(this.page.locator('input[type="password"]').first());
    const submitBtn = this.page.locator('button[type="submit"], button:has-text("Đăng nhập")').first();
    await usernameInput.fill(username);
    await passwordInput.fill(password);
    await submitBtn.click();
    await this.page.waitForURL((url) => !url.toString().includes('login'), { timeout: 15000 });
  }

  // ===== THAO TÁC TÌM KIẾM NL =====
  async searchNL(query: string) {
    await this.searchTextarea.fill(query);
    await this.page.waitForTimeout(300);
    const btn = this.page.locator('button[aria-label="Tìm kiếm"], button:has-text("Tìm kiếm")').first();
    await btn.waitFor({ state: 'visible' });
    await btn.click();
    await this.page.waitForTimeout(500);
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
   * Mock API phản hồi Smart Search qua page.route kèm bộ đếm hits
   */
  async mockSearchApi(responseBody: any, status = 200): Promise<{ getHits: () => number }> {
    let hits = 0;
    await this.page.route(SMART_SEARCH_API_MAP.SEARCH_ENDPOINT_PATTERN, async (route) => {
      hits++;
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(responseBody),
      });
    });
    return { getHits: () => hits };
  }
}
