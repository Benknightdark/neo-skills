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
  // 廢話起手式
  { phrase: "值得注意的是", category: "起手式", regex: /值得注意的是/g },
  { phrase: "不得不說", category: "起手式", regex: /不得不說/g },
  { phrase: "不可否認的是", category: "起手式", regex: /不可否認的是/g },
  { phrase: "毫無疑問地", category: "起手式", regex: /毫無疑問地?/g },
  { phrase: "簡單來說", category: "起手式", regex: /簡單來說/g },
  { phrase: "總結來說", category: "起手式", regex: /總結來說/g },
  { phrase: "綜上所述", category: "起手式", regex: /綜上所述/g },
  { phrase: "讓我們來看看", category: "起手式", regex: /讓我們來看看/g },
  { phrase: "我們需要深入探討", category: "起手式", regex: /我們需要深入探討/g },
  // 誇大字眼
  { phrase: "不容忽視", category: "誇大渲染", regex: /不容忽視/g },
  { phrase: "不容小覷", category: "誇大渲染", regex: /不容小覷/g },
  { phrase: "扮演著舉足輕重的角色", category: "誇大渲染", regex: /扮演著舉足輕重的角色/g },
  { phrase: "至關重要", category: "誇大渲染", regex: /至關重要/g },
  { phrase: "無疑是", category: "誇大渲染", regex: /無疑是/g },
  // AI 高頻詞彙
  { phrase: "維度", category: "AI 濫用詞", regex: /維度/g },
  { phrase: "畫卷", category: "AI 濫用詞", regex: /畫卷/g },
  { phrase: "雙刃劍", category: "AI 濫用詞", regex: /雙刃劍/g },
  { phrase: "落地", category: "AI 濫用詞", regex: /落地/g },
  { phrase: "賦能", category: "AI 濫用詞", regex: /賦能/g },
  { phrase: "生態系/生態圈", category: "AI 濫用詞", regex: /生態[系圈]/g },
  { phrase: "護城河", category: "AI 濫用詞", regex: /護城河/g },
  { phrase: "痛點", category: "AI 濫用詞", regex: /痛點/g },
  { phrase: "閉環", category: "AI 濫用詞", regex: /閉環/g },
  { phrase: "抓手", category: "AI 濫用詞", regex: /抓手/g },
  { phrase: "背後的邏輯", category: "AI 濫用詞", regex: /背後的邏輯/g },
  { phrase: "重塑", category: "AI 濫用詞", regex: /重塑/g },
  // 贅詞副詞
  { phrase: "基本上", category: "贅字副詞", regex: /基本上/g },
  { phrase: "深刻地", category: "贅字副詞", regex: /深刻地/g }
];

function showHelp() {
  console.warn(`
Neo Stop Slop Analyzer - 檢測並計算文本中的 AI Tells / Slop 密度。

用法:
  node analyze-slop.js [選項]

選項:
  -f, --file <路徑>      指定要分析的文字或 Markdown 檔案路徑。
  -i, --input <文字>     直接傳入要分析的文字字串。
  -o, --output <路徑>    將結果寫入指定檔案 (預設為輸出至 stdout)。
  --format <格式>        輸出格式: "text" (預設，易讀報告) 或 "json" (程式解析用)。
  -h, --help             顯示此說明訊息。

範例:
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
        console.error(`[ERROR] 不支援的輸出格式: ${options.format}. 請使用 "text" 或 "json"。`);
        process.exit(1);
      }
    } else {
      console.error(`[ERROR] 未知參數: ${arg}`);
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
  let grade = 'A+ (極其精煉，無 AI 腔)';
  if (slopDensity > 10) {
    grade = 'F (充斥大量 AI Tells，廢話連篇)';
  } else if (slopDensity > 5) {
    grade = 'D (AI 腔過重，亟需重寫)';
  } else if (slopDensity > 2) {
    grade = 'C (有明顯 AI Tells，建議修改)';
  } else if (slopDensity > 0.5) {
    grade = 'B (有些許贅詞，品質尚可)';
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
  output += `   NEO STOP SLOP - AI TELLS 檢測報告\n`;
  output += `==================================================\n`;
  output += `來源名稱: ${sourceName}\n`;
  output += `總字詞數: ${result.metrics.totalWords}\n`;
  output += `檢出 AI 贅詞數: ${result.metrics.totalViolations}\n`;
  output += `Slop 密度分數: ${result.metrics.slopDensityScore}% (每百字出現次數)\n`;
  output += `評估等級: ${result.metrics.grade}\n`;
  output += `--------------------------------------------------\n`;

  if (result.violations.length === 0) {
    output += `✨ 太棒了！您的文字極其精煉，沒有檢測到任何 AI 贅詞特徵！\n`;
  } else {
    output += `檢出細節 (前 30 筆違規)：\n\n`;
    const displayList = result.violations.slice(0, 30);
    displayList.forEach(v => {
      output += `[第 ${v.line} 行] 【${v.category}】檢出: "${v.matchedText}" (預設關鍵字: "${v.phrase}")\n`;
      output += `  上下文: "${v.lineContent}"\n\n`;
    });

    if (result.violations.length > 30) {
      output += `... 還有其他 ${result.violations.length - 30} 處違規未列出。\n`;
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
      console.error(`[ERROR] 找不到指定的檔案: ${options.file}`);
      process.exit(1);
    }
    sourceContent = fs.readFileSync(absolutePath, 'utf8');
    sourceName = path.basename(options.file);
  } else if (options.input !== null) {
    sourceContent = options.input;
    sourceName = '直接傳入字串';
  } else {
    console.error(`[ERROR] 請提供 --file <路徑> 或 --input <文字>。`);
    showHelp();
    process.exit(1);
  }

  // Run analysis
  console.error(`[INFO] 正在分析 "${sourceName}" 中的 AI 腔贅詞...`);
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
    console.error(`[INFO] 正在將分析結果寫入: ${outputPath}`);
    fs.writeFileSync(outputPath, outputResult, 'utf8');
  } else {
    // Print to stdout
    process.stdout.write(outputResult + '\n');
  }

  console.error(`[INFO] 分析完成。`);
}

main();
