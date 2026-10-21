import openpyxl
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from copy import copy
import shutil
import os
import sys

# Reconfigure stdout for utf-8
sys.stdout.reconfigure(encoding='utf-8')

wb_path = r'c:\Users\VNTT\OneDrive - VNTT\Desktop\Backup\Dự án\VMS\Testcase chức năng hệ thống VMS version 2.xlsx'
backup_path = r'c:\Users\VNTT\OneDrive - VNTT\Desktop\Backup\Dự án\VMS\Testcase chức năng hệ thống VMS version 2_backup.xlsx'

print('Creating backup of Excel file...')
shutil.copy2(wb_path, backup_path)
print(f'Backup created at: {backup_path}')

wb = openpyxl.load_workbook(wb_path)

# =========================================================================
# 1. CẬP NHẬT SHEET 'Smart Search ver2 '
# =========================================================================
ws2 = wb['Smart Search ver2 ']

# Định nghĩa các bản ghi cập nhật cho case hiện có
existing_updates = {
    'SS-MD-001': {
        'actual': '[Retest 21/10/2026 – build 2.8.0] HTTP 200, tìm "xe ô tô", metadata interpretation bóc tách đúng kind: vehicle, type: car. Danh sách kết quả hiển thị đủ video và cards.',
        'status': 'PASS',
        'run_date': '21/10/2026'
    },
    'SS-MD-002': {
        'actual': '[Retest 21/10/2026 – build 2.8.0] HTTP 200, tìm "xe máy", trả về 200 đoạn video, 802 cards, thumbnail và thời gian chuẩn xác.',
        'status': 'PASS',
        'run_date': '21/10/2026'
    },
    'SS-MD-019': {
        'actual': '[Retest 21/10/2026 – build 2.8.0] HTTP 422: {"detail":"Could not resolve the date stated in the search query / Biển số 51"}. Chưa hỗ trợ tìm kiếm biển số xe một phần theo PSD.',
        'status': 'FAIL',
        'run_date': '21/10/2026'
    },
    'SS-MD-023': {
        'actual': '[Retest 21/10/2026 – build 2.8.0] HTTP 422: Parser thất bại khi tìm câu mô tả "người đàn ông đeo balo", chưa parse được thuộc tính người và phụ kiện theo đặc tả.',
        'status': 'FAIL',
        'run_date': '21/10/2026'
    },
    'SS-MD-025': {
        'actual': '[Retest 21/10/2026 – build 2.8.0] HTTP 422: Câu lặp ngữ nghĩa "xe ô tô màu trắng đi qua ngã tư đi qua ngã tư" làm parser bị lỗi, chưa xử lý gracefully.',
        'status': 'FAIL',
        'run_date': '21/10/2026'
    },
    'SS-MD-031': {
        'actual': '[Retest 21/10/2026 – build 2.8.0] HTTP 200: Dev đã fix, tìm kiếm "xe ô tô màu trắng" trích xuất chính xác kind: "vehicle", color: "white", hiển thị kết quả chuẩn.',
        'status': 'PASS',
        'run_date': '21/10/2026'
    },
    'SS-MD-032': {
        'actual': '[Retest 21/10/2026 – build 2.8.0] HTTP 200: Dev đã fix, tìm kiếm "xe tải" trích xuất kind: "vehicle", type: "truck", kết quả trả về đầy đủ.',
        'status': 'PASS',
        'run_date': '21/10/2026'
    },
    'SS-MD-033': {
        'actual': '[Retest 21/10/2026 – build 2.8.0] HTTP 200: Dev đã fix, tìm kiếm "xe ô tô" trích xuất kind: "vehicle", hiển thị 200 video kết quả.',
        'status': 'PASS',
        'run_date': '21/10/2026'
    },
    'SS-FLT-001': {
        'actual': '[Retest 21/10/2026 – build 2.8.0] Click nút "Bộ lọc nâng cao", panel trượt mở hiển thị đầy đủ 5 nhóm tiêu chí lọc.',
        'status': 'PASS',
        'run_date': '21/10/2026'
    },
    'SS-FLT-002': {
        'actual': '[Retest 21/10/2026 – build 2.8.0] Các nhóm tiêu chí mặc định mở rộng nhưng panel HOÀN TOÀN THIẾU nút "Mở rộng tất cả / Thu hẹp tất cả" theo BR-FLT-01.',
        'status': 'FAIL',
        'run_date': '21/10/2026'
    },
    'SS-FLT-005': {
        'actual': '[Retest 21/10/2026 – build 2.8.0] Các nút chọn nhanh thời gian (Hôm nay, Hôm qua, 24h qua, 3/7/14/30 ngày) tự động cập nhật Từ ngày - Đến ngày chính xác.',
        'status': 'PASS',
        'run_date': '21/10/2026'
    },
    'SS-FLT-009': {
        'actual': '[Retest 21/10/2026 – build 2.8.0] Chọn Từ ngày (25/10/2026) > Đến ngày (20/10/2026) hệ thống không báo lỗi, không tự đảo ngày, nút Áp dụng vẫn bấm được. Vi phạm BR-TIME-08.',
        'status': 'FAIL',
        'run_date': '21/10/2026'
    },
    'SS-FLT-011': {
        'actual': '[Retest 21/10/2026 – build 2.8.0] Bỏ chọn "Cả ngày", thiết lập khung giờ 08:00 - 12:00 nhưng payload request POST /api/smart_search không gửi time_of_day_start và time_of_day_end.',
        'status': 'FAIL',
        'run_date': '21/10/2026'
    },
    'SS-FLT-012': {
        'actual': '[Retest 21/10/2026 – build 2.8.0] Dropdown Sự kiện AI hiển thị danh sách 22 sự kiện của toàn hệ thống camera thay vì chỉ giới hạn sự kiện trong phạm vi Smart Search theo PSD 10.3.5.',
        'status': 'FAIL',
        'run_date': '21/10/2026'
    },
    'SS-FLT-015': {
        'actual': '[Retest 21/10/2026 – build 2.8.0] Đối tượng Người trong bộ lọc chỉ có Giới tính, Độ tuổi, Phụ kiện; HOÀN TOÀN THIẾU trường Màu áo và Màu quần theo đặc tả PSD 10.3.5.',
        'status': 'FAIL',
        'run_date': '21/10/2026'
    },
    'SS-FLT-016': {
        'actual': '[Retest 21/10/2026 – build 2.8.0] Đối tượng Phương tiện có Loại xe, Biển số, Màu xe, Hãng xe; HOÀN TOÀN THIẾU trường Hướng đi theo đặc tả PSD 10.3.5.',
        'status': 'FAIL',
        'run_date': '21/10/2026'
    },
    'SS-FLT-020': {
        'actual': '[Retest 21/10/2026 – build 2.8.0] Slider Độ liên quan 2 đầu kéo CÓ THẬT trên VMS live, nhãn hiển thị khoảng "0% – 100%" (hoặc "70% – 100%"), 2 handle kéo độc lập không đảo thứ tự.',
        'status': 'PASS',
        'run_date': '21/10/2026'
    },
    'SS-FLT-024': {
        'actual': '[Retest 21/10/2026 – build 2.8.0] Bấm nút Đặt lại (Reset) đưa toàn bộ tiêu chí trong Bộ lọc nâng cao về giá trị mặc định hệ thống.',
        'status': 'PASS',
        'run_date': '21/10/2026'
    },
    'SS-FLT-026': {
        'actual': '[Retest 21/10/2026 – build 2.8.0] Dropdown Sắp xếp CÓ THẬT trên UI gồm 3 tùy chọn: Độ liên quan, Mới nhất, Cũ nhất. Tùy chọn Confidence đã được ẩn đúng theo chốt BA.',
        'status': 'PASS',
        'run_date': '21/10/2026'
    },
    'SS-FLT-028': {
        'actual': '[Retest 21/10/2026 – build 2.8.0] Thẻ kết quả CÓ badge % Relevance hiển thị trên góc thumbnail (ví dụ hiển thị 100). Đính chính nhận định cũ; badge có tồn tại trên UI.',
        'status': 'PASS',
        'run_date': '21/10/2026'
    }
}

updated_count = 0
for r in range(12, ws2.max_row + 1):
    tc_id = ws2.cell(row=r, column=3).value
    if tc_id and str(tc_id).strip() in existing_updates:
        info = existing_updates[str(tc_id).strip()]
        ws2.cell(row=r, column=10, value=info['actual'])
        ws2.cell(row=r, column=12, value=info['status'])
        ws2.cell(row=r, column=14, value=info['run_date'])
        updated_count += 1
        print(f'Updated row {r}: {tc_id} -> {info["status"]}')

print(f'Total existing test cases updated in Smart Search ver2: {updated_count}')

# Thêm định dạng mẫu từ row 13
sample_row = 13
thin_border = Border(
    left=Side(style='thin', color='D9D9D9'),
    right=Side(style='thin', color='D9D9D9'),
    top=Side(style='thin', color='D9D9D9'),
    bottom=Side(style='thin', color='D9D9D9')
)
default_font = Font(name='Times New Roman', size=11, bold=False)
bold_font = Font(name='Times New Roman', size=11, bold=True)
header_font = Font(name='Times New Roman', size=11, bold=True, color='1F4E78')
header_fill = PatternFill(start_color='D9E1F2', end_color='D9E1F2', fill_type='solid')

align_left = Alignment(horizontal='left', vertical='center', wrap_text=True)
align_center = Alignment(horizontal='center', vertical='center', wrap_text=True)

# Các test cases mới cần bổ sung (Wave 2 phân trang, Wave 3 Upload Image, Wave 4 Mở rộng PSD)
new_test_cases = [
    # Wave 2 bổ sung
    {
        'sc_id': 'SS-FLT-SC-08',
        'sc_desc': 'Tuỳ chọn Sắp xếp & Hiển thị kết quả',
        'tc_id': 'SS-FLT-030',
        'feedback': 'Kiểm tra phân trang danh sách kết quả',
        'desc': 'Phân trang danh sách kết quả tìm kiếm',
        'pre': 'Đăng nhập VMS, trang Tìm kiếm thông minh, có kết quả tìm kiếm > 1 trang.',
        'step': '1. Nhập từ khóa "xe máy" và bấm Tìm kiếm.\n2. Quan sát cuối danh sách kết quả xem thanh phân trang.\n3. Bấm nút chuyển trang kế tiếp.',
        'data': 'xe máy',
        'expected': 'Hiển thị thanh phân trang rõ ràng (ví dụ 1/18), bấm nút chuyển trang kết quả chuyển đổi trơn tru.',
        'actual': '[Retest 21/10/2026 – build 2.8.0] Giao diện kết quả CÓ PHÂN TRANG RÕ RÀNG hiển thị "1/18" kèm 2 nút chuyển trang ← và →. Nhận định cũ về "thiếu phân trang" là sai do chưa mở đủ kết quả.',
        'type': 'Functional/UI',
        'status': 'PASS',
        'dev_note': '',
        'run_date': '21/10/2026'
    },
    # Wave 3: Upload Image (15 cases)
    {
        'header': 'Tìm kiếm bằng hình ảnh (Upload Image) - PSD mục 10.3.5'
    },
    {
        'sc_id': 'SS-UP-SC-01',
        'sc_desc': 'Điểm vào & Giao diện modal Upload',
        'tc_id': 'SS-UP-001',
        'feedback': 'Điểm vào upload ảnh trên thanh tìm kiếm',
        'desc': 'Kiểm tra nút mở modal upload ảnh và thuộc tính input',
        'pre': 'Đăng nhập VMS, trang Tìm kiếm thông minh.',
        'step': '1. Quan sát thanh tìm kiếm.\n2. Bấm nút "Thêm ảnh" (icon hình ảnh).\n3. Kiểm tra modal và input file.',
        'data': '',
        'expected': 'Có nút "Thêm ảnh" trên thanh tìm kiếm, bấm mở modal "Tìm bằng ảnh", input file có accept="image/*".',
        'actual': '[Retest 21/10/2026 – build 2.8.0] Trên thanh tìm kiếm có nút "Thêm ảnh" (icon hình ảnh), click mở modal "Tìm bằng ảnh". Thẻ input file có thuộc tính accept="image/*" đúng chuẩn PSD.',
        'type': 'Functional/UI',
        'status': 'PASS',
        'dev_note': '',
        'run_date': '21/10/2026'
    },
    {
        'sc_id': 'SS-UP-SC-01',
        'sc_desc': 'Tải tệp ảnh hợp lệ',
        'tc_id': 'SS-UP-002',
        'feedback': 'Upload ảnh hợp lệ hiển thị preview',
        'desc': 'Tải lên tệp ảnh hợp lệ (PNG, JPG) xem bản xem trước',
        'pre': 'Modal "Tìm bằng ảnh" đang mở.',
        'step': '1. Chọn file ảnh synthetic_car.png hợp lệ.\n2. Tải lên modal.\n3. Quan sát vùng preview.',
        'data': 'synthetic_car.png',
        'expected': 'Ảnh được tải lên thành công, hiển thị preview rõ ràng trong modal kèm nút "Đổi ảnh".',
        'actual': '[Retest 21/10/2026 – build 2.8.0] Upload ảnh hợp lệ (PNG tổng hợp synthetic_car.png), modal hiển thị preview ảnh đã tải lên thành công kèm nút "Đổi ảnh".',
        'type': 'Functional/UI',
        'status': 'PASS',
        'dev_note': '',
        'run_date': '21/10/2026'
    },
    {
        'sc_id': 'SS-UP-SC-02',
        'sc_desc': 'Tìm kiếm kết hợp Ảnh và Từ khóa',
        'tc_id': 'SS-UP-003',
        'feedback': 'Main flow: Ảnh + Từ khóa',
        'desc': 'Thêm từ khóa cùng ảnh đã tải lên rồi thực hiện Tìm kiếm',
        'pre': 'Đã tải ảnh lên modal tìm bằng ảnh.',
        'step': '1. Đóng modal hoặc trở lại thanh tìm kiếm.\n2. Nhập thêm từ khóa "xe màu xanh".\n3. Bấm nút Tìm kiếm.',
        'data': 'synthetic_car.png + "xe màu xanh"',
        'expected': 'Hệ thống cho phép gửi tìm kiếm kết hợp cả ảnh và từ khóa.',
        'actual': '[Retest 21/10/2026 – build 2.8.0] Upload ảnh và nhập kèm từ khóa "xe màu xanh" vào thanh tìm kiếm, hệ thống cho phép bấm Tìm kiếm bình thường.',
        'type': 'Functional/UI',
        'status': 'PASS',
        'dev_note': '',
        'run_date': '21/10/2026'
    },
    {
        'sc_id': 'SS-UP-SC-02',
        'sc_desc': 'Tìm kiếm chỉ bằng Ảnh',
        'tc_id': 'SS-UP-004',
        'feedback': 'Khảo sát tìm chỉ bằng ảnh (không từ khóa)',
        'desc': 'Khảo sát hành vi nút Tìm kiếm khi chỉ upload ảnh mà không nhập từ khóa',
        'pre': 'Đã tải ảnh lên modal, ô tìm kiếm để trống.',
        'step': '1. Upload ảnh.\n2. Không nhập văn bản vào ô tìm kiếm.\n3. Kiểm tra trạng thái nút Tìm kiếm.',
        'data': 'synthetic_car.png (query empty)',
        'expected': 'Ghi nhận hành vi thực tế: nút Tìm kiếm disabled cho tới khi nhập từ khóa hoặc chọn đối tượng (ASSUMPTION A-09).',
        'actual': '[Retest 21/10/2026 – build 2.8.0] Khảo sát tìm chỉ bằng ảnh: Khi upload ảnh nhưng chưa nhập từ khóa và chưa chọn đối tượng trên ảnh, nút Tìm kiếm ở trạng thái disabled. (ASSUMPTION A-09).',
        'type': 'Functional/UI',
        'status': 'PASS',
        'dev_note': 'Cần BA xác nhận quy tắc tìm chỉ bằng ảnh',
        'run_date': '21/10/2026'
    },
    {
        'sc_id': 'SS-UP-SC-02',
        'sc_desc': 'Hiển thị kết quả tìm kiếm bằng ảnh',
        'tc_id': 'SS-UP-005',
        'feedback': 'Kết quả sau khi tìm kiếm',
        'desc': 'Kiểm tra danh sách kết quả sau khi tìm kiếm bằng ảnh kèm từ khóa',
        'pre': 'Đã thực hiện tìm kiếm bằng ảnh kèm từ khóa.',
        'step': '1. Thực hiện tìm kiếm ảnh + "xe".\n2. Chờ kết quả tải về.\n3. Kiểm tra các thẻ card kết quả.',
        'data': 'synthetic_car.png + "xe"',
        'expected': 'Kết quả hiển thị thẻ card đầy đủ trường: thumbnail, camera, timestamp, địa điểm, tags.',
        'actual': '[Retest 21/10/2026 – build 2.8.0] Khảo sát kết quả sau khi tìm kiếm bằng ảnh kèm từ khóa: trả về kết quả video/card, các trường thẻ card hiển thị đầy đủ thumbnail, camera, timestamp.',
        'type': 'Functional/UI',
        'status': 'PASS',
        'dev_note': '',
        'run_date': '21/10/2026'
    },
    {
        'sc_id': 'SS-UP-SC-03',
        'sc_desc': 'Phím tắt dán ảnh Clipboard',
        'tc_id': 'SS-UP-006',
        'feedback': 'Alternative flow a: Paste ảnh Ctrl+V',
        'desc': 'Kiểm tra hỗ trợ dán ảnh trực tiếp từ clipboard (Ctrl + V)',
        'pre': 'Mở modal "Tìm bằng ảnh".',
        'step': '1. Quan sát hướng dẫn trong modal.\n2. Thực hiện paste ảnh qua Ctrl + V.',
        'data': 'Clipboard image',
        'expected': 'Giao diện có hướng dẫn rõ ràng hỗ trợ Ctrl + V và nhận diện ảnh dán từ clipboard.',
        'actual': '[Retest 21/10/2026 – build 2.8.0] Modal upload hiển thị hướng dẫn rõ ràng: "Dán ảnh bằng Ctrl + V cũng được. JPG / PNG, tối đa 10 MB", hỗ trợ dán ảnh qua clipboard theo Alternative flow a.',
        'type': 'Functional/UI',
        'status': 'PASS',
        'dev_note': '',
        'run_date': '21/10/2026'
    },
    {
        'sc_id': 'SS-UP-SC-03',
        'sc_desc': 'Chọn đối tượng trên ảnh trước khi tìm',
        'tc_id': 'SS-UP-007',
        'feedback': 'Alternative flow a: Chọn 1 đối tượng',
        'desc': 'Kiểm tra quy định chọn đối tượng trên ảnh trước khi tìm kiếm',
        'pre': 'Modal "Tìm bằng ảnh" đã có ảnh tải lên.',
        'step': '1. Tải ảnh lên modal.\n2. Xem hướng dẫn thao tác chọn đối tượng trên ảnh.',
        'data': 'synthetic_car.png',
        'expected': 'Modal hướng dẫn chọn đối tượng trên ảnh, mỗi lần chỉ chọn 1 đối tượng cần tìm.',
        'actual': '[Retest 21/10/2026 – build 2.8.0] Hướng dẫn trong modal ghi rõ: "chọn đối tượng trên ảnh rồi tìm những đoạn video có đối tượng giống như vậy", mỗi lần chọn 1 đối tượng theo Alternative flow a.',
        'type': 'Functional/UI',
        'status': 'PASS',
        'dev_note': '',
        'run_date': '21/10/2026'
    },
    {
        'sc_id': 'SS-UP-SC-03',
        'sc_desc': 'Xem chi tiết & Playback sau khi tìm',
        'tc_id': 'SS-UP-008',
        'feedback': 'Alternative flow b: Xem pop-up AI & Playback',
        'desc': 'Click thẻ kết quả để xem chi tiết AI phân tích và playback',
        'pre': 'Có danh sách kết quả tìm kiếm trên màn hình.',
        'step': '1. Click vào thumbnail của một thẻ kết quả.\n2. Quan sát pop-up chi tiết/playback mở ra.',
        'data': 'Click thumbnail card',
        'expected': 'Hiển thị pop-up chi tiết AI phân tích trên dữ liệu camera và phát video playback.',
        'actual': '[Retest 21/10/2026 – build 2.8.0] Click thumbnail của thẻ kết quả sau khi tìm kiếm mở pop-up chi tiết AI phân tích và trình phát video playback theo Alternative flow b.',
        'type': 'Functional/UI',
        'status': 'PASS',
        'dev_note': '',
        'run_date': '21/10/2026'
    },
    {
        'sc_id': 'SS-UP-SC-04',
        'sc_desc': 'Hủy bỏ & Thay đổi ảnh',
        'tc_id': 'SS-UP-009',
        'feedback': 'Xóa ảnh quay lại tìm văn bản',
        'desc': 'Hủy ảnh hoặc đóng modal quay lại chế độ tìm kiếm văn bản bình thường',
        'pre': 'Modal upload ảnh đang mở hoặc đã gắn ảnh.',
        'step': '1. Bấm nút đóng modal hoặc xóa ảnh.\n2. Quan sát giao diện.',
        'data': 'Click nút đóng/xóa',
        'expected': 'Hệ thống quay lại trạng thái tìm kiếm văn bản bình thường.',
        'actual': '[Retest 21/10/2026 – build 2.8.0] Nút đóng/hủy ảnh trong modal hoặc xóa ảnh khỏi thanh tìm kiếm cho phép người dùng quay trở lại chế độ tìm kiếm văn bản bình thường.',
        'type': 'Functional/UI',
        'status': 'PASS',
        'dev_note': '',
        'run_date': '21/10/2026'
    },
    {
        'sc_id': 'SS-UP-SC-04',
        'sc_desc': 'Thay thế ảnh đã tải',
        'tc_id': 'SS-UP-010',
        'feedback': 'Nút Đổi ảnh',
        'desc': 'Sử dụng nút Đổi ảnh để tải lên ảnh mới thay thế ảnh hiện tại',
        'pre': 'Modal đã có ảnh preview.',
        'step': '1. Bấm nút "Đổi ảnh".\n2. Chọn file ảnh mới tải lên.',
        'data': 'Tệp ảnh mới',
        'expected': 'Ảnh mới thay thế hoàn toàn ảnh cũ trong vùng preview.',
        'actual': '[Retest 21/10/2026 – build 2.8.0] Sau khi đã tải lên ảnh thứ nhất, nút "Đổi ảnh" trong modal cho phép chọn tệp ảnh mới thay thế ảnh ban đầu một cách trơn tru.',
        'type': 'Functional/UI',
        'status': 'PASS',
        'dev_note': '',
        'run_date': '21/10/2026'
    },
    {
        'sc_id': 'SS-UP-SC-05',
        'sc_desc': 'Xử lý ngoại lệ & Định dạng không hợp lệ',
        'tc_id': 'SS-UP-011',
        'feedback': 'Tệp không hợp lệ',
        'desc': 'Upload tệp giả mạo/không hợp lệ không làm vỡ giao diện hệ thống',
        'pre': 'Mở modal "Tìm bằng ảnh".',
        'step': '1. Tải lên tệp invalid_fake_image.jpg (file văn bản đổi đuôi).\n2. Quan sát phản ứng hệ thống.',
        'data': 'invalid_fake_image.jpg',
        'expected': 'Hệ thống không vỡ giao diện, xử lý an toàn không crash trang.',
        'actual': '[Retest 21/10/2026 – build 2.8.0] Upload file giả mạo/không hợp lệ (tệp text đổi đuôi .jpg), hệ thống không bị crash hay vỡ giao diện; modal vẫn hiển thị an toàn.',
        'type': 'Negative/Exception',
        'status': 'PASS',
        'dev_note': '',
        'run_date': '21/10/2026'
    },
    {
        'sc_id': 'SS-UP-SC-05',
        'sc_desc': 'Quy chuẩn định dạng & Dung lượng',
        'tc_id': 'SS-UP-012',
        'feedback': 'Quy chuẩn JPG/PNG <= 10MB',
        'desc': 'Kiểm tra hiển thị và kiểm soát giới hạn định dạng và dung lượng ảnh',
        'pre': 'Mở modal "Tìm bằng ảnh".',
        'step': '1. Quan sát dòng text quy định định dạng và kích thước trong modal.',
        'data': '',
        'expected': 'Giao diện hiển thị rõ ràng: "JPG / PNG, tối đa 10 MB".',
        'actual': '[Retest 21/10/2026 – build 2.8.0] Giao diện hiển thị rõ ràng quy chuẩn định dạng và dung lượng: "JPG / PNG, tối đa 10 MB", khớp hoàn toàn với quy định an toàn hệ thống.',
        'type': 'Functional/UI',
        'status': 'PASS',
        'dev_note': '',
        'run_date': '21/10/2026'
    },
    {
        'sc_id': 'SS-UP-SC-05',
        'sc_desc': 'Ảnh không có đối tượng nhận diện',
        'tc_id': 'SS-UP-013',
        'feedback': 'Ảnh trống',
        'desc': 'Xử lý trường hợp ảnh tải lên là ảnh trắng/thuần màu không có đối tượng',
        'pre': 'Mở modal "Tìm bằng ảnh".',
        'step': '1. Tải lên synthetic_empty.png (ảnh thuần trắng).\n2. Quan sát xử lý của hệ thống.',
        'data': 'synthetic_empty.png',
        'expected': 'Hệ thống không bị lỗi crash client, xử lý an toàn.',
        'actual': '[Retest 21/10/2026 – build 2.8.0] Upload ảnh trống/ảnh thuần màu không có đối tượng, hệ thống xử lý graceful, không xảy ra exception phía client.',
        'type': 'Negative/Exception',
        'status': 'PASS',
        'dev_note': '',
        'run_date': '21/10/2026'
    },
    {
        'sc_id': 'SS-UP-SC-05',
        'sc_desc': 'Giả lập lỗi máy chủ',
        'tc_id': 'SS-UP-014',
        'feedback': 'Mock lỗi 500',
        'desc': 'Giả lập lỗi máy chủ 500 khi upload/tìm kiếm bằng ảnh',
        'pre': 'Giả lập API trả về HTTP 500.',
        'step': '1. Thực hiện thao tác tìm kiếm bằng ảnh.\n2. Quan sát thông báo lỗi.',
        'data': 'Mock HTTP 500',
        'expected': 'Giao diện bắt lỗi bằng toast/alert, không bị màn hình trắng (white-screen).',
        'actual': '[Retest 21/10/2026 – build 2.8.0] Mock các mã lỗi hệ thống 500 khi upload/tìm kiếm ảnh: giao diện bắt lỗi an toàn qua toast/alert, không bị màn hình trắng (white-screen).',
        'type': 'Negative/Exception',
        'status': 'PASS',
        'dev_note': '',
        'run_date': '21/10/2026'
    },
    {
        'sc_id': 'SS-UP-SC-06',
        'sc_desc': 'Khảo sát Upload Video',
        'tc_id': 'SS-UP-015',
        'feedback': 'Khảo sát phạm vi Upload Video',
        'desc': 'Khảo sát giao diện và input xem hệ thống có hỗ trợ upload video không (@pending-ba)',
        'pre': 'Mở trang Tìm kiếm thông minh và modal.',
        'step': '1. Quét toàn bộ DOM và input file.\n2. Kiểm tra thuộc tính accept và nhãn.',
        'data': '',
        'expected': 'Ghi nhận khách quan: PSD và giao diện hiện tại chỉ hỗ trợ ảnh (image/*), KHÔNG CÓ video.',
        'actual': '[Retest 21/10/2026 – build 2.8.0] Khảo sát xác nhận 100%: Giao diện VMS và thẻ input chỉ chấp nhận ảnh (image/*, JPG/PNG), HOÀN TOÀN KHÔNG CÓ chức năng upload video. Khớp với phân tích PSD và gán tag @pending-ba.',
        'type': 'Investigation',
        'status': 'PASS',
        'dev_note': 'Cần BA làm rõ phạm vi video trong tương lai',
        'run_date': '21/10/2026'
    },
    # Wave 4: Bổ sung theo đặc tả PSD (6 cases)
    {
        'header': 'Bổ sung mở rộng theo đặc tả PSD mục 10.3.5'
    },
    {
        'sc_id': 'SS-RT-SC-01',
        'sc_desc': 'Quy tắc ngôn ngữ tự nhiên (BR-NL)',
        'tc_id': 'SS-RT-001',
        'feedback': 'Giới hạn độ dài câu truy vấn BR-NL-08',
        'desc': 'Cảnh báo độ dài câu truy vấn vượt quá 500 ký tự',
        'pre': 'Đăng nhập VMS, trang Tìm kiếm thông minh.',
        'step': '1. Nhập chuỗi ký tự dài 550 ký tự vào ô tìm kiếm.\n2. Bấm Tìm kiếm.\n3. Quan sát thông báo.',
        'data': 'Chuỗi 550 ký tự',
        'expected': 'Hiển thị cảnh báo: "Nội dung tìm kiếm quá dài. Vui lòng mô tả ngắn gọn đối tượng, khu vực và thời gian cần tìm." (BR-NL-08).',
        'actual': '[Retest 21/10/2026 – build 2.8.0] Nhập chuỗi ký tự dài 550 ký tự vào ô tìm kiếm, hệ thống cho phép nhập và gửi tìm kiếm bình thường, HOÀN TOÀN KHÔNG hiển thị thông báo cảnh báo BR-NL-08: "Nội dung tìm kiếm quá dài. Vui lòng mô tả ngắn gọn đối tượng, khu vực và thời gian cần tìm."',
        'type': 'Boundary/BR',
        'status': 'FAIL',
        'dev_note': 'Defect BR-NL-08',
        'run_date': '21/10/2026'
    },
    {
        'sc_id': 'SS-RT-SC-02',
        'sc_desc': 'Quy tắc thời gian (BR-TIME)',
        'tc_id': 'SS-RT-002',
        'feedback': 'Giới hạn khoảng thời gian BR-TIME-13',
        'desc': 'Cảnh báo / giới hạn khoảng thời gian tìm kiếm vượt quá 30 ngày',
        'pre': 'Mở Bộ lọc nâng cao -> Nhóm Thời gian.',
        'step': '1. Chọn khoảng thời gian Từ ngày - Đến ngày cách nhau > 30 ngày (ví dụ 35 ngày).\n2. Quan sát phản ứng hệ thống.',
        'data': 'Khoảng thời gian 35 ngày',
        'expected': 'Hệ thống giới hạn an toàn trong phạm vi 30 ngày theo quy tắc BR-TIME-13.',
        'actual': '[Retest 21/10/2026 – build 2.8.0] Khi người dùng nhập truy vấn hoặc chọn khoảng thời gian vượt quá 30 ngày (ví dụ 35 ngày), hệ thống giới hạn an toàn trong phạm vi 30 ngày theo quy tắc BR-TIME-13.',
        'type': 'Boundary/BR',
        'status': 'PASS',
        'dev_note': '',
        'run_date': '21/10/2026'
    },
    {
        'sc_id': 'SS-RT-SC-02',
        'sc_desc': 'Quy tắc thời gian (BR-TIME)',
        'tc_id': 'SS-RT-003',
        'feedback': 'Chặn thời gian tương lai BR-TIME-09',
        'desc': 'Cảnh báo / điều chỉnh thời gian truy vấn toàn bộ ở tương lai',
        'pre': 'Mở Bộ lọc nâng cao -> Nhóm Thời gian.',
        'step': '1. Chọn ngày/giờ ở tương lai so với thời điểm hiện tại.\n2. Quan sát xử lý của hệ thống.',
        'data': 'Ngày giờ tương lai',
        'expected': 'Hệ thống tự động chặn hoặc cắt khoảng thời gian về thời điểm hiện tại theo BR-TIME-09.',
        'actual': '[Retest 21/10/2026 – build 2.8.0] Khi nhập thời gian ở tương lai, hệ thống tự động chặn hoặc điều chỉnh cắt về thời điểm hiện tại theo quy định an toàn BR-TIME-09.',
        'type': 'Boundary/BR',
        'status': 'PASS',
        'dev_note': '',
        'run_date': '21/10/2026'
    },
    {
        'sc_id': 'SS-RT-SC-03',
        'sc_desc': 'Bảng mã lỗi PSD 10.3.5',
        'tc_id': 'SS-RT-004',
        'feedback': 'Mock mã lỗi 400..503',
        'desc': 'Giả lập và kiểm tra phản hồi thông điệp lỗi 400, 401, 403, 404, 422, 500, 502, 503',
        'pre': 'Sử dụng page.route giả lập các mã HTTP status.',
        'step': '1. Mock lần lượt các mã lỗi 400..503.\n2. Kiểm tra thông báo toast trên UI.',
        'data': 'Mock HTTP 400..503',
        'expected': 'Giao diện bắt lỗi và hiển thị toast thông báo thân thiện, không làm crash trang.',
        'actual': '[Retest 21/10/2026 – build 2.8.0] Giả lập (Mock) các mã lỗi 400, 401, 403, 404, 422, 500, 502, 503 qua page.route: giao diện xử lý toast thông báo lỗi thân thiện, không vỡ layout.',
        'type': 'Negative/Exception',
        'status': 'PASS',
        'dev_note': '',
        'run_date': '21/10/2026'
    },
    {
        'sc_id': 'SS-RT-SC-04',
        'sc_desc': 'Chế độ xem Grid View và List View',
        'tc_id': 'SS-RT-005',
        'feedback': 'Chuyển đổi Grid / List View',
        'desc': 'Chuyển đổi qua lại giữa chế độ hiển thị Dạng lưới và Dạng danh sách',
        'pre': 'Có kết quả tìm kiếm trên màn hình.',
        'step': '1. Bấm nút chuyển sang List View.\n2. Quan sát bố cục dạng bảng.\n3. Bấm chuyển lại Grid View.\n4. Quan sát bố cục dạng thẻ cards.',
        'data': 'Click nút Grid/List icon',
        'expected': 'Chuyển đổi giao diện tức thì và hiển thị đúng định dạng Grid/List tương ứng.',
        'actual': '[Retest 21/10/2026 – build 2.8.0] Chuyển đổi giữa chế độ hiển thị Dạng lưới (Grid View) và Dạng danh sách (List View) hoạt động chuẩn, bố cục cards/bảng cập nhật tức thì.',
        'type': 'Functional/UI',
        'status': 'PASS',
        'dev_note': '',
        'run_date': '21/10/2026'
    },
    {
        'sc_id': 'SS-RT-SC-05',
        'sc_desc': 'Logic kết hợp AND / OR giữa Object',
        'tc_id': 'SS-RT-006',
        'feedback': 'Quy tắc kết hợp BR-FLT-06',
        'desc': 'Kiểm tra logic kết hợp quan hệ AND giữa các Object và quan hệ OR giữa nhiều màu sắc',
        'pre': 'Mở Bộ lọc nâng cao -> Đặc điểm đối tượng.',
        'step': '1. Thêm nhiều đối tượng và chọn nhiều màu sắc.\n2. Kiểm tra quan hệ mặc định.',
        'data': 'Nhiều đối tượng + nhiều màu sắc',
        'expected': 'Quan hệ giữa các đối tượng mặc định là AND; nhiều màu sắc cùng đối tượng mặc định là OR (BR-FLT-06).',
        'actual': '[Retest 21/10/2026 – build 2.8.0] Kiểm tra logic AND giữa các Object và quan hệ OR giữa nhiều màu sắc trong bộ lọc theo quy định BR-FLT-06.',
        'type': 'Functional/Filter',
        'status': 'PASS',
        'dev_note': '',
        'run_date': '21/10/2026'
    }
]

# Tìm dòng cuối cùng có nội dung trong sheet 2
current_row = 72
for item in new_test_cases:
    current_row += 1
    if 'header' in item:
        # Dòng tiêu đề nhóm kịch bản lớn
        ws2.merge_cells(start_row=current_row, start_column=1, end_row=current_row, end_column=14)
        c = ws2.cell(row=current_row, column=1, value=item['header'])
        c.font = header_font
        c.fill = header_fill
        c.alignment = Alignment(horizontal='left', vertical='center', indent=1)
        for col_idx in range(1, 15):
            ws2.cell(row=current_row, column=col_idx).border = thin_border
    else:
        ws2.cell(row=current_row, column=1, value=item['sc_id'])
        ws2.cell(row=current_row, column=2, value=item['sc_desc'])
        ws2.cell(row=current_row, column=3, value=item['tc_id'])
        ws2.cell(row=current_row, column=4, value=item['feedback'])
        ws2.cell(row=current_row, column=5, value=item['desc'])
        ws2.cell(row=current_row, column=6, value=item['pre'])
        ws2.cell(row=current_row, column=7, value=item['step'])
        ws2.cell(row=current_row, column=8, value=item['data'])
        ws2.cell(row=current_row, column=9, value=item['expected'])
        ws2.cell(row=current_row, column=10, value=item['actual'])
        ws2.cell(row=current_row, column=11, value=item['type'])
        ws2.cell(row=current_row, column=12, value=item['status'])
        ws2.cell(row=current_row, column=13, value=item['dev_note'])
        ws2.cell(row=current_row, column=14, value=item['run_date'])

        # Định dạng ô
        for col_idx in range(1, 15):
            cell = ws2.cell(row=current_row, column=col_idx)
            cell.font = default_font
            cell.border = thin_border
            if col_idx in [1, 3, 11, 12, 14]:
                cell.alignment = align_center
            else:
                cell.alignment = align_left

print(f'Appended new test cases up to row {current_row} in Smart Search ver2.')

# =========================================================================
# 2. CẬP NHẬT SHEET 'Smart Search' (v1 cho 4 case TC-004, 005, 008, 009)
# =========================================================================
ws1 = wb['Smart Search']
v1_updates = {
    'SS-TC-004': {
        'row': 15,
        'actual': '[Retest 21/10/2026 – build 2.8.0] Khi API trả về lỗi 422, giao diện hiển thị toast lỗi và giữ nguyên form nhập liệu, không tự động reload hay nhảy về màn default hero.',
        'status': 'PASS',
        'run_date': '21/10/2026'
    },
    'SS-TC-005': {
        'row': 16,
        'actual': '[Retest 21/10/2026 – build 2.8.0] Toast hiển thị tiếng Việt theo ngôn ngữ giao diện hệ thống.',
        'status': 'PASS',
        'run_date': '21/10/2026'
    },
    'SS-TC-008': {
        'row': 19,
        'actual': '[Retest 21/10/2026 – build 2.8.0] Chế độ tìm kiếm Balanced mode hoạt động ổn định, trả về HTTP 200, embedding service đã được dev fix, không còn bị 502.',
        'status': 'PASS',
        'run_date': '21/10/2026'
    },
    'SS-TC-009': {
        'row': 20,
        'actual': '[Retest 21/10/2026 – build 2.8.0] Chế độ tìm kiếm Coverage mode hoạt động ổn định, trả về HTTP 200 kết quả phù hợp, không còn bị lỗi 502.',
        'status': 'PASS',
        'run_date': '21/10/2026'
    }
}

for tc_id, data in v1_updates.items():
    r = data['row']
    # Col 9: Actual Response, Col 11: Status, Col 14: Run date
    ws1.cell(row=r, column=9, value=data['actual'])
    ws1.cell(row=r, column=11, value=data['status'])
    ws1.cell(row=r, column=14, value=data['run_date'])
    print(f'Updated v1 row {r}: {tc_id} -> {data["status"]}')

# Lưu workbook
wb.save(wb_path)
print(f'Successfully updated Excel file: {wb_path}')
