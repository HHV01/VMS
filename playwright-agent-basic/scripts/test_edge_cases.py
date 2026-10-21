import urllib.request
import json
import ssl
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('artifacts/auth-storage-state.json', 'r', encoding='utf-8') as f:
    state = json.load(f)
token = json.loads(state['origins'][0]['localStorage'][0]['value'])['token']

url = 'http://180.148.1.242:8001/api/smart_search'
headers = {
    'Content-Type': 'application/json',
    'Authorization': f'Bearer {token}'
}

def test_query(name, q, extra=None):
    payload = {'query': q, 'search_mode': 'precision', 'limit': 5}
    if extra:
        payload.update(extra)
    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=15) as res:
            raw = res.read().decode('utf-8')
            data = json.loads(raw)
            interp = data.get('data', {}).get('interpretation', {})
            unsupp = interp.get('unsupported_filters', [])
            objects = interp.get('objects', [])
            total = data.get('data', {}).get('total', 0)
            start_t = interp.get('start_time')
            end_t = interp.get('end_time')
            print(f"[{name}] SUCCESS 200 | total={total} | unsupp={unsupp} | objects={len(objects)} | start={start_t} | end={end_t}")
            return 200, data
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8')[:200]
        print(f"[{name}] HTTP {e.code} | body={err_body}")
        return e.code, err_body
    except Exception as e:
        print(f"[{name}] EXCEPTION: {e}")
        return 0, str(e)

print("=== 1. TEST INPUT KÝ TỰ ĐẶC BIỆT / INJECTION ===")
test_query('XSS injection', '<script>alert(1)</script>')
test_query('SQL injection', "' OR '1'='1")
test_query('Special chars', '!@#$%^&*()_+{}|:<>?')
test_query('Pure spaces', '     ')
test_query('Emoji only', '🚗 🏍️ 👮')

print("\n=== 2. TEST THỰC THỂ NGOÀI PHẠM VI (BR-NL-03) ===")
test_query('Khủng long', 'con khủng long')
test_query('Con mèo', 'con mèo')
test_query('Máy bay', 'máy bay màu trắng')
test_query('Xe tăng', 'xe tăng')
test_query('Hỗn hợp: Xe ô tô + Máy bay', 'xe ô tô và máy bay')

print("\n=== 3. TEST CỤM TỪ THỜI GIAN ĐẶC BIỆT ===")
test_query('Vừa nãy', 'xe máy vừa nãy')
test_query('Nửa đêm', 'xe ô tô nửa đêm')
test_query('Rạng sáng', 'xe máy rạng sáng')
test_query('Tương lai xa', 'xe ô tô năm 2030')
test_query('Lúc 12h', 'xe ô tô lúc 12h')

print("\n=== 4. TEST SLIDER ĐỘ LIÊN QUAN BIÊN ===")
test_query('Slider 100%-100%', 'xe máy', {'relevance_score': [1.0, 1.0]})
test_query('Slider 0%-0%', 'xe máy', {'relevance_score': [0.0, 0.0]})
test_query('Slider đảo ngược 80%-20%', 'xe máy', {'relevance_score': [0.8, 0.2]})
