import test from 'node:test';
import assert from 'node:assert/strict';
import { access, mkdtemp, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const scriptPath = join(repoRoot, 'bin', 'install-skills.js');

async function withTempDir(t) {
  const dir = await mkdtemp(join(tmpdir(), 'neo-skills-install-cli-'));
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

test('install-skills 對未知 agent 回傳錯誤', () => {
  const result = runInstall(['--ai-agent', 'unknown']);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /未知的 agent/);
});

test('install-skills 可安裝單一 agent 至指定專案路徑', async (t) => {
  const projectRoot = await withTempDir(t);
  const result = runInstall(['--ai-agent', 'copilot', '--project-path', projectRoot]);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /\[Copilot\] 安裝成功/);
  await access(join(projectRoot, '.github', 'skills', 'neo-git-commit', 'SKILL.md'));
});

test('install-skills 未指定 agent 時可批次安裝全部 agent', async (t) => {
  const projectRoot = await withTempDir(t);
  const result = runInstall(['--project-path', projectRoot]);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /成功: 3 \/ 3/);
  await Promise.all([
    access(join(projectRoot, '.claude', 'skills', 'neo-clarification', 'SKILL.md')),
    access(join(projectRoot, '.github', 'skills', 'neo-git-commit', 'SKILL.md')),
    access(join(projectRoot, '.codex', 'skills', 'neo-python', 'SKILL.md')),
  ]);
});
