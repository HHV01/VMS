# Quy Chuẩn Hồ Sơ Test Case & Báo Cáo Excel (2-Sheet Standard)

Bản quy chuẩn định dạng hồ sơ và báo cáo kiểm thử Excel áp dụng thống nhất cho mọi dự án tự động hóa (Web, Mobile, REST API, IoT, Smart Systems).

---

## 📑 Cấu trúc 2 Sheet Bắt Buộc

Mọi file Excel xuất ra từ hệ thống hoặc dùng để quản lý testcase đều tuân thủ đúng **2 Sheet**:

```text
📁 File Báo Cáo / Hồ Sơ Test Case Excel (.xlsx)
├── 📊 Sheet 1: [Testcase chi tiết]  (Toàn bộ metadata, thống kê & 12 cột kịch bản)
└── 🖼️ Sheet 2: [Ảnh lỗi]            (Nhúng trực tiếp ảnh chụp screenshot của các case FAIL)
```

---

## 📊 1. Chi tiết Sheet 1: `Testcase chi tiết`

### A. Khối Metadata đầu trang (Dòng 1 - 6):
* **Dòng 1:** Tiêu đề lớn: `BỘ TESTCASE & KẾT QUẢ THỰC THI [TÊN_DỰ_ÁN]`
* **Dòng 2:** `Tài liệu tham chiếu` | `Hệ thống kiểm thử (URL)`
* **Dòng 3:** `Phạm vi kiểm thử` | `Người thực hiện (Tester)`
* **Dòng 4:** `Phiên bản testcase` | `Ngày thực hiện`
* **Dòng 5:** `Trạng thái` | `Môi trường chạy (Browser, Headed/Headless)`

### B. Bảng Thống kê Tổng quan (Dòng 8):
| Tổng số case | PASS | FAIL | BLOCKED | NOT RUN | Tỷ lệ PASS (%) | Ghi chú |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |

### C. Bảng 12 Cột Kịch bản Chi tiết (Dòng 10 trở đi):

| STT | Tên Cột | Ý Nghĩa | Ví Dụ Mẫu |
| :---: | :--- | :--- | :--- |
| **1** | **Mã kịch bản (Scenario ID)** | Mã nhóm luồng kịch bản | `SC-AUTH-01`, `SC-SRCH-02` |
| **2** | **Tên kịch bản (Test Scenario Title)** | Tên chức năng lớn | `Cấu hình & Đăng nhập hệ thống` |
| **3** | **Mã kiểm thử (Test Case ID)** | Mã định danh duy nhất của test | `VMS-AUTH-UI-001`, `POLE-DEV-002` |
| **4** | **Kịch bản chi tiết (Description)** | Mô tả mục tiêu kiểm thử | `Kiểm tra đăng nhập thành công với admin` |
| **5** | **Điều kiện tiên quyết (Preconditions)** | Trạng thái chuẩn bị trước khi chạy | `Server hoạt động, tài khoản đã kích hoạt` |
| **6** | **Các bước kiểm thử (Test Steps)** | Các bước thao tác (1, 2, 3...) | `1. Vào /login\n2. Điền form\n3. Bấm Submit` |
| **7** | **Kết quả mong đợi (Expected Results)**| Hành vi đúng theo yêu cầu | `Chuyển hướng về Dashboard, lưu token` |
| **8** | **Kết quả thực tế (Actual Results)** | Hành vi ghi nhận thực tế từ browser | `Đã chuyển hướng về Dashboard thành công` |
| **9** | **Loại kiểm thử (Type)** | Phân loại test | `Chức năng/UI`, `Logic/API`, `E2E` |
| **10**| **Tình trạng (Status)** | Trạng thái kết luận | `PASS` (Xanh), `FAIL` (Đỏ), `BLOCKED` (Vàng) |
| **11**| **Chú thích (Notes)** | Tra cứu bằng chứng ảnh khi lỗi | `[AUT-EV-01] Xem sheet Ảnh lỗi` (nếu FAIL) |
| **12**| **Tester** | Người chạy hoặc agent | `QA Automation / Tên Tester` |

---

## 🖼️ 2. Chi tiết Sheet 2: `Ảnh lỗi` (Embedded Screenshots)

Khi một testcase bị **FAIL**, ảnh chụp màn hình được **nhúng trực tiếp vào Sheet `Ảnh lỗi`** tại các khối ô tương ứng mà không cần mở file rời bên ngoài:

```text
+-----------------------------------------------------------------------------------+
| ẢNH LỖI CỦA CÁC CASE FAIL                                                         |
| Ảnh chụp tự động tại thời điểm phát hiện lỗi. Tra theo mã AUT-EV-xx.             |
+-----------------------------------------------------------------------------------+
| [Mã bằng chứng] AUT-EV-01  |  [Mã Test] VMS-SRCH-UI-015  |  [Lỗi] Không hiển thị nút|
+-----------------------------------------------------------------------------------+
|                                                                                   |
|                [ ẢNH CHỤP SCREENSHOT THẬT ĐƯỢC NHÚNG TRỰC TIẾP ]                 |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

---

## ⚙️ 3. Lệnh Tự Động Xuất Excel từ Playwright

Framework tích hợp sẵn script tạo file Excel chuẩn 2-Sheet tự động từ kết quả chạy:

```bash
python scripts/export_excel_report.py
```
* Script tự động đọc `artifacts/` và `playwright-results.json`.
* Tự động sinh `Sheet 1` với bảng màu chuẩn (PASS xanh, FAIL đỏ).
* Tự động lọc các case FAIL, nạp ảnh chụp màn hình tương ứng và chèn vào `Sheet 2 (Ảnh lỗi)`.
