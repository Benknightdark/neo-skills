import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const scriptPath = join(repoRoot, 'scripts', 'check-skills-syntax.py');

async function withTempDir(t) {
  const dir = await mkdtemp(join(tmpdir(), 'neo-skills-syntax-'));
  t.after(async () => {
    await rm(dir, { recursive: true, force: true });
  });
  return dir;
}

function runValidator(skillDir) {
  return spawnSync('python3', [scriptPath, '--dir', skillDir], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
}

test('check-skills-syntax 驗證目前所有內建技能', () => {
  const result = runValidator('skills');

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /"total_scanned_skills": \d+/);
  assert.match(result.stdout, /"status": "success"/);
});

test('check-skills-syntax 擋下非觸發導向描述與非標準頂層欄位', async (t) => {
  const dir = await withTempDir(t);
  const skillDir = join(dir, 'bad-skill');
  await mkdir(skillDir, { recursive: true });
  await writeFile(
    join(skillDir, 'SKILL.md'),
    `---
name: bad-skill
version: "1.0.0"
description: Too short.
---

# Bad Skill
`,
    'utf8',
  );

  const result = runValidator(dir);

  assert.equal(result.status, 1);
  assert.match(result.stdout, /非標準頂層屬性/);
  assert.match(result.stdout, /description' 過短/);
  assert.match(result.stdout, /不是觸發導向描述/);
});
