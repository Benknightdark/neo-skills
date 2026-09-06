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
  'assets/templates/scripts.md.template',
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

  assert.match(skillText, /\.neo_harness\/docs\/scripts\.md/);
  assert.match(skillText, /YYYYMMDDHHmmss_/);

  const scriptsTemplate = await readFile(
    join(skillRoot, 'assets', 'templates', 'scripts.md.template'),
    'utf8',
  );
  assert.deepEqual(
    scriptsTemplate.trim().split('\n'),
    ['| 指令 | 用途 |', '| :--- | :--- |'],
    'scripts.md 模板必須是只有兩欄的 Markdown table',
  );
});

test('neo-harness-project 將 Harness 產出集中於 .neo_harness 並保留根入口', async () => {
  const skillText = await readFile(join(skillRoot, 'SKILL.md'), 'utf8');
  const artifactText = await readFile(
    join(skillRoot, 'references', 'artifact-selection.md'),
    'utf8',
  );
  const generationText = await readFile(
    join(skillRoot, 'references', 'generation-validation.md'),
    'utf8',
  );
  const agentsTemplate = await readFile(
    join(skillRoot, 'assets', 'templates', 'AGENTS.md.template'),
    'utf8',
  );
  const plansTemplate = await readFile(
    join(skillRoot, 'assets', 'templates', 'PLANS.md.template'),
    'utf8',
  );

  for (const path of [
    '.neo_harness/ARCHITECTURE.md',
    '.neo_harness/PLANS.md',
    '.neo_harness/docs/scripts.md',
    '.neo_harness/docs/exec-plans/active/',
    '.neo_harness/docs/exec-plans/completed/',
  ]) {
    assert.ok(skillText.includes(path), `SKILL.md 缺少正式路徑：${path}`);
    assert.ok(artifactText.includes(path), `資產選擇矩陣缺少正式路徑：${path}`);
    assert.ok(generationText.includes(path), `產生與驗證規範缺少正式路徑：${path}`);
  }

  assert.match(skillText, /不得建立 `\.neo_harness\/AGENTS\.md`/);
  assert.match(skillText, /`migrate`/);
  assert.match(skillText, /目的地已存在.*`blocked`/s);
  assert.match(artifactText, /舊路徑搬遷/);
  assert.match(generationText, /不屬於 Harness 的文件不因路徑相近而搬遷/);
  assert.match(agentsTemplate, /\.neo_harness\/ARCHITECTURE\.md/);
  assert.match(agentsTemplate, /\.neo_harness\/docs\/scripts\.md/);
  assert.match(plansTemplate, /\.neo_harness\/docs\/exec-plans\/active\//);
  assert.match(plansTemplate, /\.neo_harness\/docs\/exec-plans\/completed\//);
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
