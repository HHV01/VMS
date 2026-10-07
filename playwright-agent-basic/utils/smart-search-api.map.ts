import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * SMART SEARCH API ADAPTER (MAP & DATA CONTRACTS)
 * TẤT CẢ ENDPOINT VÀ FIELD DƯỚI ĐÂY LÀ PHỎNG ĐOÁN HỢP LÝ THEO PSD/BA VÀ ĐƯỢC ĐÁNH DẤU "UNVERIFIED".
 * Sau khi có HAR/API thật, chỉ cần cập nhật lại file này.
 */
export const SMART_SEARCH_API_MAP = {
  // Confirmed Live Backend Base: http://180.148.1.242:8001
  AUTH_LOGIN: /.*\/api\/auth\/login.*/i,
  VALIDATE_TOKEN: /.*\/api\/auth\/validate_token.*/i,
  CAMERAS_ENDPOINT_PATTERN: /.*\/api\/cameras.*/i,
  
  // Smart Search search endpoint pattern on port 8001
  SEARCH_ENDPOINT_PATTERN: /.*:8001\/api\/.*(?:smart-search|events|retrieval|search).*/i,
  SEARCH_PARSE_NL_PATTERN: /.*:8001\/api\/.*(?:parse-nl|nlp|prompt).*/i,

  // UI Query Parameters
  URL_QUERY_PARAMS: {
    SEARCH_MODE: 'search_mode', // 'precision' | 'flexible'
    TIME_PRESET: 'time_preset', // '7d' | '24h' | 'today' | 'yesterday'
  },

  // UNVERIFIED: Schema field names
  FIELDS: {
    QUERY_TEXT: 'query_text',
    PAGE: 'page',
    PAGE_SIZE: 'page_size',
    SORT_BY: 'sort_by', // 'relevance' | 'newest' | 'oldest'
    SORT_ORDER: 'sort_order', // 'desc' | 'asc'
    TIME_FROM: 'from_time',
    TIME_TO: 'to_time',
    CAMERA_IDS: 'camera_ids',
    AREA_IDS: 'area_ids',
    MIN_RELEVANCE: 'min_relevance',
    MAX_RELEVANCE: 'max_relevance',
    OBJECT_TYPES: 'object_types',
    ATTRIBUTES: 'attributes',
  },
};

export interface MockSearchResultItem {
  id: string;
  thumbnailUrl: string;
  relevanceScore: number; // 0..100
  cameraName: string;
  cameraId: string;
  locationName: string;
  areaId: string;
  timestamp: string; // ISO or 'DD/MM/YYYY HH:mm:ss'
  matchedTags: string[];
  totalCriteriaCount?: number;
  matchedCriteriaCount?: number;
  playbackUrl?: string;
  boundingBox?: { x: number; y: number; width: number; height: number };
}

export interface MockSearchResponse {
  statusCode: number;
  message?: string;
  totalResults: number;
  totalCameras: number;
  totalAreas: number;
  page: number;
  pageSize: number;
  data: MockSearchResultItem[];
  unsupportedConditions?: string[];
}

/**
 * Helper captureApi(page): Ghi lại request/response XHR thực tế của Smart Search vào artifacts/capture/
 * Loại bỏ toàn bộ token và header nhạy cảm để kiểm tra API thật khi chạy môi trường live.
 */
export async function captureApi(page: Page, runName = 'live_capture'): Promise<() => void> {
  const captureDir = path.resolve(process.cwd(), 'artifacts', 'capture');
  if (!fs.existsSync(captureDir)) {
    fs.mkdirSync(captureDir, { recursive: true });
  }

  const logs: Array<{
    url: string;
    method: string;
    postData: any;
    status: number;
    responseBody: any;
    timestamp: string;
  }> = [];

  const responseHandler = async (res: any) => {
    try {
      const req = res.request();
      const url = req.url();
      if (url.includes('smart-search') || url.includes('video-analytic') || url.includes('search')) {
        let postData = null;
        try {
          postData = req.postDataJSON() || req.postData();
        } catch {
          postData = req.postData();
        }

        let responseBody = null;
        try {
          responseBody = await res.json();
        } catch {
          try {
            responseBody = await res.text();
          } catch {
            responseBody = null;
          }
        }

        logs.push({
          url,
          method: req.method(),
          postData,
          status: res.status(),
          responseBody,
          timestamp: new Date().toISOString(),
        });

        fs.writeFileSync(
          path.join(captureDir, `${runName}_${Date.now()}.json`),
          JSON.stringify(logs, null, 2),
          'utf8'
        );
      }
    } catch {
      // bỏ qua lỗi capture không chặn test
    }
  };

  page.on('response', responseHandler);
  return () => page.off('response', responseHandler);
}
