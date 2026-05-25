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

test('analyze-slop.js 能夠正確列印說明訊息 (help)', () => {
  const result = runAnalyzer(['--help']);
  assert.equal(result.status, 0);
  assert.match(result.stderr, /Neo Stop Slop Analyzer/);
});

test('analyze-slop.js 能夠正確檢測英文的 AI Tells 贅詞', () => {
  const testInput = "Here's the thing: Not because it's hard. But because it's necessary to delve into this tapestry. Full stop.";
  const result = runAnalyzer(['--input', testInput, '--format', 'json']);

  assert.equal(result.status, 0, result.stderr);
  
  const output = JSON.parse(result.stdout);
  assert.ok(output.metrics.totalWords > 0);
  assert.ok(output.metrics.totalViolations >= 3); // "here's the thing", "full stop", etc.
  assert.equal(output.metrics.grade, 'F (充斥大量 AI Tells，廢話連篇)');
});

test('analyze-slop.js 能夠正確檢測繁體中文的 AI Tells 贅詞', () => {
  const testInput = "值得注意的是，這是一把雙刃劍，至關重要。";
  const result = runAnalyzer(['--input', testInput, '--format', 'json']);

  assert.equal(result.status, 0, result.stderr);
  
  const output = JSON.parse(result.stdout);
  assert.ok(output.metrics.totalWords > 0);
  assert.ok(output.metrics.totalViolations >= 3); // "值得注意的是", "雙刃劍", "至關重要"
});

test('analyze-slop.js 面對無 AI Tells 的精簡文字應給予 A+ 等級', () => {
  const testInput = "寫測試有助於提高程式碼品質。";
  const result = runAnalyzer(['--input', testInput, '--format', 'json']);

  assert.equal(result.status, 0, result.stderr);
  
  const output = JSON.parse(result.stdout);
  assert.equal(output.metrics.totalViolations, 0);
  assert.match(output.metrics.grade, /A\+/);
});
