import { expect, test } from '../../../fixtures/base.fixture';
import { JevApi } from '../../../api/jev.api';
import { JevSmartOracle } from '../../../utils/jev-smart-oracle';
import { JevFailureAnalyzer } from '../../../utils/jev-failure-analyzer';

test.describe('Jev AI - TypeSafe System One Decision Model', { tag: ['@module:jev', '@jev', '@api'] }, () => {
  test('[JEV-001] Choice primitive: Phân loại hành động kiểm thử', async ({ request }) => {
    const jev = new JevApi(request);
    const decision = await jev.decideChoice(
      'Người dùng đã nhập thông tin đăng nhập đúng nhưng giao diện hiển thị thông báo lỗi 500 từ server',
      'Xác định loại sự kiện đang xảy ra trên hệ thống',
      {
        AUTH_SUCCESS: 'Đăng nhập thành công',
        AUTH_FAILURE: 'Đăng nhập thất bại do sai thông tin',
        SERVER_ERROR: 'Lỗi máy chủ nội bộ HTTP 500',
      }
    );

    expect(decision.choice).toBeDefined();
    expect(decision.confidence).toBeGreaterThan(0);
    expect(Object.keys(decision.probabilities).length).toBeGreaterThan(0);
  });

  test('[JEV-002] Noul primitive: Phán đoán nhị phân (Yes/No probability)', async ({ request }) => {
    const jev = new JevApi(request);
    const result = await jev.decideNoul(
      'Màn hình hiển thị danh sách 10 camera hoạt động bình thường, không có camera nào báo mất tín hiệu',
      'Hệ thống camera có đang hoạt động ổn định không?'
    );

    expect(typeof result.isYes).toBe('boolean');
    expect(result.probability).toBeGreaterThanOrEqual(0);
    expect(result.probability).toBeLessThanOrEqual(1);
  });

  test('[JEV-003] Score primitive: Đánh giá chất lượng dữ liệu', async ({ request }) => {
    const jev = new JevApi(request);
    const result = await jev.decideScore(
      'Video camera đạt chuẩn full HD 1080p, tốc độ khung hình 30fps, không bị giật lag',
      'Đánh giá chất lượng luồng video camera từ 1 đến 5'
    );

    expect(result.score).toBeGreaterThanOrEqual(1);
    expect(result.score).toBeLessThanOrEqual(5);
    expect(result.confidence).toBeGreaterThan(0);
  });

  test('[JEV-004] Smart Oracle: Đánh giá ngữ nghĩa kết quả tìm kiếm VMS', async ({ request }) => {
    const jev = new JevApi(request);
    const oracle = new JevSmartOracle(jev);

    const judgment = await oracle.judgeSemanticMatch(
      'Tìm xe máy màu đỏ vượt đèn đỏ',
      'Sự kiện phát hiện xe gắn máy màu đỏ qua vạch dừng khi tín hiệu đèn màu đỏ tại nút giao'
    );

    expect(judgment.isRelevant).toBe(true);
    expect(judgment.score).toBeGreaterThanOrEqual(3);
    expect(judgment.confidence).toBeGreaterThan(0);
  });

  test('[JEV-005] Failure Analyzer: Tự động phân tích nguyên nhân lỗi kiểm thử', async ({ request }) => {
    const jev = new JevApi(request);
    const analyzer = new JevFailureAnalyzer(jev);

    const failure = await analyzer.analyzeFailure({
      testTitle: '[OC-001] Kiểm tra hiển thị số lượng xe ô tô',
      errorMessage: 'locator.click: Timeout 30000ms exceeded waiting for locator("button#export-excel")',
      stepFailed: 'Bấm nút xuất báo cáo Excel',
    });

    expect(['APPLICATION_BUG', 'ENVIRONMENT_TIMEOUT', 'SELECTOR_DRIFT', 'DATA_ISSUE']).toContain(
      failure.category
    );
    expect(failure.suggestedAction).toBeDefined();
    expect(failure.severityScore).toBeGreaterThanOrEqual(1);
  });
});
