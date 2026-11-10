/**
 * Data builder phục vụ các test case @mock
 * Tạo các dataset theo ĐÚNG CONTRACT THỰC TẾ của Backend API: /api/smart_search
 * { message: {...}, data: { query: '...', total: N, items: [...] } }
 */
export class SmartSearchMockBuilder {
  /**
   * Bộ dữ liệu 3 kết quả với các mức relevance chuẩn xác: 100% (3/3), 67% (2/3), 33% (1/3)
   * Phục vụ test: Slider filter min-max, Sort relevance descending, Tag verification
   */
  static build3TierRelevanceDataset(query = 'Người áo đỏ mang balo') {
    return {
      message: { en: 'Data retrieved successfully', vi: 'Lấy dữ liệu thành công' },
      data: {
        query,
        start_time: '2026-09-30T17:00:00Z',
        end_time: '2026-10-07T16:59:59.999000Z',
        total: 3,
        items: [
          {
            segment_id: 'mock-rel-100',
            camera_id: 'LH-LTT-HV_CAM-01',
            camera_name: 'LH-LTT-HV_CAM-01',
            start_time: '2026-10-07T09:34:39.044312Z',
            end_time: '2026-10-07T09:34:53.563034Z',
            score: 1,
            relevance_score: 100,
            display_score: 100,
            display_score_type: 'relevance',
            matched_filter_count: 3,
            total_filter_count: 3,
            summary: 'Người mặc áo đỏ mang balo di chuyển qua cổng chính.',
            thumb_url: '/security-events/2026-10-07/event_retrieval/da3bc738-f37b-41a4-8f52-dbea643e2889-4.jpg',
            playback_url: '/recording/LH-LTT-HV_CAM-01/start/1791365679/end/1791365694/index.m3u8',
            objects: [
              { class: 'person', color: 'red', accessories: 'backpack' }
            ]
          },
          {
            segment_id: 'mock-rel-067',
            camera_id: 'LH-LTT-DK_CAM-04',
            camera_name: 'LH-LTT-DK_CAM-04',
            start_time: '2026-10-07T09:34:23.974949Z',
            end_time: '2026-10-07T09:34:39.853660Z',
            score: 0.67,
            relevance_score: 67,
            display_score: 67,
            display_score_type: 'relevance',
            matched_filter_count: 2,
            total_filter_count: 3,
            summary: 'Người mặc áo đỏ di chuyển.',
            thumb_url: '/security-events/2026-10-07/event_retrieval/e8c66573-cf45-41a2-a529-478c6213b703-4.jpg',
            playback_url: '/recording/LH-LTT-DK_CAM-04/start/1791365663/end/1791365680/index.m3u8',
            objects: [
              { class: 'person', color: 'red' }
            ]
          },
          {
            segment_id: 'mock-rel-033',
            camera_id: 'AIOT1',
            camera_name: 'AIOT1',
            start_time: '2026-10-07T09:30:00.000000Z',
            end_time: '2026-10-07T09:30:15.000000Z',
            score: 0.33,
            relevance_score: 33,
            display_score: 33,
            display_score_type: 'relevance',
            matched_filter_count: 1,
            total_filter_count: 3,
            summary: 'Người đi bộ qua khu vực.',
            thumb_url: '/security-events/2026-10-07/event_retrieval/6bea9c87-5275-4f6b-8168-77f94eba673a-4.jpg',
            playback_url: '/recording/AIOT1/start/1791365400/end/1791365415/index.m3u8',
            objects: [
              { class: 'person' }
            ]
          }
        ]
      }
    };
  }

  /**
   * Bộ dữ liệu 17 kết quả phân trang (8 item / trang cho List view)
   */
  static buildPaginationDataset(total = 17) {
    const items = [];
    for (let i = 0; i < total; i++) {
      items.push({
        segment_id: `mock-page-item-${i + 1}`,
        camera_id: `CAM-ZONE-${(i % 3) + 1}`,
        camera_name: `CAM_ZONE_${(i % 3) + 1}`,
        start_time: `2026-10-07T10:${String(i).padStart(2, '0')}:00.000000Z`,
        end_time: `2026-10-07T10:${String(i).padStart(2, '0')}:15.000000Z`,
        score: Math.max(0.2, (100 - i * 4) / 100),
        relevance_score: Math.max(20, 100 - i * 4),
        display_score: Math.max(20, 100 - i * 4),
        display_score_type: 'relevance',
        summary: `Phương tiện di chuyển số ${i + 1}`,
        thumb_url: '/security-events/2026-10-07/event_retrieval/da3bc738-f37b-41a4-8f52-dbea643e2889-4.jpg',
        playback_url: '/recording/CAM/index.m3u8',
        objects: [{ class: 'vehicle', vehicle_type: 'motorbike' }]
      });
    }

    return {
      message: { en: 'Data retrieved successfully', vi: 'Lấy dữ liệu thành công' },
      data: {
        query: 'phương tiện',
        start_time: '2026-09-30T17:00:00Z',
        end_time: '2026-10-07T16:59:59.999000Z',
        total,
        items
      }
    };
  }

  /**
   * Response rỗng: 200 OK nhưng 0 kết quả
   */
  static buildEmptyResponse() {
    return {
      message: { en: 'No data', vi: 'Không có dữ liệu' },
      data: {
        query: 'không_tồn_tại',
        start_time: '2026-09-30T17:00:00Z',
        end_time: '2026-10-07T16:59:59.999000Z',
        total: 0,
        items: []
      }
    };
  }

  /**
   * Response cảnh báo điều kiện chưa hỗ trợ (BR-NL-02)
   */
  static buildUnsupportedConditionsResponse() {
    return {
      message: { en: 'Partially supported query', vi: 'Một số điều kiện chưa được hỗ trợ' },
      data: {
        query: 'chạy nhảy tốc độ cao',
        start_time: '2026-09-30T17:00:00Z',
        end_time: '2026-10-07T16:59:59.999000Z',
        total: 1,
        unsupported_conditions: ['nhảy múa tốc độ cao'],
        items: [
          {
            segment_id: 'mock-sup-1',
            camera_id: 'AIOT1',
            camera_name: 'AIOT1',
            start_time: '2026-10-07T11:00:00Z',
            end_time: '2026-10-07T11:01:00Z',
            score: 1,
            relevance_score: 100,
            summary: 'Người đi bộ.',
            thumb_url: '/security-events/2026-10-07/event_retrieval/da3bc738-f37b-41a4-8f52-dbea643e2889-4.jpg',
            objects: [{ class: 'person' }]
          }
        ]
      }
    };
  }
}
