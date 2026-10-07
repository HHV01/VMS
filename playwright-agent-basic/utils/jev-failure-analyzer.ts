import { JevApi } from '../api/jev.api';

export type FailureCategory =
  | 'APPLICATION_BUG'
  | 'ENVIRONMENT_TIMEOUT'
  | 'SELECTOR_DRIFT'
  | 'DATA_ISSUE';

export interface FailureAnalysisResult {
  category: FailureCategory;
  confidence: number;
  explanation: string;
  suggestedAction: string;
  severityScore: number; // 1-5
  isRealDefect: boolean;
}

export class JevFailureAnalyzer {
  private jev: JevApi;

  constructor(jevApi?: JevApi) {
    this.jev = jevApi || new JevApi();
  }

  /**
   * Phân tích nguyên nhân gốc của lỗi kiểm thử (Test Failure RCA) bằng Jev System One
   */
  async analyzeFailure(input: {
    testTitle: string;
    errorMessage: string;
    stackTrace?: string;
    stepFailed?: string;
  }): Promise<FailureAnalysisResult> {
    const state = {
      testTitle: input.testTitle,
      errorMessage: input.errorMessage,
      stackTrace: input.stackTrace || '',
      stepFailed: input.stepFailed || '',
    };

    const res = await this.jev.systemOne({
      state,
      questions: {
        rootCause: {
          type: 'choice',
          instructions:
            'Phân loại nguyên nhân gốc rễ chính xác của lần kiểm thử thất bại này vào 1 trong 4 danh mục chuẩn.',
          criteria: {
            APPLICATION_BUG:
              'Hệ thống hiển thị sai kết quả, sai dữ liệu nghiệp vụ, HTTP 500 từ API, hoặc vi phạm assertion kết quả mong muốn.',
            ENVIRONMENT_TIMEOUT:
              'Mạng chập chờn, gateway timeout 504, request timeout vượt ngưỡng chờ quy định của server hoặc trình duyệt.',
            SELECTOR_DRIFT:
              'DOM thay đổi, không tìm thấy locator phần tử UI, thuộc tính selector bị sửa đổi trên giao diện mới.',
            DATA_ISSUE:
              'Tài khoản không đủ quyền, dữ liệu test mẫu bị xóa hoặc không thỏa mãn ràng buộc đầu vào.',
          },
        },
        severity: {
          type: 'score',
          instructions:
            'Đánh giá mức độ nghiêm trọng của lỗi từ 1 (rất thấp, flaky) đến 5 (Blocker, lỗi chức năng cốt lõi).',
          criteria: [
            '1 - Rất thấp / Flaky nhẹ',
            '2 - Thấp / Lỗi hiển thị nhỏ',
            '3 - Trung bình / Chức năng phụ',
            '4 - Cao / Ảnh hưởng luồng chính',
            '5 - Nghiêm trọng / Blocker hệ thống',
          ],
        },
        isRealDefectVerdict: {
          type: 'noul',
          instructions:
            'Lỗi này có phải là một lỗi phần mềm thực tế (Product Defect) cần báo cáo cho đội phát triển không?',
        },
      },
    });

    const rootCauseAnswer = res.answers.rootCause;
    const severityAnswer = res.answers.severity;
    const noulAnswer = res.answers.isRealDefectVerdict;

    const category = (
      rootCauseAnswer?.type === 'choice' ? rootCauseAnswer.choice : 'APPLICATION_BUG'
    ) as FailureCategory;

    const confidence = rootCauseAnswer?.type === 'choice' ? rootCauseAnswer.confidence : 0.85;
    const severityScore = severityAnswer?.type === 'score' ? severityAnswer.score : 3;
    const isRealDefect =
      noulAnswer?.type === 'noul'
        ? noulAnswer.noul >= 0.5
        : category === 'APPLICATION_BUG';

    const actionMap: Record<FailureCategory, string> = {
      APPLICATION_BUG: 'Tạo bug ticket trên Jira/Redmine kèm ảnh chụp lỗi và bước tái hiện.',
      ENVIRONMENT_TIMEOUT: 'Kiểm tra độ trễ server môi trường test và xem xét chạy lại với --stable.',
      SELECTOR_DRIFT: 'Cập nhật lại Page Object Model (POM) theo thuộc tính DOM mới của frontend.',
      DATA_ISSUE: 'Kiểm tra lại bộ dữ liệu test fixture trong project/.env hoặc seed lại database.',
    };

    return {
      category,
      confidence,
      explanation: `Jev AI phân loại: ${category} với độ tin cậy ${(confidence * 100).toFixed(1)}%. Mức nghiêm trọng: ${severityScore}/5.`,
      suggestedAction: actionMap[category] || 'Kiểm tra log chi tiết.',
      severityScore,
      isRealDefect,
    };
  }
}
