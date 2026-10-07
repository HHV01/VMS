import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parse as parseEnv } from 'dotenv';
import { buildPlaywrightFinalReport } from './build-playwright-report.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const rawArgs = process.argv.slice(2);
let stable = false;
let grepPattern = '';
const positional = [];
for (let index = 0; index < rawArgs.length; index += 1) {
  const argument = rawArgs[index];
  if (argument === '--stable') {
    stable = true;
  } else if (argument === '--grep') {
    grepPattern = rawArgs[++index] || '';
  } else if (argument.startsWith('--grep=')) {
    grepPattern = argument.slice('--grep='.length);
  } else {
    positional.push(argument);
  }
}
const [featureId] = positional;
const validId = /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/;

if (
  positional.length > 1 ||
  (featureId && !validId.test(featureId)) ||
  grepPattern.length > 160 ||
  /[\u0000-\u001f]/.test(grepPattern)
) {
  console.error('Usage: npm run project:test -- [feature-id] [--grep "test title"] [--stable]');
  process.exit(1);
}

const projectRoot = join(root, 'project');
const configPath = join(projectRoot, 'project.config.json');
const envPath = join(projectRoot, '.env');

if (!existsSync(configPath)) {
  console.error('Thiếu project/project.config.json');
  process.exit(1);
}
if (!existsSync(envPath)) {
  console.error('Thiếu project/.env; hãy copy từ project/.env.example.');
  process.exit(1);
}

const config = JSON.parse(readFileSync(configPath, 'utf8'));
const projectId = config.id;
if (!projectId || projectId === 'project-id') {
  console.error('Chưa cấu hình project ID. Chạy npm run project:setup trước.');
  process.exit(1);
}
if (!['dev', 'test'].includes(config.environment)) {
  console.error('Runner chỉ cho phép environment dev hoặc test.');
  process.exit(1);
}

const projectEnvironment = parseEnv(readFileSync(envPath));
const baseUrlValue = projectEnvironment[config.web.baseUrlEnv];
if (!baseUrlValue) {
  console.error(`Thiếu ${config.web.baseUrlEnv} trong project/.env.`);
  process.exit(1);
}

let baseUrl;
try {
  baseUrl = new URL(baseUrlValue);
} catch {
  console.error(`${config.web.baseUrlEnv} không phải URL hợp lệ.`);
  process.exit(1);
}

const allowedHosts = (config.web.allowedHosts || []).map((host) => host.toLowerCase());
if (!allowedHosts.includes(baseUrl.hostname.toLowerCase())) {
  console.error(
    `Host ${baseUrl.hostname} không nằm trong web.allowedHosts của project/project.config.json.`,
  );
  process.exit(1);
}

function containsSpec(directoryOrFile) {
  if (!existsSync(directoryOrFile)) return false;
  if (directoryOrFile.endsWith('.spec.ts')) return true;
  return readdirSync(directoryOrFile, { withFileTypes: true }).some((entry) => {
    const path = join(directoryOrFile, entry.name);
    return entry.isDirectory() ? containsSpec(path) : entry.name.endsWith('.spec.ts');
  });
}

function findCandidates(featureId) {
  if (!featureId) {
    return ['ui', 'api']
      .map((t) => join(root, 'tests', t))
      .filter((p) => existsSync(p) && containsSpec(p));
  }

  // 1. Kiểm tra trực tiếp thư mục: tests/ui/<featureId> hoặc tests/api/<featureId>
  const direct = ['ui', 'api']
    .map((t) => join(root, 'tests', t, featureId))
    .filter((p) => existsSync(p) && containsSpec(p));
  if (direct.length) return direct;

  // 2. Kiểm tra nếu featureId là 'ui' hoặc 'api'
  if (['ui', 'api'].includes(featureId.toLowerCase())) {
    const dir = join(root, 'tests', featureId.toLowerCase());
    if (existsSync(dir) && containsSpec(dir)) return [dir];
  }

  // 3. Khớp tên file spec (hỗ trợ alias: object-counting, oc, smart-search, ss, jev, health)
  const matchedFiles = [];
  function searchSpecs(dir) {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        searchSpecs(fullPath);
      } else if (entry.name.endsWith('.spec.ts')) {
        const normalized = entry.name.toLowerCase().replace('.spec.ts', '');
        const idLower = featureId.toLowerCase();
        if (
          normalized.includes(idLower) ||
          (idLower === 'oc' && normalized.includes('object-counting')) ||
          (idLower === 'ss' && normalized.includes('smart-search'))
        ) {
          matchedFiles.push(fullPath);
        }
      }
    }
  }
  searchSpecs(join(root, 'tests'));
  return matchedFiles;
}

function collectPlaywrightJson(directory, output = []) {
  if (!existsSync(directory)) return output;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) collectPlaywrightJson(path, output);
    else if (entry.name === 'playwright-results.json') output.push(path);
  }
  return output;
}

function collectLegacyHtml(directory, output = []) {
  if (!existsSync(directory)) return output;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) collectLegacyHtml(path, output);
    else if (entry.name.toLowerCase().endsWith('.html')) output.push(path);
  }
  return output;
}

const runnableCandidates = findCandidates(featureId);
if (!runnableCandidates.length) {
  console.error(`Không tìm thấy test${featureId ? ` cho module/feature '${featureId}'` : ''}.`);
  console.error('Gợi ý module: object-counting (oc), smart-search (ss), vms, jev, health, ui, api');
  process.exit(1);
}

const runId = process.env.RUN_ID || new Date().toISOString().replace(/[:.]/g, '-');
const featureScope = featureId || 'all-features';
const playwrightCli = join(root, 'node_modules', '@playwright', 'test', 'cli.js');
if (!existsSync(playwrightCli)) {
  console.error('Thiếu Playwright dependency. Hãy chạy npm install trước.');
  process.exit(1);
}

const args = [
  playwrightCli,
  'test',
  ...runnableCandidates.map((path) => path.slice(root.length + 1).replaceAll('\\', '/')),
  `--project=${config.web.browserProject}`,
  `--workers=${config.execution.workers}`,
];

if (config.execution.headed) args.push('--headed');
if (stable) args.push(`--repeat-each=${config.execution.stableRuns}`);
if (grepPattern) args.push(`--grep=${grepPattern}`);

const result = spawnSync(process.execPath, args, {
  cwd: root,
  stdio: 'inherit',
  env: {
    ...process.env,
    PROJECT_ID: projectId,
    FEATURE_ID: featureScope,
    RUN_ID: runId,
    PROJECT_ENV_FILE: envPath,
    BASE_URL_ENV: config.web.baseUrlEnv,
    HEADED: String(config.execution.headed),
    ARTIFACT_DIR: join('artifacts', projectId, featureScope, runId, 'test-results'),
  },
});

const jsonPath = join(root, 'artifacts', projectId, featureScope, runId, 'test-results', 'playwright-results.json');
const finalReportPath = join(root, 'reports', projectId, featureScope, runId, 'FINAL_QC_REPORT.html');
const masterReportPath = join(root, 'reports', projectId, featureScope, 'MASTER_QC_REPORT.html');
try {
  const report = await buildPlaywrightFinalReport({
    jsonPath,
    outputPath: finalReportPath,
    workspaceRoot: root,
    projectName: config.name || projectId,
    featureId: featureScope,
    runId,
    environment: config.environment,
    filter: grepPattern,
  });
  const historyJsonPaths = collectPlaywrightJson(join(root, 'artifacts', projectId, featureScope)).sort();
  const legacyReportPaths = collectLegacyHtml(join(root, 'artifacts', projectId, featureScope, 'legacy-reports')).sort();
  const masterReport = await buildPlaywrightFinalReport({
    jsonPaths: historyJsonPaths,
    legacyReportPaths,
    outputPath: masterReportPath,
    workspaceRoot: root,
    projectName: config.name || projectId,
    featureId: `${featureScope} · Tổng hợp`,
    runId: 'MASTER-LATEST',
    environment: config.environment,
    filter: 'Kết quả mới nhất của từng testcase',
  });
  console.log(`FINAL_QC_REPORT=${relative(root, report.outputPath).replaceAll('\\', '/')}`);
  console.log(`MASTER_QC_REPORT=${relative(root, masterReport.outputPath).replaceAll('\\', '/')}`);
  console.log(`PLAYWRIGHT_JSON=${relative(root, jsonPath).replaceAll('\\', '/')}`);
} catch (error) {
  console.error(`Không thể dựng FINAL_QC_REPORT.html: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}

if (process.exitCode !== 1) process.exitCode = result.status ?? 1;
