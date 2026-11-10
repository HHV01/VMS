import type { APIRequestContext } from '@playwright/test';

export interface JevChoiceQuestion {
  type: 'choice';
  instructions: string;
  criteria?: Record<string, string>;
}

export interface JevScoreQuestion {
  type: 'score';
  instructions: string;
  criteria: string[];
}

export interface JevNoulQuestion {
  type: 'noul';
  instructions: string;
}

export type JevQuestion = JevChoiceQuestion | JevScoreQuestion | JevNoulQuestion;

export interface JevSystemOneRequest {
  model?: string;
  state: unknown;
  questions: Record<string, JevQuestion>;
}

export interface JevChoiceAnswer {
  type: 'choice';
  choice: string;
  probabilities: Record<string, number>;
  confidence: number;
}

export interface JevScoreAnswer {
  type: 'score';
  score: number;
  probabilities?: Record<string, number>;
  confidence: number;
  legend?: string[];
}

export interface JevNoulAnswer {
  type: 'noul';
  noul: number; // probability between 0 and 1 that answer is "yes"
}

export type JevAnswer = JevChoiceAnswer | JevScoreAnswer | JevNoulAnswer;

export interface JevSystemOneResponse {
  model: string;
  answers: Record<string, JevAnswer>;
}

export class JevApi {
  readonly baseUrl: string;
  readonly apiKey: string;
  readonly model: string;
  readonly isMockMode: boolean;

  constructor(
    private readonly request?: APIRequestContext,
    options?: { baseUrl?: string; apiKey?: string; model?: string }
  ) {
    this.baseUrl = (
      options?.baseUrl ||
      process.env.JEV_API_BASE_URL ||
      'https://api.typesafe.ai/v1'
    ).replace(/\/+$/, '');

    this.apiKey = options?.apiKey || process.env.TYPESAFE_API_KEY || process.env.JEV_API_KEY || '';
    this.model = options?.model || process.env.JEV_MODEL || 'jev-latest';
    this.isMockMode = !this.apiKey || this.apiKey === 'mock' || this.apiKey.startsWith('mock_');
  }

  /**
   * Gọi API TypeSafe Jev System One với payload đầy đủ
   */
  async systemOne(req: JevSystemOneRequest): Promise<JevSystemOneResponse> {
    const isOpenRouter = this.apiKey.startsWith('sk-or-') || this.baseUrl.includes('openrouter.ai');
    const endpoint = isOpenRouter
      ? (this.baseUrl.includes('/decisions') ? this.baseUrl : 'https://openrouter.ai/api/alpha/decisions')
      : (this.baseUrl.endsWith('/systemone') ? this.baseUrl : `${this.baseUrl}/systemone`);

    const modelToUse = req.model || (isOpenRouter && this.model === 'jev-latest' ? 'typesafe/jev-1.13' : this.model);

    const payload = {
      model: modelToUse,
      state: typeof req.state === 'string' ? req.state : JSON.stringify(req.state),
      questions: req.questions,
    };

    if (this.isMockMode) {
      return this.generateMockResponse(payload);
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };

    if (this.request) {
      const response = await this.request.post(endpoint, {
        headers,
        data: payload,
      });

      if (!response.ok()) {
        const text = await response.text();
        throw new Error(`Jev API error HTTP ${response.status()}: ${text}`);
      }

      return (await response.json()) as JevSystemOneResponse;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Jev API error HTTP ${response.status}: ${text}`);
    }

    return (await response.json()) as JevSystemOneResponse;
  }

  /**
   * Primitive Choice: Chọn 1 trong số các lựa chọn với xác suất và độ tin cậy
   */
  async decideChoice(
    state: unknown,
    instructions: string,
    criteria: Record<string, string>
  ): Promise<{ choice: string; confidence: number; probabilities: Record<string, number> }> {
    const res = await this.systemOne({
      state,
      questions: {
        decision: {
          type: 'choice',
          instructions,
          criteria,
        },
      },
    });

    const answer = res.answers.decision as JevChoiceAnswer;
    return {
      choice: answer.choice,
      confidence: answer.confidence,
      probabilities: answer.probabilities,
    };
  }

  /**
   * Primitive Noul: Phán đoán nhị phân Có / Không (Yes/No probability)
   */
  async decideNoul(
    state: unknown,
    instructions: string,
    threshold = 0.5
  ): Promise<{ isYes: boolean; probability: number }> {
    const res = await this.systemOne({
      state,
      questions: {
        verdict: {
          type: 'noul',
          instructions,
        },
      },
    });

    const answer = res.answers.verdict as JevNoulAnswer;
    return {
      isYes: answer.noul >= threshold,
      probability: answer.noul,
    };
  }

  /**
   * Primitive Score: Cho điểm theo thang đo có thứ tự
   */
  async decideScore(
    state: unknown,
    instructions: string,
    criteria?: string[]
  ): Promise<{ score: number; confidence: number; probabilities?: Record<string, number> }> {
    const defaultCriteria = [
      '1: Rất thấp hoặc không đạt',
      '2: Thấp hoặc cần cải thiện',
      '3: Trung bình hoặc chấp nhận được',
      '4: Tốt hoặc đạt yêu cầu',
      '5: Xuất sắc hoặc hoàn hảo',
    ];
    const res = await this.systemOne({
      state,
      questions: {
        evaluation: {
          type: 'score',
          instructions,
          criteria: criteria || defaultCriteria,
        },
      },
    });

    const answer = res.answers.evaluation as JevScoreAnswer;
    return {
      score: answer.score,
      confidence: answer.confidence,
      probabilities: answer.probabilities,
    };
  }

  /**
   * Mock deterministic fallback generator khi chạy local/CI không có API key
   */
  private generateMockResponse(payload: {
    model: string;
    state: string;
    questions: Record<string, JevQuestion>;
  }): JevSystemOneResponse {
    const stateStr = payload.state.toLowerCase();
    const answers: Record<string, JevAnswer> = {};

    for (const [key, q] of Object.entries(payload.questions)) {
      if (q.type === 'choice') {
        const keys = Object.keys(q.criteria || { default: 'default' });
        // Heuristic simulation
        let selected = keys[0];
        for (const candidate of keys) {
          if (stateStr.includes(candidate.toLowerCase())) {
            selected = candidate;
            break;
          }
        }
        const probs: Record<string, number> = {};
        for (const k of keys) {
          probs[k] = k === selected ? 0.85 : Number((0.15 / Math.max(1, keys.length - 1)).toFixed(2));
        }
        answers[key] = {
          type: 'choice',
          choice: selected,
          confidence: 0.9,
          probabilities: probs,
        };
      } else if (q.type === 'score') {
        answers[key] = {
          type: 'score',
          score: Math.min(q.criteria?.length || 5, 4),
          confidence: 0.88,
          probabilities: { '1': 0.05, '2': 0.1, '3': 0.15, '4': 0.55, '5': 0.15 },
        };
      } else if (q.type === 'noul') {
        // Evaluate simple keywords
        const negativeKeywords = ['fail', 'error', 'timeout', 'not found', 'exception', 'mismatch'];
        const hasNegative = negativeKeywords.some((w) => stateStr.includes(w));
        const probability = hasNegative && q.instructions.toLowerCase().includes('match') ? 0.15 : 0.92;
        answers[key] = {
          type: 'noul',
          noul: probability,
        };
      }
    }

    return {
      model: payload.model,
      answers,
    };
  }
}
