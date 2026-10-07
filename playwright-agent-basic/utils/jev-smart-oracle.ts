import { JevApi } from '../api/jev.api';

export interface SemanticRelevanceResult {
  isRelevant: boolean;
  score: number; // 1-5 scale
  confidence: number;
  explanation: string;
}

export class JevSmartOracle {
  private jev: JevApi;

  constructor(jevApi?: JevApi) {
    this.jev = jevApi || new JevApi();
  }

  /**
   * Đánh giá kết quả tìm kiếm ngữ nghĩa trong VMS Smart Search có đúng mục tiêu không
   */
  async judgeSemanticMatch(
    userQuery: string,
    actualText: string,
    context?: Record<string, unknown>
  ): Promise<SemanticRelevanceResult> {
    const state = {
      userQuery,
      actualText,
      context: context || {},
    };

    const res = await this.jev.systemOne({
      state,
      questions: {
        relevanceScore: {
          type: 'score',
          instructions:
            'Đánh giá mức độ liên quan giữa truy vấn tìm kiếm tự nhiên của người dùng và kết quả hiển thị trên VMS theo thang điểm từ 1 đến 5.',
          criteria: [
            '1 - Hoàn toàn không liên quan, sai lệch hoàn toàn',
            '2 - Liên quan rất ít hoặc mơ hồ',
            '3 - Liên quan một phần về bối cảnh hoặc thực thể',
            '4 - Liên quan cao, khớp với ý định người dùng',
            '5 - Khớp hoàn hảo với truy vấn và ngữ cảnh camera',
          ],
        },
        isAcceptableMatch: {
          type: 'noul',
          instructions:
            'Kết quả tìm kiếm này có được chấp nhận là kết quả hợp lệ cho truy vấn của người dùng không?',
        },
      },
    });

    const scoreAnswer = res.answers.relevanceScore;
    const noulAnswer = res.answers.isAcceptableMatch;

    const score = scoreAnswer?.type === 'score' ? scoreAnswer.score : 3;
    const confidence = scoreAnswer?.type === 'score' ? scoreAnswer.confidence : 0.8;
    const noulVal = noulAnswer?.type === 'noul' ? noulAnswer.noul : 0.5;

    return {
      isRelevant: noulVal >= 0.6 || score >= 3,
      score,
      confidence,
      explanation: `Jev AI evaluated score ${score}/5 with confidence ${(confidence * 100).toFixed(1)}% (Noul: ${(noulVal * 100).toFixed(1)}%)`,
    };
  }

  /**
   * Đánh giá danh sách kết quả tìm kiếm theo batch
   */
  async rankSearchResults(
    userQuery: string,
    items: string[]
  ): Promise<Array<{ text: string; score: number; isRelevant: boolean }>> {
    const results = [];
    for (const item of items) {
      const evaluation = await this.judgeSemanticMatch(userQuery, item);
      results.push({
        text: item,
        score: evaluation.score,
        isRelevant: evaluation.isRelevant,
      });
    }
    return results.sort((a, b) => b.score - a.score);
  }
}
