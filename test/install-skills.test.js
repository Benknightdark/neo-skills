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
  const dir = await mkdtemp(join(tmpdir(), 'neo-skills-install-'));
  t.after(async () => {
    await rm(dir, { recursive: true, force: true });
  });
  return dir;
}

function runInstall(testHomeDir) {
  return spawnSync(process.execPath, [scriptPath], {
    cwd: repoRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      TEST_HOME_DIR: testHomeDir,
    },
  });
}

test('install-skills 能夠成功複製技能至全域 Antigravity CLI 目錄', async (t) => {
  const tempHome = await withTempDir(t);
  const result = runInstall(tempHome);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /安裝成功！已同步/);

  // 驗證技能檔案確實存在於目標目錄中
  const targetSkillFile = join(tempHome, '.gemini', 'antigravity-cli', 'skills', 'neo-python', 'SKILL.md');
  await assert.doesNotReject(access(targetSkillFile), '目標技能檔案應該要存在');
});

test('install-skills 複製時會過濾無關檔案', async (t) => {
  const tempHome = await withTempDir(t);
  const result = runInstall(tempHome);

  assert.equal(result.status, 0, result.stderr || result.stdout);

  // 驗證 node_modules 或 .git 等敏感資料夾不會出現在目標目錄下
  const badNodeModules = join(tempHome, '.gemini', 'antigravity-cli', 'skills', 'node_modules');
  await assert.rejects(access(badNodeModules), 'node_modules 應該被過濾掉而不能存在');

  const badGit = join(tempHome, '.gemini', 'antigravity-cli', 'skills', '.git');
  await assert.rejects(access(badGit), '.git 應該被過濾掉而不能存在');
});
