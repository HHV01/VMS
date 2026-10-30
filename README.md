# VMS — Video Management System Automation Testing Framework

Repository lưu trữ tài liệu kiểm thử, kịch bản test tự động (Playwright + TypeScript) và báo cáo Defect của hệ thống **VMS (Video Management System)** — Becamex Smart Industrial Park.

---

## 📁 Cấu trúc Tổng thể Repository (Repository Structure)

```text
VMS/
├── Bao_cao_Defect_Smart_Search_VMS_kem_hinh_anh.xlsx  # Báo cáo Defect Smart Search kèm ảnh thumbnail & flow tái hiện
├── Hinh_anh_Defect_Full_HD/                           # Thư mục lưu trữ hình ảnh bằng chứng lỗi kích thước gốc Full HD
│   ├── 1_SS_BUG_01_Tu_ngay_lon_hon_Den_ngay.png
│   ├── 2_SS_BUG_02_Phuong_tien_thieu_huong_di.png
│   └── 3_SS_BUG_03_Loc_bien_so_51_tra_ve_sai.png
├── Testcase chức năng hệ thống VMS version 2.xlsx     # File Excel Master quản lý toàn bộ 84 Test Cases Smart Search (Sheet ver2)
├── BO_TESTCASE_VMS_OBJECT_COUNTING_HOAN_CHINH.xlsx    # File Excel Master kiểm thử module Object Counting (Đếm đối tượng)
├── PSD_BecaVMS.docx                                   # Tài liệu đặc tả yêu cầu nghiệp vụ hệ thống (PSD)
├── Smart-Pole-TestCase.csv                            # Kịch bản kiểm thử các tính năng phần cứng Smart Pole
├── evidence_defects/                                  # Bằng chứng kiểm thử và lỗi trực tiếp trên giao diện Live
│
└── playwright-agent-basic/                            # Core Framework Automation Testing (Playwright + TypeScript)
    ├── api/                                           # Các module giao tiếp REST API & Client API
    │   ├── base.api.ts                                # Base API client chuẩn
    │   ├── example.api.ts                             # Ví dụ API calls
    │   └── jev.api.ts                                 # Tích hợp TypeSafe Jev AI (System One Decision Model)
    │
    ├── pages/                                         # Page Object Model (POM) ánh xạ trực tiếp các trang chức năng
    │   ├── vms-smart-search.page.ts                   # POM Module Tìm kiếm thông minh (Smart Search)
    │   └── vms-object-counting.page.ts                # POM Module Đếm đối tượng (Object Counting)
    │
    ├── tests/                                         # Toàn bộ Test Suite kiểm thử tự động
    │   ├── ui/
    │   │   └── vms/
    │   │       ├── vms-smart-search.spec.ts           # 53 test cases kiểm thử giao diện & API Smart Search
    │   │       └── vms-object-counting.spec.ts        # Test suite module Đếm đối tượng
    │   └── api/
    │       ├── SAMPLE/health.api.spec.ts              # Kiểm tra sức khỏe hệ thống
    │       └── jev/jev.api.spec.ts                    # Test bộ quyết định AI Jev
    │
    ├── fixtures/                                      # Custom Fixtures (Auth Storage State, CDP Browser context)
    │   ├── base.fixture.ts
    │   ├── vms-auth.fixture.ts
    │   └── vms-cdp.fixture.ts
    │
    ├── utils/                                         # Các tiện ích bổ trợ và bộ xử lý dữ liệu
    │   ├── env.ts                                     # Đọc và xác thực biến môi trường an toàn
    │   ├── helper.ts                                  # Tiện ích định dạng ngày giờ, chuỗi
    │   ├── jev-failure-analyzer.ts                    # Phân tích nguyên nhân lỗi kiểm thử tự động
    │   ├── jev-smart-oracle.ts                        # Thẩm định kết quả tìm kiếm ngữ nghĩa
    │   ├── smart-search-api.map.ts                    # Bản đồ URL endpoint API Smart Search
    │   └── smart-search-mock.data.ts                  # Dữ liệu giả lập mock cho các mã lỗi HTTP 4xx, 5xx
    │
    ├── test-data/                                     # Dữ liệu kiểm thử đầu vào (Test Fixtures)
    │   ├── empty_0b.jpg                               # Ảnh trống 0 bytes phục vụ test biên
    │   ├── oversize_11mb.jpg                          # Ảnh vượt quá dung lượng 10MB phục vụ test validation
    │   ├── invalid_fake_image.jpg                     # Tệp sai định dạng
    │   ├── synthetic_car.png                          # Ảnh mẫu nhận diện xe ô tô
    │   └── smart-search.assumptions.ts                # Các giả định kiểm thử Smart Search
    │
    ├── scripts/                                       # Công cụ thực thi và báo cáo của framework
    │   ├── project-test.mjs                           # Runner đa luồng xuất báo cáo HTML trực quan
    │   ├── ponytail-debt.mjs                          # Kiểm tra sổ nợ kỹ thuật theo chuẩn Ponytail
    │   ├── build-playwright-report.mjs                # Bộ tạo báo cáo test tùy biến
    │   ├── save-shared-auth.mjs                       # Lưu trữ phiên đăng nhập vào storageState
    │   ├── export_excel_report.py                     # Xuất báo cáo kiểm thử ra định dạng Excel
    │   ├── generate_defect_excel_with_images.py       # Tự động tạo Báo cáo Defect Excel có nhúng ảnh chụp màn hình
    │   ├── apply_retest_to_testcase_excel.py          # Đồng bộ kết quả retest tự động vào file Testcase Master
    │   └── update_testcase_ver2_status.py             # Cập nhật trạng thái từng case của Sheet ver2
    │
    ├── project/                                       # Cấu hình dự án và môi trường
    │   ├── project.config.json                        # Cấu hình worker, timeout, baseUrl
    │   └── .env.example                               # File mẫu cấu hình biến môi trường
    │
    ├── docs/                                          # Tài liệu hướng dẫn và quy tắc kiểm thử
    │   ├── playwright_rules.md                        # Quy tắc viết kịch bản Playwright
    │   ├── ponytail_qa_rules.md                       # Triết lý viết test tối giản Ponytail
    │   ├── ponytail_audit.md                          # Hướng dẫn kiểm định chất lượng test
    │   ├── TESTCASE_TEMPLATE.md                       # Mẫu hồ sơ test case chuẩn 12 cột
    │   └── TESTCASE_TEMPLATE.csv                      # File CSV mẫu
    │
    ├── package.json                                   # Khai báo scripts và thư viện phụ thuộc
    ├── playwright.config.ts                           # File cấu hình trung tâm của Playwright Test Runner
    ├── tsconfig.json                                  # Cấu hình trình biên dịch TypeScript
    └── AGENTS.md                                      # Quy chuẩn bắt buộc dành cho AI Agent & Developer
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Kiểm Thử

### 1. Cài đặt môi trường

```bash
cd playwright-agent-basic
npm install
npx playwright install chromium
```

### 2. Cấu hình biến môi trường

Tạo file `playwright-agent-basic/project/.env` từ file mẫu `project/.env.example`:

```env
VMS_BASE_URL=http://180.148.1.242:8004
VMS_SMART_SEARCH_URL=http://180.148.1.242:8004/video-analytic/smart-search
VMS_USERNAME=becamex
VMS_PASSWORD=becamex@123
VMS_TIMEOUT=30000
```

### 3. Thực thi kịch bản kiểm thử

```bash
# 1. Chạy toàn bộ test suite Smart Search
npm run test:ss

# 2. Chạy kiểm tra chất lượng mã nguồn & sổ nợ (0 Token / Không gọi server thật)
npm run verify

# 3. Chạy nhóm test case cụ thể (ví dụ retest các case live)
npx playwright test tests/ui/vms/vms-smart-search.spec.ts --grep "@live"

# 4. Chạy kiểm tra các ca kiểm thử mock lỗi (400, 422, 500)
npx playwright test tests/ui/vms/vms-smart-search.spec.ts --grep "@mock"

# 5. Xuất báo cáo HTML chi tiết
npm run project:test -- ss
```

---

## 📊 Bảng Tổng Hợp Trạng Thái Kiểm Thử (Status Dashboard)

### Module Smart Search (Tìm kiếm thông minh) — Build v2.8.0

| Nhóm chức năng | Tổng số Test Cases | Pass | Fail | Tỷ lệ Đạt (%) |
| :--- | :---: | :---: | :---: | :---: |
| **Tìm kiếm bằng Ngôn ngữ tự nhiên (Metadata)** | 33 | 33 | 0 | 100% |
| **Bộ lọc nâng cao (Advanced Filters)** | 30 | 29 | 1 | 96.7% |
| **Tìm kiếm bằng Hình ảnh (Image Upload)** | 10 | 10 | 0 | 100% |
| **Bổ sung theo đặc tả PSD (Wave 4)** | 11 | 11 | 0 | 100% |
| **TỔNG CỘNG** | **84** | **83** | **1** | **98.8%** |

> [!NOTE]
> **Defect thực tế duy nhất còn tồn đọng**:
> - **Mã Test Case**: `SS-FLT-016`
> - **Tiêu đề**: Bảng thuộc tính đối tượng Phương tiện thiếu trường *"Hướng đi"*.
> - **Mức độ**: Medium
> - **Bằng chứng**: [`Hinh_anh_Defect_Full_HD/2_SS_BUG_02_Phuong_tien_thieu_huong_di.png`](Hinh_anh_Defect_Full_HD/2_SS_BUG_02_Phuong_tien_thieu_huong_di.png)
> - **Tài liệu**: Chi tiết xem tại [`Bao_cao_Defect_Smart_Search_VMS_kem_hinh_anh.xlsx`](Bao_cao_Defect_Smart_Search_VMS_kem_hinh_anh.xlsx).

---

## 🛡️ Tiêu Chuẩn Kỹ Thuật (Ponytail & Quality Gate)

- **Zero Rigid Sleeps**: Toàn bộ các thao tác tìm kiếm và chuyển trang sử dụng `searchAndWait()` và Web-First Assertions thay cho `waitForTimeout`.
- **Clean POM**: Ánh xạ theo Accessibility Tree (`getByRole`, `getByText`) tăng tính bền vững khi DOM thay đổi.
- **Auto Quality Check**: `npm run verify` chạy tự động `tsc --noEmit` + `ponytail:debt` + `playwright test --list` trước khi commit.
