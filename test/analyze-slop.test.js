import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const scriptPath = join(repoRoot, 'skills', 'neo-stop-slop', 'scripts', 'analyze-slop.js');

function runAnalyzer(args) {
  return spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
}

test('analyze-slop.js prints the help message correctly', () => {
  const result = runAnalyzer(['--help']);
  assert.equal(result.status, 0);
  assert.match(result.stderr, /Neo Stop Slop Analyzer/);
});

test('analyze-slop.js detects English AI tells', () => {
  const testInput = "Here's the thing: Not because it's hard. But because it's necessary to delve into this tapestry. Full stop.";
  const result = runAnalyzer(['--input', testInput, '--format', 'json']);

  assert.equal(result.status, 0, result.stderr);
  
  const output = JSON.parse(result.stdout);
  assert.ok(output.metrics.totalWords > 0);
  assert.ok(output.metrics.totalViolations >= 3); // "here's the thing", "full stop", etc.
  assert.equal(output.metrics.grade, 'F (Heavy AI tells and filler)');
});

test('analyze-slop.js detects Traditional Chinese AI tells', () => {
  const testInput = "值得注意的是，這是一把雙刃劍，至關重要。";
  const result = runAnalyzer(['--input', testInput, '--format', 'json']);

  assert.equal(result.status, 0, result.stderr);
  
  const output = JSON.parse(result.stdout);
  assert.ok(output.metrics.totalWords > 0);
  assert.ok(output.metrics.totalViolations >= 3); // "值得注意的是", "雙刃劍", "至關重要"
});

test('analyze-slop.js gives concise text an A+ grade', () => {
  const testInput = "寫測試有助於提高程式碼品質。";
  const result = runAnalyzer(['--input', testInput, '--format', 'json']);

  assert.equal(result.status, 0, result.stderr);
  
  const output = JSON.parse(result.stdout);
  assert.equal(output.metrics.totalViolations, 0);
  assert.match(output.metrics.grade, /A\+/);
});
