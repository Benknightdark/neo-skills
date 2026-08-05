import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const scriptPath = join(
  repoRoot,
  'skills',
  'neo-code-review',
  'scripts',
  'git-diff-reviewer.py',
);

async function withTempDir(t) {
  const dir = await mkdtemp(join(tmpdir(), 'neo-code-review-'));
  t.after(async () => {
    await rm(dir, { recursive: true, force: true });
  });
  return dir;
}

function runGit(cwd, args) {
  const result = spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  return result;
}

function runReviewer(cwd, args) {
  return spawnSync('python3', [scriptPath, ...args], {
    cwd,
    encoding: 'utf8',
  });
}

async function createGitRepository() {
  const dir = await mkdtemp(join(tmpdir(), 'neo-code-review-git-'));
  runGit(dir, ['init', '-q']);
  runGit(dir, ['config', 'user.email', 'test@example.com']);
  runGit(dir, ['config', 'user.name', 'Test User']);
  await writeFile(join(dir, '.gitignore'), 'ignored.py\n', 'utf8');
  await writeFile(join(dir, 'tracked.txt'), 'base\n', 'utf8');
  runGit(dir, ['add', '.']);
  runGit(dir, ['commit', '-qm', 'initial']);
  return dir;
}

test('git-diff-reviewer working-tree mode covers all uncommitted change types', async (t) => {
  const dir = await createGitRepository();
  t.after(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  await writeFile(join(dir, 'tracked.txt'), 'base\nstaged\n', 'utf8');
  runGit(dir, ['add', 'tracked.txt']);
  await writeFile(join(dir, 'tracked.txt'), 'base\nstaged\nunstaged\n', 'utf8');
  await writeFile(join(dir, 'new file.py'), 'print("new")\n', 'utf8');
  await writeFile(join(dir, 'ignored.py'), 'print("ignored")\n', 'utf8');

  const result = runReviewer(dir, ['--working-tree']);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const output = JSON.parse(result.stdout);
  assert.equal(output.mode, 'working-tree');
  assert.equal(output.status, 'success');
  assert.match(output.diff, /tracked\.txt/);
  assert.ok(
    output.files.some((file) => file.path === 'new file.py'),
    'It should read an untracked file whose path contains spaces',
  );
  assert.equal(
    output.files.some((file) => file.path === 'ignored.py'),
    false,
    'It should not read a Git-ignored file',
  );
});

test('git-diff-reviewer working-tree mode detects a clean worktree', async (t) => {
  const dir = await createGitRepository();
  t.after(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  const result = runReviewer(dir, ['--working-tree']);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const output = JSON.parse(result.stdout);
  assert.equal(output.mode, 'working-tree');
  assert.equal(output.status, 'empty');
  assert.equal(output.diff, '');
  assert.deepEqual(output.files, []);
});

test('git-diff-reviewer rejects mutually exclusive change selectors', async (t) => {
  const dir = await createGitRepository();
  t.after(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  const result = runReviewer(dir, ['--working-tree', '--staged']);

  assert.equal(result.status, 1);
  const output = JSON.parse(result.stdout);
  assert.equal(output.status, 'error');
  assert.match(output.error_message, /mutually exclusive/);
});

test('git-diff-reviewer reports a clear error outside a Git repository', async (t) => {
  const dir = await mkdtemp(join(tmpdir(), 'neo-code-review-non-git-'));
  t.after(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  const result = runReviewer(dir, ['--working-tree']);

  assert.equal(result.status, 1);
  const output = JSON.parse(result.stdout);
  assert.equal(output.status, 'error');
  assert.match(output.error_message, /not a Git repository/);
});

test('git-diff-reviewer preserves specific-file mode', async (t) => {
  const dir = await createGitRepository();
  t.after(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  const targetPath = join(dir, 'target.txt');
  await writeFile(targetPath, 'target\n', 'utf8');

  const result = runReviewer(dir, ['--input', 'target.txt']);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const output = JSON.parse(result.stdout);
  assert.equal(output.mode, 'specific-files');
  assert.equal(output.files.length, 1);
  assert.equal(output.files[0].path, 'target.txt');
  assert.equal(output.files[0].content, await readFile(targetPath, 'utf8'));
});
