# Ponytail cho QA — bổ sung cho Harness Engineering

Bản diễn giải phù hợp với repo QA từ nguyên tắc Ponytail:
https://github.com/DietrichGebert/ponytail/blob/main/AGENTS.md
Đây là tích hợp quy tắc trong repo, không phải plugin Ponytail và không cung cấp hooks hay lệnh chuyển mode. Cập nhật có chủ đích qua review; không tự tải hướng dẫn upstream lúc chạy.

## Thứ tự ưu tiên

Yêu cầu người dùng và các giới hạn harness, quyền, guardrails, workflow, schema và prompt vai trò vẫn phải được tuân thủ. Các nguyên tắc tối giản dưới đây không được dùng để bỏ một yêu cầu bắt buộc hoặc mở rộng quyền/tool của agent.

## Khi triển khai hoặc review code

Đọc code liên quan và lần theo luồng thực tế trước khi chọn cách sửa. Xét lần lượt:

1. Phần bổ sung có cần để đáp ứng yêu cầu không? Tránh làm thêm ngoài phạm vi.
2. Repo đã có helper, page object, fixture, runner hoặc pattern phù hợp chưa? Dùng lại nếu đúng hành vi.
3. Thư viện chuẩn đã giải quyết được chưa?
4. Nền tảng hoặc Playwright có tính năng tương ứng chưa?
5. Dependency đã cài có đáp ứng được chưa?
6. Có cách diễn đạt ngắn và rõ hơn mà vẫn đúng ở các biên không? Không nén code đến khó đọc.
7. Nếu cần viết mới, viết phần nhỏ nhất đáp ứng đầy đủ hành vi.

Sửa nguyên nhân gốc: kiểm tra các caller liên quan trước khi sửa helper dùng chung. Chỉ gom script khi đã đối chiếu input, tác động và output; không xóa code chỉ vì tên giống nhau. Không thêm framework, dependency hoặc lớp trừu tượng nếu chưa có nhu cầu cụ thể.

Ưu tiên xóa hơn thêm, chọn cách nhàm chán hơn cách khéo léo, giữ số file ít nhất có thể. Chất vấn yêu cầu phức tạp trước khi dựng: hỏi lại "có thực sự cần X, hay Y đã đủ?" và chờ trả lời thay vì tự dựng cả hai.

## Đánh dấu chỗ đơn giản hóa có chủ đích

Khi cố tình chọn cách đơn giản mà cắt một góc thật, đánh dấu ngay tại dòng code bằng comment `ponytail:` nêu rõ trần giới hạn và điều kiện cần làm lại:

```ts
// ponytail: <đã đơn giản hóa gì>. ceiling: <giới hạn thật>. upgrade: <khi nào phải làm lại>
```

Ví dụ trong repo automation:

```ts
// ponytail: locator theo text tiếng Việt. ceiling: vỡ khi UI đổi ngôn ngữ. upgrade: khi FE thêm data-testid
// ponytail: chỉ phủ happy path của filter. ceiling: chưa bắt lỗi khi filter rỗng. upgrade: khi BA chốt rule filter rỗng
```

Marker phải có đủ cả `ceiling:` và `upgrade:`. Thiếu điều kiện làm lại thì khoản nợ mục âm thầm, nên `npm run ponytail:debt` coi đó là lỗi. Marker dùng cho phần cố ý đơn giản hóa, không dùng thay cho gap coverage, bug đã biết hay evidence thiếu — những thứ đó vẫn phải vào report bắt buộc.

## Áp dụng theo vai trò QA

- QC/Planner: giữ đủ các nhóm coverage theo `business_coverage_rules.md`; gộp testcase chỉ khi vẫn bảo toàn mục đích, dữ liệu và khả năng truy vết. Không tự thu hẹp phạm vi để giảm số test.
- Executor: dùng runner/tool hiện có trong allowlist; giữ approval, cleanup, retry và stability gates. Không thay lỗi thật bằng mock hoặc sửa expected để đạt PASS.
- Verifier: đối chiếu assertion và evidence; phân biệt mock, hệ thống thật, chưa chạy và bị chặn. Thiếu bằng chứng phải ghi gap, không suy diễn PASS.
- Reporter: giữ nguyên schema, số liệu, limitation và các báo cáo bắt buộc. Ngắn gọn không đồng nghĩa bỏ kết quả hoặc che lỗi.
- Agent lập trình: tối giản code triển khai; giữ validation, xử lý lỗi, bảo mật, accessibility và đặc tính thiết bị thực tế cần kiểm tra.

## Điều kiện hoàn thành và checklist review

- Đã tìm phần có thể tái sử dụng và kiểm tra các caller bị ảnh hưởng.
- Thay đổi logic đáng kể có ít nhất một kiểm tra chạy được, có khả năng phát hiện hành vi sai; ưu tiên kiểm tra sẵn có rồi bổ sung khi thiếu. Đây là mức tối thiểu, không thay thế coverage hoặc các gate harness.
- Automation giữ assertion có ý nghĩa và evidence cần thiết. Không dùng kết quả test:list làm bằng chứng test đã PASS.
- Chạy kiểm tra phù hợp và báo trung thực phần chưa chạy; không tạo test chỉ để phản chiếu implementation.
- Mọi chỗ đơn giản hóa có chủ đích đều có marker `ponytail:` kèm ceiling và upgrade; `npm run ponytail:debt` sạch.
- Giữ nguyên scope, quyền, guardrails, cleanup, traceability và report bắt buộc.
