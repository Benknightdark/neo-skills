import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createHash } from 'node:crypto';
import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { spawn, spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const skillRoot = join(repoRoot, 'skills', 'neo-mas-app-audit');
const checkerScript = join(skillRoot, 'scripts', 'check-mas-update.py');

const expectedFiles = [
  'SKILL.md',
  'scripts/check-mas-update.py',
  'references/source-manifest.json',
  'references/overview-and-classification.md',
  'references/checklist-part1-release-and-data.md',
  'references/checklist-part2-tx-auth-code-server.md',
  'references/reference-items-and-survey.md',
  'assets/audit-report-template.md',
  'evals/evals.json',
  'evals/eval_queries.json',
];

const mandatoryBenchmarkIds = [
  '4.1.1.1.2', '4.1.1.1.3', '4.1.1.3.1',
  '4.1.2.1.1', '4.1.2.1.2',
  '4.1.2.2.3', '4.1.2.2.4',
  '4.1.2.3.1', '4.1.2.3.2', '4.1.2.3.4', '4.1.2.3.5', '4.1.2.3.6',
  '4.1.2.3.7', '4.1.2.3.8', '4.1.2.3.9', '4.1.2.3.10', '4.1.2.3.11',
  '4.1.2.3.12', '4.1.2.3.13', '4.1.2.3.14', '4.1.2.3.16',
  '4.1.2.4.1',
  '4.1.2.5.1', '4.1.2.5.2', '4.1.2.5.3',
  '4.1.3.1.1', '4.1.3.1.2', '4.1.3.1.3',
  '4.1.3.2.1', '4.1.3.2.2', '4.1.3.2.3',
  '4.1.4.1.1', '4.1.4.1.2',
  '4.1.4.2.1', '4.1.4.2.2', '4.1.4.2.3', '4.1.4.2.4',
  '4.1.5.1.1', '4.1.5.1.2', '4.1.5.1.3',
  '4.1.5.3.1',
  '4.1.5.4.1', '4.1.5.4.2',
  '4.1.5.5.1', '4.1.5.5.6', '4.1.5.5.7', '4.1.5.5.8', '4.1.5.5.9',
  '4.2.2.1.2',
];

const referenceItemIds = Array.from({ length: 16 }, (_, idx) => `REF-${idx + 1}`);

async function withTempDir(t) {
  const dir = await mkdtemp(join(tmpdir(), 'neo-mas-audit-'));
  t.after(async () => {
    await rm(dir, { recursive: true, force: true });
  });
  return dir;
}

async function startMockServer(t, handler) {
  const server = http.createServer(handler);
  await new Promise((resolveListen) => server.listen(0, '127.0.0.1', resolveListen));
  t.after(async () => {
    await new Promise((resolveClose) => server.close(resolveClose));
  });
  const addr = server.address();
  return `http://127.0.0.1:${addr.port}`;
}

function runCheckerAsync(args) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn('python3', ['-B', checkerScript, ...args], {
      cwd: repoRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('error', rejectRun);
    child.on('close', (status) => {
      resolveRun({ status, stdout, stderr });
    });
  });
}

test('neo-mas-app-audit 包含完整檔案結構、有效連結與全部 V4.0 條文', async () => {
  await Promise.all(expectedFiles.map((file) => assert.doesNotReject(
    access(join(skillRoot, file)),
    `缺少技能資源：${file}`,
  )));

  const skillText = await readFile(join(skillRoot, 'SKILL.md'), 'utf8');
  const relativeLinks = [...skillText.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)]
    .map((match) => match[1])
    .filter((href) => !href.startsWith('#') && !href.includes('://'));

  await Promise.all(relativeLinks.map((href) => assert.doesNotReject(
    access(resolve(skillRoot, href)),
    `SKILL.md 連結不存在：${href}`,
  )));

  const part1 = await readFile(join(skillRoot, 'references', 'checklist-part1-release-and-data.md'), 'utf8');
  const part2 = await readFile(join(skillRoot, 'references', 'checklist-part2-tx-auth-code-server.md'), 'utf8');
  const refDoc = await readFile(join(skillRoot, 'references', 'reference-items-and-survey.md'), 'utf8');
  const overview = await readFile(join(skillRoot, 'references', 'overview-and-classification.md'), 'utf8');

  const combinedChecklists = `${part1}\n${part2}`;
  for (const id of mandatoryBenchmarkIds) {
    assert.ok(combinedChecklists.includes(`\`${id}\``), `明細檔缺少強制檢測項 ${id}`);
    assert.ok(overview.includes(`\`${id}\``), `總表缺少強制檢測項 ${id}`);
  }
  for (const refId of referenceItemIds) {
    assert.ok(refDoc.includes(`**${refId}**`), `參考項目檔缺少 ${refId}`);
  }

  const manifest = JSON.parse(await readFile(join(skillRoot, 'references', 'source-manifest.json'), 'utf8'));
  assert.equal(manifest.counts.L1, 25);
  assert.equal(manifest.counts.L2, 31);
  assert.equal(manifest.counts.L3, 39);
  assert.equal(manifest.counts.F, 9);
  assert.equal(manifest.counts.mandatory_unique_items, 49);
  assert.equal(manifest.counts.reference_items, 16);
});

test('neo-mas-app-audit 固定報告模板與評估資料符合規範', async () => {
  const template = await readFile(join(skillRoot, 'assets', 'audit-report-template.md'), 'utf8');
  for (const heading of [
    '## 一、受測 App 基本資訊與檢測範圍',
    '## 二、合規總覽與判定統計',
    '## 三、檢測項目逐項結果明細',
    '## 四、不符合要求項目與修補建議',
    '## 五、待人工／動態驗證項目與附錄三調查表待補清單',
    '## 六、基本資安參考項目提示',
  ]) {
    assert.ok(template.includes(heading), `報告模板缺少固定章節：${heading}`);
  }
  assert.ok(template.includes('來源基準更新檢查'));
  assert.ok(template.includes('Skill 同步變更清單'));

  const queries = JSON.parse(await readFile(join(skillRoot, 'evals', 'eval_queries.json'), 'utf8'));
  const evals = JSON.parse(await readFile(join(skillRoot, 'evals', 'evals.json'), 'utf8'));

  assert.ok(Array.isArray(queries));
  assert.ok(queries.some((item) => item.should_trigger === true));
  assert.ok(queries.some((item) => item.should_trigger === false));
  assert.equal(evals.skill_name, 'neo-mas-app-audit');
  assert.ok(evals.evals.length >= 3);
});

test('check-mas-update.py 支援 --help 且能正確偵測無更新、有更新與解析失敗情境', async (t) => {
  const helpResult = spawnSync('python3', ['-B', checkerScript, '--help'], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  assert.equal(helpResult.status, 0);
  assert.match(helpResult.stdout, /--manifest/);
  assert.match(helpResult.stdout, /--download-dir/);

  const tempDir = await withTempDir(t);
  const v4Bytes = Buffer.from('%PDF-1.4 mock mas v4.0');
  const v4Sha = createHash('sha256').update(v4Bytes).digest('hex');
  const v41Bytes = Buffer.from('%PDF-1.4 mock mas v4.1 updated');
  const v41Sha = createHash('sha256').update(v41Bytes).digest('hex');

  let mode = 'up_to_date';
  const baseUrl = await startMockServer(t, (req, res) => {
    if (req.url === '/app/questAndAnswer') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      if (mode === 'broken_html') {
        res.end('<html><body><p>no benchmark table here</p></body></html>');
        return;
      }
      const pdfLink = mode === 'updated'
        ? `<a href="${baseUrl}/files/v4.1.pdf">行動應用App基本資安檢測基準V4.1</a>`
        : `<a href="${baseUrl}/files/v4.0.pdf">行動應用App基本資安檢測基準V4.0</a>`;
      res.end(`
        <html><body><table>
          <tr>
            <td rowspan="2">1</td>
            <td rowspan="2">行動應用App基本資安檢測基準</td>
            <td colspan="2">${pdfLink}</td>
          </tr>
          <tr>
            <td colspan="2"><a href="${baseUrl}/files/v3.2-en.pdf">行動應用App基本資安檢測基準V3.2英文版</a></td>
          </tr>
        </table></body></html>
      `);
      return;
    }

    if (req.url === '/files/v4.0.pdf') {
      if (mode === 'head_405' && req.method === 'HEAD') {
        res.writeHead(405);
        res.end('Method Not Allowed');
        return;
      }
      const payload = mode === 'sha_mismatch' ? v41Bytes : v4Bytes;
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'ETag': '"v40-etag"',
        'Last-Modified': 'Wed, 14 May 2025 03:41:54 GMT',
        'Content-Length': String(v4Bytes.length),
      });
      if (req.method !== 'HEAD') res.write(payload);
      res.end();
      return;
    }

    if (req.url === '/files/v4.1.pdf') {
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'ETag': '"v41-etag"',
        'Last-Modified': 'Tue, 17 Nov 2026 01:00:00 GMT',
        'Content-Length': String(v41Bytes.length),
      });
      if (req.method !== 'HEAD') res.write(v41Bytes);
      res.end();
      return;
    }

    res.writeHead(404);
    res.end('Not found');
  });

  const manifestPath = join(tempDir, 'manifest.json');
  await writeFile(manifestPath, JSON.stringify({
    source_page_url: `${baseUrl}/app/questAndAnswer`,
    benchmark_title: '行動應用App基本資安檢測基準',
    current_version_label: '行動應用App基本資安檢測基準V4.0',
    current_pdf_url: `${baseUrl}/files/v4.0.pdf`,
    pdf_etag: '"v40-etag"',
    pdf_last_modified: 'Wed, 14 May 2025 03:41:54 GMT',
    pdf_content_length: v4Bytes.length,
    pdf_sha256: v4Sha,
  }), 'utf8');

  const downloadDir = join(tempDir, 'downloads');

  // 1. up_to_date
  mode = 'up_to_date';
  const upToDateRes = await runCheckerAsync([
    '--manifest', manifestPath, '--download-dir', downloadDir,
  ]);
  assert.equal(upToDateRes.status, 0, upToDateRes.stderr);
  const upToDateJson = JSON.parse(upToDateRes.stdout);
  assert.equal(upToDateJson.status, 'up_to_date');
  assert.deepEqual(upToDateJson.changes, []);
  assert.equal(upToDateJson.downloaded_pdf_path, null);

  // 2. update_available
  mode = 'updated';
  const updatedRes = await runCheckerAsync([
    '--manifest', manifestPath, '--download-dir', downloadDir,
  ]);
  assert.equal(updatedRes.status, 0, updatedRes.stderr);
  const updatedJson = JSON.parse(updatedRes.stdout);
  assert.equal(updatedJson.status, 'update_available');
  assert.ok(updatedJson.changes.includes('version_label_changed'));
  assert.ok(updatedJson.changes.includes('pdf_url_changed'));
  assert.equal(updatedJson.remote.sha256, v41Sha);
  assert.ok(updatedJson.downloaded_pdf_path);
  await assert.doesNotReject(access(updatedJson.downloaded_pdf_path));

  // 3. HTTP 405 on HEAD falls back to GET headers cleanly
  mode = 'head_405';
  const head405Res = await runCheckerAsync(['--manifest', manifestPath]);
  assert.equal(head405Res.status, 0, head405Res.stderr);
  assert.equal(JSON.parse(head405Res.stdout).status, 'up_to_date');

  // 4. --verify-hash detects modified PDF bytes even when version/URL/headers match
  mode = 'sha_mismatch';
  const shaRes = await runCheckerAsync([
    '--manifest', manifestPath, '--verify-hash', '--download-dir', downloadDir,
  ]);
  assert.equal(shaRes.status, 0, shaRes.stderr);
  const shaJson = JSON.parse(shaRes.stdout);
  assert.equal(shaJson.status, 'update_available');
  assert.ok(shaJson.changes.includes('pdf_sha256_changed'));

  // 5. broken_html -> check_failed with exit code 2 and agent-browser fallback recommendation
  mode = 'broken_html';
  const failedRes = await runCheckerAsync(['--manifest', manifestPath]);
  assert.equal(failedRes.status, 2);
  const failedJson = JSON.parse(failedRes.stdout);
  assert.equal(failedJson.status, 'check_failed');
  assert.equal(failedJson.fallback_recommended, 'agent-browser');
});
