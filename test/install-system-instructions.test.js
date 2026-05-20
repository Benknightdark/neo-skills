import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, access, mkdtemp, rm, mkdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const scriptPath = join(repoRoot, 'bin', 'install-system-instructions.js');

async function withTempDir(t) {
  const dir = await mkdtemp(join(tmpdir(), 'neo-skills-sys-inst-'));
  t.after(async () => {
    await rm(dir, { recursive: true, force: true });
  });
  return dir;
}

function runInstall(args) {
  return spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
}

// ── 參數驗證 ──

test('省略 --ai-agent 時安裝至全部 agent', async (t) => {
  const dir = await withTempDir(t);
  const result = runInstall(['--instructions', 'technical-co-founder', '--project-path', dir]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /全部安裝完成/);
});

test('未知 agent 回傳錯誤', () => {
  const result = runInstall(['--ai-agent', 'unknown', '--instructions', 'technical-co-founder']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /未知的 agent/);
});

test('缺少 --instructions 回傳錯誤', () => {
  const result = runInstall(['--ai-agent', 'claude']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /缺少必填參數 --instructions/);
});

test('未知 instructions key 回傳錯誤', () => {
  const result = runInstall(['--ai-agent', 'claude', '--instructions', 'nonexistent']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /未知的 instructions/);
});

// ── 建立新檔案 ──

test('指導檔不存在時正確建立 — Claude', async (t) => {
  const projectRoot = await withTempDir(t);
  const result = runInstall([
    '--ai-agent', 'claude',
    '--instructions', 'technical-co-founder',
    '--project-path', projectRoot,
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /已建立指導檔/);

  const content = await readFile(join(projectRoot, 'CLAUDE.md'), 'utf8');
  assert.ok(content.includes('<!-- neo-skills:system-instructions:technical-co-founder -->'));
  assert.ok(content.includes('Technical Co-Founder'));
  assert.ok(content.includes('<!-- /neo-skills:system-instructions:technical-co-founder -->'));
});

test('指導檔不存在時正確建立 — Copilot', async (t) => {
  const projectRoot = await withTempDir(t);
  const result = runInstall([
    '--ai-agent', 'copilot',
    '--instructions', 'technical-co-founder',
    '--project-path', projectRoot,
  ]);

  assert.equal(result.status, 0, result.stderr);

  const content = await readFile(join(projectRoot, '.github', 'copilot-instructions.md'), 'utf8');
  assert.ok(content.includes('<!-- neo-skills:system-instructions:technical-co-founder -->'));
});

test('指導檔不存在時正確建立 — Codex', async (t) => {
  const projectRoot = await withTempDir(t);
  const result = runInstall([
    '--ai-agent', 'codex',
    '--instructions', 'technical-co-founder',
    '--project-path', projectRoot,
  ]);

  assert.equal(result.status, 0, result.stderr);

  const content = await readFile(join(projectRoot, 'AGENTS.md'), 'utf8');
  assert.ok(content.includes('<!-- neo-skills:system-instructions:technical-co-founder -->'));
});

test('指導檔不存在時正確建立 — Antigravity (AGY)', async (t) => {
  const projectRoot = await withTempDir(t);
  const result = runInstall([
    '--ai-agent', 'agy',
    '--instructions', 'technical-co-founder',
    '--project-path', projectRoot,
  ]);

  assert.equal(result.status, 0, result.stderr);

  const content = await readFile(join(projectRoot, 'agents.md'), 'utf8');
  assert.ok(content.includes('<!-- neo-skills:system-instructions:technical-co-founder -->'));
});

// ── 附加至既有檔案 ──

test('指導檔已存在時附加至最下方', async (t) => {
  const projectRoot = await withTempDir(t);
  const existingContent = '# CLAUDE.md\n\nExisting content here.\n';
  await writeFile(join(projectRoot, 'CLAUDE.md'), existingContent, 'utf8');

  const result = runInstall([
    '--ai-agent', 'claude',
    '--instructions', 'technical-co-founder',
    '--project-path', projectRoot,
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /已將.*附加至既有指導檔/);

  const content = await readFile(join(projectRoot, 'CLAUDE.md'), 'utf8');
  assert.ok(content.startsWith('# CLAUDE.md'));
  assert.ok(content.includes('Existing content here.'));
  assert.ok(content.includes('<!-- neo-skills:system-instructions:technical-co-founder -->'));
});

// ── 冪等性 ──

test('重複安裝同一提示詞不會重複附加', async (t) => {
  const projectRoot = await withTempDir(t);

  // 第一次安裝
  runInstall([
    '--ai-agent', 'claude',
    '--instructions', 'technical-co-founder',
    '--project-path', projectRoot,
  ]);

  // 第二次安裝
  const result = runInstall([
    '--ai-agent', 'claude',
    '--instructions', 'technical-co-founder',
    '--project-path', projectRoot,
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /跳過安裝/);

  const content = await readFile(join(projectRoot, 'CLAUDE.md'), 'utf8');
  const markerCount = content.split('<!-- neo-skills:system-instructions:technical-co-founder -->').length - 1;
  assert.equal(markerCount, 1, '標記應只出現一次');
});

test('指定 --replace-all 時會先移除既有的提示詞再重裝', async (t) => {
  const projectRoot = await withTempDir(t);

  // 1. 第一次安裝
  runInstall([
    '--ai-agent', 'claude',
    '--instructions', 'technical-co-founder',
    '--project-path', projectRoot,
  ]);

  // 2. 故意修改該區域，模擬髒資料/舊的內容
  const targetFile = join(projectRoot, 'CLAUDE.md');
  const originalContent = await readFile(targetFile, 'utf8');
  const modifiedContent = originalContent.replace('Technical Co-Founder', 'Old Outdated Content');
  await writeFile(targetFile, modifiedContent, 'utf8');

  // 3. 再次安裝，但加上 --replace-all
  const result = runInstall([
    '--ai-agent', 'claude',
    '--instructions', 'technical-co-founder',
    '--project-path', projectRoot,
    '--replace-all',
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /已重裝/);

  // 4. 驗證檔案內容
  const finalContent = await readFile(targetFile, 'utf8');
  assert.ok(!finalContent.includes('Old Outdated Content'), '舊的內容應被清空');
  assert.ok(finalContent.includes('Technical Co-Founder'), '應重裝為新的提示詞');
  
  const markerCount = finalContent.split('<!-- neo-skills:system-instructions:technical-co-founder -->').length - 1;
  assert.equal(markerCount, 1, '標記應只出現一次');
});
