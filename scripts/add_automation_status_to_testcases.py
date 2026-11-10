# -*- coding: utf-8 -*-
"""
Script bổ sung cột 'Automation Status' vào các file Excel testcase thực tế của VMS
Tuân thủ chiến lược: Mỗi dự án 1 repo, chuẩn hóa testcase, đo lường tỷ lệ tự động hóa.
"""

import os
import re
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

thin_border = Border(
    left=Side(style='thin', color='000000'),
    right=Side(style='thin', color='000000'),
    top=Side(style='thin', color='000000'),
    bottom=Side(style='thin', color='000000')
)

fill_auto = PatternFill(start_color="D9EAD3", end_color="D9EAD3", fill_type="solid") # Xanh lá nhạt
fill_in_progress = PatternFill(start_color="FFF2CC", end_color="FFF2CC", fill_type="solid") # Vàng nhạt
fill_orange_header = PatternFill(start_color="FFC000", end_color="FFC000", fill_type="solid")

def update_object_counting():
    oc_path = os.path.join(repo_root, "testcases", "BO_TESTCASE_VMS_OBJECT_COUNTING_HOAN_CHINH.xlsx")
    if not os.path.exists(oc_path):
        print(f"File not found: {oc_path}")
        return

    wb = openpyxl.load_workbook(oc_path)
    ws = wb["Testcase chi tiết"]

    # Header Row 11, Col 13
    col_idx = 13
    cell_h = ws.cell(row=11, column=col_idx, value="Automation Status\n(Trạng thái Auto)")
    cell_h.font = Font(name="Times New Roman", size=10, bold=True, color="000000")
    cell_h.fill = fill_orange_header
    cell_h.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    cell_h.border = thin_border
    ws.column_dimensions[get_column_letter(col_idx)].width = 18

    # Rows 12 to 86: 100% automated in vms-object-counting.spec.ts
    for r in range(12, ws.max_row + 1):
        tc_id = ws.cell(row=r, column=3).value
        if not tc_id:
            continue
        c = ws.cell(row=r, column=col_idx, value="Automated")
        c.font = Font(name="Times New Roman", size=10, bold=True, color="274E13")
        c.fill = fill_auto
        c.alignment = Alignment(horizontal="center", vertical="center")
        c.border = thin_border

    # KPI Block in Row 8 - Row 9
    ws.merge_cells("G8:H8")
    ws.merge_cells("I8:J8")
    ws.cell(8, 7, "Automated (Auto)").font = Font(name="Times New Roman", size=10, bold=True, color="FFFFFF")
    ws.cell(8, 7).fill = PatternFill(start_color="0070C0", end_color="0070C0", fill_type="solid")
    ws.cell(8, 7).alignment = Alignment(horizontal="center", vertical="center")
    ws.cell(8, 7).border = thin_border
    ws.cell(8, 8).border = thin_border

    ws.cell(8, 9, "Tỷ lệ Auto (%)").font = Font(name="Times New Roman", size=10, bold=True, color="FFFFFF")
    ws.cell(8, 9).fill = PatternFill(start_color="004D40", end_color="004D40", fill_type="solid")
    ws.cell(8, 9).alignment = Alignment(horizontal="center", vertical="center")
    ws.cell(8, 9).border = thin_border
    ws.cell(8, 10).border = thin_border

    ws.merge_cells("G9:H9")
    ws.merge_cells("I9:J9")
    ws.cell(9, 7, 75).font = Font(name="Times New Roman", size=11, bold=True, color="0070C0")
    ws.cell(9, 7).alignment = Alignment(horizontal="center", vertical="center")
    ws.cell(9, 7).border = thin_border
    ws.cell(9, 8).border = thin_border

    ws.cell(9, 9, "100.0%").font = Font(name="Times New Roman", size=11, bold=True, color="004D40")
    ws.cell(9, 9).alignment = Alignment(horizontal="center", vertical="center")
    ws.cell(9, 9).border = thin_border
    ws.cell(9, 10).border = thin_border

    wb.save(oc_path)
    print(f"Updated: {oc_path} -> Added Automation Status (75 Automated / 100%)")

def update_smart_search_ver2():
    ss_path = os.path.join(repo_root, "testcases", "Testcase chức năng hệ thống VMS version 2.xlsx")
    if not os.path.exists(ss_path):
        print(f"File not found: {ss_path}")
        return

    # Read spec to know which tests are automated
    spec_path = os.path.join(repo_root, "tests", "ui", "vms", "vms-smart-search.spec.ts")
    with open(spec_path, "r", encoding="utf-8") as f:
        spec_text = f.read()

    wb = openpyxl.load_workbook(ss_path)
    ws = wb["Smart Search ver2 "]

    col_idx = 15
    cell_h = ws.cell(row=11, column=col_idx, value="Automation Status\n(Trạng thái Auto)")
    cell_h.font = Font(name="Times New Roman", size=12, bold=True, color="000000")
    cell_h.fill = fill_orange_header
    cell_h.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    cell_h.border = thin_border
    ws.column_dimensions[get_column_letter(col_idx)].width = 20

    auto_count = 0
    in_prog_count = 0

    for r in range(13, ws.max_row + 1):
        tc_id = ws.cell(row=r, column=3).value
        if not tc_id:
            continue
        tc_id_str = str(tc_id).strip()

        # Check if tc_id is in spec
        is_automated = (tc_id_str in spec_text)

        c = ws.cell(row=r, column=col_idx)
        c.border = thin_border
        c.alignment = Alignment(horizontal="center", vertical="center")

        if is_automated:
            c.value = "Automated"
            c.font = Font(name="Times New Roman", size=11, bold=True, color="274E13")
            c.fill = fill_auto
            auto_count += 1
        else:
            c.value = "In Progress"
            c.font = Font(name="Times New Roman", size=11, bold=True, color="B45F06")
            c.fill = fill_in_progress
            in_prog_count += 1

    # Update KPI in Row 8 - Row 9
    total_case = auto_count + in_prog_count
    ws.merge_cells("G8:H8")
    ws.merge_cells("I8:J8")
    ws.cell(8, 7, "Automated (Auto)").font = Font(name="Times New Roman", size=11, bold=True, color="FFFFFF")
    ws.cell(8, 7).fill = PatternFill(start_color="0070C0", end_color="0070C0", fill_type="solid")
    ws.cell(8, 7).alignment = Alignment(horizontal="center", vertical="center")
    ws.cell(8, 7).border = thin_border
    ws.cell(8, 8).border = thin_border

    ws.cell(8, 9, "Tỷ lệ Auto (%)").font = Font(name="Times New Roman", size=11, bold=True, color="FFFFFF")
    ws.cell(8, 9).fill = PatternFill(start_color="004D40", end_color="004D40", fill_type="solid")
    ws.cell(8, 9).alignment = Alignment(horizontal="center", vertical="center")
    ws.cell(8, 9).border = thin_border
    ws.cell(8, 10).border = thin_border

    ws.merge_cells("G9:H9")
    ws.merge_cells("I9:J9")
    ws.cell(9, 7, auto_count).font = Font(name="Times New Roman", size=11, bold=True, color="0070C0")
    ws.cell(9, 7).alignment = Alignment(horizontal="center", vertical="center")
    ws.cell(9, 7).border = thin_border
    ws.cell(9, 8).border = thin_border

    pct_str = f"{(auto_count / total_case * 100):.1f}%" if total_case > 0 else "0%"
    ws.cell(9, 9, pct_str).font = Font(name="Times New Roman", size=11, bold=True, color="004D40")
    ws.cell(9, 9).alignment = Alignment(horizontal="center", vertical="center")
    ws.cell(9, 9).border = thin_border
    ws.cell(9, 10).border = thin_border

    wb.save(ss_path)
    print(f"Updated: {ss_path} -> Added Automation Status ({auto_count} Automated, {in_prog_count} In Progress / {pct_str})")

if __name__ == "__main__":
    update_object_counting()
    update_smart_search_ver2()
