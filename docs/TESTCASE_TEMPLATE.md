# Quy Chuẩn Biểu Mẫu Test Case Chuẩn (Web UI & API)

Tài liệu quy định cấu trúc biểu mẫu hồ sơ kiểm thử chuẩn áp dụng thống nhất cho toàn bộ các dự án kiểm thử tự động (Automation Testing) của Becamex / VMS theo định hướng **1 Dự án - 1 Repository độc lập**.

---

## 📌 Tổng Quan Hai Biểu Mẫu Chuẩn

Hệ thống quản lý kịch bản kiểm thử phân tách rõ ràng thành hai tầng kiểm thử với cấu trúc cột chuyên biệt:

1. **Testcase Web UI (13 cột)**: 12 cột kiểm thử giao diện & hành vi người dùng truyền thống + **1 cột mới `Automation Status`**.
2. **Testcase API (15 cột)**: 14 cột kiểm thử tầng dịch vụ/endpoint (Method, Path, Payload, Status Code) + **1 cột mới `Automation Status`**.

> [!IMPORTANT]
> **Nguyên tắc cốt lõi**:
> * **Kết quả thủ công và tự động hóa tách biệt**: Cột `Tình trạng (Status)` dành riêng cho kết quả chạy thủ công (Manual Run). Kết quả chạy tự động được đo lường qua Playwright runner, dashboard và CI report.
> * **Liên kết chặt chẽ**: Cột `Mã kiểm thử (Test Case ID)` là định danh duy nhất dùng để ánh xạ trực tiếp vào tiêu đề mã kiểm thử tự động trong Playwright (`[VMS-SS-UI-001] ...`).
> * **Đo lường độ phủ tự động hóa**: Cột `Automation Status` dùng để quản trị tiến độ chuyển đổi kiểm thử từ manual sang auto và tính toán tỷ lệ phủ (Automation Coverage %).

---

## 🖥️ 1. Quy Chuẩn Test Case Web UI (13 Cột)

Dành cho kiểm thử giao diện người dùng, luồng nghiệp vụ E2E, trải nghiệm tương tác, form nhập liệu và báo cáo hiển thị.

| STT | Tên Cột | Tên Tiếng Anh | Quy Định & Ý Nghĩa | Giá Trị Hợp Lệ / Ví Dụ Thực Tế |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Mã kịch bản (Scenario ID)** | Scenario ID | Mã định danh nhóm kịch bản hoặc cụm tính năng | `SC-SS-01`, `SC-OC-NAV-01`, `Q3-NV-01` |
| **2** | **Tên kịch bản kiểm thử** | Scenario Title | Tên phân hệ hoặc luồng nghiệp vụ lớn | `Tìm kiếm thông minh (Smart Search) theo metadata đối tượng` |
| **3** | **Mã kiểm thử (Test Case ID)** | Test Case ID | Mã định danh duy nhất cho từng ca test (Primary Key) | `VMS-SS-UI-001`, `OC-MON-TC-001`, `BECAROS-E2E-Q3-TC-001` |
| **4** | **Kịch bản chi tiết** | Test Description | Mô tả ngắn gọn, rõ ràng mục tiêu và hành vi cần kiểm tra | `Tìm kiếm phương tiện với từ khóa "xe ô tô" trong khoảng thời gian 7 ngày` |
| **5** | **Điều kiện tiên quyết** | Pre-conditions | Trạng thái hệ thống, dữ liệu nền tảng, quyền truy cập cần có trước khi test | `Đã đăng nhập tài khoản Becamex; Trang Smart Search mở sẵn; Hệ thống có dữ liệu AI trong 7 ngày` |
| **6** | **Các bước kiểm thử** | Test Steps | Các thao tác tuần tự của người dùng trên giao diện (đánh số 1, 2, 3...) | `1. Nhập từ khóa "xe ô tô" vào ô tìm kiếm.\n2. Chọn khoảng thời gian 7 ngày.\n3. Nhấn nút Tìm kiếm.` |
| **7** | **Kết quả mong đợi** | Expected Results | Phản hồi giao diện, dữ liệu và hành vi hệ thống mong đợi | `Hiển thị danh sách card kết quả khớp loại xe ô tô; Thumbnail và video playback hoạt động bình thường.` |
| **8** | **Kết quả thực tế** | Actual Results | Ghi nhận quan sát thực tế khi kiểm thử thủ công | `Trả về 802 cards kết quả; Dữ liệu khớp chính xác; Video phát mượt mà.` |
| **9** | **Loại kiểm thử (Type)** | Test Type | Phân loại mục đích kiểm thử | `Smoke`, `Regression`, `Function`, `Integration`, `Security`, `Performance` |
| **10**| **Tình trạng (Status)** | Test Status | Kết quả thực thi của lần chạy kiểm thử thủ công gần nhất | `PASS`, `FAIL`, `BLOCKED`, `NOT RUN` |
| **11**| **Chú thích (Notes)** | Notes / Evidence | Ghi chú thêm, mã lỗi tham chiếu, bằng chứng lỗi hoặc lý do nếu giữ manual | `Khớp test tự động vms-smart-search.spec.ts. Xem ảnh lỗi BUG-01 nếu FAIL.` |
| **12**| **Tester** | Tester Name | Người thực hiện hoặc người phụ trách ca kiểm thử | `Hoàng Hồng Vân`, `Nguyễn Thị Minh Tâm`, `QA Team` |
| **13**| **Automation Status (mới)** | Automation Status | Trạng thái tự động hóa của test case theo chuẩn 4 mức | `Not Started`, `In Progress`, `Automated`, `Manual Only` |

---

## 🔌 2. Quy Chuẩn Test Case API (15 Cột)

Dành cho kiểm thử tầng dịch vụ RESTful API, Microservices, xác thực Token, bảo mật Endpoint, độ trễ và tính toàn vẹn dữ liệu payload.

| STT | Tên Cột | Tên Tiếng Anh | Quy Định & Ý Nghĩa | Giá Trị Hợp Lệ / Ví Dụ Thực Tế |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Test Scenario ID** | Scenario ID | Mã nhóm kịch bản API | `AUTH_API_01`, `SS_API_01`, `LOGIN01` |
| **2** | **Test Scenario Description** | Scenario Description | Mô tả mục tiêu của nhóm kịch bản API | `Xác thực và cấp phát mã ủy quyền JWT token cho người dùng` |
| **3** | **Test Case ID** | Test Case ID | Mã định danh duy nhất của ca test API | `LOGIN01-001`, `VMS-AUTH-API-001`, `SS-API-015` |
| **4** | **Test Case Description** | Test Description | Mục tiêu chi tiết của ca gọi API | `Lấy Access Token với thông tin tài khoản admin chính xác` |
| **5** | **Pre-Conditions** | Pre-conditions | Điều kiện tiên quyết: môi trường test, cơ sở dữ liệu, VPN, công cụ gọi | `Server API hoạt động tại 180.148.1.242:8001; Tài khoản đã active trên database` |
| **6** | **Test Data** | Test Data / Payload | Dữ liệu tham số (Query Params, Path Params, JSON Request Body) | `{"username": "admin", "password": "SecretPassword123"}` |
| **7** | **Test Step** | Test Steps | Các bước chuẩn bị và gửi request API | `1. Khởi tạo POST request tới endpoint.\n2. Set Header Content-Type: application/json.\n3. Gửi payload và nhận response.` |
| **8** | **Method** | HTTP Method | Phương thức giao thức HTTP | `GET`, `POST`, `PUT`, `DELETE`, `PATCH` |
| **9** | **Path** | Endpoint Path | Đường dẫn URI tương đối của API | `/api/v1/Authentication/token-data`, `/api/smart_search` |
| **10**| **Expected Response** | Expected Response | Mã trạng thái HTTP, thời gian phản hồi và cấu trúc dữ liệu JSON mong đợi | `HTTP 200 OK, JSON có trường data.token, status="success", latency < 500ms` |
| **11**| **Actual Response** | Actual Response | Kết quả thực tế khi thực thi API thủ công (Postman/Curl) | `HTTP 200 OK, token JWT hợp lệ sinh ra trong 142ms, body đầy đủ thông tin user` |
| **12**| **Loại kiểm thử (Type)** | Test Type | Phân loại kiểm thử API | `Smoke`, `Regression`, `Function`, `Integration`, `Security`, `Performance` |
| **13**| **Status** | Manual Status | Kết quả thực thi thủ công gần nhất | `PASS`, `FAIL`, `PENDING` |
| **14**| **Note** | Notes / Bug ID | Ghi chú kỹ thuật, mã lỗi Jira/Redmine hoặc lý do giữ manual | `Token có hiệu lực trong 24 giờ. Cần cấp refresh token tự động.` |
| **15**| **Automation Status (mới)** | Automation Status | Trạng thái tự động hóa của endpoint API theo chuẩn 4 mức | `Not Started`, `In Progress`, `Automated`, `Manual Only` |

---

## 🎯 3. Định Nghĩa 4 Trạng Thái Của `Automation Status`

Cột **`Automation Status`** là thước đo duy nhất để đo lường tỷ lệ tự động hóa của dự án:

$$\text{Automation Coverage (\%)} = \frac{\text{Số case Automated}}{\text{Tổng số case} - \text{Số case Manual Only}} \times 100\%$$

| Trạng Thái | Ý Nghĩa Chi Tiết | Điều Kiện Đạt Được | Trách Nhiệm / Hành Động Tiếp Theo |
| :--- | :--- | :--- | :--- |
| **`Not Started`** | Chưa bắt đầu tự động hóa. | Testcase chỉ mới có kịch bản thủ công, chưa có mã kiểm thử Playwright tương ứng. | Lên kế hoạch đưa vào Sprint / Wave kiểm thử tiếp theo. |
| **`In Progress`** | Đang phát triển mã tự động. | Đang phân tích selector/DOM, đang dựng Page Object Model hoặc đang viết test script dở dang. | Hoàn thiện code, bổ sung assertions và chạy thử local. |
| **`Automated`** | Đã tự động hóa hoàn chỉnh. | Mã kiểm thử đã được review, kiểm tra kiểu dữ liệu sạch (`tsc --noEmit`), chạy ổn định trên CI/Local, có assertions kiểm tra đầy đủ. | Duy trì bảo trì định kỳ, chạy hồi quy trong CI pipeline. |
| **`Manual Only`** | Giữ kiểm thử thủ công vĩnh viễn. | Ca test không phù hợp hoặc không khả thi để tự động hóa (yêu cầu cảm quan mắt nhìn, so khớp từng pixel thiết kế Figma, can thiệp nút bấm vật lý trên thiết bị camera/IoT, hạ tầng bên ngoài chưa mock được). | **Bắt buộc ghi rõ lý do** tại cột `Chú thích (Notes)`. Định kỳ rà soát để chuyển sang Auto khi có mock/công cụ mới. |

---

## 🔗 4. Quy Tắc Ánh Xạ Giữa Test Case ID Và Code Playwright

Mỗi ca kiểm thử có `Automation Status = Automated` **bắt buộc** phải được phản ánh tương ứng trong mã nguồn Playwright:

```typescript
// tests/ui/vms/vms-smart-search.spec.ts
test.describe('VMS Smart Search - Tìm kiếm thông minh', () => {

  // Mã [SS-MD-001] ánh xạ chính xác với Test Case ID trong file Excel/CSV
  test('[SS-MD-001] Tìm kiếm phương tiện với từ khóa "xe ô tô"', async ({ page }) => {
    const searchPage = new VmsSmartSearchPage(page);
    await searchPage.goto();
    await searchPage.searchKeyword('xe ô tô');
    await searchPage.selectTimeRange('7_days');
    await searchPage.submitSearch();

    // Assertion chặt chẽ
    await expect(searchPage.resultCards).toBeVisible();
    const count = await searchPage.getResultCount();
    expect(count).toBeGreaterThan(0);
  });

});
```

---

## 📂 5. Danh Sách Tệp Biểu Mẫu Chuẩn Trong Repository

| Tệp Mẫu | Vị Trí Lưu Trữ | Mục Đích Sử Dụng |
| :--- | :--- | :--- |
| **`TESTCASE_TEMPLATE_CHUAN.xlsx`** | `testcases/` & `docs/` | File Excel 2-Sheet mẫu chuẩn gồm Sheet `Web UI Testcase` (13 cột) và Sheet `API Testcase` (15 cột) kèm Data Validation dropdown list. |
| **`TESTCASE_UI_TEMPLATE.csv`** | `docs/` | File CSV 13 cột chuẩn dành cho import/export kịch bản Web UI. |
| **`TESTCASE_API_TEMPLATE.csv`** | `docs/` | File CSV 15 cột chuẩn dành cho import/export kịch bản API. |
| **`TESTCASE_TEMPLATE.md`** | `docs/` | Tài liệu đặc tả và hướng dẫn chi tiết quy chuẩn (file hiện tại). |
