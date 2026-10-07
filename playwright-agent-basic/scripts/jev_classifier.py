#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Jev AI Failure Classifier (Python Helper)
Gửi state lỗi kiểm thử đến TypeSafe Jev System One model để tự động phân loại nguyên nhân gốc.
Hỗ trợ fallback sandbox/heuristic khi không có API key.
"""

import os
import json
import urllib.request
import urllib.error

def classify_test_failure(tc_id: str, tc_desc: str, error_message: str, step_text: str = "") -> dict:
    """
    Phân loại lỗi kiểm thử bằng Jev AI System One.
    Trả về dict gồm: category, confidence, explanation, suggested_action, severity
    """
    api_key = os.environ.get("TYPESAFE_API_KEY") or os.environ.get("JEV_API_KEY") or ""
    base_url = os.environ.get("JEV_API_BASE_URL", "https://api.typesafe.ai/v1").rstrip("/")
    
    state = {
        "tc_id": tc_id,
        "tc_desc": tc_desc,
        "error_message": error_message,
        "step_text": step_text
    }
    
    payload = {
        "model": os.environ.get("JEV_MODEL", "jev-latest"),
        "state": state,
        "questions": {
            "rootCause": {
                "type": "choice",
                "instructions": "Phân loại nguyên nhân gốc rễ của lần kiểm thử thất bại vào 1 trong 4 danh mục chuẩn.",
                "criteria": {
                    "APPLICATION_BUG": "Hệ thống hiển thị sai kết quả, sai dữ liệu nghiệp vụ, HTTP 500 từ API, hoặc vi phạm assertion kết quả mong muốn.",
                    "ENVIRONMENT_TIMEOUT": "Mạng chập chờn, gateway timeout 504, request timeout vượt ngưỡng chờ quy định của server hoặc trình duyệt.",
                    "SELECTOR_DRIFT": "DOM thay đổi, không tìm thấy locator phần tử UI, thuộc tính selector bị sửa đổi trên giao diện mới.",
                    "DATA_ISSUE": "Tài khoản không đủ quyền, dữ liệu test mẫu bị xóa hoặc không thỏa mãn ràng buộc đầu vào."
                }
            },
            "severity": {
                "type": "score",
                "instructions": "Đánh giá mức độ nghiêm trọng từ 1 đến 5.",
                "criteria": [
                    "1 - Rất thấp",
                    "2 - Thấp",
                    "3 - Trung bình",
                    "4 - Cao",
                    "5 - Nghiêm trọng"
                ]
            }
        }
    }
    
    action_map = {
        "APPLICATION_BUG": "Tạo bug ticket trên Jira/Redmine kèm ảnh chụp lỗi và bước tái hiện.",
        "ENVIRONMENT_TIMEOUT": "Kiểm tra độ trễ server môi trường test và xem xét chạy lại với --stable.",
        "SELECTOR_DRIFT": "Cập nhật lại Page Object Model (POM) theo thuộc tính DOM mới của frontend.",
        "DATA_ISSUE": "Kiểm tra lại bộ dữ liệu test fixture trong project/.env hoặc seed lại database."
    }

    if not api_key or api_key in ("mock", "mock_key"):
        # Heuristic sandbox fallback
        err_lower = (error_message or "").lower()
        if "timeout" in err_lower or "waiting for" in err_lower:
            if "locator" in err_lower or "selector" in err_lower:
                category = "SELECTOR_DRIFT"
            else:
                category = "ENVIRONMENT_TIMEOUT"
        elif "500" in err_lower or "expect" in err_lower or "assertion" in err_lower:
            category = "APPLICATION_BUG"
        elif "unauthorized" in err_lower or "forbidden" in err_lower or "not found" in err_lower:
            category = "DATA_ISSUE"
        else:
            category = "APPLICATION_BUG"
            
        return {
            "category": category,
            "confidence": 0.88,
            "severity": 3,
            "explanation": f"Jev AI (Sandbox Heuristic): {category} (Độ tin cậy 88%)",
            "suggested_action": action_map.get(category, "Kiểm tra log chi tiết.")
        }
        
    is_openrouter = api_key.startswith("sk-or-") or "openrouter.ai" in base_url
    endpoint = "https://openrouter.ai/api/alpha/decisions" if is_openrouter else f"{base_url}/systemone"
    model_name = os.environ.get("JEV_MODEL") or ("typesafe/jev-1.13" if is_openrouter else "jev-latest")
    payload["model"] = model_name

    try:
        req = urllib.request.Request(
            endpoint,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            answers = data.get("answers", {})
            rc = answers.get("rootCause", {})
            sev = answers.get("severity", {})
            
            category = rc.get("choice", "APPLICATION_BUG")
            confidence = rc.get("confidence", 0.9)
            severity = sev.get("score", 3)
            
            return {
                "category": category,
                "confidence": confidence,
                "severity": severity,
                "explanation": f"Jev AI: {category} (Độ tin cậy {confidence * 100:.1f}%)",
                "suggested_action": action_map.get(category, "Kiểm tra log chi tiết.")
            }
    except Exception as e:
        return {
            "category": "APPLICATION_BUG",
            "confidence": 0.5,
            "severity": 3,
            "explanation": f"Jev AI Fallback: {str(e)}",
            "suggested_action": action_map["APPLICATION_BUG"]
        }
