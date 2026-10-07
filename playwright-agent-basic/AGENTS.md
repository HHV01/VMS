# Hướng dẫn làm việc trong repo

Repo automation test bằng Playwright + TypeScript theo chuẩn Ponytail. Mọi thứ vận hành qua `npm`.

## Trước khi sửa code

Đọc và áp dụng [`docs/ponytail_qa_rules.md`](docs/ponytail_qa_rules.md): dùng lại code có sẵn trước khi viết mới, sửa nguyên nhân gốc, giữ assertion có ý nghĩa.

Quy tắc Playwright của framework nằm ở [`docs/playwright_rules.md`](docs/playwright_rules.md).

Mẫu hồ sơ testcase chuẩn nằm ở [`docs/TESTCASE_TEMPLATE.md`](docs/TESTCASE_TEMPLATE.md) và [`docs/TESTCASE_TEMPLATE.csv`](docs/TESTCASE_TEMPLATE.csv).

## Ràng buộc bắt buộc

- **Không hạ coverage, assertion hay evidence** để test dễ xanh hơn.
- **Không dùng chờ cứng** (`waitForTimeout`) và **không dùng `networkidle`** — ứng dụng hiện đại gọi mạng/polling liên tục nên `networkidle` dễ gây treo hoặc timeout.
- **Không hard-code URL hay tài khoản.** Luôn lấy từ `project/.env` (mẫu: `project/.env.example`).
- **Không commit `project/.env`**, ảnh chụp, trace hay báo cáo. `.gitignore` đã chặn sẵn.
- Cố ý đơn giản hóa chỗ nào thì đánh dấu bằng comment `ponytail:` kèm `ceiling:` và `upgrade:`; `npm run ponytail:debt` sẽ báo lỗi nếu thiếu.

## Trước khi kết thúc một thay đổi

```bash
npm run verify
```

Lệnh này chạy `lint` (TypeScript), `ponytail:debt` (sổ nợ) và `test:list` (liệt kê test). Nó **không** gọi vào hệ thống đích thật.
