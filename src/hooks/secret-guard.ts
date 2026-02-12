#!/usr/bin/env node
import { readFileSync } from 'fs';

// Define the sensitive patterns
const SENSITIVE_PATTERNS = [
  /\.env(\..+)?(["']|$)/,       // Matches .env, .env.local, .env.production
  /\.pem(["']|$)/,              // Private keys
  /\.key(["']|$)/,              // Private keys
  /\.git\//,             // Git directory internals
  /id_rsa/,              // SSH keys
  /credentials\.json/,   // Common cloud credentials
  /secrets\./            // Explicit 'secrets' files
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
    
    // 2. Extract tool info
    // Structure: { hook: "tool:before_execute", data: { tool_name: "...", tool_args: { ... } } }
    const { tool_name, tool_args } = inputData.data || {};

    // 3. Analyze arguments for sensitive data
    if (tool_args) {
      const argsString = JSON.stringify(tool_args);
      
      for (const pattern of SENSITIVE_PATTERNS) {
        if (pattern.test(argsString)) {
           // 4. Block if sensitive data found
           console.log(JSON.stringify({
             action: 'reject', // or "block" depending on specific CLI version, but usually non-success exit code or specific response is key. 
                               // For Gemini CLI hooks, often just exiting with code 2 blocks it, but returning JSON is required.
                               // We will return a message explaining why.
             message: `Security Alert: Access to sensitive file matching pattern '${pattern}' is blocked by Neo Skills.`
           }));
           process.exit(2); // Exit code 2 usually signifies a "block" or "interception" in many hook systems.
        }
      }
    }

    // 5. Allow if no issues found
    // Outputting an empty JSON object or specific "allow" action
    console.log(JSON.stringify({ action: 'continue' }));
    process.exit(0);

  } catch (error) {
    // Log error to stderr to not break JSON parsing on stdout
    console.error('Error in secret-guard hook:', error);
    // If hook fails, we usually decide to fail open or fail closed. 
    // Failing closed (exit 1) is safer for security hooks.
    process.exit(1); 
  }
}

main();
