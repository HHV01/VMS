# -*- coding: utf-8 -*-
"""
Generate Standard Testcase Excel Template (Web UI & API)
Tuân thủ chuẩn QC Becamex:
- Sheet 1: Web UI Testcase (13 cột)
- Sheet 2: API Testcase (15 cột)
- Sheet 3: Quy chuẩn & Hướng dẫn
"""

import os
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

def create_template():
    wb = openpyxl.Workbook()
    # Remove default sheet
    wb.remove(wb.active)

    # Styles
    font_title = Font(name="Calibri", size=14, bold=True, color="1F4E79")
    font_section = Font(name="Calibri", size=11, bold=True, color="000000")
    font_meta_label = Font(name="Calibri", size=10, bold=True, color="333333")
    font_meta_val = Font(name="Calibri", size=10, color="000000")
    font_header_ui = Font(name="Calibri", size=10, bold=True, color="FFFFFF")
    font_header_api = Font(name="Calibri", size=10, bold=True, color="FFFFFF")
    font_data = Font(name="Calibri", size=9.5, color="000000")
    font_status_pass = Font(name="Calibri", size=9.5, bold=True, color="274E13")
    font_status_fail = Font(name="Calibri", size=9.5, bold=True, color="990000")
    font_auto = Font(name="Calibri", size=9.5, bold=True, color="004D40")

    fill_header_ui = PatternFill(start_color="1F4E79", end_color="1F4E79", fill_type="solid") # Navy
    fill_header_api = PatternFill(start_color="0D5C75", end_color="0D5C75", fill_type="solid") # Teal Blue
    fill_meta_bg = PatternFill(start_color="F2F4F7", end_color="F2F4F7", fill_type="solid")
    fill_kpi_header = PatternFill(start_color="D9E1F2", end_color="D9E1F2", fill_type="solid")
    fill_pass = PatternFill(start_color="D9EAD3", end_color="D9EAD3", fill_type="solid")
    fill_fail = PatternFill(start_color="FCE5CD", end_color="FCE5CD", fill_type="solid")
    fill_auto = PatternFill(start_color="E0F2F1", end_color="E0F2F1", fill_type="solid")

    thin_border = Border(
        left=Side(style="thin", color="D0D5DD"),
        right=Side(style="thin", color="D0D5DD"),
        top=Side(style="thin", color="D0D5DD"),
        bottom=Side(style="thin", color="D0D5DD")
    )
    header_border = Border(
        left=Side(style="thin", color="1F4E79"),
        right=Side(style="thin", color="1F4E79"),
        top=Side(style="medium", color="1F4E79"),
        bottom=Side(style="medium", color="1F4E79")
    )

    align_center = Alignment(horizontal="center", vertical="center", wrap_text=True)
    align_left = Alignment(horizontal="left", vertical="center", wrap_text=True)
    align_header = Alignment(horizontal="center", vertical="center", wrap_text=True)

    # =========================================================================
    # SHEET 1: Web UI Testcase (13 Cột)
    # =========================================================================
    ws_ui = wb.create_sheet(title="Web UI Testcase")
    ws_ui.views.sheetView[0].showGridLines = True

    # 1. Metadata Block
    ws_ui["A1"] = "BỘ TESTCASE KIỂM THỬ GIAO DIỆN WEB UI - HỆ THỐNG VMS"
    ws_ui["A1"].font = font_title
    ws_ui.merge_cells("A1:G1")

    meta_ui = [
        ("Tên dự án (Project's Name):", "Hệ thống Quản lý Video VMS (BecaVMS)", "Tài liệu tham chiếu:", "PSD_BecaVMS.docx / Wireframe Draw.io"),
        ("Tên phân hệ (Module's Name):", "Smart Search & Object Counting", "Môi trường kiểm thử:", "Staging http://180.148.1.242 / Headless Chrome"),
        ("Người thực hiện (Tester):", "Hoàng Hồng Vân, Nguyễn Thị Minh Tâm", "Phiên bản (Version):", "v2.8.0-Dev"),
        ("Ngày cập nhật:", "2026-11-10", "Framework Tự Động:", "Playwright + TypeScript (1 Repo Độc Lập)")
    ]

    for idx, (lbl1, val1, lbl2, val2) in enumerate(meta_ui, start=2):
        ws_ui.cell(row=idx, column=1, value=lbl1).font = font_meta_label
        ws_ui.cell(row=idx, column=2, value=val1).font = font_meta_val
        ws_ui.cell(row=idx, column=4, value=lbl2).font = font_meta_label
        ws_ui.cell(row=idx, column=5, value=val2).font = font_meta_val

    # 2. KPI Summary Block (Row 7-8)
    kpi_labels = ["Tổng số case", "PASS (Thủ công)", "FAIL (Thủ công)", "BLOCKED", "NOT RUN", "Automated (Auto)", "In Progress", "Manual Only", "Tỷ lệ Auto (%)"]
    for col_idx, lbl in enumerate(kpi_labels, start=1):
        cell_lbl = ws_ui.cell(row=7, column=col_idx, value=lbl)
        cell_lbl.font = font_section
        cell_lbl.fill = fill_kpi_header
        cell_lbl.alignment = align_center
        cell_lbl.border = thin_border

    kpi_formulas_ui = [
        '=COUNTA(C11:C100)',
        '=COUNTIF(J11:J100, "PASS")',
        '=COUNTIF(J11:J100, "FAIL")',
        '=COUNTIF(J11:J100, "BLOCKED")',
        '=COUNTIF(J11:J100, "NOT RUN")',
        '=COUNTIF(M11:M100, "Automated")',
        '=COUNTIF(M11:M100, "In Progress")',
        '=COUNTIF(M11:M100, "Manual Only")',
        '=IF(A8-H8>0, ROUND(F8/(A8-H8)*100, 1), 0)'
    ]
    for col_idx, formula in enumerate(kpi_formulas_ui, start=1):
        cell_val = ws_ui.cell(row=8, column=col_idx, value=formula)
        cell_val.font = font_section
        cell_val.alignment = align_center
        cell_val.border = thin_border

    # 3. Headers (Row 10) - 13 Cột Chuẩn
    ui_headers = [
        "Mã kịch bản\n(Scenario ID)",
        "Tên kịch bản kiểm thử\n(Scenario Title)",
        "Mã kiểm thử\n(Test Case ID)",
        "Kịch bản chi tiết\n(Test Description)",
        "Điều kiện tiên quyết\n(Pre-conditions)",
        "Các bước kiểm thử\n(Test Steps)",
        "Kết quả mong đợi\n(Expected Results)",
        "Kết quả thực tế\n(Actual Results)",
        "Loại kiểm thử\n(Type)",
        "Tình trạng\n(Status)",
        "Chú thích\n(Notes)",
        "Tester\n(Người thực hiện)",
        "Automation Status\n(Trạng thái Auto)"
    ]

    for col_idx, h in enumerate(ui_headers, start=1):
        cell = ws_ui.cell(row=10, column=col_idx, value=h)
        cell.font = font_header_ui
        cell.fill = fill_header_ui
        cell.alignment = align_header
        cell.border = header_border

    # 4. Sample Data Rows
    ui_samples = [
        [
            "SC-SS-01",
            "Tìm kiếm thông minh (Smart Search)",
            "VMS-SS-UI-001",
            'Tìm kiếm phương tiện với từ khóa "xe ô tô" trong khoảng thời gian 7 ngày',
            "Đã đăng nhập tài khoản Becamex; Trang Smart Search mở sẵn; Có dữ liệu AI trong 7 ngày",
            "1. Nhập \"xe ô tô\" vào ô tìm kiếm.\n2. Chọn khoảng thời gian 7 ngày.\n3. Nhấn nút Tìm kiếm.\n4. Quan sát kết quả hiển thị.",
            "Hệ thống hiển thị danh sách thẻ kết quả khớp xe ô tô; Có thumbnail và video tương ứng.",
            "Hiển thị 802 cards kết quả; Dữ liệu khớp chính xác; Video phát mượt mà.",
            "Regression",
            "PASS",
            "Playwright test: tests/ui/vms/vms-smart-search.spec.ts:35",
            "Hoàng Hồng Vân",
            "Automated"
        ],
        [
            "SC-SS-01",
            "Tìm kiếm thông minh (Smart Search)",
            "VMS-SS-UI-002",
            'Tìm kiếm người với từ khóa "người mặc áo đỏ"',
            "Đã đăng nhập tài khoản Becamex; Trang Smart Search mở sẵn",
            "1. Nhập \"người mặc áo đỏ\" vào ô tìm kiếm.\n2. Chọn camera khu vực Cổng chính.\n3. Bấm Tìm kiếm.",
            "Hiển thị danh sách kết quả đối tượng người có màu áo đỏ; Bóc tách metadata chính xác.",
            "Hiển thị đúng 45 thẻ kết quả; AI bóc tách: kind: person; color: red.",
            "Function",
            "PASS",
            "Playwright test: tests/ui/vms/vms-smart-search.spec.ts:120",
            "Hoàng Hồng Vân",
            "Automated"
        ],
        [
            "SC-SS-02",
            "Tìm kiếm thông minh - Giới hạn & Ngoại lệ",
            "VMS-SS-UI-003",
            "Cảnh báo độ dài câu truy vấn vượt quá 500 ký tự (BR-NL-08)",
            "Đã mở trang Smart Search",
            "1. Dán chuỗi văn bản dài 520 ký tự vào ô tìm kiếm.\n2. Quan sát phản hồi của giao diện.",
            "Hệ thống hiển thị cảnh báo đỏ hoặc ngăn không cho nhập quá 500 ký tự.",
            "Không hiển thị cảnh báo; Cho phép nhập và tìm kiếm gây lỗi 500 từ backend.",
            "Function",
            "FAIL",
            "Defect BUG_03: Thiếu cảnh báo giới hạn 500 ký tự. Xem ảnh BUG_03.",
            "Nguyễn Thị Minh Tâm",
            "Automated"
        ],
        [
            "SC-OC-01",
            "Đếm đối tượng (Object Counting)",
            "VMS-OC-UI-001",
            "Kiểm tra loại đếm mặc định là Crossline (Đường cắt) khi mở trang",
            "Đã đăng nhập VMS; Tài khoản có quyền xem Đếm đối tượng",
            "1. Điều hướng tới menu Phân tích video thông minh -> Đếm đối tượng.\n2. Quan sát loại đếm được chọn mặc định.",
            "Nút loại đếm Đường cắt (Crossline) được kích hoạt mặc định.",
            "Loại đếm Crossline được active và highlight sẵn sàng.",
            "Smoke",
            "PASS",
            "Playwright test: tests/ui/vms/vms-object-counting.spec.ts:24",
            "Hoàng Hồng Vân",
            "Automated"
        ],
        [
            "SC-OC-02",
            "Đếm đối tượng - Hiển thị đồ họa",
            "VMS-OC-UI-002",
            "Đánh giá cảm quan màu sắc và độ dày đường vẽ Crossline trên luồng video trực tiếp",
            "Đang mở Live View camera giám sát",
            "1. Quan sát đường kẻ vẽ Crossline trên player video.\n2. Đánh giá tính thẩm mỹ và độ tương phản với nền đường.",
            "Đường vẽ rõ nét; Độ dày 2px; Màu sắc tương phản tốt với mặt đường.",
            "Đường nét hiển thị chuẩn thẩm mỹ.",
            "Function",
            "PASS",
            "Cần mắt người đánh giá cảm quan thực tế trên màn hình hiển thị trực tiếp.",
            "Nguyễn Thị Minh Tâm",
            "Manual Only"
        ]
    ]

    for row_idx, r_data in enumerate(ui_samples, start=11):
        for col_idx, val in enumerate(r_data, start=1):
            c = ws_ui.cell(row=row_idx, column=col_idx, value=val)
            c.font = font_data
            c.border = thin_border
            if col_idx in (1, 3, 9, 10, 12, 13):
                c.alignment = align_center
            else:
                c.alignment = align_left

            # Highlights
            if col_idx == 10:
                if val == "PASS":
                    c.fill = fill_pass
                    c.font = font_status_pass
                elif val == "FAIL":
                    c.fill = fill_fail
                    c.font = font_status_fail
            elif col_idx == 13:
                if val == "Automated":
                    c.fill = fill_auto
                    c.font = font_auto

    # Data Validation Dropdowns for UI
    dv_ui_type = DataValidation(type="list", formula1='"Smoke,Regression,Function,Integration,Security,Performance"', allow_blank=True)
    dv_ui_status = DataValidation(type="list", formula1='"PASS,FAIL,BLOCKED,NOT RUN"', allow_blank=True)
    dv_ui_auto = DataValidation(type="list", formula1='"Not Started,In Progress,Automated,Manual Only"', allow_blank=True)

    ws_ui.add_data_validation(dv_ui_type)
    ws_ui.add_data_validation(dv_ui_status)
    ws_ui.add_data_validation(dv_ui_auto)

    dv_ui_type.add("I11:I100")
    dv_ui_status.add("J11:J100")
    dv_ui_auto.add("M11:M100")

    # Column Widths
    ui_widths = {1: 15, 2: 26, 3: 18, 4: 32, 5: 28, 6: 32, 7: 30, 8: 30, 9: 14, 10: 12, 11: 30, 12: 18, 13: 18}
    for col_idx, w in ui_widths.items():
        ws_ui.column_dimensions[get_column_letter(col_idx)].width = w


    # =========================================================================
    # SHEET 2: API Testcase (15 Cột)
    # =========================================================================
    ws_api = wb.create_sheet(title="API Testcase")
    ws_api.views.sheetView[0].showGridLines = True

    # 1. Metadata Block
    ws_api["A1"] = "BỘ TESTCASE KIỂM THỬ GIAO DIỆN LẬP TRÌNH API - HỆ THỐNG VMS"
    ws_api["A1"].font = font_title
    ws_api.merge_cells("A1:G1")

    meta_api = [
        ("Tên dự án (Project's Name):", "Hệ thống Quản lý Video VMS (BecaVMS)", "Tài liệu API (Swagger):", "http://180.148.1.242:8001/docs"),
        ("Tên phân hệ (Module's Name):", "Auth & Smart Search & Analytics API", "Môi trường kiểm thử:", "Backend Server http://180.148.1.242:8001"),
        ("Người thực hiện (Tester):", "Hoàng Hồng Vân, Nguyễn Thị Minh Tâm", "Phiên bản (Version):", "v2.8.0-Dev"),
        ("Ngày cập nhật:", "2026-11-10", "Framework Tự Động:", "Playwright API Request / Jev Decision Engine")
    ]

    for idx, (lbl1, val1, lbl2, val2) in enumerate(meta_api, start=2):
        ws_api.cell(row=idx, column=1, value=lbl1).font = font_meta_label
        ws_api.cell(row=idx, column=2, value=val1).font = font_meta_val
        ws_api.cell(row=idx, column=4, value=lbl2).font = font_meta_label
        ws_api.cell(row=idx, column=5, value=val2).font = font_meta_val

    # 2. KPI Summary Block (Row 7-8)
    for col_idx, lbl in enumerate(kpi_labels, start=1):
        cell_lbl = ws_api.cell(row=7, column=col_idx, value=lbl)
        cell_lbl.font = font_section
        cell_lbl.fill = fill_kpi_header
        cell_lbl.alignment = align_center
        cell_lbl.border = thin_border

    kpi_formulas_api = [
        '=COUNTA(C11:C100)',
        '=COUNTIF(M11:M100, "PASS")',
        '=COUNTIF(M11:M100, "FAIL")',
        '=COUNTIF(M11:M100, "BLOCKED")',
        '=COUNTIF(M11:M100, "PENDING")',
        '=COUNTIF(O11:O100, "Automated")',
        '=COUNTIF(O11:O100, "In Progress")',
        '=COUNTIF(O11:O100, "Manual Only")',
        '=IF(A8-H8>0, ROUND(F8/(A8-H8)*100, 1), 0)'
    ]
    for col_idx, formula in enumerate(kpi_formulas_api, start=1):
        cell_val = ws_api.cell(row=8, column=col_idx, value=formula)
        cell_val.font = font_section
        cell_val.alignment = align_center
        cell_val.border = thin_border

    # 3. Headers (Row 10) - 15 Cột Chuẩn
    api_headers = [
        "Test Scenario ID\n(Mã kịch bản)",
        "Test Scenario Description\n(Mô tả kịch bản)",
        "Test Case ID\n(Mã ca kiểm thử)",
        "Test Case Description\n(Mô tả chi tiết ca test)",
        "Pre-Conditions\n(Điều kiện tiên quyết)",
        "Test Data\n(Payload / Params)",
        "Test Step\n(Các bước gọi API)",
        "Method\n(Phương thức)",
        "Path\n(Đường dẫn endpoint)",
        "Expected Response\n(Phản hồi mong đợi)",
        "Actual Response\n(Phản hồi thực tế)",
        "Loại kiểm thử\n(Type)",
        "Status\n(Trạng thái)",
        "Note\n(Ghi chú)",
        "Automation Status\n(Trạng thái Auto)"
    ]

    for col_idx, h in enumerate(api_headers, start=1):
        cell = ws_api.cell(row=10, column=col_idx, value=h)
        cell.font = font_header_api
        cell.fill = fill_header_api
        cell.alignment = align_header
        cell.border = header_border

    # 4. Sample Data Rows
    api_samples = [
        [
            "LOGIN01",
            "Xác thực và cấp phát mã ủy quyền JWT Token",
            "LOGIN01-001",
            "Lấy Access Token với tài khoản và mật khẩu quản trị chính xác",
            "Hệ thống Backend VMS hoạt động; Tài khoản admin tồn tại trên DB",
            '{"username": "becamex", "password": "P@ssw0rd2026!"}',
            "1. Khởi tạo POST request tới endpoint /api/v1/Authentication/token-data.\n2. Đính kèm Header Content-Type: application/json.\n3. Gửi payload và kiểm tra response.",
            "POST",
            "/api/v1/Authentication/token-data",
            'HTTP 200 OK; JSON trả về data.access_token hợp lệ; token_type="Bearer"; expires_in > 0.',
            "HTTP 200 OK; Token sinh hợp lệ trong 125ms; data đầy đủ quyền hạn.",
            "Smoke",
            "PASS",
            "Token dùng cho các request API tiếp theo.",
            "Automated"
        ],
        [
            "LOGIN01",
            "Xác thực và cấp phát mã ủy quyền JWT Token",
            "LOGIN01-002",
            "Báo lỗi 401 khi đăng nhập với sai mật khẩu",
            "Hệ thống Backend VMS hoạt động",
            '{"username": "becamex", "password": "WrongPass!"}',
            "1. Gửi POST request với mật khẩu sai.\n2. Kiểm tra status code và thông điệp lỗi.",
            "POST",
            "/api/v1/Authentication/token-data",
            'HTTP 401 Unauthorized; message="Sai tài khoản hoặc mật khẩu".',
            "HTTP 401 Unauthorized; message khớp mô tả.",
            "Security",
            "PASS",
            "Đã verify mã lỗi bảo mật.",
            "Automated"
        ],
        [
            "SS_API_01",
            "Tìm kiếm thông minh (Smart Search API)",
            "SS_API-001",
            "Gọi API tìm kiếm phương tiện ô tô màu trắng trong 7 ngày",
            "Có Access Token hợp lệ; Hệ thống AI có dữ liệu metadata 7 ngày",
            '{"keyword": "xe ô tô màu trắng", "time_range": "7_days", "precision": true}',
            "1. Gửi POST request tới /api/smart_search.\n2. Đính kèm Header Authorization Bearer token.\n3. Gửi payload tìm kiếm.",
            "POST",
            "/api/smart_search",
            'HTTP 200 OK; JSON trả về danh sách results; metadata interpretation gồm kind="vehicle", type="car", color="white".',
            "HTTP 200 OK; Bóc tách đúng 3 tiêu chí; Trả về danh sách video cards đầy đủ.",
            "Function",
            "PASS",
            "API response time: 310ms. Đã có spec tự động.",
            "Automated"
        ],
        [
            "SS_API_01",
            "Tìm kiếm thông minh (Smart Search API)",
            "SS_API-002",
            "Gọi API tìm kiếm với câu query rỗng",
            "Có Access Token hợp lệ",
            '{"keyword": "", "time_range": "today"}',
            "1. Gửi POST request với keyword rỗng.\n2. Kiểm tra validation error.",
            "POST",
            "/api/smart_search",
            'HTTP 400 Bad Request hoặc 422 Unprocessable Entity; message="Từ khóa tìm kiếm không được để trống".',
            "HTTP 400 Bad Request; message báo lỗi chính xác.",
            "Function",
            "PASS",
            "Kiểm tra xử lý validation đầu vào.",
            "Automated"
        ],
        [
            "OC_API_01",
            "Thống kê Đếm đối tượng (Object Counting Stats API)",
            "OC_API-001",
            "Lấy dữ liệu thống kê lưu lượng theo giờ cho quy tắc Crossline",
            "Có Access Token; Camera đã cấu hình quy tắc Crossline hoạt động",
            "Query params: cameraId=LH-HV-LL_CAM-04&ruleCode=R-10156&range=today",
            "1. Gửi GET request tới /api/v1/object-counting/statistics.\n2. Truyền tham số camera và mã rule.\n3. Kiểm tra payload trả về.",
            "GET",
            "/api/v1/object-counting/statistics",
            "HTTP 200 OK; JSON trả về mảng thống kê theo từng khung giờ; tổng số lượng đếm khớp thực tế.",
            "HTTP 200 OK; Dữ liệu thống kê trả về đầy đủ 24 buckets theo giờ.",
            "Regression",
            "PASS",
            "Đã tích hợp test trong vms-object-counting.spec.ts.",
            "Automated"
        ]
    ]

    for row_idx, r_data in enumerate(api_samples, start=11):
        for col_idx, val in enumerate(r_data, start=1):
            c = ws_api.cell(row=row_idx, column=col_idx, value=val)
            c.font = font_data
            c.border = thin_border
            if col_idx in (1, 3, 8, 12, 13, 15):
                c.alignment = align_center
            else:
                c.alignment = align_left

            # Highlights
            if col_idx == 13:
                if val == "PASS":
                    c.fill = fill_pass
                    c.font = font_status_pass
                elif val == "FAIL":
                    c.fill = fill_fail
                    c.font = font_status_fail
            elif col_idx == 15:
                if val == "Automated":
                    c.fill = fill_auto
                    c.font = font_auto

    # Data Validation Dropdowns for API
    dv_api_method = DataValidation(type="list", formula1='"GET,POST,PUT,DELETE,PATCH"', allow_blank=True)
    dv_api_type = DataValidation(type="list", formula1='"Smoke,Regression,Function,Integration,Security,Performance"', allow_blank=True)
    dv_api_status = DataValidation(type="list", formula1='"PASS,FAIL,PENDING"', allow_blank=True)
    dv_api_auto = DataValidation(type="list", formula1='"Not Started,In Progress,Automated,Manual Only"', allow_blank=True)

    ws_api.add_data_validation(dv_api_method)
    ws_api.add_data_validation(dv_api_type)
    ws_api.add_data_validation(dv_api_status)
    ws_api.add_data_validation(dv_api_auto)

    dv_api_method.add("H11:H100")
    dv_api_type.add("L11:L100")
    dv_api_status.add("M11:M100")
    dv_api_auto.add("O11:O100")

    # Column Widths
    api_widths = {1: 16, 2: 28, 3: 16, 4: 32, 5: 28, 6: 28, 7: 30, 8: 12, 9: 28, 10: 30, 11: 30, 12: 14, 13: 12, 14: 28, 15: 18}
    for col_idx, w in api_widths.items():
        ws_api.column_dimensions[get_column_letter(col_idx)].width = w


    # =========================================================================
    # SHEET 3: Quy chuẩn & Hướng dẫn
    # =========================================================================
    ws_doc = wb.create_sheet(title="Quy chuẩn & Hướng dẫn")
    ws_doc.views.sheetView[0].showGridLines = True

    ws_doc["A1"] = "HƯỚNG DẪN QUY CHUẨN TESTCASE THEO CHIẾN LƯỢC QC BECAMEX"
    ws_doc["A1"].font = font_title
    ws_doc.merge_cells("A1:E1")

    instructions = [
        ("1. Mục tiêu chiến lược", "Mỗi dự án 1 repository riêng biệt, tách bạch testcase UI và API, đo lường được tiến độ tự động hóa và liên kết chặt chẽ với Playwright framework."),
        ("2. Quy tắc 13 Cột Web UI", "Bao gồm 12 cột kiểm thử truyền thống của team + 1 cột thứ 13 bổ sung: 'Automation Status'."),
        ("3. Quy tắc 15 Cột API", "Bao gồm 14 cột kiểm thử API (Method, Path, Payload, Status Code) + 1 cột thứ 15 bổ sung: 'Automation Status'."),
        ("4. Tách biệt Kết quả chạy", "Cột Status (PASS/FAIL) dùng cho lần chạy thủ công gần nhất. Kết quả chạy tự động được đo lường qua Playwright runner, dashboard và CI report."),
        ("5. Bốn trạng thái Automation Status", "• Not Started: Chưa viết code auto.\n• In Progress: Đang phân tích requirement hoặc đang viết code.\n• Automated: Đã hoàn thiện code, test assertions đầy đủ, code sạch lint, chạy ổn định trên CI/Local.\n• Manual Only: Giữ thủ công có chủ đích (phải ghi rõ lý do ở cột Note)."),
        ("6. Công thức đo Coverage %", "Tỷ lệ phủ tự động hóa = [Số case Automated] / ([Tổng số case] - [Số case Manual Only]) * 100%")
    ]

    for idx, (title, desc) in enumerate(instructions, start=3):
        ws_doc.cell(row=idx, column=1, value=title).font = font_section
        c_desc = ws_doc.cell(row=idx, column=2, value=desc)
        c_desc.font = font_data
        c_desc.alignment = align_left

    ws_doc.column_dimensions["A"].width = 30
    ws_doc.column_dimensions["B"].width = 90

    # Save outputs
    target_path = "testcases/TESTCASE_TEMPLATE_CHUAN.xlsx"
    docs_path = "docs/TESTCASE_TEMPLATE_CHUAN.xlsx"
    wb.save(target_path)
    wb.save(docs_path)
    print(f"Created: {target_path} and {docs_path}")

if __name__ == "__main__":
    create_template()

