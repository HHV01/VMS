import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * SMART SEARCH API ADAPTER (MAP & DATA CONTRACTS)
 * ĐÃ XÁC MINH TRỰC TIẾP TRÊN MÔI TRƯỜNG LIVE (Port 8004 UI -> Port 8001 Backend API).
 * 
 * MẪU REQUEST THỰC TẾ (Đã gỡ token & thông tin nhạy cảm):
 * -------------------------------------------------------------
 * POST http://180.148.1.242:8001/api/smart_search
 * Headers: {
 *   "Authorization": "Bearer [REDACTED_JWT_TOKEN]",
 *   "Content-Type": "application/json",
 *   "Accept": "application/json, text/plain, *\/*"
 * }
 * Body: {
 *   "query": "người",
 *   "start_time": "2026-09-30T17:00:00.000Z",
 *   "end_time": "2026-10-07T16:59:59.999Z",
 *   "time_of_day_start": null,
 *   "time_of_day_end": null,
 *   "limit": 200
 * }
 * 
 * MẪU RESPONSE THỰC TẾ (Trích đoạn items tiêu biểu):
 * -------------------------------------------------------------
 * Status: 200 OK
 * Body: {
 *   "message": { "vi": "Tìm kiếm thành công", "en": "Search successful" },
 *   "data": {
 *     "query": "người",
 *     "total": 31,
 *     "limit": 200,
 *     "offset": 0,
 *     "has_more": false,
 *     "items": [
 *       {
 *         "segment_id": "a8c0c9c0-62bb-4ce4-9238-4f5a08b5728a",
 *         "camera_id": "LH-HV-LL_CAM-04",
 *         "camera_name": "LH-HV-LL_CAM-04",
 *         "start_time": "2026-10-07T09:01:09.822791Z",
 *         "end_time": "2026-10-07T09:01:26.478672Z",
 *         "score": 1,
 *         "relevance_score": null,
 *         "matched_filter_count": null,
 *         "total_filter_count": null,
 *         "display_score": null,
 *         "summary": "Bối cảnh là một khu vực giao thông đông đúc vào buổi sáng sớm...",
 *         "thumb_url": "/security-events/2026-10-07/event_retrieval/a8c0c9c0-62bb-4ce4-9238-4f5a08b5728a-4.jpg",
 *         "objects": [
 *           { "class": "vehicle", "color": "tan", "confidence": 0.942, "vehicle_type": "truck" },
 *           { "class": "person", "confidence": 0.759 }
 *         ],
 *         "playback_url": "/recording/LH-HV-LL_CAM-04/start/1791363669/end/1791363686/index.m3u8"
 *       }
 *     ],
 *     "interpretation": {
 *       "search_basis": "metadata",
 *       "parser": "gemini",
 *       "yoloe_classes": ["person"],
 *       "unsupported_filters": []
 *     }
 *   },
 *   "status_code": 200
 * }
 */
export const SMART_SEARCH_API_MAP = {
  // CONFIRMED LIVE ENDPOINTS (Verified on port 8001)
  AUTH_LOGIN: /.*:8001\/api\/auth\/login.*/i,
  VALIDATE_TOKEN: /.*:8001\/api\/auth\/validate_token.*/i,
  CAMERAS_ENDPOINT_PATTERN: /.*:8001\/api\/cameras.*/i,
  
  // Confirmed Live Search endpoint on port 8001
  SEARCH_ENDPOINT_PATTERN: /.*:8001\/api\/smart_search.*/i,
  SEARCH_PARSE_NL_PATTERN: /.*:8001\/api\/.*(?:parse-nl|nlp|prompt).*/i,

  // UI Query Parameters (Confirmed in UI URL)
  URL_QUERY_PARAMS: {
    SEARCH_MODE: 'search_mode', // 'precision' | 'flexible'
    TIME_PRESET: 'time_preset', // '7d' | '24h' | 'today' | 'yesterday'
  },

  // CONFIRMED LIVE REQUEST SCHEMA FIELDS
  REQUEST_FIELDS: {
    QUERY: 'query',
    START_TIME: 'start_time',
    END_TIME: 'end_time',
    TIME_OF_DAY_START: 'time_of_day_start',
    TIME_OF_DAY_END: 'time_of_day_end',
    LIMIT: 'limit',
  },

  // CONFIRMED LIVE ITEM SCHEMA FIELDS
  ITEM_FIELDS: {
    SEGMENT_ID: 'segment_id',
    CAMERA_ID: 'camera_id',
    CAMERA_NAME: 'camera_name',
    START_TIME: 'start_time',
    END_TIME: 'end_time',
    SCORE: 'score',
    RELEVANCE_SCORE: 'relevance_score',
    MATCHED_FILTER_COUNT: 'matched_filter_count',
    TOTAL_FILTER_COUNT: 'total_filter_count',
    DISPLAY_SCORE: 'display_score',
    SUMMARY: 'summary',
    THUMB_URL: 'thumb_url',
    PLAYBACK_URL: 'playback_url',
    OBJECTS: 'objects',
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
