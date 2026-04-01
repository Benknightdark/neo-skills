import test from 'node:test';
import assert from 'node:assert/strict';
import { access, mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { AGENTS, createInstaller } from '../bin/_utils.js';

function silenceConsole(t) {
  const original = {
    log: console.log,
    warn: console.warn,
    error: console.error,
  };

  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};

  t.after(() => {
    console.log = original.log;
    console.warn = original.warn;
    console.error = original.error;
  });
}

async function withTempDir(t) {
  const dir = await mkdtemp(join(tmpdir(), 'neo-skills-bin-utils-'));
  t.after(async () => {
    await rm(dir, { recursive: true, force: true });
  });
  return dir;
}

test('createInstaller 於有 projectPath 的 agent 使用專案目錄', async (t) => {
  silenceConsole(t);
  const projectRoot = await withTempDir(t);
  const install = createInstaller(AGENTS.copilot, projectRoot);

  const result = await install();

  assert.equal(result.success, true);
  assert.match(result.message, new RegExp(projectRoot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  await access(join(projectRoot, '.github', 'skills', 'neo-git-commit', 'SKILL.md'));
});

test('createInstaller 於無 projectPath 的 agent 回退至 homePath 子目錄', async (t) => {
  silenceConsole(t);
  const projectRoot = await withTempDir(t);
  const install = createInstaller(AGENTS.claude, projectRoot);

  const result = await install();

  assert.equal(result.success, true);
  await access(join(projectRoot, '.claude', 'skills', 'neo-clarification', 'SKILL.md'));
});
