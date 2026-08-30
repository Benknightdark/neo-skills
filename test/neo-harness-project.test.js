import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const skillRoot = join(repoRoot, 'skills', 'neo-harness-project');

const expectedFiles = [
  'SKILL.md',
  'references/project-assessment.md',
  'references/artifact-selection.md',
  'references/generation-validation.md',
  'assets/templates/AGENTS.md.template',
  'assets/templates/ARCHITECTURE.md.template',
  'assets/templates/PLANS.md.template',
  'assets/templates/exec-plan.md.template',
  'evals/eval_queries.json',
  'evals/evals.json',
];

const deniedTerms = [
  /openai/i,
  /codex/i,
  /chatgpt/i,
  /agents[\s-]+sdk/i,
  /(^|[^a-z0-9])gpt(?:-[a-z0-9]+)?([^a-z0-9]|$)/i,
  /dall-e/i,
  /sora/i,
];

async function listFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  }));
  return files.flat();
}

test('neo-harness-project 包含完整技能資源且連結有效', async () => {
  await Promise.all(expectedFiles.map((path) => assert.doesNotReject(
    access(join(skillRoot, path)),
    `缺少技能資源：${path}`,
  )));

  const skillText = await readFile(join(skillRoot, 'SKILL.md'), 'utf8');
  const relativeLinks = [...skillText.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)]
    .map((match) => match[1])
    .filter((path) => !path.startsWith('#') && !path.includes('://'));

  await Promise.all(relativeLinks.map((path) => assert.doesNotReject(
    access(resolve(skillRoot, path)),
    `SKILL.md 連結不存在：${path}`,
  )));
});

test('neo-harness-project 評估資料格式有效', async () => {
  const queries = JSON.parse(await readFile(join(skillRoot, 'evals', 'eval_queries.json'), 'utf8'));
  const evals = JSON.parse(await readFile(join(skillRoot, 'evals', 'evals.json'), 'utf8'));

  assert.ok(queries.should_trigger.length > 0, '必須提供 should_trigger 案例');
  assert.ok(queries.should_not_trigger.length > 0, '必須提供 should_not_trigger 案例');
  assert.equal(evals.skill_name, 'neo-harness-project');
  assert.ok(evals.evals.length > 0, '必須提供行為評估案例');
});

test('neo-harness-project 的檔名與內容保持供應商中立', async () => {
  const files = await listFiles(skillRoot);

  for (const file of files) {
    const path = relative(skillRoot, file);
    const content = await readFile(file, 'utf8');

    for (const term of deniedTerms) {
      assert.doesNotMatch(path, term, `檔名包含禁止詞彙：${path}`);
      assert.doesNotMatch(content, term, `內容包含禁止詞彙：${path}`);
    }
  }
});
