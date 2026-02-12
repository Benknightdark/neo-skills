#!/usr/bin/env node
import { readFileSync } from 'fs';

// Define the sensitive patterns
const SENSITIVE_PATTERNS = [
  /\.env/i,                     // Matches .env, .env.local, .envrc
  /\.pem\b/i,                   // Private keys
  /\.key\b/i,                   // Private keys
  /\.git\//i,                   // Git directory internals
  /\bid_rsa/i,                  // SSH keys
  /credentials\.json/i,         // Common cloud credentials
  /\bsecrets?\./i               // Explicit 'secret' or 'secrets' files
];

async function main() {
  try {
    // 1. Read input from stdin
    const inputBuffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      process.stdin.on('data', chunk => chunks.push(chunk));
      process.stdin.on('end', () => resolve(Buffer.concat(chunks)));
      process.stdin.on('error', reject);
    });

    const inputData = JSON.parse(inputBuffer.toString('utf-8'));
    
    // 2. Extract tool info - Support both nested and flat structures
    const data = inputData.data || inputData;
    const tool_name = data.tool_name;
    const tool_args = data.tool_args || data.tool_input;

    // 3. Analyze arguments for sensitive data
    if (tool_args) {
      const argsString = JSON.stringify(tool_args);
      
      for (const pattern of SENSITIVE_PATTERNS) {
        if (pattern.test(argsString)) {
           // 4. Block if sensitive data found
           // Using standard Gemini CLI hook response format
           console.log(JSON.stringify({
             decision: 'deny',
             reason: `Security Alert: Access to sensitive file matching pattern '${pattern}' is blocked by Neo Skills.`,
             systemMessage: '🔒 Security Alert: Sensitive data access blocked.'
           }));
           process.exit(0); // Exit code 0 is required for structured JSON response
        }
      }
    }

    // 5. Allow if no issues found
    console.log(JSON.stringify({ decision: 'allow' }));
    process.exit(0);

  } catch (error) {
    // Log error to stderr to not break JSON parsing on stdout
    console.error('Error in secret-guard hook:', error);
    process.exit(1); 
  }
}

main();
