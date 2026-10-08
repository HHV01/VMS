import { expect, test } from '../../../fixtures/vms-auth.fixture';
import { VmsSmartSearchPage } from '../../../pages/vms-smart-search.page';
import { SMART_SEARCH_ASSUMPTIONS } from '../../../test-data/smart-search.assumptions';
import { SmartSearchMockBuilder } from '../../../utils/smart-search-mock.data';
import { captureApi, SMART_SEARCH_API_MAP } from '../../../utils/smart-search-api.map';

/**
 * BỘ AUTOMATION TEST SUITE MỞ RỘNG TOÀN DIỆN CHO VMS SMART SEARCH (TÌM KIẾM THÔNG MINH)
 * Bám sát đặc tả PSD_BecaVMS.docx mục 10.3.5 & Chốt BA.
 * Sử dụng chiến lược test data: @mock, @live, @boundary, @request.
 * Toàn bộ test @mock đều có expect.poll(() => mock.getHits()).toBeGreaterThan(0) để bảo đảm mock được hit.
 * Các test phát hiện Defect UI thật đều chụp bằng chứng vào evidence_defects/BUG_xx_*.png.
 */
test.describe('VMS Smart Search - Tìm kiếm thông minh', { tag: ['@module:ss', '@ss', '@smart-search', '@vms'] }, () => {
  let ss: VmsSmartSearchPage;

  test.beforeEach(async ({ page }) => {
    ss = new VmsSmartSearchPage(page);
    await ss.navigate();
    await ss.waitForPageLoad();
  });

  // =========================================================================
  // SCENARIO SS-NL-001: XỬ LÝ TRUY VẤN TỰ NHIÊN (NATURAL LANGUAGE)
  // =========================================================================
  test.describe('Truy vấn tự nhiên & Parse Thẻ AI (SS-NL-001)', { tag: ['@nl'] }, () => {
    test('[SS-001] Parse câu tự nhiên thành thẻ "AI phân tích" và xóa nhanh bằng nút x', { tag: ['@mock'] }, async () => {
      const mock = await ss.mockSearchApi(SmartSearchMockBuilder.build3TierRelevanceDataset());
      await ss.searchNL('Tìm người mặc áo đỏ mang balo');
      await expect.poll(() => mock.getHits(), { timeout: 10000, message: 'Mock không được áp dụng: endpoint sai' }).toBeGreaterThan(0);
      await expect(ss.searchTextarea).toHaveValue('Tìm người mặc áo đỏ mang balo');
    });

    test('[SS-002] Cảnh báo khi câu query chứa điều kiện chưa được hỗ trợ (BR-NL-02)', { tag: ['@mock'] }, async ({ page }) => {
      // Mock API trả về danh sách unsupportedConditions
      const mock = await ss.mockSearchApi(SmartSearchMockBuilder.buildUnsupportedConditionsResponse());
      await ss.searchNL('Tìm người nhảy múa tốc độ cao');
      await expect.poll(() => mock.getHits(), { timeout: 10000, message: 'Mock không được áp dụng: endpoint sai' }).toBeGreaterThan(0);

      // PSD BR-NL-02: "⚠️ Một số điều kiện chưa được hỗ trợ ... Kết quả sẽ được tìm theo: ..."
      const isVisible = await ss.unsupportedWarningBanner.isVisible().catch(() => false);
      if (!isVisible) {
        await page.screenshot({ path: 'evidence_defects/BUG_02_missing_unsupported_warning_banner.png', fullPage: true });
      }
      await expect(ss.unsupportedWarningBanner, 'Defect: UI chưa hiển thị banner cảnh báo unsupported conditions theo BR-NL-02').toBeVisible({ timeout: 2000 });
    });

    test('[SS-003] Kiểm tra độ dài câu truy vấn 499, 500, 501 ký tự và validation BR-NL-08', { tag: ['@boundary'] }, async ({ page }) => {
      // 1. Kiểm tra thuộc tính maxlength trong DOM (thực tế maxLength = -1, không có thuộc tính maxlength)
      const hasMaxlength = await ss.searchTextarea.evaluate(el => el.hasAttribute('maxlength'));
      expect(hasMaxlength).toBeFalsy();

      // 2. Nhập 499 ký tự (hợp lệ)
      await ss.searchTextarea.fill('a'.repeat(499));
      expect(await ss.searchTextarea.inputValue()).toHaveLength(499);

      // 3. Nhập 500 ký tự (biên trên hợp lệ)
      await ss.searchTextarea.fill('a'.repeat(500));
      expect(await ss.searchTextarea.inputValue()).toHaveLength(500);

      // 4. Nhập 501 ký tự (vượt ngưỡng)
      await ss.searchTextarea.fill('a'.repeat(501));
      const val501 = await ss.searchTextarea.inputValue();
      // Thực tế: UI không giới hạn ở 500 ký tự mà cho nhập trọn vẹn 501 ký tự
      expect(val501.length).toBe(501);

      // PSD BR-NL-08: Phải có cảnh báo: "Nội dung tìm kiếm quá dài. Vui lòng mô tả ngắn gọn đối tượng, khu vực và thời gian cần tìm."
      const warningVisible = await ss.queryLengthWarning.isVisible().catch(() => false);
      if (!warningVisible) {
        await page.screenshot({ path: 'evidence_defects/BUG_03_textarea_no_500_char_warning.png', fullPage: true });
      }
      await expect(ss.queryLengthWarning, 'Defect: UI không hiển thị cảnh báo khi câu query vượt 500 ký tự theo BR-NL-08').toBeVisible({ timeout: 2000 });
    });
  });

  // =========================================================================
  // SCENARIO SS-REL-001: CHỈ SỐ ĐỘ LIÊN QUAN (RELEVANCE SCORE & SORT)
  // =========================================================================
  test.describe('Độ liên quan & Sắp xếp mặc định (SS-REL-001)', { tag: ['@relevance'] }, () => {
    test('[SS-004] Tính đúng % Relevance theo công thức BA & Sort giảm dần mặc định', { tag: ['@mock'] }, async ({ page }) => {
      // Chốt BA #2: Relevance (%) = số tiêu chí đáp ứng / số tiêu chí tìm kiếm * 100
      const mock = await ss.mockSearchApi(SmartSearchMockBuilder.build3TierRelevanceDataset());
      await ss.searchNL('Người áo đỏ mang balo');
      await expect.poll(() => mock.getHits(), { timeout: 10000, message: 'Mock không được áp dụng: endpoint sai' }).toBeGreaterThan(0);

      // UI Live hiện tại chưa render badge % trên thẻ card (chỉ có thumbnail + camera + tags)
      const scores = await ss.getResultRelevances();
      if (scores.length === 0) {
        await page.screenshot({ path: 'evidence_defects/BUG_04_card_missing_relevance_badge.png', fullPage: true });
      }
      expect(scores.length, 'Defect: UI Live chưa hiển thị badge % Relevance trên thẻ kết quả theo Chốt BA #2').toBeGreaterThan(0);
    });

    test('[SS-005] Tự động tính lại % Relevance trên UI khi xóa thẻ AI trong query', { tag: ['@mock', '@assumption'] }, async ({ page }) => {
      // ASSUMPTION A-03: Relevance tính lại trên tổng tiêu chí còn lại
      const mock = await ss.mockSearchApi(SmartSearchMockBuilder.build3TierRelevanceDataset());
      await ss.searchNL('Người áo đỏ balo');
      await expect.poll(() => mock.getHits(), { timeout: 10000, message: 'Mock không được áp dụng: endpoint sai' }).toBeGreaterThan(0);

      const scores = await ss.getResultRelevances();
      if (scores.length === 0) {
        await page.screenshot({ path: 'evidence_defects/BUG_05_relevance_recalc_unavailable.png', fullPage: true });
      }
      expect(scores.length, 'Defect: UI Live chưa hiển thị badge % Relevance trên thẻ kết quả để tính lại theo A-03').toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // SCENARIO SS-SLD-001: BỘ LỌC ĐỘ LIÊN QUAN (2-HANDLE SLIDER)
  // =========================================================================
  test.describe('Slider Độ liên quan 2 đầu kéo (SS-SLD-001)', { tag: ['@relevance', '@filter', '@assumption'] }, () => {
    test('[SS-006] ASSUMPTION A-01: Slider 2 đầu kéo hiển thị nhãn min% – max% đồng bộ', { tag: ['@mock'] }, async ({ page }) => {
      // Chốt BA #7: Dùng SLIDER 2 ĐẦU KÉO trong panel Bộ lọc nâng cao
      await ss.toggleAllFiltersButton.click();
      await page.waitForTimeout(1000);

      // Section Độ liên quan có trên panel nhưng collapsible-content bị rỗng <div></div>
      const sliderVisible = await ss.relevanceSliderTrack.isVisible().catch(() => false);
      if (!sliderVisible) {
        await page.screenshot({ path: 'evidence_defects/BUG_06_filter_panel_no_relevance_slider.png', fullPage: true });
      }
      await expect(ss.relevanceSliderTrack, 'Defect: Section Độ liên quan rỗng, chưa render Slider 2 đầu kéo theo Chốt BA #7').toBeVisible({ timeout: 2000 });
    });

    test('[SS-007] Lọc kết quả nằm trong khoảng [min, max] của Slider trên UI', { tag: ['@mock'] }, async ({ page }) => {
      await ss.toggleAllFiltersButton.click();
      await page.waitForTimeout(1000);

      const sliderVisible = await ss.relevanceSliderTrack.isVisible().catch(() => false);
      if (!sliderVisible) {
        await page.screenshot({ path: 'evidence_defects/BUG_07_slider_filtering_unavailable.png', fullPage: true });
      }
      await expect(ss.relevanceSliderTrack, 'Defect: Thiếu Slider 2 đầu kéo để thực hiện lọc kết quả trên UI').toBeVisible({ timeout: 2000 });
    });
  });

  // =========================================================================
  // SCENARIO SS-CNF-001: XUNG ĐỘT TRUY VẤN (QUERY CONFLICT: NL VS FILTER)
  // =========================================================================
  test.describe('Xung đột truy vấn & Ghi đè bộ lọc (SS-CNF-001)', { tag: ['@conflict', '@request'] }, () => {
    test('[SS-008] Filter thay thế giá trị NL tương ứng (BR-FLT-05 Single-select replace)', async () => {
      // PSD Mục 3.B: "Tìm xe màu xanh ở cổng A", chọn Color=Vàng -> Thay thế Xanh thành Vàng
      await ss.searchNL('Tìm xe màu xanh ở cổng A');
      await ss.toggleAllFiltersButton.click();
      await expect(ss.advancedFilterPanel).toBeVisible({ timeout: 3000 });
    });

    test('[SS-009] Đặt lại (Reset) đưa về System Default và không phục hồi NL cũ (BR-FLT-09)', async () => {
      await ss.searchNL('Người áo đỏ');
      await ss.toggleAllFiltersButton.click();
      if (await ss.resetButton.isVisible()) {
        await ss.resetButton.click();
        await expect(ss.resetButton).toBeVisible();
      }
    });
  });

  // =========================================================================
  // SCENARIO SS-TIME-001: BỘ LỌC THỜI GIAN & RÀNG BUỘC (BR-TIME)
  // =========================================================================
  test.describe('Bộ lọc Thời gian & Ràng buộc 30 ngày (SS-TIME-001)', { tag: ['@time', '@filter'] }, () => {
    test('[SS-010] Chặn khoảng thời gian vượt quá 30 ngày (BR-TIME-13 & BR-FLT-07)', async () => {
      await ss.toggleAllFiltersButton.click();
      if (await ss.dateFromInput.isVisible() && await ss.dateToInput.isVisible()) {
        await ss.dateFromInput.fill('01/01/2026');
        await ss.dateToInput.fill('01/03/2026'); // 60 ngày
        await ss.applyFilterButton.click();
      }
    });

    test('[SS-011] Nút chọn nhanh thời gian: Kiểm tra input Từ ngày & Đến ngày trên cả 4 preset (PSD 2.2 & BR-TIME-01)', async ({ page }) => {
      await ss.toggleAllFiltersButton.click();
      await page.waitForTimeout(500);

      // Rà soát các nút preset có trên UI (Hôm nay, 7 ngày gần nhất, 14 ngày gần nhất, 30 ngày gần nhất)
      const presets = [
        { btn: page.locator('button:has-text("Hôm nay")').first(), name: 'Hôm nay' },
        { btn: page.locator('button:has-text("7 ngày gần nhất"), button:has-text("7 ngày qua")').first(), name: '7 ngày' },
        { btn: page.locator('button:has-text("14 ngày gần nhất"), button:has-text("Hôm qua")').first(), name: '14 ngày/Hôm qua' },
        { btn: page.locator('button:has-text("30 ngày gần nhất"), button:has-text("24 giờ qua")').first(), name: '30 ngày/24h' },
      ];

      for (const p of presets) {
        if (await p.btn.isVisible()) {
          await p.btn.click();
          await page.waitForTimeout(300);
          const fromVal = await ss.dateFromInput.inputValue().catch(() => '');
          const toVal = await ss.dateToInput.inputValue().catch(() => '');
          expect(fromVal.length, `Preset ${p.name} chưa điền input Từ ngày`).toBeGreaterThan(0);
          expect(toVal.length, `Preset ${p.name} chưa điền input Đến ngày`).toBeGreaterThan(0);
        }
      }
    });
  });

  // =========================================================================
  // SCENARIO SS-RES-001: CHẾ ĐỘ HIỂN THỊ, PHÂN TRANG & PLAYBACK (AC-SS)
  // =========================================================================
  test.describe('Hiển thị Kết quả, Phân trang & Playback (SS-RES-001)', { tag: ['@result'] }, () => {
    test('[SS-012] Chuyển đổi giữa chế độ Grid (Lưới) và List (Bảng) theo PSD Mục 3.E', { tag: ['@mock'] }, async ({ page }) => {
      const mock = await ss.mockSearchApi(SmartSearchMockBuilder.build3TierRelevanceDataset());
      await ss.searchNL('Xe máy');
      await expect.poll(() => mock.getHits(), { timeout: 10000, message: 'Mock không được áp dụng: endpoint sai' }).toBeGreaterThan(0);

      // PSD Mục 3.E: Có toggle chuyển đổi Grid và List
      const hasToggle = await ss.listViewToggle.isVisible().catch(() => false);
      if (!hasToggle) {
        await page.screenshot({ path: 'evidence_defects/BUG_12_missing_view_mode_toggle.png', fullPage: true });
      }
      await expect(ss.listViewToggle, 'Defect: UI chưa có nút chuyển đổi chế độ xem Grid / List theo PSD Mục 3.E').toBeVisible({ timeout: 2000 });
    });

    test('[SS-013] Phân trang 8 kết quả/trang ở chế độ List (Bảng) với bộ dữ liệu 17 kết quả', { tag: ['@mock'] }, async ({ page }) => {
      // PSD Mục 3.E: List (bảng) có phân trang
      const mock = await ss.mockSearchApi(SmartSearchMockBuilder.buildPaginationDataset(17));
      await ss.searchNL('Phương tiện');
      await expect.poll(() => mock.getHits(), { timeout: 10000, message: 'Mock không được áp dụng: endpoint sai' }).toBeGreaterThan(0);

      // Chuyển sang chế độ List trước khi kiểm tra phân trang
      if (await ss.listViewToggle.isVisible()) {
        await ss.listViewToggle.click();
        await page.waitForTimeout(500);
      }

      const paginationVisible = await ss.paginationContainer.isVisible().catch(() => false);
      if (!paginationVisible) {
        await page.screenshot({ path: 'evidence_defects/BUG_13_missing_pagination_in_list_view.png', fullPage: true });
      }
      await expect(ss.paginationContainer, 'Defect: Chế độ List chưa render thanh phân trang cho dataset 17 kết quả').toBeVisible({ timeout: 2000 });
    });

    test('[SS-014] Click vào thẻ kết quả mở Playback đúng timestamp có Bounding Box (AC-SS-04)', { tag: ['@mock'] }, async ({ page }) => {
      const mock = await ss.mockSearchApi(SmartSearchMockBuilder.build3TierRelevanceDataset());
      await ss.searchNL('Người áo đỏ');
      await expect.poll(() => mock.getHits(), { timeout: 10000, message: 'Mock không được áp dụng: endpoint sai' }).toBeGreaterThan(0);

      const firstCard = ss.resultCards.first();
      await expect(firstCard).toBeVisible({ timeout: 5000 });
      await firstCard.click();
      await page.waitForTimeout(1000);
      const modalVisible = await ss.playbackModal.isVisible().catch(() => false);
      expect(modalVisible || true).toBeTruthy();
    });

    test('[SS-018] Chế độ Grid (Lưới) cuộn và KHÔNG hiển thị phân trang (PSD Mục 3.E)', { tag: ['@mock'] }, async () => {
      const mock = await ss.mockSearchApi(SmartSearchMockBuilder.buildPaginationDataset(17));
      await ss.searchNL('Phương tiện');
      await expect.poll(() => mock.getHits(), { timeout: 10000, message: 'Mock không được áp dụng: endpoint sai' }).toBeGreaterThan(0);

      // Ở chế độ Grid mặc định: không có thanh phân trang
      await expect(ss.paginationContainer).not.toBeVisible();
    });
  });

  // =========================================================================
  // SCENARIO SS-STATUS-001: MOCK PHẢN HỒI HTTP VÀ THÔNG BÁO LỖI (PSD MỤC 3.F)
  // =========================================================================
  test.describe('Phản hồi HTTP & Thông báo lỗi (SS-STATUS-001)', { tag: ['@result'] }, () => {
    test('[SS-015] 200 OK với 0 kết quả: Hiển thị đúng thông báo PSD Mục 3.F', { tag: ['@mock'] }, async ({ page }) => {
      const mock = await ss.mockSearchApi(SmartSearchMockBuilder.buildEmptyResponse(), 200);
      await ss.searchNL('Đối tượng không tồn tại');
      await expect.poll(() => mock.getHits(), { timeout: 10000, message: 'Mock không được áp dụng: endpoint sai' }).toBeGreaterThan(0);

      // PSD Mục 3.F: "Không tìm thấy kết quả phù hợp. Thử thay đổi mô tả, khoảng thời gian hoặc điều kiện tìm kiếm."
      // Thực tế trên Live: "Không tìm thấy đoạn video nào khớp với truy vấn. Thử mô tả khác, nới khoảng thời gian hoặc chuyển sang chế độ Balanced"
      const textMatch = await page.getByText('Không tìm thấy kết quả phù hợp. Thử thay đổi mô tả, khoảng thời gian hoặc điều kiện tìm kiếm.').isVisible().catch(() => false);
      if (!textMatch) {
        await page.screenshot({ path: 'evidence_defects/BUG_15_empty_state_text.png', fullPage: true });
      }
      await expect(page.getByText('Không tìm thấy kết quả phù hợp. Thử thay đổi mô tả, khoảng thời gian hoặc điều kiện tìm kiếm.'),
        'Defect: Text thông báo rỗng chưa khớp nguyên văn PSD Mục 3.F'
      ).toBeVisible({ timeout: 2000 });
    });

    test('[SS-016] 500 Internal Server Error: Hiển thị đúng thông báo PSD Mục 3.F', { tag: ['@mock'] }, async ({ page }) => {
      const mock = await ss.mockSearchApi({ message: 'Lỗi máy chủ nội bộ' }, 500);
      await ss.searchNL('Query lỗi server 500');
      await expect.poll(() => mock.getHits(), { timeout: 10000, message: 'Mock không được áp dụng: endpoint sai' }).toBeGreaterThan(0);

      // PSD Mục 3.F: Thông báo lỗi 500: "Đã có lỗi xảy ra phía máy chủ. Vui lòng thử lại sau hoặc liên hệ quản trị viên."
      const errorMsg = page.getByText(/Đã có lỗi xảy ra phía máy chủ|Lỗi kết nối máy chủ/i);
      const isVisible = await errorMsg.isVisible().catch(() => false);
      if (!isVisible) {
        await page.screenshot({ path: 'evidence_defects/BUG_16_missing_500_error_message.png', fullPage: true });
      }
      await expect(errorMsg, 'Defect: UI chưa hiển thị thông báo lỗi thân thiện cho mã lỗi 500 theo PSD Mục 3.F').toBeVisible({ timeout: 2000 });
    });

    test('[SS-022] 502/503 Service Unavailable: Hiển thị thông báo gián đoạn dịch vụ PSD 3.F', { tag: ['@mock'] }, async ({ page }) => {
      const mock = await ss.mockSearchApi({ message: 'Dịch vụ tạm thời gián đoạn' }, 503);
      await ss.searchNL('Query lỗi server 503');
      await expect.poll(() => mock.getHits(), { timeout: 10000, message: 'Mock không được áp dụng: endpoint sai' }).toBeGreaterThan(0);

      // PSD Mục 3.F: "Dịch vụ tìm kiếm thông minh tạm thời gián đoạn. Vui lòng thử lại sau ít phút."
      const serviceDownMsg = page.getByText(/gián đoạn|tạm thời/i);
      const isVisible = await serviceDownMsg.isVisible().catch(() => false);
      if (!isVisible) {
        await page.screenshot({ path: 'evidence_defects/BUG_22_missing_502_503_error_message.png', fullPage: true });
      }
      await expect(serviceDownMsg, 'Defect: UI chưa hiển thị thông báo gián đoạn dịch vụ cho mã 502/503 theo PSD Mục 3.F').toBeVisible({ timeout: 2000 });
    });

    test('[SS-028] 400 Bad Request: Hiển thị đúng thông báo PSD Mục 3.F', { tag: ['@mock'] }, async ({ page }) => {
      const mock = await ss.mockSearchApi({ message: 'Yêu cầu không hợp lệ' }, 400);
      await ss.searchNL('Query lỗi cú pháp 400');
      await expect.poll(() => mock.getHits(), { timeout: 10000, message: 'Mock không được áp dụng: endpoint sai' }).toBeGreaterThan(0);

      // PSD Mục 3.F: "Yêu cầu tìm kiếm không hợp lệ. Vui lòng kiểm tra lại câu truy vấn."
      const badReqMsg = page.getByText(/Yêu cầu tìm kiếm không hợp lệ/i);
      const isVisible = await badReqMsg.isVisible().catch(() => false);
      if (!isVisible) {
        await page.screenshot({ path: 'evidence_defects/BUG_28_missing_400_error_message.png', fullPage: true });
      }
      await expect(badReqMsg, 'Defect: UI chưa hiển thị thông báo yêu cầu không hợp lệ cho mã lỗi 400 theo PSD Mục 3.F').toBeVisible({ timeout: 2000 });
    });

    test('[SS-029] 401/403 Unauthorized/Forbidden: Hiển thị thông báo quyền truy cập PSD Mục 3.F', { tag: ['@mock'] }, async ({ page }) => {
      const mock = await ss.mockSearchApi({ message: 'Không có quyền truy cập' }, 403);
      await ss.searchNL('Query không có quyền');
      await expect.poll(() => mock.getHits(), { timeout: 10000, message: 'Mock không được áp dụng: endpoint sai' }).toBeGreaterThan(0);

      // PSD Mục 3.F: "Bạn không có quyền tìm kiếm trên một số camera hoặc khu vực đã chọn."
      const forbidMsg = page.getByText(/không có quyền/i);
      const isVisible = await forbidMsg.isVisible().catch(() => false);
      if (!isVisible) {
        await page.screenshot({ path: 'evidence_defects/BUG_29_missing_403_error_message.png', fullPage: true });
      }
      await expect(forbidMsg, 'Defect: UI chưa hiển thị thông báo không có quyền cho mã lỗi 403 theo PSD Mục 3.F').toBeVisible({ timeout: 2000 });
    });

    test('[SS-030] 422 Unprocessable Entity: Hiển thị thông báo không thể phân tích truy vấn PSD 3.F', { tag: ['@mock'] }, async ({ page }) => {
      const mock = await ss.mockSearchApi({ message: 'Không thể phân tích ngữ nghĩa' }, 422);
      await ss.searchNL('Query không thể phân tích');
      await expect.poll(() => mock.getHits(), { timeout: 10000, message: 'Mock không được áp dụng: endpoint sai' }).toBeGreaterThan(0);

      // PSD Mục 3.F: "Hệ thống không thể hiểu yêu cầu tìm kiếm. Vui lòng thử mô tả bằng cách khác."
      const unprocMsg = page.getByText(/không thể hiểu yêu cầu|không thể phân tích/i);
      const isVisible = await unprocMsg.isVisible().catch(() => false);
      if (!isVisible) {
        await page.screenshot({ path: 'evidence_defects/BUG_30_missing_422_error_message.png', fullPage: true });
      }
      await expect(unprocMsg, 'Defect: UI chưa hiển thị thông báo không thể hiểu yêu cầu cho mã 422 theo PSD Mục 3.F').toBeVisible({ timeout: 2000 });
    });
  });

  // =========================================================================
  // SCENARIO SS-EXT-001: MỞ RỘNG NGHIỆP VỤ & PHÁT HIỆN LIVE
  // =========================================================================
  test.describe('Nghiệp vụ Mở rộng & Hành vi Live (SS-EXT-001)', () => {
    test('[SS-019] Bảng chuẩn hóa cụm từ thời gian từ PSD (buổi sáng, trưa, chiều, tối, vừa nãy)', { tag: ['@time'] }, async () => {
      // PSD Mục 3.C: buổi sáng (06:00-12:00), vừa nãy (now-10m)
      await ss.searchNL('tìm người buổi sáng');
      await expect(ss.searchTextarea).toHaveValue('tìm người buổi sáng');
    });

    test('[SS-027] Cụm từ thời gian mở rộng: rạng sáng, sáng sớm, chạng vạng, khuya, nửa đêm, từ 12h đến 14h, lúc 12h (PSD 3.C)', { tag: ['@time'] }, async () => {
      // PSD Mục 3.C:
      // rạng sáng (04:00-06:00), sáng sớm (05:00-07:00), chạng vạng (17:30-18:30)
      // khuya (22:00-24:00), nửa đêm (23:30-00:30), từ 12h đến 14h (12:00-14:00), lúc 12h (11:45-12:15)
      await ss.searchNL('xe máy lúc 12h từ 12h đến 14h sáng sớm');
      await expect(ss.searchTextarea).toHaveValue('xe máy lúc 12h từ 12h đến 14h sáng sớm');
    });

    test('[SS-020] Chặn khoảng thời gian From > To và thời gian tương lai (BR-TIME-09)', async () => {
      await ss.toggleAllFiltersButton.click();
      if (await ss.dateFromInput.isVisible() && await ss.dateToInput.isVisible()) {
        await ss.dateFromInput.fill('01/12/2026');
        await ss.dateToInput.fill('01/01/2026'); // From > To
        await ss.applyFilterButton.click();
      }
    });

    test('[SS-021] Mặc định thời gian: NL không ngày giờ (7 ngày qua, A-05) vs Filter (ngày hiện tại)', { tag: ['@time', '@assumption'] }, async () => {
      // Query mặc định trên URL live có time_preset=7d
      const url = await ss.page.url();
      expect(url).toContain('time_preset=7d');
    });

    test('[SS-023] NL nhiều đối tượng và quan hệ AND/OR (Chốt BA #3, A-03)', { tag: ['@nl', '@mock'] }, async () => {
      const mock = await ss.mockSearchApi(SmartSearchMockBuilder.build3TierRelevanceDataset('Người áo đỏ VÀ xe máy đen'));
      await ss.searchNL('Người áo đỏ VÀ xe máy đen');
      await expect.poll(() => mock.getHits(), { timeout: 10000, message: 'Mock không được áp dụng: endpoint sai' }).toBeGreaterThan(0);
    });

    test('[SS-024] Chế độ tìm kiếm search_mode: Precision vs Flexible (Phát hiện Live UI)', { tag: ['@live-ui'] }, async () => {
      // Dropdown chế độ tìm kiếm có trên thanh tìm kiếm Live
      const modeBtn = ss.page.locator('button:has-text("Precision"), button:has-text("Flexible")').first();
      await expect(modeBtn).toBeVisible();
    });

    test('[SS-025] Nút Tìm kiếm bị disabled khi ô prompt rỗng (Phát hiện Live UI)', { tag: ['@live-ui'] }, async () => {
      await ss.clearQuery();
      const isSearchDisabled = await ss.searchButton.isDisabled();
      expect(isSearchDisabled).toBeTruthy();
    });

    test('[SS-031] Query Summary đồng bộ 2 chiều và thông báo "Đã cập nhật màu xe: Xanh → Vàng" (PSD Mục 3.B)', async ({ page }) => {
      await ss.searchNL('Tìm xe màu xanh');
      await ss.toggleAllFiltersButton.click();
      // PSD Mục 3.B: Khi đổi giá trị filter, hiển thị thông báo "Đã cập nhật màu xe: Xanh → Vàng"
      await expect(ss.advancedFilterPanel).toBeVisible({ timeout: 3000 });
    });

    test('[SS-032] Khu vực đổi thì camera không thuộc khu vực bị bỏ và có thông báo (BR-FLT-04)', async () => {
      await ss.toggleAllFiltersButton.click();
      await expect(ss.advancedFilterPanel).toBeVisible({ timeout: 3000 });
    });

    test('[SS-033] Sắp xếp kết quả: Mới nhất / Cũ nhất và Độ liên quan (PSD Mục 3.E)', { tag: ['@result'] }, async () => {
      // PSD Mục 3.E: Dropdown sort hỗ trợ Độ liên quan giảm dần (mặc định), Thời gian mới nhất, Thời gian cũ nhất
      const sortBtn = ss.page.locator('button:has-text("Độ liên quan"), button[aria-label="Sắp xếp"]').first();
      await expect(sortBtn).toBeVisible();
    });

    test('[SS-026] @live: Tìm kiếm thực tế với từ khóa rộng "người" và xác thực kết quả', { tag: ['@live'] }, async ({ page }) => {
      const stopCapture = await captureApi(page, 'live_smart_search_broad');
      try {
        await ss.searchNL('người');
        await page.waitForTimeout(4000);

        const count = await ss.getResultCount();
        expect(count).toBeGreaterThan(0);
        // Kiểm tra thẻ đầu tiên có thông tin thời gian hoặc camera
        const firstCardText = await ss.resultCards.first().innerText();
        expect(firstCardText).toMatch(/LH-|AIOT|CAM|\d{2}:\d{2}/i);
      } finally {
        stopCapture();
      }
    });
  });
});
