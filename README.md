# VMS Automation Testing Framework (`vms-automation`)

Repository kiểm thử tự động hóa (QA Automation Testing Framework) chuyên biệt cho hệ thống **VMS (Video Management System)** — Becamex Smart Industrial Park, xây dựng trên nền tảng **Playwright + TypeScript** tuân thủ triết lý **Ponytail** và mô hình **Page Object Model (POM)**.

---

## 📁 Cấu trúc Repository Chuẩn hóa (Single Project Structure)

Repository được chuẩn hóa theo quy chuẩn **1 Repo cho 1 Dự án độc lập**, loại bỏ toàn bộ các tệp ngoại lai và đưa framework lên cấp thư mục gốc (Root-level):

```text
vms-automation/ (Root Repository VMS)
│
├── 📁 .github/                                           # CI/CD Tự động hóa kiểm thử
│   └── workflows/
│       └── quality.yml                                   # GitHub Actions: Chạy npm run verify tự động trên PR
│
├── 📄 package.json                                       # Định danh package: "vms-automation", scripts thực thi
├── 📄 playwright.config.ts                               # Cấu hình trung tâm Playwright Test Runner (workers, timeouts)
├── 📄 tsconfig.json                                      # Cấu hình biên dịch TypeScript
├── 📄 AGENTS.md                                          # Quy tắc phát triển kiểm thử bắt buộc (Zero rigid waits)
├── 📄 README.md                                          # Tài liệu hướng dẫn cài đặt & vận hành hệ thống kiểm thử
│
├── 📁 testcases/                                         # HỒ SƠ TEST CASE VMS & BÁO CÁO DEFECT
│   ├── Testcase chức năng hệ thống VMS version 2.xlsx    # Master Test Cases module Smart Search (84 cases)
│   ├── BO_TESTCASE_VMS_OBJECT_COUNTING_HOAN_CHINH.xlsx   # Master Test Cases module Object Counting (86 cases)
│   └── Bao_cao_Defect_Smart_Search_VMS_kem_hinh_anh.xlsx # Báo cáo Defect Smart Search kèm ảnh thumbnail & flow
│
├── 📁 docs/                                              # TÀI LIỆU ĐẶC TẢ & QUY CHUẨN KỸ THUẬT
│   ├── PSD_BecaVMS.docx                                  # Tài liệu đặc tả yêu cầu nghiệp vụ hệ thống VMS
│   ├── playwright_rules.md                               # Quy chuẩn viết Playwright theo Accessibility & Web-First
│   ├── ponytail_qa_rules.md                              # Triết lý tối giản mã nguồn kiểm thử Ponytail
│   └── ponytail_audit.md                                 # Hướng dẫn kiểm định chất lượng test suite
│
├── 📁 pages/                                             # PAGE OBJECT MODEL (POM) CHO GIAO DIỆN VMS
│   ├── vms-smart-search.page.ts                          # POM module Tìm kiếm thông minh (tích hợp searchAndWait)
│   └── vms-object-counting.page.ts                       # POM module Đếm đối tượng
│
├── 📁 tests/                                             # KỊCH BẢN KIỂM THỬ TỰ ĐỘNG (145 TESTS)
│   ├── ui/
│   │   └── vms/
│   │       ├── vms-smart-search.spec.ts                  # 53 test cases Smart Search (Wave 1 -> Wave 4)
│   │       └── vms-object-counting.spec.ts               # 87 test cases Object Counting (Live, Rules, Chart)
│   └── api/
│       └── jev/jev.api.spec.ts                           # 5 test cases AI Test Oracle & Phân loại lỗi Jev AI
│
├── 📁 fixtures/                                          # QUẢN LÝ PHIÊN ĐĂNG NHẬP & BROWSER CONTEXT
│   ├── vms-auth.fixture.ts                               # Chia sẻ phiên đăng nhập VMS qua storageState
│   ├── vms-cdp.fixture.ts                                # Chrome DevTools Protocol context
│   └── base.fixture.ts                                   # Base test fixture
│
├── 📁 project/                                           # CẤU HÌNH MÔI TRƯỜNG & TARGET HOST
│   ├── project.config.json                               # Khai báo host VMS cho phép, browser, retry
│   └── .env.example                                      # Mẫu biến môi trường (VMS_BASE_URL, credentials)
│
├── 📁 utils/                                             # TIỆN ÍCH HỖ TRỢ & BỘ XỬ LÝ DỮ LIỆU
│   ├── env.ts                                            # Đọc biến môi trường an toàn type-safe
│   ├── helper.ts                                         # Hàm tiện ích xử lý định dạng chuỗi, ngày giờ
│   ├── smart-search-api.map.ts                           # Bản đồ endpoint API backend Smart Search
│   ├── smart-search-mock.data.ts                         # Dữ liệu giả lập mock cho các mã lỗi HTTP 400, 422, 500
│   ├── jev-smart-oracle.ts                               # AI Oracle đánh giá ngữ nghĩa kết quả tìm kiếm VMS
│   └── jev-failure-analyzer.ts                           # Tự động phân tích và gán nhãn nguyên nhân lỗi test
│
├── 📁 test-data/                                         # DỮ LIỆU KIỂM THỬ ĐẦU VÀO (STATIC FIXTURES)
│   ├── empty_0b.jpg                                      # File rỗng 0 bytes phục vụ test lỗi upload
│   ├── oversize_11mb.jpg                                 # File ảnh 11MB phục vụ test biên dung lượng (>10MB)
│   ├── invalid_fake_image.jpg                            # File giả mạo định dạng phục vụ negative testing
│   └── synthetic_car.png                                 # Ảnh mẫu nhận diện phương tiện xe ô tô
│
├── 📁 scripts/                                           # BỘ CÔNG CỤ THỰC THI & TỰ ĐỘNG HÓA BÁO CÁO
│   ├── project-test.mjs                                  # Test runner tự động xuất HTML Report
│   ├── ponytail-debt.mjs                                 # Máy quét kiểm tra sổ nợ kỹ thuật (Ponytail Debt)
│   ├── export_excel_report.py                            # Xuất kết quả kiểm thử ra file Excel
│   ├── generate_defect_excel_with_images.py              # Tự động tạo Báo cáo Defect Excel có nhúng ảnh chụp
│   ├── apply_retest_to_testcase_excel.py                 # Đồng bộ kết quả retest tự động vào file Master Excel
│   └── update_testcase_ver2_status.py                    # Cập nhật trạng thái từng case của Sheet ver2
│
├── 📁 Hinh_anh_Defect_Full_HD/                           # BẰNG CHỨNG DEFECT ĐỘ PHÂN GIẢI CAO (FULL HD)
│   └── 2_SS_BUG_02_Phuong_tien_thieu_huong_di.png        # Bằng chứng lỗi thiếu trường Hướng đi (SS-FLT-016)
│
└── 📁 evidence_defects/                                  # Ảnh chụp bằng chứng lỗi trực tiếp trên hệ thống Live
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Kiểm Thử (Trực tiếp tại Root)

### 1. Cài đặt môi trường

```bash
npm install
npx playwright install chromium
```

### 2. Cấu hình biến môi trường

Tạo file `project/.env` từ file mẫu `project/.env.example`:

```env
VMS_BASE_URL=http://180.148.1.242:8004
VMS_SMART_SEARCH_URL=http://180.148.1.242:8004/video-analytic/smart-search
VMS_USERNAME=becamex
VMS_PASSWORD=becamex@123
VMS_TIMEOUT=30000
```

### 3. Thực thi kiểm thử

```bash
# 1. Kiểm tra chất lượng mã nguồn & sổ nợ kỹ thuật (0 Token / Không gọi server thật)
npm run verify

# 2. Chạy toàn bộ test suite Smart Search
npm run test:ss

# 3. Chạy toàn bộ test suite Đếm đối tượng (Object Counting)
npm run test:oc

# 4. Chạy kiểm thử cụ thể theo tag hoặc Case ID
npx playwright test tests/ui/vms/vms-smart-search.spec.ts --grep "SS-FLT-016"

# 5. Chạy test và tự động xuất HTML Report
npm run project:test -- ss
```

---

## 📊 Hiện Trạng Kiểm Thử VMS Smart Search (Build v2.8.0)

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
> - **Tiêu đề**: Bảng thuộc tính đối tượng Phương tiện thiếu trường lựa chọn *"Hướng đi"*.
> - **Mức độ**: Medium
> - **Bằng chứng**: [`Hinh_anh_Defect_Full_HD/2_SS_BUG_02_Phuong_tien_thieu_huong_di.png`](Hinh_anh_Defect_Full_HD/2_SS_BUG_02_Phuong_tien_thieu_huong_di.png)
> - **Chi tiết**: Xem tại file [`testcases/Bao_cao_Defect_Smart_Search_VMS_kem_hinh_anh.xlsx`](testcases/Bao_cao_Defect_Smart_Search_VMS_kem_hinh_anh.xlsx).

---

## 🛡️ Tiêu Chuẩn Kỹ Thuật (Ponytail Principles)

1. **Zero Rigid Sleep**: Tuyệt đối không sử dụng `page.waitForTimeout()` tĩnh trong luồng chính; toàn bộ thao tác sử dụng `ss.searchAndWait()` và Web-First Assertions (`toBeVisible()`, `toHaveText()`).
2. **Accessibility-First Locators**: Sử dụng `getByRole`, `getByLabel`, `getByText` để đảm bảo test không bị vỡ khi Dev thay đổi class styling hoặc cấu trúc DOM phụ.
3. **Continuous Quality Gate**: Script `npm run verify` chạy tự động `tsc --noEmit` + `ponytail:debt` + `playwright test --list` trước mỗi commit để đảm bảo repo luôn xanh và sạch nợ kỹ thuật.
