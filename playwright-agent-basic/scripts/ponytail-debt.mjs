import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, relative, sep } from 'node:path';

// Gom mọi marker `ponytail:` thành sổ nợ. Marker thiếu điều kiện làm lại bị coi là lỗi
// vì khoản nợ không có trigger sẽ mục âm thầm. Quy ước nằm trong
// docs/ponytail_qa_rules.md.

const root = fileURLToPath(new URL('..', import.meta.url));
const SKIP = new Set(['node_modules', '.git', 'artifacts', 'reports', 'build', 'dist']);
const CODE = /\.(ts|mts|cts|js|mjs|cjs|ps1)$/;
const MARKER = /(?:\/\/|#)\s*ponytail:\s*(.+)$/iu;

const files = readdirSync(root, { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile() && CODE.test(entry.name))
  .filter((entry) => !relative(root, entry.parentPath).split(sep).some((part) => SKIP.has(part)))
  .map((entry) => join(entry.parentPath, entry.name));

let total = 0;
let incomplete = 0;
const output = [];

for (const file of files.sort()) {
  const rows = [];
  readFileSync(file, 'utf8').split(/\r?\n/).forEach((line, index) => {
    const body = line.match(MARKER)?.[1]?.trim();
    if (!body) return;
    const what = body.split(/ceiling:/iu)[0].trim().replace(/[.\s]+$/u, '');
    const ceiling = body.split(/ceiling:/iu)[1]?.split(/upgrade:/iu)[0]?.trim().replace(/[.\s]+$/u, '');
    const upgrade = body.split(/upgrade:/iu)[1]?.trim().replace(/[.\s]+$/u, '');
    rows.push({ line: index + 1, what, ceiling, upgrade });
  });
  if (!rows.length) continue;
  output.push(relative(root, file).replaceAll(sep, '/'));
  for (const row of rows) {
    total += 1;
    output.push(`  :${row.line} — ${row.what || '(không mô tả)'}`);
    output.push(`        ceiling: ${row.ceiling || 'THIẾU'}`);
    output.push(`        upgrade: ${row.upgrade || 'THIẾU'}`);
    if (!row.ceiling || !row.upgrade) {
      incomplete += 1;
      output.push('        ^ thiếu ceiling/upgrade — khoản nợ này không có điều kiện làm lại');
    }
  }
  output.push('');
}

if (!total) {
  console.log('PASS: không có marker ponytail:. Sổ nợ sạch.');
  process.exit(0);
}

console.log('Sổ nợ ponytail:\n');
console.log(output.join('\n'));
console.log(`Tổng: ${total} marker, ${incomplete} thiếu ceiling/upgrade.`);
if (incomplete) {
  console.error('\nFAIL: mọi marker ponytail: phải nêu đủ ceiling và upgrade.');
  process.exit(1);
}
console.log('PASS: mọi marker đều có ceiling và upgrade.');
