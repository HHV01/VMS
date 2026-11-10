import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, relative } from 'node:path';

function esc(value = '') {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

function htmlText(value = '') {
  return String(value)
    .replace(/<br\s*\/?\s*>/giu, '\n')
    .replace(/<[^>]+>/gu, '')
    .replaceAll('&quot;', '"')
    .replaceAll('&#039;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&')
    .replace(/&#(\d+);/gu, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/\r/gu, '')
    .replace(/\n[ \t]+/gu, '\n')
    .trim();
}

function canonicalModule(module) {
  return module;
}

function parseLegacyReport(html, sourcePath, workspaceRoot) {
  const segments = html.split(/(?=<div class="tc-card card-)/gu);
  const items = [];
  for (const segment of segments) {
    if (!segment.startsWith('<div class="tc-card card-')) continue;
    const status = segment.match(/^<div class="tc-card card-([A-Z]+)"/u)?.[1] || 'SKIP';
    const rawModule = htmlText(segment.match(/data-module="([^"]+)"/u)?.[1] || 'Legacy Report');
    const id = htmlText(segment.match(/<span class="tc-id">([\s\S]*?)<\/span>/u)?.[1] || `LEGACY-${items.length + 1}`);
    const method = htmlText(segment.match(/<span class="method-badge[^>]*>([\s\S]*?)<\/span>/u)?.[1] || 'API');
    const title = htmlText(segment.match(/<span class="tc-name">([\s\S]*?)<\/span>/u)?.[1] || id);
    const endpoint = htmlText(segment.match(/<span class="endpoint-url">([\s\S]*?)<\/span>/u)?.[1] || title.match(/\/[A-Za-z0-9_{}./?=&-]+/u)?.[0] || 'Legacy evidence');
    const module = canonicalModule(rawModule, `${title} ${endpoint}`);
    const headings = [...segment.matchAll(/<div class="info-box-title">([\s\S]*?)<\/div>/gu)];
    const sections = headings.map((heading) => {
      const start = heading.index + heading[0].length;
      const end = segment.indexOf('</div>', start);
      return htmlText(segment.slice(start, end < 0 ? start : end));
    });
    items.push({
      id,
      parentId: id,
      module,
      title,
      fullTitle: `${module} › ${title}`,
      method,
      endpoint,
      status: status === 'NA' ? 'SKIP' : status,
      duration: 0,
      error: '',
      evidence: [relative(workspaceRoot, sourcePath).replaceAll('\\', '/')],
      runs: 1,
      passedRuns: status === 'PASS' ? 1 : 0,
      skippedRuns: status === 'SKIP' || status === 'NA' ? 1 : 0,
      apiCalls: [],
      preconditions: [],
      skipReasons: [],
      legacyDetails: {
        steps: sections[0] || 'Xem evidence từ report sprint đã nhập.',
        payload: sections[1] || '(Không có dữ liệu payload trong report cũ.)',
        expected: sections[2] || 'Xem expected trong evidence report cũ.',
        actual: sections[3] || `Status: ${status}`,
      },
    });
  }
  return items;
}

function collectSpecs(suites, parents = [], output = []) {
  for (const suite of suites || []) {
    const path = suite.title ? [...parents, suite.title] : parents;
    for (const spec of suite.specs || []) output.push({ ...spec, suitePath: path });
    collectSpecs(suite.suites, path, output);
  }
  return output;
}

function normalizeSpec(spec, workspaceRoot) {
  const tests = spec.tests || [];
  const results = tests.flatMap((test) => test.results || []);
  const statuses = results.map((result) => result.status);
  const status = tests.every((test) => test.status === 'skipped') || statuses.every((item) => item === 'skipped')
    ? 'SKIP'
    : statuses.some((item) => item === 'failed' || item === 'timedOut' || item === 'interrupted') || spec.ok === false
      ? 'FAIL'
      : 'PASS';
  const duration = results.reduce((sum, result) => sum + (result.duration || 0), 0);
  const error = results.map((result) => result.error?.message || result.error?.stack || '').filter(Boolean).join('\n\n');
  const evidence = results.flatMap((result) => result.attachments || []).map((item) => item.path).filter(Boolean)
    .map((path) => relative(workspaceRoot, path).replaceAll('\\', '/'));
  const apiCalls = results.flatMap((result) => result.attachments || [])
    .filter((item) => item.name === 'qc-api-calls' && item.body)
    .flatMap((item) => {
      try {
        return JSON.parse(Buffer.from(item.body, 'base64').toString('utf8')).calls || [];
      } catch {
        return [];
      }
    });
  const annotations = tests.flatMap((test) => [
    ...(test.annotations || []),
    ...(test.results || []).flatMap((result) => result.annotations || []),
  ]);
  const preconditions = [...new Set(annotations.filter((item) => item.type === 'precondition').map((item) => item.description).filter(Boolean))];
  const skipReasons = [...new Set(annotations.filter((item) => item.type === 'skip').map((item) => item.description).filter(Boolean))];
  const fullTitle = [...spec.suitePath, spec.title].filter(Boolean).join(' › ');
  const id = fullTitle.match(/(?:[A-Z][A-Z0-9-]*-TC-\d+|[A-Z]{3}\d{2}-\d{3})/u)?.[0] || `TC-${String(Math.abs(hash(fullTitle))).slice(0, 6)}`;
  const method = fullTitle.match(/\b(GET|POST|PUT|PATCH|DELETE|WS|TOPIC)\b/u)?.[1] || 'API';
  const endpoint = fullTitle.match(/\/(?:[A-Za-z0-9_{}.-]+\/?)+/u)?.[0] || 'Xem testcase source';
  const rawModule = spec.suitePath.at(-1) || 'General';
  const module = /Actions, Device, Services.+Hostnames/iu.test(fullTitle)
    ? canonicalModule('Platform APIs', spec.title)
    : canonicalModule(rawModule, `${fullTitle} ${endpoint}`);
  return {
    id, parentId: id, module, title: spec.title, fullTitle, method, endpoint,
    status, duration, error, evidence,
    runs: Math.max(results.length, 1),
    passedRuns: statuses.filter((item) => item === 'passed').length,
    skippedRuns: statuses.filter((item) => item === 'skipped').length,
    apiCalls,
    preconditions,
    skipReasons,
  };
}

function compactJson(value, maxLength = 12_000) {
  const output = value === null || value === undefined
    ? '(Không có body)'
    : typeof value === 'string'
      ? value
      : JSON.stringify(value, null, 2);
  return output.length > maxLength ? `${output.slice(0, maxLength)}\n…[TRUNCATED IN HTML]` : output;
}

function callPath(url) {
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
}

function formatSteps(item) {
  if (item.legacyDetails) return item.legacyDetails.steps;
  const condition = item.preconditions.length
    ? item.preconditions.map((value) => `Điều kiện: ${value}`).join('\n')
    : 'Điều kiện: API server và test data của project sẵn sàng.';
  if (!item.apiCalls.length) return `${condition}\n1. ${item.title}`;
  return `${condition}\n${item.apiCalls.map((call, index) => `${index + 1}. Gọi ${call.method} ${callPath(call.url)}\n   Ghi nhận status, Content-Type, duration và response body`).join('\n')}`;
}

function formatPayload(item) {
  if (item.legacyDetails) return item.legacyDetails.payload;
  if (!item.apiCalls.length) return '(Không có API call được capture; testcase có thể đã SKIP/BLOCKED trước execution.)';
  return item.apiCalls.map((call, index) => `${item.apiCalls.length > 1 ? `[Call ${index + 1}] ` : ''}${call.method} ${callPath(call.url)}\n${compactJson(call.payload)}`).join('\n\n');
}

function formatExpected(item) {
  if (item.legacyDetails) return item.legacyDetails.expected;
  if (!item.apiCalls.length) return 'Testcase chưa thực thi nên chưa có assertion runtime.';
  return item.apiCalls.map((call, index) => `${item.apiCalls.length > 1 ? `[Call ${index + 1}] ` : ''}${call.method} ${callPath(call.url)}\n${call.expected?.length ? call.expected.join('\n') : 'Expected được kiểm tra bằng assertion trực tiếp trong testcase.'}`).join('\n\n');
}

function formatActual(item) {
  if (item.legacyDetails) return item.legacyDetails.actual;
  const skipReason = item.status === 'SKIP'
    ? `\nLý do SKIP: ${item.skipReasons.length ? item.skipReasons.join('\n') : item.title}`
    : '';
  if (!item.apiCalls.length) {
    return `Status: ${item.status}\nSố lượt thực thi: ${item.runs}\nSố lượt PASS: ${item.passedRuns}\nSố lượt SKIP: ${item.skippedRuns}${skipReason}${item.error ? `\n\n${item.error}` : ''}`;
  }
  const calls = item.apiCalls.map((call, index) => `${item.apiCalls.length > 1 ? `[Call ${index + 1}] ` : ''}${call.method} ${callPath(call.url)}\nStatus code: ${call.status ?? 'N/A'}\nThời gian phản hồi: ${call.durationMs}ms\nContent-Type: ${call.contentType || 'N/A'}\nResponse:\n${compactJson(call.response)}${call.error ? `\nError: ${call.error}` : ''}`).join('\n\n');
  return `Test status: ${item.status}\nSố lượt: ${item.runs}; PASS: ${item.passedRuns}; SKIP: ${item.skippedRuns}\nTổng duration: ${item.duration}ms${skipReason}\n\n${calls}${item.error ? `\n\nPlaywright error:\n${item.error}` : ''}`;
}

function aggregateSpecs(items) {
  const grouped = new Map();
  for (const item of items) {
    const key = `${item.module}\u0000${item.title}`;
    const current = grouped.get(key);
    if (!current) {
      grouped.set(key, { ...item });
      continue;
    }
    current.runs += item.runs;
    current.passedRuns += item.passedRuns;
    current.skippedRuns += item.skippedRuns;
    current.duration += item.duration;
    current.evidence = [...new Set([...current.evidence, ...item.evidence])];
    if (!current.apiCalls.length && item.apiCalls.length) current.apiCalls = item.apiCalls;
    current.preconditions = [...new Set([...current.preconditions, ...item.preconditions])];
    current.skipReasons = [...new Set([...current.skipReasons, ...item.skipReasons])];
    current.error = [...new Set([current.error, item.error].filter(Boolean))].join('\n\n');
    if (current.status === 'FAIL' || item.status === 'FAIL') current.status = 'FAIL';
    else if (current.status === 'SKIP' && item.status === 'SKIP') current.status = 'SKIP';
    else current.status = 'PASS';
  }
  return [...grouped.values()];
}

function splitMultiCallSpecs(items) {
  return items.flatMap((item) => {
    if (item.apiCalls.length <= 1) return item;
    const scenario = item.title.replace(item.id, '').trim();
    return item.apiCalls.map((call, index) => ({
      ...item,
      id: `${item.id}-${String(index + 1).padStart(2, '0')}`,
      parentId: item.id,
      title: `${call.method} ${callPath(call.url)}${scenario ? ` — ${scenario}` : ''}`,
      module: item.module === 'Platform APIs'
        ? canonicalModule('Platform APIs', callPath(call.url))
        : canonicalModule(item.module, item.title),
      method: call.method,
      endpoint: call.url,
      apiCalls: [call],
      evidence: index === 0 ? item.evidence : [],
    }));
  });
}

function hash(value) {
  let output = 0;
  for (let index = 0; index < value.length; index += 1) output = ((output << 5) - output + value.charCodeAt(index)) | 0;
  return output;
}

function badge(status) {
  return `<span class="status-badge status-${esc(status)}">${esc(status)}</span>`;
}

export async function buildPlaywrightFinalReport({ jsonPath, jsonPaths, legacyReportPaths = [], outputPath, workspaceRoot, projectName, featureId, runId, environment, filter }) {
  const inputs = jsonPaths?.length ? jsonPaths : [jsonPath];
  const latestSpecs = new Map();
  for (const legacyPath of legacyReportPaths) {
    const legacyHtml = await readFile(legacyPath, 'utf8');
    for (const item of parseLegacyReport(legacyHtml, legacyPath, workspaceRoot)) latestSpecs.set(item.id, item);
  }
  for (const input of inputs) {
    const raw = JSON.parse(await readFile(input, 'utf8'));
    const runSpecs = splitMultiCallSpecs(
      aggregateSpecs(collectSpecs(raw.suites).map((spec) => normalizeSpec(spec, workspaceRoot))),
    );
    const replacedParents = new Set(runSpecs.map((item) => item.parentId || item.id));
    for (const [key, previous] of latestSpecs) {
      if (replacedParents.has(previous.parentId || previous.id)) latestSpecs.delete(key);
    }
    for (const item of runSpecs) latestSpecs.set(item.id, item);
  }
  const specs = [...latestSpecs.values()];
  const passed = specs.filter((item) => item.status === 'PASS').length;
  const failed = specs.filter((item) => item.status === 'FAIL').length;
  const skipped = specs.filter((item) => item.status === 'SKIP').length;
  const rate = specs.length ? ((passed / specs.length) * 100).toFixed(1) : '0.0';
  const modules = [...new Set(specs.map((item) => item.module))];
  const status = failed ? 'FAIL' : skipped ? 'NEED_REVIEW' : 'PASS';
  const moduleButtons = modules.map((module) => `<button class="filter-btn" onclick="filterCards(this,'module','${esc(module)}')">${esc(module)} (${specs.filter((item) => item.module === module).length})</button>`).join('');
  const cards = specs.map((item, index) => {
    const primaryCall = item.apiCalls[0];
    const method = primaryCall?.method || item.method;
    const endpoint = primaryCall?.url || item.endpoint;
    return `<article class="tc-card card-${item.status}${index === 0 ? ' open' : ''}" data-module="${esc(item.module)}" data-status="${item.status}">
    <div class="tc-header" onclick="this.parentElement.classList.toggle('open')"><div class="tc-title-group"><span class="tc-id">${esc(item.id)}</span><span class="method-badge method-${method}">${esc(method)}</span><span class="tc-name">${esc(item.title)}</span></div>${badge(item.status)}</div>
    <div class="tc-body"><p class="endpoint"><strong>Endpoint:</strong> <span>${esc(endpoint)}</span> · <strong>Module:</strong> ${esc(item.module)}</p>
      <div class="info-grid"><div class="info-box"><div class="info-box-title">1. Các bước thực hiện & điều kiện tiền đề</div><div class="code-block">${esc(formatSteps(item))}</div></div><div class="info-box"><div class="info-box-title">2. Payload / dữ liệu đầu vào</div><div class="code-block">${esc(formatPayload(item))}</div></div></div>
      <div class="info-grid"><div class="info-box"><div class="info-box-title">3. Kết quả mong muốn</div><div class="code-block">${esc(formatExpected(item))}</div></div><div class="info-box"><div class="info-box-title">4. Kết quả thực tế</div><div class="code-block ${item.status === 'FAIL' ? 'fail-box' : ''}">${esc(formatActual(item))}</div></div></div>
    </div></article>`;
  }).join('');

  const html = `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(projectName)} - ${esc(featureId)} Test Report</title><style>
  :root{--bg-dark:#0f172a;--card-bg:#1e293b;--card-border:#334155;--blue:#38bdf8;--green:#34d399;--red:#f87171;--purple:#c084fc;--amber:#fbbf24;--text:#f8fafc;--muted:#94a3b8}*{box-sizing:border-box;margin:0;padding:0;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}body{background:var(--bg-dark);color:var(--text);padding:30px 40px;line-height:1.5}.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:30px;padding-bottom:20px;border-bottom:1px solid var(--card-border)}h1{font-size:26px;color:var(--blue)}.sub{color:var(--muted);font-size:13px;margin-top:4px}.header-meta{display:flex;gap:10px;flex-wrap:wrap}.header-badge{background:#38bdf826;color:var(--blue);padding:6px 14px;border-radius:20px;border:1px solid #38bdf84d;font-weight:700;font-size:12px}.metrics{display:grid;grid-template-columns:repeat(5,1fr);gap:20px;margin-bottom:30px}.metric{background:var(--card-bg);border:1px solid var(--card-border);border-radius:14px;padding:20px 24px}.metric-title{font-size:12px;color:var(--muted);font-weight:700;text-transform:uppercase}.metric-value{font-size:34px;font-weight:800}.pass{color:var(--green)}.fail{color:var(--red)}.review{color:var(--amber)}.rate{color:var(--purple)}.controls-bar{display:flex;justify-content:space-between;align-items:center;background:var(--card-bg);border:1px solid var(--card-border);padding:14px 20px;border-radius:12px;margin-bottom:25px;gap:15px}.filter-group{display:flex;gap:8px;flex-wrap:wrap}.filter-btn{background:rgba(255,255,255,.05);border:1px solid var(--card-border);color:var(--muted);padding:8px 16px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600}.filter-btn:hover,.filter-btn.active{background:var(--blue);color:#0f172a;border-color:var(--blue)}.filter-btn.btn-fail.active{background:var(--red);color:#fff;border-color:var(--red)}.search-input{background:rgba(255,255,255,.05);border:1px solid var(--card-border);color:var(--text);padding:8px 14px;border-radius:6px;width:260px;font-size:13px;outline:none}.tc-card{background:var(--card-bg);border:1px solid var(--card-border);border-radius:12px;margin-bottom:14px;overflow:hidden}.card-FAIL{border-color:#f8717199}.tc-header{padding:16px 20px;display:flex;justify-content:space-between;align-items:center;cursor:pointer;gap:15px}.tc-title-group{display:flex;align-items:center;gap:12px}.tc-id{font-weight:800;color:var(--blue);min-width:120px}.tc-name{font-size:14px}.method-badge{font-size:11px;font-weight:900;padding:3px 8px;border-radius:4px;background:#ffffff14;color:var(--blue)}.method-POST{color:var(--green);background:#34d39922}.method-DELETE{color:var(--red);background:#f8717122}.method-PATCH,.method-PUT{color:var(--purple);background:#c084fc22}.status-badge{padding:4px 12px;border-radius:16px;font-size:12px;font-weight:800}.status-PASS{background:#34d39922;color:var(--green);border:1px solid #34d39966}.status-FAIL{background:#f8717133;color:var(--red);border:1px solid #f8717199}.status-SKIP,.status-BLOCKED{background:#fbbf2422;color:var(--amber);border:1px solid #fbbf2466}.tc-body{padding:18px 20px;border-top:1px solid var(--card-border);background:#0f172a;display:none}.tc-card.open .tc-body{display:block}.endpoint{font-size:12px;color:var(--muted);margin-bottom:12px}.endpoint span{font-family:Consolas,monospace;color:var(--blue)}.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:14px}.info-box{background:var(--card-bg);border:1px solid var(--card-border);border-radius:8px;padding:12px 16px}.info-box-title{font-size:11px;font-weight:800;color:var(--muted);text-transform:uppercase;margin-bottom:6px}.code-block{background:#090d16;border:1px solid var(--card-border);border-radius:6px;padding:10px 14px;font:12px/1.5 Consolas,monospace;color:#e2e8f0;white-space:pre-wrap;max-height:260px;overflow:auto}.fail-box{border-color:#f8717199;background:#ef44441a;color:#fca5a5}details{margin-top:12px}summary{cursor:pointer;color:var(--blue);font-weight:700}@media(max-width:900px){body{padding:15px}.header,.controls-bar{display:block}.header-meta,.search-input{margin-top:12px}.metrics{grid-template-columns:repeat(2,1fr)}.info-grid{grid-template-columns:1fr}.tc-title-group{align-items:flex-start;flex-wrap:wrap}}@media print{body{background:#fff;color:#111;padding:0}.controls-bar{display:none}.header,.metric,.tc-card{break-inside:avoid}.tc-body{display:block}.tc-card{color:#111}.code-block{color:#111;background:#f5f5f5}.sub,.endpoint{color:#444}}
  </style></head><body><header class="header"><div><h1>${esc(projectName)} - API Automation Execution Report</h1><p class="sub">Feature: ${esc(featureId)} · Filter: ${esc(filter || 'All')} · Báo cáo được tổng hợp trực tiếp từ Playwright JSON</p></div><div class="header-meta"><span class="header-badge">${esc(environment)}</span><span class="header-badge">${esc(runId)}</span><span class="header-badge">${status}</span></div></header>
  <section class="metrics"><div class="metric"><div class="metric-title">Tổng testcase</div><div class="metric-value">${specs.length}</div></div><div class="metric"><div class="metric-title">Đạt (PASS)</div><div class="metric-value pass">${passed}</div></div><div class="metric"><div class="metric-title">Không đạt (FAIL)</div><div class="metric-value fail">${failed}</div></div><div class="metric"><div class="metric-title">Skip / Blocked</div><div class="metric-value review">${skipped}</div></div><div class="metric"><div class="metric-title">Tỷ lệ thành công</div><div class="metric-value rate">${rate}%</div></div></section>
  <div class="controls-bar"><div class="filter-group"><button class="filter-btn active" onclick="filterCards(this,'all','')">Tất cả (${specs.length})</button><button class="filter-btn btn-fail" onclick="filterCards(this,'status','FAIL')">❌ Xem Lỗi FAIL (${failed})</button><button class="filter-btn" style="background:rgba(148,163,184,.2);color:#cbd5e1;border-color:rgba(148,163,184,.4)" onclick="filterCards(this,'status','SKIP')">⏭ Bỏ Qua NA (${skipped})</button>${moduleButtons}</div><input class="search-input" id="searchInput" onkeyup="searchCards()" placeholder="Tìm kiếm API, Testcase ID..."></div><main id="list">${cards}</main>
  <script>function filterCards(btn,type,value){document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');document.querySelectorAll('.tc-card').forEach(c=>{c.style.display=type==='all'||c.dataset[type]===value?'block':'none'})}function searchCards(){const q=document.getElementById('searchInput').value.toLowerCase();document.querySelectorAll('.tc-card').forEach(c=>c.style.display=c.innerText.toLowerCase().includes(q)?'block':'none')}</script></body></html>`;
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, html, 'utf8');
  return { outputPath, total: specs.length, passed, failed, skipped, status };
}
