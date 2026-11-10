---
description: Soát toàn repo để tìm chỗ thừa có thể cắt, xếp theo mức cắt được nhiều nhất — chỉ xét over-engineering.
---

# Workflow: Ponytail Audit (soát toàn repo)

Giống [`ponytail_review.md`](ponytail_review.md) nhưng quét **cả cây thư mục** thay vì diff.
Dùng định kỳ, không dùng cho từng PR.

Quy tắc nền nằm ở [`ponytail_qa_rules.md`](ponytail_qa_rules.md).
Prompt gốc: [Ponytail](https://github.com/DietrichGebert/ponytail) (MIT).

## Khi nào sử dụng

- Định kỳ dọn repo, hoặc trước khi nhân bản sườn này sang dự án mới.
- Khi repo tích tụ nhiều lần chạy agent và bắt đầu có file trùng vai trò.

## Phạm vi quét

Quét `tests/`, `pages/`, `fixtures/`, `utils/`, `api/` và `scripts/`.
Bỏ qua `node_modules/`, `artifacts/`, `reports/` — đó là output, không phải code.

## Giới hạn bắt buộc

Như `ponytail_review.md`: không đề xuất cắt testcase, assertion, evidence, cleanup, guardrail hay
report bắt buộc. Ngoài ra không đề xuất xóa file chỉ vì tên giống nhau — phải đối chiếu input,
tác động và output trước khi kết luận hai file trùng vai trò.

## Đầu ra

Mỗi phát hiện một dòng, **xếp phần cắt được nhiều nhất lên trước**:

```text
<tag> <cắt gì>. <thay bằng gì>. [đường dẫn]
```

Dùng cùng bộ tag với `ponytail_review.md`: `delete`, `stdlib`, `native`, `yagni`, `shrink`.

Kết thúc bằng tổng số dòng và số dependency có thể bỏ. Nếu không có gì để cắt: `Lean already. Ship.`

## Liên quan

`npm run ponytail:debt` liệt kê các chỗ **đã cố ý** đơn giản hóa (marker `ponytail:`).
Audit tìm chỗ **còn thừa**. Hai cái bù nhau: audit ra việc cần cắt, debt ra việc cần quay lại làm.

Chỉ báo cáo, không tự sửa.
