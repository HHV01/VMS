/**
 * TẬP HỢP TOÀN BỘ GIẢ ĐỊNH (ASSUMPTIONS) CHO SMART SEARCH (TÌM KIẾM THÔNG MINH)
 * Mọi spec test và data builder đọc từ file này, không hard-code giá trị giả định.
 */

export const SMART_SEARCH_ASSUMPTIONS = {
  /**
   * [A-01] Slider Độ liên quan mặc định là 0% – 100%, step = 1%
   * Nguồn nghi vấn: PSD chưa ghi rõ giá trị khởi tạo; BA chốt là slider 2 đầu kéo.
   */
  A_01_SLIDER_DEFAULT_RANGE: {
    min: 0,
    max: 100,
    step: 1,
    defaultLabel: '0% – 100%',
  },

  /**
   * [A-02] Badge số cạnh tiêu đề section "Độ liên quan"
   * = số filter đang áp dụng khác mặc định (ẩn hoặc 0 khi để 0% - 100%).
   * Nguồn nghi vấn: Wireframe có badge số lượng filter.
   */
  A_02_RELEVANCE_BADGE_SHOWS_ACTIVE_COUNT: true,

  /**
   * [A-03] Công thức tính Relevance khi query chứa nhiều object
   * Relevance (%) = tổng số tiêu chí khớp / tổng số tiêu chí của tất cả object (gộp chung) * 100.
   * Nguồn nghi vấn: PSD chưa quy định rõ tính theo từng object hay gộp chung.
   */
  A_03_MULTI_OBJECT_RELEVANCE_MODE: 'COMBINED_CRITERIA' as const,

  /**
   * [A-04] Nơi tính toán Relevance & xử lý lọc Slider
   * Giả định: Relevance do backend tính toán và trả về trong từng item; Slider gửi min_relevance / max_relevance trong payload request lên backend.
   * Nguồn nghi vấn: Chưa có xác nhận kiến trúc từ Dev.
   */
  A_04_RELEVANCE_BACKEND_FILTERING: true,

  /**
   * [A-05] Mặc định thời gian:
   * - NL Search khi câu query không chứa ngày giờ: theo BR-TIME-01 (7 ngày gần nhất, cả ngày).
   * - Advanced Filter mặc định khi mở: theo PSD 2.2 (ngày hiện tại, 00:00:00 -> 23:59:59).
   * Nguồn nghi vấn: Mâu thuẫn giữa PSD 2.2 và BR-TIME-01.
   */
  A_05_TIME_DEFAULT_NL: '7_DAYS_PAST' as const,
  A_05_TIME_DEFAULT_FILTER: 'TODAY' as const,

  /**
   * [A-06] Loại bỏ hoàn toàn Độ tin cậy (Confidence)
   * Không viết test cho Confidence hay Sort theo Confidence theo Chốt BA #5.
   */
  A_06_IGNORE_CONFIDENCE_METRICS: true,

  /**
   * [A-07] Định dạng và dung lượng Upload Ảnh (Xác nhận từ UI VMS 2.8.0):
   * Định dạng hỗ trợ: JPG, PNG; dung lượng tối đa: 10 MB.
   * Giao diện hiển thị: "Chọn ảnh hoặc kéo thả vào đây / Dán ảnh bằng Ctrl + V cũng được. JPG / PNG, tối đa 10 MB."
   */
  A_07_UPLOAD_IMAGE_SPECS: {
    formats: ['jpg', 'png', 'jpeg'],
    maxSizeMB: 10,
    supportsPaste: true,
  },

  /**
   * [A-08] Upload Video KHÔNG được hỗ trợ
   * PSD không mô tả và giao diện thật không có ô upload video (input chỉ accept="image/*").
   * Ghi nhận và chờ BA xác nhận.
   */
  A_08_UPLOAD_VIDEO_UNSUPPORTED: true,

  /**
   * [A-09] Tìm kiếm chỉ bằng Ảnh (không có từ khóa)
   * Giả định: Cho phép tìm kiếm chỉ bằng ảnh đã chọn đối tượng, nút Tìm kiếm vẫn được kích hoạt.
   */
  A_09_IMAGE_ONLY_SEARCH_ALLOWED: true,

  /**
   * [A-10] Giới hạn số lượng kết quả (Hard limit 200)
   * Backend API /api/smart_search có limit mặc định = 200 items.
   */
  A_10_BACKEND_MAX_LIMIT_200: 200,

  /**
   * [A-11] Mốc chuẩn hóa thời gian: "khoảng xh" (12:30–12:30)
   * Nghi vấn lỗi đặc tả trong PSD. Đưa vào câu hỏi BA; không assert cứng mốc này.
   */
  A_11_PENDING_BA_TIME_ROUNDING_ERROR: true,
};

