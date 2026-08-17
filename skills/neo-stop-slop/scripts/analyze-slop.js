#!/usr/bin/env node

/**
 * Neo Stop Slop - CLI Analyzer
 * 
 * Analyze text or markdown files for AI writing patterns (Slop) and calculate Slop Density.
 * Strictly non-interactive, accepts arguments, separates stdout/stderr.
 */

import fs from 'fs';
import path from 'path';

// Define high-frequency AI Tells & Slop Patterns
const ENGLISH_PATTERNS = [
  // Throat-clearing
  { phrase: "here's the thing", category: "Throat-Clearing", regex: /\bhere's the thing\b/gi },
  { phrase: "the uncomfortable truth is", category: "Throat-Clearing", regex: /\bthe uncomfortable truth is\b/gi },
  { phrase: "it turns out that", category: "Throat-Clearing", regex: /\bit turns out that\b/gi },
  { phrase: "let me be clear", category: "Throat-Clearing", regex: /\blet me be clear\b/gi },
  { phrase: "the truth is,", category: "Throat-Clearing", regex: /\bthe truth is\b/gi },
  { phrase: "it is important to note that", category: "Throat-Clearing", regex: /\bit is important to note that\b/gi },
  { phrase: "it goes without saying that", category: "Throat-Clearing", regex: /\bit goes without saying that\b/gi },
  // Emphasis crutches
  { phrase: "full stop.", category: "Emphasis Crutch", regex: /\bfull stop\b/gi },
  { phrase: "let that sink in", category: "Emphasis Crutch", regex: /\blet that sink in\b/gi },
  { phrase: "make no mistake", category: "Emphasis Crutch", regex: /\bmake no mistake\b/gi },
  // High-frequency AI Slop Words
  { phrase: "delve", category: "AI Slop Word", regex: /\bdelve\b/gi },
  { phrase: "tapestry", category: "AI Slop Word", regex: /\btapestry\b/gi },
  { phrase: "testament", category: "AI Slop Word", regex: /\btestament\b/gi },
  { phrase: "beacon", category: "AI Slop Word", regex: /\bbeacon\b/gi },
  { phrase: "catalyst", category: "AI Slop Word", regex: /\bcatalyst\b/gi },
  { phrase: "revolutionize", category: "AI Slop Word", regex: /\brevolutionize\b/gi },
  { phrase: "synergy", category: "AI Slop Word", regex: /\bsynergy\b/gi },
  { phrase: "foster", category: "AI Slop Word", regex: /\bfoster\b/gi },
  { phrase: "demystify", category: "AI Slop Word", regex: /\bdemystify\b/gi },
  // Business jargon
  { phrase: "navigate challenges", category: "Jargon", regex: /\bnavigate (?:the )?challenges\b/gi },
  { phrase: "unpack", category: "Jargon", regex: /\bunpack\b/gi },
  { phrase: "lean into", category: "Jargon", regex: /\blean into\b/gi },
  { phrase: "double down", category: "Jargon", regex: /\bdouble down\b/gi },
  { phrase: "deep dive", category: "Jargon", regex: /\bdeep dive\b/gi },
  { phrase: "paradigm shift", category: "Jargon", regex: /\bparadigm shift\b/gi }
];

const CHINESE_PATTERNS = [
  // Throat-clearing openers
  { phrase: "值得注意的是", category: "Throat-Clearing", regex: /值得注意的是/g },
  { phrase: "不得不說", category: "Throat-Clearing", regex: /不得不說/g },
  { phrase: "不可否認的是", category: "Throat-Clearing", regex: /不可否認的是/g },
  { phrase: "毫無疑問地", category: "Throat-Clearing", regex: /毫無疑問地?/g },
  { phrase: "簡單來說", category: "Throat-Clearing", regex: /簡單來說/g },
  { phrase: "總結來說", category: "Throat-Clearing", regex: /總結來說/g },
  { phrase: "綜上所述", category: "Throat-Clearing", regex: /綜上所述/g },
  { phrase: "讓我們來看看", category: "Throat-Clearing", regex: /讓我們來看看/g },
  { phrase: "我們需要深入探討", category: "Throat-Clearing", regex: /我們需要深入探討/g },
  // Exaggerated wording
  { phrase: "不容忽視", category: "Emphasis Crutch", regex: /不容忽視/g },
  { phrase: "不容小覷", category: "Emphasis Crutch", regex: /不容小覷/g },
  { phrase: "扮演著舉足輕重的角色", category: "Emphasis Crutch", regex: /扮演著舉足輕重的角色/g },
  { phrase: "至關重要", category: "Emphasis Crutch", regex: /至關重要/g },
  { phrase: "無疑是", category: "Emphasis Crutch", regex: /無疑是/g },
  // High-frequency AI vocabulary
  { phrase: "維度", category: "AI Slop Word", regex: /維度/g },
  { phrase: "畫卷", category: "AI Slop Word", regex: /畫卷/g },
  { phrase: "雙刃劍", category: "AI Slop Word", regex: /雙刃劍/g },
  { phrase: "落地", category: "AI Slop Word", regex: /落地/g },
  { phrase: "賦能", category: "AI Slop Word", regex: /賦能/g },
  { phrase: "生態系/生態圈", category: "AI Slop Word", regex: /生態[系圈]/g },
  { phrase: "護城河", category: "AI Slop Word", regex: /護城河/g },
  { phrase: "痛點", category: "AI Slop Word", regex: /痛點/g },
  { phrase: "閉環", category: "AI Slop Word", regex: /閉環/g },
  { phrase: "抓手", category: "AI Slop Word", regex: /抓手/g },
  { phrase: "背後的邏輯", category: "AI Slop Word", regex: /背後的邏輯/g },
  { phrase: "重塑", category: "AI Slop Word", regex: /重塑/g },
  // Filler adverbs
  { phrase: "基本上", category: "Filler Adverb", regex: /基本上/g },
  { phrase: "深刻地", category: "Filler Adverb", regex: /深刻地/g }
];

function showHelp() {
  console.warn(`
Neo Stop Slop Analyzer - Detect AI tells and calculate slop density in text.

Usage:
  node analyze-slop.js [options]

Options:
  -f, --file <path>      Path to a text or Markdown file to analyze.
  -i, --input <text>     Text to analyze directly.
  -o, --output <path>    Write the result to a file (defaults to stdout).
  --format <format>      Output format: "text" (default, readable report) or "json" (for parsing).
  -h, --help             Show this help message.

Examples:
  node analyze-slop.js --file src/README.md --format json
  node analyze-slop.js --input "Here's the thing: Not because it's hard. But because it's necessary. Full stop."
`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    file: null,
    input: null,
    output: null,
    format: 'text' // text or json
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '-h' || arg === '--help') {
      showHelp();
      process.exit(0);
    } else if (arg === '-f' || arg === '--file') {
      options.file = args[++i];
    } else if (arg === '-i' || arg === '--input') {
      options.input = args[++i];
    } else if (arg === '-o' || arg === '--output') {
      options.output = args[++i];
    } else if (arg === '--format') {
      options.format = args[++i];
      if (options.format !== 'text' && options.format !== 'json') {
        console.error(`[ERROR] Unsupported output format: ${options.format}. Use "text" or "json".`);
        process.exit(1);
      }
    } else {
      console.error(`[ERROR] Unknown argument: ${arg}`);
      showHelp();
      process.exit(1);
    }
  }

  return options;
}

function calculateWordCount(text) {
  // Simple word count: English words + Chinese characters
  const enWords = text.match(/[a-zA-Z]+/g) || [];
  const zhChars = text.match(/[\u4e00-\u9fa5]/g) || [];
  return enWords.length + zhChars.length;
}

function analyzeText(text) {
  const lines = text.split('\n');
  const violations = [];
  let matchCount = 0;

  // Process English and Chinese patterns
  const allPatterns = [...ENGLISH_PATTERNS, ...CHINESE_PATTERNS];

  lines.forEach((lineText, lineIndex) => {
    const lineNumber = lineIndex + 1;

    allPatterns.forEach(pattern => {
      // Reset regex index due to 'g' flag
      pattern.regex.lastIndex = 0;
      let match;
      while ((match = pattern.regex.exec(lineText)) !== null) {
        matchCount++;
        violations.push({
          line: lineNumber,
          matchedText: match[0],
          phrase: pattern.phrase,
          category: pattern.category,
          lineContent: lineText.trim()
        });
      }
    });
  });

  const totalWords = calculateWordCount(text);
  // Calculate Slop Density Score (violations per 100 words)
  const slopDensity = totalWords > 0 ? parseFloat(((matchCount / totalWords) * 100).toFixed(2)) : 0;

  // Grade based on density
  let grade = 'A+ (Extremely concise; no AI tells)';
  if (slopDensity > 10) {
    grade = 'F (Heavy AI tells and filler)';
  } else if (slopDensity > 5) {
    grade = 'D (Too much AI style; rewrite recommended)';
  } else if (slopDensity > 2) {
    grade = 'C (Clear AI tells; revision recommended)';
  } else if (slopDensity > 0.5) {
    grade = 'B (Some filler; acceptable quality)';
  }

  return {
    metrics: {
      totalWords,
      totalViolations: matchCount,
      slopDensityScore: slopDensity,
      grade
    },
    violations
  };
}

function formatTextReport(result, sourceName) {
  let output = `==================================================\n`;
  output += `   NEO STOP SLOP - AI TELL DETECTION REPORT\n`;
  output += `==================================================\n`;
  output += `Source: ${sourceName}\n`;
  output += `Word count: ${result.metrics.totalWords}\n`;
  output += `AI tell count: ${result.metrics.totalViolations}\n`;
  output += `Slop density score: ${result.metrics.slopDensityScore}% (matches per 100 words)\n`;
  output += `Grade: ${result.metrics.grade}\n`;
  output += `--------------------------------------------------\n`;

  if (result.violations.length === 0) {
    output += `✨ Great. No AI-tell patterns detected.\n`;
  } else {
    output += `Detected details (first 30 violations):\n\n`;
    const displayList = result.violations.slice(0, 30);
    displayList.forEach(v => {
      output += `[Line ${v.line}] [${v.category}] Detected: "${v.matchedText}" (Configured phrase: "${v.phrase}")\n`;
      output += `  Context: "${v.lineContent}"\n\n`;
    });

    if (result.violations.length > 30) {
      output += `... ${result.violations.length - 30} additional violations omitted.\n`;
    }
  }
  output += `==================================================\n`;
  return output;
}

function main() {
  const options = parseArgs();

  let sourceContent = '';
  let sourceName = '';

  if (options.file) {
    const absolutePath = path.resolve(options.file);
    if (!fs.existsSync(absolutePath)) {
      console.error(`[ERROR] File not found: ${options.file}`);
      process.exit(1);
    }
    sourceContent = fs.readFileSync(absolutePath, 'utf8');
    sourceName = path.basename(options.file);
  } else if (options.input !== null) {
    sourceContent = options.input;
    sourceName = 'Direct input';
  } else {
    console.error(`[ERROR] Provide --file <path> or --input <text>.`);
    showHelp();
    process.exit(1);
  }

  // Run analysis
  console.error(`[INFO] Analyzing AI-tell patterns in "${sourceName}"...`);
  const result = analyzeText(sourceContent);

  // Generate output string
  let outputResult = '';
  if (options.format === 'json') {
    outputResult = JSON.stringify(result, null, 2);
  } else {
    outputResult = formatTextReport(result, sourceName);
  }

  // Handle output destination
  if (options.output) {
    const outputPath = path.resolve(options.output);
    console.error(`[INFO] Writing analysis results to: ${outputPath}`);
    fs.writeFileSync(outputPath, outputResult, 'utf8');
  } else {
    // Print to stdout
    process.stdout.write(outputResult + '\n');
  }

  console.error(`[INFO] Analysis complete.`);
}

main();
