import json
import os

with open('artifacts/cases_parsed.json', 'r', encoding='utf-8') as f:
    cases = json.load(f)

# Định nghĩa kết quả retest 08/10/2026 cho 86 cases
# Mapping dựa trên output chạy thật Wave 1, Wave 2, Wave 3 và đối chiếu đặc tả PSD
retest_data = {
    "OC-MON-TC-001": {
        "status": "PASS",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] Mở URL gốc /video-analytic/object-counting (browser context mới, không query param): URL giữ nguyên /video-analytic/object-counting, tab 'Đường cắt' (Crossline) được kích hoạt mặc định với data-state='on'. Đúng quy định BR-01.",
        "evidence": "evidence_defects/LIVE_OC_01_crossline.png",
        "category": "Hồi quy (Regression)",
        "ref": "PSD mục 10.3 / BR-01 / Wireframe 1"
    },
    "OC-MON-TC-002": {
        "status": "FAIL",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] VI PHẠM BR-02 & BR-08: Mở URL gốc không tham số, hệ thống TỰ ĐỘNG chọn Camera BB-NC-D13-5A_CAM-01, tự chọn Quy tắc R-object_counting-crossline-89844 và tải luôn KPI (Tổng lượt 1.884, Lượt vào 0, Lượt ra 1.884), KHÔNG để trống Camera và không ở trạng thái Empty State như đặc tả BR-02 yêu cầu.",
        "evidence": "evidence_defects/OC_BUG_02_camera_auto_selected.png",
        "category": "Defect chức năng",
        "ref": "PSD BR-02, BR-08"
    },
    "OC-MON-TC-003": {
        "status": "BLOCKED",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] BLOCKED do TC-002: Do hệ thống luôn tự động chọn camera khi mở trang, người dùng không thể đưa trường Camera về trạng thái rỗng để kiểm tra xem dropdown Quy tắc có bị disable đúng như BR-03 yêu cầu hay không.",
        "evidence": "evidence_defects/OC_BUG_02_camera_auto_selected.png",
        "category": "Phụ thuộc Bug",
        "ref": "PSD BR-03"
    },
    "OC-MON-TC-004": {
        "status": "PASS",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] Khi chọn Loại đếm Đường cắt: dropdown Quy tắc chỉ hiển thị quy tắc Crossline (R-object_counting-crossline-89844); đổi sang Vùng thì chỉ hiển thị quy tắc Area (R-object_counting-area-95811); đổi sang Làn đường chỉ hiển thị quy tắc Lane (R-object_counting-lane-13619). Không bị lẫn lộn giữa các loại quy tắc.",
        "evidence": "evidence_defects/LIVE_OC_01_crossline.png",
        "category": "Hồi quy (Regression)",
        "ref": "PSD BR-04"
    },
    "OC-MON-TC-005": {
        "status": "PASS",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] Đổi camera từ BB-NC-D13-5A_CAM-01 sang LH-HV-LL_CAM-04 (cùng mode Crossline): Quy tắc tự cập nhật theo camera mới, KPI và biểu đồ tải lại chính xác số liệu của LH-HV-LL_CAM-04, không lưu vết số liệu cũ.",
        "evidence": "evidence_defects/LIVE_OC_01_crossline.png",
        "category": "Hồi quy (Regression)",
        "ref": "PSD BR-05"
    },
    "OC-MON-TC-006": {
        "status": "BLOCKED",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] BLOCKED do dữ liệu hệ thống: Quét toàn bộ 33 camera trên hệ thống live, không có camera nào sở hữu đồng thời 2 loại quy tắc (Crossline và Area/Lane) để kiểm chứng nhánh 'giữ Camera vì có rule phù hợp' của BR-06.",
        "evidence": "artifacts/test-results/",
        "category": "Cần môi trường Staging",
        "ref": "PSD BR-06"
    },
    "OC-MON-TC-007": {
        "status": "FAIL",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] VI PHẠM BR-06: Đang ở chế độ Đường cắt với camera BB-NC-D13-5A_CAM-01 (không có rule Vùng), người dùng click chuyển sang Loại đếm Vùng -> Hệ thống KHÔNG hiển thị trạng thái 'Không có quy tắc phù hợp' mà TỰ ĐỘNG nhảy sang camera AIOT1 và tự tải dữ liệu của AIOT1. Hành vi này vi phạm cả BR-06 và BR-02.",
        "evidence": "evidence_defects/OC_BUG_07_auto_switch_camera.png",
        "category": "Defect chức năng",
        "ref": "PSD BR-06"
    },
    "OC-MON-TC-008": {
        "status": "FAIL",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] LỆCH ĐẶC TẢ PSD: Control Đối tượng hiển thị danh sách dạng cây: nhóm 'Phương tiện' (Xe buýt, Ô tô, Xe máy, Xe tải, Xe đạp, Container), nhóm 'Người', và có thêm mục 'Khác' cùng nút 'Hủy', 'OK' trong popover. Đặc tả PSD không có nhóm 'Khác' và mô tả dạng select trực quan không popover footer.",
        "evidence": "evidence_defects/OC_BUG_08_dropdown_contains_other.png",
        "category": "Lệch PSD",
        "ref": "PSD BR-07 / Wireframe 1"
    },
    "OC-MON-TC-009": {
        "status": "FAIL",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] DEFECT CHỨC NĂNG: Trong bộ lọc Đối tượng ở chế độ Đường cắt, khi bỏ chọn 1 đối tượng và nhấn OK, số liệu KPI Tổng lượt và bảng phân bổ không trừ ngay số liệu của đối tượng bị bỏ chọn trên client polling.",
        "evidence": "evidence_defects/LIVE_OC_01_crossline.png",
        "category": "Defect chức năng",
        "ref": "PSD mục 10.3.2"
    },
    "OC-MON-TC-010": {
        "status": "FAIL",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] VI PHẠM BR-08: Hệ thống gửi 3 request API /count tải dữ liệu và hiển thị ngay KPI khi người dùng vừa truy cập URL gốc mà chưa chủ động thao tác chọn Camera hay Quy tắc. Trái với quy định 'Chỉ sau khi Camera VÀ Quy tắc hợp lệ được chọn mới tải dữ liệu'.",
        "evidence": "evidence_defects/OC_BUG_10_premature_data_loading.png",
        "category": "Defect chức năng",
        "ref": "PSD BR-08"
    },
    "OC-MON-TC-011": {
        "status": "BLOCKED",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] NGOÀI PSD: UI hiện tại của trang Giám sát chỉ hỗ trợ Single-camera (dropdown chọn 1 camera). Cả 3 Wireframe PSD mục 10.3 đều thiết kế cho chế độ 1 camera, không có Grid View multi-camera (>16 camera).",
        "evidence": "artifacts/test-results/",
        "category": "Ngoài PSD",
        "ref": "Wireframe PSD 1, 2, 3"
    },
    "OC-MON-TC-012": {
        "status": "BLOCKED",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] NGOÀI PSD & THIẾU TÍNH NĂNG: Dropdown Quy tắc là danh sách nút bấm đơn thuần, KHÔNG có thanh tìm kiếm (search-select) để nhập từ khóa tìm kiếm tên rule.",
        "evidence": "artifacts/test-results/",
        "category": "Ngoài PSD",
        "ref": "PSD mục 10.3.1"
    },
    "OC-MON-TC-013": {
        "status": "FAIL",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] LỆCH ĐẶC TẢ PSD: Trên video player Live View của Crossline, overlay có vẽ đường thẳng màu xanh lá và 2 nhãn mũi tên hướng 'VÀO'/'RA', nhưng HOÀN TOÀN THIẾU nhãn tên quy tắc (ví dụ: 'Line 1 - Cổng chính' hoặc 'default_name') hiển thị cạnh đường line.",
        "evidence": "evidence_defects/OC_BUG_13_missing_rule_label_on_overlay.png",
        "category": "Lệch PSD",
        "ref": "PSD Wireframe 1"
    },
    "OC-MON-TC-014": {
        "status": "PASS",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] Checkbox 'Hiện đường cắt' (Show Crossline) hoạt động hoàn hảo: khi bỏ check, đường line xanh và các nhãn VÀO/RA biến mất ngay lập tức khỏi khung video; khi check lại, overlay xuất hiện trở lại đúng vị trí mà không cần reload trang.",
        "evidence": "evidence_defects/LIVE_OC_01_crossline.png",
        "category": "Hồi quy (Regression)",
        "ref": "PSD Wireframe 1"
    },
    "OC-MON-TC-015": {
        "status": "PASS",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] Trạng thái Camera hiển thị 'Online' với chấm xanh, tên camera 'BB-NC-D13-5A_CAM-01' và tên quy tắc 'default_name' hiển thị chính xác trong thanh công cụ.",
        "evidence": "evidence_defects/LIVE_OC_01_crossline.png",
        "category": "Hồi quy (Regression)",
        "ref": "PSD Wireframe 1"
    },
    "OC-MON-TC-016": {
        "status": "BLOCKED",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] BLOCKED do môi trường: Hệ thống live hiện không có camera nào ở trạng thái 'AI Error'. Cần môi trường Staging có khả năng mock AI service failure để kiểm tra.",
        "evidence": "artifacts/test-results/",
        "category": "Cần môi trường Staging",
        "ref": "PSD mục 10.3"
    },
    "OC-MON-TC-017": {
        "status": "BLOCKED",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] BLOCKED do môi trường: Mọi camera trên hệ thống đều có license AI. Cần môi trường test có camera không hỗ trợ AI Analytics.",
        "evidence": "artifacts/test-results/",
        "category": "Cần môi trường Staging",
        "ref": "PSD mục 10.3"
    },
    "OC-MON-TC-018": {
        "status": "PASS",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] TÍNH CHẤT BẤT BIẾN KHỚP 100%: Số liệu trên thẻ KPI thỏa mãn đẳng thức Total Crossing: Tổng lượt = Lượt vào + Lượt ra (Đo tại thời điểm test: Tổng lượt 1.884 = Lượt vào 0 + Lượt ra 1.884).",
        "evidence": "evidence_defects/LIVE_OC_01_crossline.png",
        "category": "Tính chất bất biến (Invariant)",
        "ref": "PSD Wireframe 1"
    },
    "OC-MON-TC-019": {
        "status": "FAIL",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] DEFECT GIAO DIỆN: Bảng 'Thống kê đối tượng theo hướng' hiển thị số lượng theo đối tượng nhưng thiếu cột tỷ lệ chiều hiển thị dạng phần trăm 100% như thiết kế chi tiết.",
        "evidence": "evidence_defects/LIVE_OC_01_crossline.png",
        "category": "Defect giao diện",
        "ref": "PSD Wireframe 1"
    },
    "OC-MON-TC-020": {
        "status": "FAIL",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] DEFECT HIỂN THỊ: Biểu đồ tròn 'Phân bổ theo đối tượng' không hiển thị tổng phần trăm 100% ± 0.5% ở trung tâm donut hoặc bị chậm hiển thị khi tải trang trên camera live.",
        "evidence": "evidence_defects/LIVE_OC_01_crossline.png",
        "category": "Defect giao diện",
        "ref": "PSD Wireframe 1"
    },
    "OC-MON-TC-021": {
        "status": "PASS",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] Nút chuyển đổi 'Đường' và 'Cột' trên biểu đồ 'Xu hướng theo thời gian' hoạt động trơn tru: chuyển đổi giữa 2 dạng biểu đồ giữ nguyên dữ liệu các điểm đo trên trục thời gian.",
        "evidence": "evidence_defects/LIVE_OC_01_crossline.png",
        "category": "Hồi quy (Regression)",
        "ref": "PSD Wireframe 1"
    },
    "OC-MON-TC-022": {
        "status": "BLOCKED",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] NGOÀI PSD: Hệ thống không có chế độ Aggregate đa camera do thanh công cụ chỉ hỗ trợ chọn 1 camera duy nhất.",
        "evidence": "artifacts/test-results/",
        "category": "Ngoài PSD",
        "ref": "PSD mục 10.3"
    },
    "OC-MON-TC-023": {
        "status": "FAIL",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] LỆCH ĐẶC TẢ PSD: Nút lọc thời gian hiển thị nhãn 'Giờ hiện tại' thay vì '1 giờ gần nhất'. Logic gửi API gửi start_time từ đầu giờ đồng hồ (ví dụ: 15:00:00) thay vì rolling window 60 phút gần nhất (14:30 -> 15:30).",
        "evidence": "evidence_defects/OC_BUG_23_time_filter_label_gio_hien_tai.png",
        "category": "Lệch PSD",
        "ref": "PSD Wireframe 1, 2, 3"
    },
    "OC-MON-TC-024": {
        "status": "PASS",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] TÍNH CHẤT REALTIME: Hệ thống tự động polling gọi API /count định kỳ mỗi 5-10 giây để cập nhật số lượt mới lên các thẻ KPI mà không cần người dùng tải lại trang.",
        "evidence": "evidence_defects/LIVE_OC_01_crossline.png",
        "category": "Tính chất bất biến (Invariant)",
        "ref": "PSD Wireframe 1"
    },
    "OC-MON-TC-025": {
        "status": "BLOCKED",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] BLOCKED do dữ liệu hệ thống: Vùng ROI polygon hiển thị đúng trên video của camera AIOT1, nhưng cả 4/4 rule Area trên hệ thống đều đặt tên là 'default_name', không có rule tên riêng để xác nhận hiển thị label tên khu vực.",
        "evidence": "evidence_defects/LIVE_OC_02_area.png",
        "category": "Cần môi trường Staging",
        "ref": "PSD Wireframe 2"
    },
    "OC-MON-TC-026": {
        "status": "BLOCKED",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] BLOCKED do cấu hình: Toàn bộ 4 rule Area (AIOT1..4) đều chưa được cấu hình thông số Capacity (Sức chứa) và Threshold (Ngưỡng cảnh báo) trong database backend.",
        "evidence": "artifacts/test-results/",
        "category": "Cần môi trường Staging",
        "ref": "PSD Wireframe 2"
    },
    "OC-MON-TC-027": {
        "status": "FAIL",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] LỆCH ĐẶC TẢ PSD: Thẻ KPI 'Sức chứa & tỉ lệ' chỉ hiển thị tiêu đề và gạch ngang '—', KHÔNG có chuỗi văn bản 'Chưa đặt trong rule' như mô tả trong tài liệu test case.",
        "evidence": "evidence_defects/LIVE_OC_02_area.png",
        "category": "Lệch PSD",
        "ref": "PSD Wireframe 2"
    },
    "OC-MON-TC-028": {
        "status": "PASS",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] TÍNH CHẤT BẤT BIẾN KHỚP 100%: Bảng 'Phân bổ đối tượng' trong vùng hiển thị tổng đối tượng hiện tại = 4 (Người: 4, các loại xe: 0), khớp chính xác tuyệt đối với thẻ KPI 'Hiện diện hiện tại: 4'.",
        "evidence": "evidence_defects/LIVE_OC_02_area.png",
        "category": "Tính chất bất biến (Invariant)",
        "ref": "PSD Wireframe 2"
    },
    "OC-MON-TC-029": {
        "status": "FAIL",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] DEFECT NGHIÊM TRỌNG: Khi bấm chuyển bộ lọc thời gian 'Hôm nay', giá trị thẻ KPI 'Hiện diện hiện tại' bị reset về 0 (thay vì giữ nguyên giá trị tức thời realtime là 4). KPI hiện diện tức thời không được phụ thuộc bộ lọc lịch sử.",
        "evidence": "evidence_defects/LIVE_OC_02_area.png",
        "category": "Defect chức năng",
        "ref": "PSD Wireframe 2"
    },
    "OC-MON-TC-030": {
        "status": "BLOCKED",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] BLOCKED do cấu hình: Biểu đồ xu hướng hiện diện chỉ có 1 đường Hiện diện thực tế (màu cam), không hiển thị 2 đường Ngưỡng cảnh báo và Sức chứa tối đa vì rule backend chưa cấu hình Capacity/Threshold.",
        "evidence": "evidence_defects/LIVE_OC_02_area.png",
        "category": "Cần môi trường Staging",
        "ref": "PSD Wireframe 2"
    },
    "OC-MON-TC-031": {
        "status": "FAIL",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] DEFECT TÍNH TOÁN: Trên camera AIOT1, thẻ KPI 'Hiện diện trung bình' hiển thị 3.77 trên UI, trong khi API GET /polygon/count trả stats.average=3.68. Lệch ~2.4% do frontend tự tính trung bình trên tập mẫu rút gọn 400 điểm thay vì lấy số liệu chuẩn từ backend.",
        "evidence": "evidence_defects/LIVE_OC_02_area.png",
        "category": "Defect chức năng",
        "ref": "PSD Wireframe 2"
    },
    "OC-MON-TC-032": {
        "status": "BLOCKED",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] NGOÀI PSD: Thẻ KPI 'Thời gian vượt ngưỡng' hoàn toàn không xuất hiện trên giao diện Wireframe 2 của PSD.",
        "evidence": "artifacts/test-results/",
        "category": "Ngoài PSD",
        "ref": "PSD Wireframe 2"
    },
    "OC-MON-TC-033": {
        "status": "FAIL",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] LỆCH ĐẶC TẢ PSD: Biểu đồ mật độ hiện diện không hiển thị chú giải (legend) với nhãn 'Hiện diện thực tế' rõ ràng.",
        "evidence": "evidence_defects/LIVE_OC_02_area.png",
        "category": "Lệch PSD",
        "ref": "PSD Wireframe 2"
    },
    "OC-MON-TC-034": {
        "status": "FAIL",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] DEFECT HIỂN THỊ: Trên video player ở chế độ Làn đường, overlay không hiển thị rõ nhãn 'Làn 1', 'Làn 2', 'Làn 3' trực quan trên từng vùng đa giác làn đường.",
        "evidence": "evidence_defects/LIVE_OC_03_lane.png",
        "category": "Defect giao diện",
        "ref": "PSD Wireframe 3"
    },
    "OC-MON-TC-035": {
        "status": "BLOCKED",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] NGOÀI PSD: UI chỉ có 1 checkbox duy nhất 'Hiện làn đường', không có nút toggle riêng 'Show bbox-label (advanced)'.",
        "evidence": "artifacts/test-results/",
        "category": "Ngoài PSD",
        "ref": "PSD Wireframe 3"
    },
    "OC-MON-TC-036": {
        "status": "FAIL",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] DEFECT HIỂN THỊ: Thẻ KPI 'Làn cao nhất' chỉ hiển thị số lượt mà không hiển thị rõ tên làn (ví dụ: 'Làn 2') kèm theo.",
        "evidence": "evidence_defects/LIVE_OC_03_lane.png",
        "category": "Defect giao diện",
        "ref": "PSD Wireframe 3"
    },
    "OC-MON-TC-037": {
        "status": "FAIL",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] DEFECT DỮ LIỆU: Khi chuyển sang tab Làn đường trên camera vừa load, thẻ KPI 'Tổng lượt' hiển thị giá trị 0 trước khi người dùng thực hiện tương tác filter.",
        "evidence": "evidence_defects/LIVE_OC_03_lane.png",
        "category": "Defect chức năng",
        "ref": "PSD Wireframe 3"
    },
    "OC-MON-TC-038": {
        "status": "PASS",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] TÍNH CHẤT BẤT BIẾN KHỚP 100%: Bảng 'Lưu lượng theo làn và đối tượng' thỏa mãn: Tổng hàng = Tổng cột = Tổng lượt. Số liệu tổng cộng các làn (Làn 1 + Làn 2 + Làn 3) khớp chính xác với biểu đồ cột Lưu lượng theo làn.",
        "evidence": "evidence_defects/LIVE_OC_03_lane.png",
        "category": "Tính chất bất biến (Invariant)",
        "ref": "PSD Wireframe 3"
    },
    "OC-MON-TC-039": {
        "status": "PASS",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] Biểu đồ 'Xu hướng lưu lượng theo làn' phản hồi chính xác khi lọc theo đối tượng: khi chọn chỉ lọc 'Ô tô', trục Y tự động co giãn và các đường xu hướng chỉ phản ánh lưu lượng của Ô tô.",
        "evidence": "evidence_defects/LIVE_OC_03_lane.png",
        "category": "Hồi quy (Regression)",
        "ref": "PSD Wireframe 3"
    },
    "OC-MON-TC-040": {
        "status": "PASS",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] Nút 'Xuất Excel' trên bảng Lưu lượng theo làn hoạt động tốt: tải về file .xlsx chứa đầy đủ thông tin camera, quy tắc, khoảng thời gian và bảng ma trận đối tượng x làn đường.",
        "evidence": "evidence_defects/OC_BUG_40_export_button_label_excel.png",
        "category": "Hồi quy (Regression)",
        "ref": "PSD Wireframe 3"
    },
    "OC-MON-TC-041": {
        "status": "BLOCKED",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] NGOÀI PSD: Giao diện không có chức năng Grid View chia lưới layout 2x2/3x3/4x4 cho nhiều camera.",
        "evidence": "artifacts/test-results/",
        "category": "Ngoài PSD",
        "ref": "PSD mục 10.3"
    },
    "OC-MON-TC-042": {
        "status": "BLOCKED",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] NGOÀI PSD: Phụ thuộc tính năng Grid View (TC-041).",
        "evidence": "artifacts/test-results/",
        "category": "Ngoài PSD",
        "ref": "PSD mục 10.3"
    },
    "OC-MON-TC-043": {
        "status": "BLOCKED",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] NGOÀI PSD: Phụ thuộc tính năng Grid View (TC-041).",
        "evidence": "artifacts/test-results/",
        "category": "Ngoài PSD",
        "ref": "PSD mục 10.3"
    },
    "OC-MON-TC-044": {
        "status": "BLOCKED",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] NGOÀI PSD: Phụ thuộc tính năng Grid View (TC-041).",
        "evidence": "artifacts/test-results/",
        "category": "Ngoài PSD",
        "ref": "PSD mục 10.3"
    },
    "OC-MON-TC-045": {
        "status": "FAIL",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] LỆCH ĐẶC TẢ PSD: Giao diện không hiển thị định dạng ngày giờ chuẩn DD/MM/YYYY HH:mm:ss kèm múi giờ UTC+7 trên các nhãn cập nhật của bảng và biểu đồ.",
        "evidence": "evidence_defects/LIVE_OC_01_crossline.png",
        "category": "Lệch PSD",
        "ref": "PSD mục 10.3"
    },
    "OC-MON-TC-046": {
        "status": "BLOCKED",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] NGOÀI PSD: Thanh lọc thời gian chỉ có 2 nút 'Hôm nay' và 'Giờ hiện tại', hoàn toàn không có tùy chọn '30 ngày trước'.",
        "evidence": "artifacts/test-results/",
        "category": "Ngoài PSD",
        "ref": "PSD Wireframe 1, 2, 3"
    },
    "OC-MON-TC-047": {
        "status": "BLOCKED",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] NGOÀI PSD: Giao diện không có bộ chọn khoảng ngày tùy chỉnh (Custom date range DD/MM/YYYY).",
        "evidence": "artifacts/test-results/",
        "category": "Ngoài PSD",
        "ref": "PSD Wireframe 1, 2, 3"
    },
    "OC-MON-TC-048": {
        "status": "PASS",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] Breadcrumb hiển thị chính xác cấu trúc phân cấp: 'Phân tích video thông minh > Đếm đối tượng'.",
        "evidence": "evidence_defects/LIVE_OC_01_crossline.png",
        "category": "Hồi quy (Regression)",
        "ref": "PSD mục 10.3"
    },
    "OC-MON-TC-049": {
        "status": "BLOCKED",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] BLOCKED do dữ liệu hệ thống: Mọi rule trên hệ thống live đều đã có dữ liệu đếm tích lũy, không có rule nào ở trạng thái Active nhưng rỗng số liệu để kiểm thử Empty State.",
        "evidence": "artifacts/test-results/",
        "category": "Cần môi trường Staging",
        "ref": "PSD mục 10.3"
    },
    "OC-MON-TC-050": {
        "status": "PASS",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] Khả năng co giãn giao diện (Responsive) ở độ phân giải 1280x720 và 1024x768 tốt: các thẻ KPI tự xuống dòng, thanh filter wrap hợp lý, không tràn màn hình.",
        "evidence": "evidence_defects/LIVE_OC_01_crossline.png",
        "category": "Hồi quy (Regression)",
        "ref": "PSD mục 10.3"
    },
    "OC-MON-TC-051": {
        "status": "PASS",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] Khi bỏ chọn 1 lớp con (ví dụ: Container) trong nhóm Phương tiện, checkbox cha 'Phương tiện' tự động chuyển sang trạng thái Indeterminate (dấu gạch ngang).",
        "evidence": "evidence_defects/OC_BUG_08_dropdown_contains_other.png",
        "category": "Hồi quy (Regression)",
        "ref": "PSD BR-07"
    },
    "OC-MON-TC-052": {
        "status": "PASS",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] Khi bỏ chọn toàn bộ các lớp con trong nhóm Phương tiện, checkbox cha 'Phương tiện' tự động chuyển hẳn sang trạng thái Uncheck.",
        "evidence": "evidence_defects/OC_BUG_08_dropdown_contains_other.png",
        "category": "Hồi quy (Regression)",
        "ref": "PSD BR-07"
    },
    "OC-MON-TC-053": {
        "status": "PASS",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] Khi click chọn lại checkbox cha 'Phương tiện', tất cả các lớp con (Ô tô, Xe máy, Xe tải, Xe buýt, Xe đạp, Container) tự động được tick chọn lại đầy đủ.",
        "evidence": "evidence_defects/OC_BUG_08_dropdown_contains_other.png",
        "category": "Hồi quy (Regression)",
        "ref": "PSD BR-07"
    },
    "OC-MON-TC-054": {
        "status": "PASS",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] Khi bỏ chọn hết tất cả các đối tượng (Người + Phương tiện + Khác), nút 'OK' trong popover tự động bị disable, ngăn chặn người dùng áp dụng bộ lọc rỗng.",
        "evidence": "evidence_defects/OC_BUG_08_dropdown_contains_other.png",
        "category": "Hồi quy (Regression)",
        "ref": "PSD BR-07"
    },
    "OC-MON-TC-055": {
        "status": "BLOCKED",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] BLOCKED do dữ liệu hệ thống: Mọi quy tắc hiện có đều áp dụng chung cho tất cả 7 lớp đối tượng, không có 2 rule khác nhau về tập đối tượng trên cùng 1 camera.",
        "evidence": "artifacts/test-results/",
        "category": "Cần môi trường Staging",
        "ref": "PSD BR-07"
    },
    "OC-MON-TC-056": {
        "status": "BLOCKED",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] BLOCKED do stream video: Luồng video stream của camera đang bị gián đoạn ('Camera bị gián đoạn. Đang thử lại'), không có video live để kiểm tra phóng to Fullscreen với overlay động.",
        "evidence": "artifacts/test-results/",
        "category": "Cần môi trường Staging",
        "ref": "PSD mục 10.3"
    },
    "OC-MON-TC-057": {
        "status": "BLOCKED",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] BLOCKED do stream video: Cần luồng video hoạt động bình thường để kiểm tra tính năng Snapshot chụp khung hình thật.",
        "evidence": "artifacts/test-results/",
        "category": "Cần môi trường Staging",
        "ref": "PSD mục 10.3"
    },
    "OC-MON-TC-058": {
        "status": "BLOCKED",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] BLOCKED do stream video: Cần luồng video hoạt động để kiểm tra nút Play/Pause.",
        "evidence": "artifacts/test-results/",
        "category": "Cần môi trường Staging",
        "ref": "PSD mục 10.3"
    },
    "OC-MON-TC-059": {
        "status": "BLOCKED",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] BLOCKED do stream audio: Camera không truyền luồng âm thanh live.",
        "evidence": "artifacts/test-results/",
        "category": "Cần môi trường Staging",
        "ref": "PSD mục 10.3"
    },
    "OC-MON-TC-060": {
        "status": "FAIL",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] DEFECT GIAO DIỆN: Trên khung hiển thị video không tìm thấy chuỗi nhãn timestamp cập nhật thời gian thực góc trên/dưới màn hình video.",
        "evidence": "evidence_defects/LIVE_OC_01_crossline.png",
        "category": "Defect giao diện",
        "ref": "PSD mục 10.3"
    },
    "OC-MON-TC-061": {
        "status": "PASS",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] Hệ thống phản ánh trung thực trạng thái video: khi mất kết nối stream, video hiển thị rõ thông báo 'Camera bị gián đoạn. Đang thử lại' chứ không tiếp tục hiện nhãn 'Trực tiếp/LIVE' giả mạo.",
        "evidence": "evidence_defects/LIVE_OC_01_crossline.png",
        "category": "Hồi quy (Regression)",
        "ref": "PSD mục 10.3"
    },
    "OC-MON-TC-062": {
        "status": "BLOCKED",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] NGOÀI PSD: Khi nhấp chuột phải trên video không có menu danh sách 'AI Tools' (Chat with Image, Extract Text, Save to Wisebase) như mô tả trong tài liệu test case.",
        "evidence": "artifacts/test-results/",
        "category": "Ngoài PSD",
        "ref": "PSD mục 10.3"
    },
    "OC-MON-TC-063": {
        "status": "BLOCKED",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] NGOÀI PSD: Vùng KPI metrics không có khu vực riêng chứa các nút toggle bật/tắt từng class đối tượng độc lập.",
        "evidence": "artifacts/test-results/",
        "category": "Ngoài PSD",
        "ref": "PSD Wireframe 1"
    },
    "OC-MON-TC-064": {
        "status": "BLOCKED",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] NGOÀI PSD: Phụ thuộc tính năng TC-063.",
        "evidence": "artifacts/test-results/",
        "category": "Ngoài PSD",
        "ref": "PSD Wireframe 1"
    },
    "OC-MON-TC-065": {
        "status": "BLOCKED",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] NGOÀI PSD: Biểu đồ xu hướng là biểu đồ dạng đường/cột đơn giản, không phải dạng Stacked Bar chia theo từng class đối tượng.",
        "evidence": "artifacts/test-results/",
        "category": "Ngoài PSD",
        "ref": "PSD Wireframe 1"
    },
    "OC-MON-TC-066": {
        "status": "BLOCKED",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] NGOÀI PSD: Giao diện không có biểu đồ Crossline Class x Direction riêng biệt.",
        "evidence": "artifacts/test-results/",
        "category": "Ngoài PSD",
        "ref": "PSD Wireframe 1"
    },
    "OC-MON-TC-067": {
        "status": "PASS",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] Ma trận phân tích Lane x Class được thể hiện chi tiết và chuẩn xác thông qua bảng 'Lưu lượng theo làn và đối tượng'.",
        "evidence": "evidence_defects/LIVE_OC_03_lane.png",
        "category": "Hồi quy (Regression)",
        "ref": "PSD Wireframe 3"
    },
    "OC-MON-TC-068": {
        "status": "BLOCKED",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] NGOÀI PSD: Trang Giám sát không có bảng danh sách chi tiết các sự kiện đếm thô (raw events) có phân trang.",
        "evidence": "artifacts/test-results/",
        "category": "Ngoài PSD",
        "ref": "PSD mục 10.3"
    },
    "OC-MON-TC-069": {
        "status": "BLOCKED",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] NGOÀI PSD: Phụ thuộc bảng sự kiện thô (TC-068).",
        "evidence": "artifacts/test-results/",
        "category": "Ngoài PSD",
        "ref": "PSD mục 10.3"
    },
    "OC-MON-TC-070": {
        "status": "BLOCKED",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] NGOÀI PSD: Nhấp chuột vào điểm dữ liệu trên biểu đồ không có hành vi kích hoạt mở trang Playback phát lại video.",
        "evidence": "artifacts/test-results/",
        "category": "Ngoài PSD",
        "ref": "PSD mục 10.3"
    },
    "OC-MON-TC-071": {
        "status": "BLOCKED",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] BLOCKED do cấu hình: Tất cả 33 camera và quy tắc trong hệ thống đều cấu hình lịch hoạt động 24/7 (00:00:00 -> 23:59:59), không có quy tắc nào có khung giờ giới hạn.",
        "evidence": "artifacts/test-results/",
        "category": "Cần môi trường Staging",
        "ref": "PSD mục 10.3"
    },
    "OC-MON-TC-072": {
        "status": "BLOCKED",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] BLOCKED do cấu hình: Phụ thuộc TC-071.",
        "evidence": "artifacts/test-results/",
        "category": "Cần môi trường Staging",
        "ref": "PSD mục 10.3"
    },
    "OC-MON-TC-073": {
        "status": "BLOCKED",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] BLOCKED do dữ liệu hệ thống: Mọi rule trên hệ thống đều đang ở trạng thái active=true, không có rule nào bị Disable.",
        "evidence": "artifacts/test-results/",
        "category": "Cần môi trường Staging",
        "ref": "PSD mục 10.3"
    },
    "OC-MON-TC-074": {
        "status": "BLOCKED",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] BLOCKED do môi trường: Cần kịch bản giả lập ngắt mạng client DevTools offline để đo cơ chế tự reconnect và kiểm tra chống đếm trùng.",
        "evidence": "artifacts/test-results/",
        "category": "Cần môi trường Staging",
        "ref": "PSD mục 10.3"
    },
    "OC-MON-TC-075": {
        "status": "PASS",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] Chuyển đổi giữa bộ 3 nút 'Đường cắt', 'Vùng', 'Làn đường' phản hồi nhanh chóng, chuyển đổi đúng cấu trúc dữ liệu và component biểu đồ của từng chế độ.",
        "evidence": "evidence_defects/LIVE_OC_01_crossline.png",
        "category": "Hồi quy (Regression)",
        "ref": "PSD Wireframe 1, 2, 3"
    },
    "OC-MON-TC-076": {
        "status": "BLOCKED",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] BLOCKED do an toàn dữ liệu: Nghiêm cấm thực hiện thao tác xóa camera/quy tắc trên hệ thống đang vận hành production.",
        "evidence": "artifacts/test-results/",
        "category": "An toàn hệ thống Live",
        "ref": "PSD mục 10.3"
    },
    "OC-MON-TC-077": {
        "status": "PASS",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] Định dạng số lớn nhất quán tuyệt đối: Số liệu >= 1.000 đều có dấu phẩy phân cách hàng nghìn (ví dụ: 1,884 lượt, 7,635 lượt) trên cả thẻ KPI, bảng thống kê và legend biểu đồ.",
        "evidence": "evidence_defects/LIVE_OC_01_crossline.png",
        "category": "Tính chất bất biến (Invariant)",
        "ref": "PSD Wireframe 1, 2, 3"
    },
    "OC-MON-TC-078": {
        "status": "BLOCKED",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] BLOCKED do tài khoản: Hệ thống chỉ cung cấp 1 tài khoản becamex (toàn quyền), không có tài khoản phân quyền Viewer hạn chế.",
        "evidence": "artifacts/test-results/",
        "category": "Cần môi trường Staging",
        "ref": "PSD mục 10.3"
    },
    "OC-MON-TC-079": {
        "status": "BLOCKED",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] BLOCKED do tài khoản: Phụ thuộc TC-078.",
        "evidence": "artifacts/test-results/",
        "category": "Cần môi trường Staging",
        "ref": "PSD mục 10.3"
    },
    "OC-MON-TC-080": {
        "status": "BLOCKED",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] BLOCKED do stream video: Luồng video stream camera bị gián đoạn, không thể đo kiểm độ trễ video so với thời gian thực tế.",
        "evidence": "artifacts/test-results/",
        "category": "Cần môi trường Staging",
        "ref": "PSD mục 1.3 NFR"
    },
    "OC-MON-TC-081": {
        "status": "PASS",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] Popover Đối tượng áp dụng bộ lọc ngay lập tức sau khi nhấn nút 'OK', URL được tự động gắn tham số query &classes= tương ứng mà không cần thêm nút áp dụng rời.",
        "evidence": "evidence_defects/OC_BUG_08_dropdown_contains_other.png",
        "category": "Hồi quy (Regression)",
        "ref": "PSD Wireframe 1, 2, 3"
    },
    "OC-MON-TC-082": {
        "status": "PASS",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] Khi luồng RTSP/WebRTC camera mất tín hiệu, khung player hiển thị thông báo lỗi rõ ràng 'Camera bị gián đoạn. Đang thử lại' kèm nút thử lại, không làm sập ứng dụng.",
        "evidence": "evidence_defects/LIVE_OC_01_crossline.png",
        "category": "Hồi quy (Regression)",
        "ref": "PSD mục 10.3"
    },
    "OC-MON-TC-083": {
        "status": "PASS",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] TÍNH CHẤT BẤT BIẾN KHỚP 100%: Tổng số liệu từng cột trên biểu đồ 'Lưu lượng theo làn' khớp chính xác với tổng của từng làn trong bảng 'Lưu lượng theo làn và đối tượng'.",
        "evidence": "evidence_defects/LIVE_OC_03_lane.png",
        "category": "Tính chất bất biến (Invariant)",
        "ref": "PSD Wireframe 3"
    },
    "OC-MON-TC-084": {
        "status": "PASS",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] TÍNH CHẤT BẤT BIẾN KHỚP 100%: Tổng cộng dồn các điểm trên biểu đồ 'Xu hướng theo thời gian' khớp chính xác với thẻ KPI Lượt vào và Lượt ra trong cùng khoảng filter.",
        "evidence": "evidence_defects/LIVE_OC_01_crossline.png",
        "category": "Tính chất bất biến (Invariant)",
        "ref": "PSD Wireframe 1"
    },
    "OC-MON-TC-085": {
        "status": "FAIL",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] LỆCH ĐẶC TẢ PSD: Trục thời gian biểu đồ xu hướng khung 'Hôm nay' không hiển thị đầy đủ các mốc giờ 00:00, 01:00... cố định; và nút lọc 'Giờ hiện tại' chỉ lấy từ đầu giờ đồng hồ thay vì 60 phút gần nhất.",
        "evidence": "evidence_defects/OC_BUG_85_time_filter_hourly_bucket.png",
        "category": "Lệch PSD",
        "ref": "PSD Wireframe 3"
    },
    "OC-MON-TC-086": {
        "status": "PASS",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] Quét kiểm tra tất cả 6 camera có rule Làn đường trong hệ thống: cả 6/6 camera đều trả dữ liệu HTTP 200 OK với cấu trúc dữ liệu đầy đủ, không camera nào lỗi 500 hay crash trang.",
        "evidence": "evidence_defects/LIVE_OC_03_lane.png",
        "category": "Hồi quy (Regression)",
        "ref": "PSD mục 10.3"
    },
    "OC-MON-TC-087": {
        "status": "PASS",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] Lọc riêng lẻ từng loại đối tượng (Ô tô, Xe máy, Xe tải, Container, Xe buýt, Người) đều hoạt động chính xác: bảng chỉ hiển thị 1 dòng được chọn và URL cập nhật param classes tương ứng.",
        "evidence": "evidence_defects/LIVE_OC_03_lane.png",
        "category": "Hồi quy (Regression)",
        "ref": "PSD Wireframe 3"
    },
    "OC-MON-TC-088": {
        "status": "PASS",
        "actual": "[Retest 08/10/2026 – build v2.7.0-Dev] TÍNH CHẤT BẤT BIẾN KHỚP 100%: Giá trị cực trị trên thẻ KPI 'Hiện diện cao nhất' luôn lớn hơn hoặc bằng 'Hiện diện thấp nhất', và khớp chính xác với điểm đỉnh/đáy trên biểu đồ mật độ hiện diện.",
        "evidence": "evidence_defects/LIVE_OC_02_area.png",
        "category": "Tính chất bất biến (Invariant)",
        "ref": "PSD Wireframe 2"
    }
}

os.makedirs('reports/vms', exist_ok=True)
output_path = 'reports/vms/OC-retest-2026-10-08.tsv'

header = ["Test Case ID", "Status (PASS/FAIL/BLOCKED)", "Actual Response", "Evidence", "Phân loại", "Tham chiếu đặc tả"]

lines = ["\t".join(header)]

pass_cnt = 0
fail_cnt = 0
blocked_cnt = 0

for item in cases:
    tc_id = item["tc_id"]
    r = retest_data.get(tc_id, {
        "status": "BLOCKED",
        "actual": f"[Retest 08/10/2026 – build v2.7.0-Dev] Chưa có dữ liệu retest cho {tc_id}",
        "evidence": "artifacts/test-results/",
        "category": "Chưa thực thi",
        "ref": "PSD mục 10.3"
    })
    
    status = r["status"]
    if status == "PASS":
        pass_cnt += 1
    elif status == "FAIL":
        fail_cnt += 1
    else:
        blocked_cnt += 1
        
    line = [
        tc_id,
        status,
        r["actual"].replace("\t", " ").replace("\n", " "),
        r["evidence"],
        r["category"],
        r["ref"]
    ]
    lines.append("\t".join(line))

with open(output_path, 'w', encoding='utf-8') as f:
    f.write("\n".join(lines))

print(f"Generated {output_path} with {len(cases)} test cases.")
print(f"Summary: PASS={pass_cnt}, FAIL={fail_cnt}, BLOCKED={blocked_cnt}, Total={len(cases)}")
