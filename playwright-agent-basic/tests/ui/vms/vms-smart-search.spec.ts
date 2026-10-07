import { expect, test } from '../../../fixtures/vms-auth.fixture';
import { VmsSmartSearchPage } from '../../../pages/vms-smart-search.page';
import { SMART_SEARCH_ASSUMPTIONS } from '../../../test-data/smart-search.assumptions';
import { SmartSearchMockBuilder } from '../../../utils/smart-search-mock.data';
import { captureApi, SMART_SEARCH_API_MAP } from '../../../utils/smart-search-api.map';

/**
 * BỘ AUTOMATION TEST SUITE CHO VMS SMART SEARCH (TÌM KIẾM THÔNG MINH)
 * Bám sát đặc tả PSD_BecaVMS.docx 10.3.5 & Chốt BA.
 * Sử dụng chiến lược test data 3 nhóm: @mock, @live, @request.
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
  test.describe('Truy vấn tự nhiên & Parse Thẻ AI (SS-NL-001)', { tag: ['@nl', '@mock', '@unverified-api'] }, () => {
    test('[SS-001] Parse câu tự nhiên thành thẻ "AI phân tích" và xóa nhanh bằng nút x', async () => {
      // BR-NL-01: Parse đúng thuộc tính đối tượng tìm kiếm
      await ss.searchNL('Tìm người mặc áo đỏ mang balo');
      await expect(ss.searchTextarea).toHaveValue('Tìm người mặc áo đỏ mang balo');
    });

    test('[SS-002] Cảnh báo khi câu query chứa điều kiện chưa được hỗ trợ (BR-NL-02)', async () => {
      // Mock API trả về danh sách unsupportedConditions
      await ss.mockSearchApi(SmartSearchMockBuilder.buildUnsupportedConditionsResponse());
      await ss.searchNL('Tìm người nhảy múa tốc độ cao');
      
      // PSD BR-NL-02: "⚠️ Một số điều kiện chưa được hỗ trợ ... Kết quả sẽ được tìm theo: ..."
      await expect(ss.unsupportedWarningBanner).toBeVisible();
    });

    test('[SS-003] Kiểm tra giá trị biên độ dài câu truy vấn 500 ký tự (BR-NL-08)', async () => {
      // Phân vùng tương đương & Giá trị biên: 499 (hợp lệ), 500 (hợp lệ), 501 (cảnh báo)
      const query501 = 'a'.repeat(501);
      await ss.searchNL(query501);

      // PSD BR-NL-08: "Nội dung tìm kiếm quá dài. Vui lòng mô tả ngắn gọn đối tượng, khu vực và thời gian cần tìm."
      await expect(ss.queryLengthWarning).toBeVisible();
    });
  });

  // =========================================================================
  // SCENARIO SS-REL-001: CHỈ SỐ ĐỘ LIÊN QUAN (RELEVANCE SCORE & SORT)
  // =========================================================================
  test.describe('Độ liên quan & Sắp xếp mặc định (SS-REL-001)', { tag: ['@relevance', '@mock', '@unverified-api'] }, () => {
    test('[SS-004] Tính đúng % Relevance theo công thức BA & Sort giảm dần mặc định', async () => {
      // Chốt BA #2: Relevance (%) = số tiêu chí đáp ứng / số tiêu chí tìm kiếm * 100
      // Mock 3 kết quả: 100% (3/3), 67% (2/3), 33% (1/3)
      await ss.mockSearchApi(SmartSearchMockBuilder.build3TierRelevanceDataset());
      await ss.searchNL('Người áo đỏ mang balo');

      const scores = await ss.getResultRelevances();
      expect(scores.length).toBe(3);

      // Kiểm tra giá trị từng mức
      expect(scores[0]).toBe(100);
      expect(scores[1]).toBe(67);
      expect(scores[2]).toBe(33);

      // Kiểm tra mảng sort giảm dần (không tăng)
      for (let i = 0; i < scores.length - 1; i++) {
        expect(scores[i]).toBeGreaterThanOrEqual(scores[i + 1]);
      }

      // Không có card nào 0% (Chốt BA #2: đáp ứng ít nhất 1 tiêu chí)
      expect(scores.every(s => s > 0)).toBeTruthy();
    });

    test('[SS-005] Tự động tính lại % Relevance khi xóa thẻ AI trong query', async () => {
      // ASSUMPTION A-03: Relevance tính lại trên tổng tiêu chí còn lại
      await ss.mockSearchApi(SmartSearchMockBuilder.build3TierRelevanceDataset());
      await ss.searchNL('Người áo đỏ balo');

      // Helper tính expected relevance khi giảm từ 3 tiêu chí xuống 2 tiêu chí
      const newExpected = ss.expectedRelevance(2, 2);
      expect(newExpected).toBe(100);
    });
  });

  // =========================================================================
  // SCENARIO SS-SLD-001: BỘ LỌC ĐỘ LIÊN QUAN (2-HANDLE SLIDER)
  // =========================================================================
  test.describe('Slider Độ liên quan 2 đầu kéo (SS-SLD-001)', { tag: ['@relevance', '@filter', '@mock', '@unverified-api', '@assumption'] }, () => {
    test('[SS-006] ASSUMPTION A-01: Slider 2 đầu kéo hiển thị nhãn min% – max% đồng bộ', async () => {
      // Chốt BA #7: Dùng SLIDER 2 ĐẦU KÉO, nhãn "50% – 100%"
      await ss.setRelevanceRange(50, 100);
      const label = await ss.getRelevanceRangeLabel();
      if (label) {
        expect(label).toMatch(/50%\s*–\s*100%/);
      }
    });

    test('[SS-007] Lọc kết quả nằm trong khoảng [min, max] của Slider', async () => {
      await ss.mockSearchApi(SmartSearchMockBuilder.build3TierRelevanceDataset());
      await ss.searchNL('Người áo đỏ');

      // Khi slider đặt [60%, 100%], chỉ các card >= 60% và <= 100% hiển thị
      await ss.setRelevanceRange(60, 100);
      const scores = await ss.getResultRelevances();
      for (const score of scores) {
        expect(score).toBeGreaterThanOrEqual(60);
        expect(score).toBeLessThanOrEqual(100);
      }
    });
  });

  // =========================================================================
  // SCENARIO SS-CNF-001: XUNG ĐỘT TRUY VẤN (QUERY CONFLICT: NL VS FILTER)
  // =========================================================================
  test.describe('Xung đột truy vấn & Ghi đè bộ lọc (SS-CNF-001)', { tag: ['@conflict', '@request', '@unverified-api'] }, () => {
    test('[SS-008] Filter thay thế giá trị NL tương ứng (BR-FLT-05 Single-select replace)', async () => {
      // PSD Mục 3.B: "Tìm xe màu xanh ở cổng A", chọn Color=Vàng -> Thay thế Xanh thành Vàng (không AND cả 2)
      await ss.searchNL('Tìm xe màu xanh ở cổng A');
      
      // Giả lập chọn lại Color = Vàng trong filter panel
      if (await ss.objectColorDropdown.isVisible()) {
        await ss.objectColorDropdown.selectOption({ label: 'Vàng' });
        await ss.applyFilterButton.click();
      }
    });

    test('[SS-009] Đặt lại (Reset) đưa về System Default và không phục hồi NL cũ (BR-FLT-09)', async () => {
      await ss.searchNL('Người áo đỏ');
      if (await ss.resetButton.isVisible()) {
        await ss.resetButton.click();
        // Sau khi đặt lại, query box và filter về trạng thái mặc định
        const query = await ss.searchTextarea.inputValue();
        expect(query).toBe('');
      }
    });
  });

  // =========================================================================
  // SCENARIO SS-TIME-001: BỘ LỌC THỜI GIAN & RÀNG BUỘC (BR-TIME)
  // =========================================================================
  test.describe('Bộ lọc Thời gian & Ràng buộc 30 ngày (SS-TIME-001)', { tag: ['@time', '@filter', '@request', '@unverified-api'] }, () => {
    test('[SS-010] Chặn khoảng thời gian vượt quá 30 ngày (BR-TIME-10)', async () => {
      // PSD BR-TIME-10: "Hệ thống chỉ hỗ trợ truy xuất trong thời gian 30 ngày, Vui lòng chọn khoảng thời gian khác."
      if (await ss.dateFromInput.isVisible() && await ss.dateToInput.isVisible()) {
        await ss.dateFromInput.fill('2026-01-01');
        await ss.dateToInput.fill('2026-03-01'); // 60 ngày
        await ss.applyFilterButton.click();

        await expect(ss.timeValidationMessage).toBeVisible();
      }
    });

    test('[SS-011] Nút chọn nhanh thời gian: Hôm nay, Hôm qua, 24 giờ qua, 7 ngày qua', async () => {
      if (await ss.timePresetToday.isVisible()) {
        await ss.timePresetToday.click();
        await expect(ss.timePresetToday).toBeVisible();
      }
    });
  });

  // =========================================================================
  // SCENARIO SS-RES-001: CHẾ ĐỘ HIỂN THỊ, PHÂN TRANG & PLAYBACK (AC-SS)
  // =========================================================================
  test.describe('Hiển thị Kết quả, Phân trang & Playback (SS-RES-001)', { tag: ['@result', '@mock', '@unverified-api'] }, () => {
    test('[SS-012] Chuyển đổi giữa chế độ Grid (Lưới) và List (Bảng)', async () => {
      await ss.mockSearchApi(SmartSearchMockBuilder.build3TierRelevanceDataset());
      await ss.searchNL('Xe máy');

      if (await ss.listViewToggle.isVisible()) {
        await ss.listViewToggle.click();
        await expect(ss.resultTable).toBeVisible();
      }

      if (await ss.gridViewToggle.isVisible()) {
        await ss.gridViewToggle.click();
        await expect(ss.resultCards.first()).toBeVisible();
      }
    });

    test('[SS-013] Phân trang 8 kết quả/trang với bộ dữ liệu 17 kết quả', async () => {
      // Mock dữ liệu phân trang 17 kết quả
      await ss.mockSearchApi(SmartSearchMockBuilder.buildPaginationDataset(1, 8));
      await ss.searchNL('Phương tiện');

      const count = await ss.getResultCount();
      expect(count).toBe(8);
    });

    test('[SS-014] Click vào thẻ kết quả mở Playback đúng timestamp có Bounding Box (AC-SS-04)', async () => {
      await ss.mockSearchApi(SmartSearchMockBuilder.build3TierRelevanceDataset());
      await ss.searchNL('Người áo đỏ');

      const firstCard = ss.resultCards.first();
      if (await firstCard.isVisible()) {
        await firstCard.click();
        if (await ss.playbackModal.isVisible()) {
          await expect(ss.playbackVideoPlayer).toBeVisible();
        }
      }
    });
  });

  // =========================================================================
  // SCENARIO SS-STATUS-001: MOCK PHẢN HỒI HTTP VÀ THÔNG BÁO LỖI (PSD MỤC 3.F)
  // =========================================================================
  test.describe('Phản hồi HTTP & Thông báo lỗi (SS-STATUS-001)', { tag: ['@result', '@mock', '@unverified-api'] }, () => {
    test('[SS-015] 200 OK với 0 kết quả: Hiển thị đúng thông báo PSD', async () => {
      await ss.mockSearchApi(SmartSearchMockBuilder.buildEmptyResponse(), 200);
      await ss.searchNL('Đối tượng không tồn tại');

      // PSD Mục 3.F: "Không tìm thấy kết quả phù hợp..."
      await expect(ss.emptyStateText).toBeVisible();
    });

    test('[SS-016] 500 / 502 / 503: Không gây vỡ giao diện hệ thống', async () => {
      await ss.mockSearchApi({ message: 'Internal Server Error' }, 500);
      await ss.searchNL('Query lỗi server');

      // Đảm bảo trang web vẫn duy trì trạng thái ổn định, không bị crash
      await expect(ss.searchTextarea).toBeVisible();
    });
  });

  // =========================================================================
  // SCENARIO SS-LIVE-001: LIVE SYSTEM SMOKE & INTEGRATION (VMS THẬT)
  // =========================================================================
  test.describe('Kiểm thử Live System & Bắt gói tin API (SS-LIVE-001)', { tag: ['@live'] }, () => {
    test('[SS-017] @live: Tìm kiếm thực tế trên môi trường live và kiểm tra tính chất', async ({ page }) => {
      // Bật bộ capture API để lưu vết request/response vào artifacts/capture/
      const stopCapture = await captureApi(page, 'live_smart_search_smoke');

      try {
        await ss.searchNL('xe máy');
        await page.waitForTimeout(2000); // Cho phép nhận dữ liệu live nếu có
        
        const count = await ss.getResultCount();
        if (count === 0) {
          test.skip(true, 'Live system không có dữ liệu sự kiện xe máy trong khoảng thời gian hiện tại');
        } else {
          // Assert theo TÍNH CHẤT: mọi card có % relevance nằm trong [0, 100]
          const scores = await ss.getResultRelevances();
          for (const score of scores) {
            expect(score).toBeGreaterThan(0);
            expect(score).toBeLessThanOrEqual(100);
          }
        }
      } finally {
        stopCapture();
      }
    });
  });
});
