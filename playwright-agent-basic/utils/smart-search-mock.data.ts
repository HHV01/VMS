import { MockSearchResponse, MockSearchResultItem } from './smart-search-api.map';

/**
 * Data builder phục vụ các test case @mock
 * Tạo các dataset nhỏ, có chủ đích rõ ràng:
 * - 3 results với relevance 100%, 67%, 33% để test Slider & Sort
 * - 17 results để test Pagination (8/trang)
 * - Empty results để test Empty State
 * - Error responses (400, 401, 403, 404, 422, 500, 502/503)
 */
export class SmartSearchMockBuilder {
  /**
   * Bộ dữ liệu 3 kết quả với các mức relevance chuẩn xác: 100% (3/3), 67% (2/3), 33% (1/3)
   * Phục vụ test: Slider filter min-max, Sort relevance descending, Tag verification
   */
  static build3TierRelevanceDataset(): MockSearchResponse {
    const items: MockSearchResultItem[] = [
      {
        id: 'item-001',
        thumbnailUrl: '/assets/mock/person_red_backpack_1.jpg',
        relevanceScore: 100, // 3/3 tiêu chí: Người + Áo đỏ + Balo
        cameraName: 'CAM_GATE_01',
        cameraId: 'cam-001',
        locationName: 'Cổng chính - Khu A',
        areaId: 'area-01',
        timestamp: '07/10/2026 10:15:30',
        matchedTags: ['Người', 'Áo đỏ', 'Balo'],
        totalCriteriaCount: 3,
        matchedCriteriaCount: 3,
        playbackUrl: '/playback?id=item-001&t=101530',
      },
      {
        id: 'item-002',
        thumbnailUrl: '/assets/mock/person_red_2.jpg',
        relevanceScore: 67, // 2/3 tiêu chí: Người + Áo đỏ
        cameraName: 'CAM_GATE_01',
        cameraId: 'cam-001',
        locationName: 'Cổng chính - Khu A',
        areaId: 'area-01',
        timestamp: '07/10/2026 09:30:15',
        matchedTags: ['Người', 'Áo đỏ'],
        totalCriteriaCount: 3,
        matchedCriteriaCount: 2,
        playbackUrl: '/playback?id=item-002&t=093015',
      },
      {
        id: 'item-003',
        thumbnailUrl: '/assets/mock/person_blue_backpack_3.jpg',
        relevanceScore: 33, // 1/3 tiêu chí: Người (hoặc Balo)
        cameraName: 'CAM_GATE_01',
        cameraId: 'cam-001',
        locationName: 'Cổng chính - Khu A',
        areaId: 'area-01',
        timestamp: '07/10/2026 08:05:00',
        matchedTags: ['Người'],
        totalCriteriaCount: 3,
        matchedCriteriaCount: 1,
        playbackUrl: '/playback?id=item-003&t=080500',
      },
    ];

    return {
      statusCode: 200,
      totalResults: 3,
      totalCameras: 1,
      totalAreas: 1,
      page: 1,
      pageSize: 10,
      data: items,
    };
  }

  /**
   * Bộ dữ liệu 17 kết quả phân trang (8 item / trang)
   */
  static buildPaginationDataset(page = 1, pageSize = 8): MockSearchResponse {
    const total = 17;
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, total);

    const data: MockSearchResultItem[] = [];
    for (let i = startIndex; i < endIndex; i++) {
      data.push({
        id: `page-item-${i + 1}`,
        thumbnailUrl: `/assets/mock/thumb_${i + 1}.jpg`,
        relevanceScore: Math.max(20, 100 - i * 4),
        cameraName: `CAM_ZONE_${(i % 3) + 1}`,
        cameraId: `cam-00${(i % 3) + 1}`,
        locationName: `Khu vực ${(i % 3) + 1}`,
        areaId: `area-00${(i % 3) + 1}`,
        timestamp: `07/10/2026 14:${String(i).padStart(2, '0')}:00`,
        matchedTags: ['Phương tiện', 'Xe máy'],
        totalCriteriaCount: 2,
        matchedCriteriaCount: 2,
      });
    }

    return {
      statusCode: 200,
      totalResults: total,
      totalCameras: 3,
      totalAreas: 3,
      page,
      pageSize,
      data,
    };
  }

  /**
   * Response rỗng: 200 OK nhưng 0 kết quả
   */
  static buildEmptyResponse(): MockSearchResponse {
    return {
      statusCode: 200,
      totalResults: 0,
      totalCameras: 0,
      totalAreas: 0,
      page: 1,
      pageSize: 10,
      data: [],
    };
  }

  /**
   * Response cảnh báo điều kiện chưa hỗ trợ (BR-NL-01..03)
   */
  static buildUnsupportedConditionsResponse(): MockSearchResponse {
    return {
      statusCode: 200,
      totalResults: 2,
      totalCameras: 1,
      totalAreas: 1,
      page: 1,
      pageSize: 10,
      data: [
        {
          id: 'item-sup-01',
          thumbnailUrl: '/assets/mock/thumb_sup.jpg',
          relevanceScore: 100,
          cameraName: 'CAM_01',
          cameraId: 'cam-01',
          locationName: 'Sảnh chính',
          areaId: 'area-01',
          timestamp: '07/10/2026 11:00:00',
          matchedTags: ['Người', 'Áo đen'],
        },
      ],
      unsupportedConditions: ['chạy nhảy với tốc độ cao'],
    };
  }
}
