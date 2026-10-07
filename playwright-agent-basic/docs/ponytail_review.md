---
description: Soát phần code vừa thay đổi để tìm chỗ thừa có thể cắt — chỉ xét over-engineering, không xét đúng/sai.
---

# Workflow: Ponytail Review (soát diff)

Soát **các thay đổi hiện tại** để tìm phần thừa. Chỉ xét over-engineering, không xét correctness —
lỗi logic thuộc về review thường và các gate trong `npm run verify`.

Quy tắc nền nằm ở [`ponytail_qa_rules.md`](ponytail_qa_rules.md).
Prompt gốc: [Ponytail](https://github.com/DietrichGebert/ponytail) (MIT).

## Khi nào sử dụng

- Trước khi mở PR hoặc bàn giao một feature automation.
- Sau khi agent sinh page object, fixture hoặc spec mới.
- Khi thấy diff phình mà không rõ phần nào thật sự cần.

## Giới hạn bắt buộc

Không được đề xuất cắt testcase, assertion, evidence, cleanup, guardrail hay nội dung report bắt buộc.
Tối giản áp dụng cho **code triển khai**, không áp dụng cho coverage. Đề xuất nào làm giảm khả năng
phát hiện lỗi là đề xuất sai.

## Đầu ra

Mỗi phát hiện một dòng:

```text
L<dòng>: <tag> <cắt gì>. <thay bằng gì>.
```

Tag:

| Tag | Nghĩa |
|---|---|
| `delete` | code chết, feature dựng sẵn cho tương lai chưa ai yêu cầu |
| `stdlib` | viết lại thứ thư viện chuẩn đã có |
| `native` | tự làm thứ Playwright hoặc nền tảng đã hỗ trợ (auto-wait, `expect` retry, `toHaveText`…) |
| `yagni` | lớp trừu tượng chỉ có một implementation |
| `shrink` | cùng logic, ít dòng hơn, vẫn đúng ở các biên |

Kết thúc bằng tổng số dòng có thể bỏ. Nếu không có gì để cắt: `Lean already. Ship.`

## Điểm hay gặp trong repo automation

- Page object hoặc spec trùng nhau giữa hai file đặt tên khác nhau.
- Helper chờ tự viết trong khi Playwright đã auto-wait hoặc `expect` đã retry sẵn.
- Wrapper mỏng bọc quanh `expect` không thêm thông tin khi fail.
- Fixture nhận tham số nhưng mọi caller đều truyền đúng một giá trị.
- `try/catch` nuốt lỗi rồi vẫn để test PASS.

Chỉ báo cáo, không tự sửa. Muốn áp dụng thì chạy sửa ở một bước riêng để diff còn đọc được.
