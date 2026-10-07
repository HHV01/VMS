# QA Automation Framework — Playwright + TypeScript

Khung tự động hóa kiểm thử (QA Automation Framework) chuẩn hóa, tối giản và hiệu năng cao bằng **Playwright + TypeScript**, tuân thủ nghiêm ngặt nguyên lý **Ponytail** (YAGNI, Minimum Code, Zero Flaky Waits) và **Harness Engineering**.

Khung này được thiết kế tổng quát (Generic & Reusable) để làm sườn mẫu cho mọi loại dự án:
- 🌐 **Web Applications & SPAs**
- 📱 **Mobile Web**
- 🔌 **REST APIs & Backend Services**
- 📡 **IoT & Smart Systems**

---

## 🚀 Cài đặt nhanh

```bash
npm install
npx playwright install chromium
```

---

## ⚙️ Cấu hình dự án

Tạo file `project/.env` từ file mẫu `project/.env.example` để khai báo URL và tài khoản môi trường test:

```env
BASE_URL=http://<host>:<port>
USERNAME=<tài_khoản_test>
PASSWORD=<mật_khẩu_test>
```

> **Lưu ý an toàn:** File `project/.env`, ảnh chụp lỗi, video và trace **không bao giờ được commit lên git** (`.gitignore` đã tự động chặn).

Cấu hình thông số dự án (host cho phép, browser, số luồng worker, retry) nằm tại [`project/project.config.json`](project/project.config.json).

---

## 🧪 Chạy Test & Xuất Báo Cáo

```bash
npm run project:test -- [feature-id]               # Chạy toàn bộ test của dự án / feature, tự động xuất HTML Report
npm run project:test -- [feature-id] --grep "001"  # Chỉ chạy testcase khớp tên hoặc mã ID
npm run project:test:stable -- [feature-id]        # Chạy lặp 2 lần để phát hiện test chập chờn (Flaky)
npm run test:list                                  # Liệt kê danh sách test, không gọi vào hệ thống thật
```

Sau mỗi lần chạy, hệ thống tự động xuất báo cáo trực quan tại:
* `reports/<project>/<feature>/<run-id>/FINAL_QC_REPORT.html`: Báo cáo chi tiết của phiên chạy vừa xong.
* `reports/<project>/<feature>/MASTER_QC_REPORT.html`: Bảng dashboard tổng hợp trạng thái mới nhất của mọi testcase.

Nếu test gặp lỗi, xem lại trace chi tiết từng bước:
```bash
npx playwright show-trace artifacts/<đường-dẫn-lỗi>/trace.zip
```

---

## 🛡️ Kiểm tra Chất lượng Tự động (0 Token)

```bash
npm run verify          # Chạy đồng thời: TypeScript Lint + Quét sổ nợ Ponytail + Liệt kê test
npm run ponytail:debt   # Liệt kê các chỗ cố ý đơn giản hóa và kiểm tra điều kiện hoàn trả
```

CI (`.github/workflows/quality.yml`) chạy tự động `npm run verify` trên mỗi Pull Request.

---

## 🤖 Tích hợp Jev AI (TypeSafe AI System One)

Framework tích hợp sẵn **Jev AI** (mô hình System One từ TypeSafe AI) với độ trễ siêu thấp (70–500ms) để đưa ra quyết định có cấu trúc (Choice, Noul, Score) thay vì sinh văn bản tự do:

1. **Client API chuẩn (`api/jev.api.ts`)**:
   - `decideChoice(state, instructions, criteria)`: Phân loại hành động/trạng thái.
   - `decideNoul(state, instructions)`: Phán đoán nhị phân Đúng/Sai (xác suất 0–1).
   - `decideScore(state, instructions, levels)`: Đánh giá điểm theo thang đo 1–5.
   - Tự động fallback Sandbox Mock khi chưa cấu hình `TYPESAFE_API_KEY`.
2. **AI Test Oracle (`utils/jev-smart-oracle.ts`)**:
   - Tự động thẩm định kết quả tìm kiếm ngôn ngữ tự nhiên trong module **VMS Smart Search**.
3. **Phân tích nguyên nhân lỗi tự động (`utils/jev-failure-analyzer.ts` & `scripts/jev_classifier.py`)**:
   - Tự động phân loại case FAIL vào 4 nhóm: `APPLICATION_BUG` (Bug thật), `ENVIRONMENT_TIMEOUT` (Mạng/môi trường), `SELECTOR_DRIFT` (Đổi DOM), `DATA_ISSUE` (Dữ liệu).
   - Nhúng trực tiếp phân loại và đề xuất khắc phục vào Sheet 2 ("Ảnh lỗi") của Báo cáo Excel.

Chạy kiểm thử riêng bộ API Jev AI:
```bash
npx playwright test tests/api/jev/jev.api.spec.ts
```

---

## 📁 Cấu trúc Thư mục

```text
├── project/             # Cấu hình dự án đang test (project.config.json, .env)
├── pages/               # Page Object Models (POM) bám sát DOM thực tế
├── fixtures/            # Fixtures dùng chung (lưu phiên đăng nhập 1 lần/worker qua storageState)
├── tests/               # Kịch bản kiểm thử (tests/ui/, tests/api/)
├── api/                 # Client REST API chuẩn (GET, POST, PUT, DELETE) & Recorder
├── utils/               # Tiện ích (đọc biến môi trường an toàn, che giấu secrets)
├── scripts/             # Runner, Report Builder và máy quét nợ kỹ thuật Ponytail
└── docs/                # Bộ quy chuẩn kỹ thuật & Mẫu hồ sơ testcase
    ├── TESTCASE_TEMPLATE.md   # Mẫu bảng hồ sơ Test Case 12 cột chuẩn đa dự án
    ├── TESTCASE_TEMPLATE.csv  # File mẫu Excel/CSV mở trực tiếp
    ├── playwright_rules.md    # Quy tắc viết Playwright chuẩn (Role-based, no hard waits)
    └── ponytail_qa_rules.md   # Triết lý tối giản code Ponytail cho QA
```

---

## 📝 Mẫu Hồ Sơ Test Case Chuẩn (Generic Template)

Khi khởi tạo dự án mới, sử dụng mẫu hồ sơ testcase chuẩn tại:
* 📄 [`docs/TESTCASE_TEMPLATE.md`](docs/TESTCASE_TEMPLATE.md)
* 📗 [`docs/TESTCASE_TEMPLATE.csv`](docs/TESTCASE_TEMPLATE.csv)

Mẫu gồm **12 cột chuẩn công nghiệp**: `Test_Case_ID`, `Module`, `Sub_Module`, `Test_Type`, `Priority`, `Test_Title`, `Preconditions`, `Test_Steps`, `Test_Data`, `Expected_Result`, `Automation_Status`, `Automation_Ref`.

---

## 📐 Quy ước Lập trình

Đọc kỹ [`AGENTS.md`](AGENTS.md) trước khi phát triển:
1. **Tuyệt đối không dùng chờ cứng (`waitForTimeout`) hay `networkidle`.** Luôn chờ theo trạng thái phần tử (`waitFor({ state: 'visible' })`, `waitForURL`).
2. **Ưu tiên Locator theo Accessibility (`getByRole`, `getByLabel`).**
3. **Không hard-code URL hoặc credentials** vào mã nguồn.
4. **Không hạ assertion** để test dễ xanh giả tạo.
