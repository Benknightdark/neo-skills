import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const scriptPath = join(repoRoot, 'skills', 'neo-harness', 'scripts', 'generate-agents-md.py');

async function withTempDir(t) {
  const dir = await mkdtemp(join(tmpdir(), 'neo-harness-test-'));
  t.after(async () => {
    await rm(dir, { recursive: true, force: true });
  });
  return dir;
}

function runGenerator(args, cwd = repoRoot) {
  return spawnSync('python3', [scriptPath, ...args], {
    cwd,
    encoding: 'utf8',
  });
}

test('generate-agents-md --validate passes on compliant AGENTS.md', () => {
  const result = runGenerator(['--target-dir', repoRoot, '--validate']);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stderr, /AGENTS.md Template Validation Passed/);
});

test('generate-agents-md --validate fails on non-compliant AGENTS.md', async (t) => {
  const tempDir = await withTempDir(t);
  const badAgentsPath = join(tempDir, 'AGENTS.md');
  await writeFile(badAgentsPath, '# Invalid AGENTS.md\nMissing all required template sections.\n', 'utf8');

  const result = runGenerator(['--target-dir', tempDir, '--validate']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Missing required section: '## 1. Project Overview'/);
  assert.match(result.stderr, /Missing required section: '## 2. Commands'/);
  assert.match(result.stderr, /Missing required section: '## 3. Workflow'/);
  assert.match(result.stderr, /Missing required section: '## 4. Forbidden Antipattern Redlines'/);
});

test('generate-agents-md dry-run generates compliant content', async (t) => {
  const tempDir = await withTempDir(t);
  await writeFile(join(tempDir, 'package.json'), JSON.stringify({ name: 'test-project', scripts: { test: 'npm test' } }), 'utf8');

  const result = runGenerator(['--target-dir', tempDir, '--dry-run']);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /# test-project AGENTS.md/);
  assert.match(result.stdout, /## 1. Project Overview/);
  assert.match(result.stdout, /## 2. Commands/);
  assert.match(result.stdout, /## 3. Workflow/);
  assert.match(result.stdout, /## 4. Forbidden Antipattern Redlines/);
});
