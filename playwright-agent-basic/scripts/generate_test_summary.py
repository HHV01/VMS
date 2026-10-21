import json
import os
import sys
import re
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def parse_playwright_json(json_path):
    if not os.path.exists(json_path):
        print(f"Error: JSON report not found at {json_path}")
        return None

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    results = []

    def process_suite(suite):
        for spec in suite.get('specs', []):
            spec_title = spec.get('title', '')
            for test in spec.get('tests', []):
                for result in test.get('results', []):
                    status = result.get('status', 'unknown')
                    duration_ms = result.get('duration', 0)
                    duration_s = round(duration_ms / 1000, 2)
                    errors = result.get('errors', [])
                    err_msg = ""
                    if errors:
                        err_msg = errors[0].get('message', '').split('\n')[0][:120]

                    # Extract ID from title like [SS-MD-019] or [SS-UP-001]
                    m = re.search(r'\[(SS-[A-Z0-9-]+)\]', spec_title)
                    tc_id = m.group(1) if m else "N/A"

                    results.append({
                        'id': tc_id,
                        'title': spec_title,
                        'status': status,
                        'duration_s': duration_s,
                        'error': err_msg,
                        'tags': spec.get('tags', [])
                    })
        for child in suite.get('suites', []):
            process_suite(child)

    for suite in data.get('suites', []):
        process_suite(suite)

    return results

def main():
    json_path = sys.argv[1] if len(sys.argv) > 1 else 'artifacts/test-results/playwright-results.json'
    results = parse_playwright_json(json_path)
    if results is None:
        sys.exit(1)

    total = len(results)
    passed = sum(1 for r in results if r['status'] == 'passed')
    failed = sum(1 for r in results if r['status'] == 'failed')
    timed_out = sum(1 for r in results if r['status'] == 'timedOut')
    skipped = sum(1 for r in results if r['status'] == 'skipped')
    flaky = sum(1 for r in results if r['status'] == 'flaky')

    print("\n" + "="*80)
    print("BẢNG TỔNG KẾT KẾT QUẢ AUTOMATION TEST (SINH TỪ PLAYWRIGHT JSON REPORT)")
    print("="*80)
    print(f"Tổng số test: {total} | Passed: {passed} | Failed: {failed} | TimedOut: {timed_out} | Skipped: {skipped} | Flaky: {flaky}\n")

    print(f"| {'STT':<4} | {'Test Case ID':<14} | {'Status':<10} | {'Duration (s)':<12} | {'Tiêu đề kiểm thử':<40} |")
    print(f"|{'-'*6}|{'-'*16}|{'-'*12}|{'-'*14}|{'-'*42}|")

    for i, r in enumerate(results, 1):
        st_icon = "PASS" if r['status'] == 'passed' else ("FAIL" if r['status'] in ['failed', 'timedOut'] else r['status'].upper())
        title_truncated = r['title'][:38]
        print(f"| {i:<4} | {r['id']:<14} | {st_icon:<10} | {r['duration_s']:<12} | {title_truncated:<40} |")
        if r['error']:
            print(f"|      | Error: {r['error']}")

    print("="*80 + "\n")

if __name__ == '__main__':
    main()
