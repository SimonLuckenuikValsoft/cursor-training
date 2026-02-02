#!/usr/bin/env node

/**
 * Run Tests and Summarize Failures
 * 
 * This skill script runs the test suite and provides a structured summary
 * of any failures with suggested fixes.
 * 
 * Usage: node run_tests_and_summarize.js [target-directory]
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDir = process.argv[2] || process.cwd();

function runTests(directory) {
  return new Promise((resolve) => {
    const testProcess = spawn('npm', ['test', '--', '--json'], {
      cwd: directory,
      shell: true,
      env: { ...process.env, CI: 'true' },
    });

    let stdout = '';
    let stderr = '';

    testProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    testProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    testProcess.on('close', (code) => {
      resolve({
        exitCode: code,
        stdout,
        stderr,
      });
    });
  });
}

function parseTestOutput(output) {
  const lines = output.split('\n');
  const failures = [];
  const passes = [];
  let currentTest = null;

  for (const line of lines) {
    // Jest-style output parsing
    if (line.includes('✓') || line.includes('PASS')) {
      const match = line.match(/✓\s+(.+?)(?:\s+\(\d+\s*ms\))?$/);
      if (match) {
        passes.push(match[1].trim());
      }
    } else if (line.includes('✕') || line.includes('FAIL')) {
      const match = line.match(/✕\s+(.+?)(?:\s+\(\d+\s*ms\))?$/);
      if (match) {
        currentTest = { name: match[1].trim(), error: '' };
      }
    } else if (line.includes('Expected') || line.includes('Received') || line.includes('Error:')) {
      if (currentTest) {
        currentTest.error += line + '\n';
      }
    } else if (line.includes('at ') && currentTest) {
      // Stack trace line
      currentTest.stackTrace = (currentTest.stackTrace || '') + line + '\n';
    }

    // Check if we've finished collecting error info
    if (currentTest && (line.trim() === '' || line.includes('●'))) {
      if (currentTest.error) {
        failures.push(currentTest);
      }
      currentTest = null;
    }
  }

  // Don't forget the last test
  if (currentTest && currentTest.error) {
    failures.push(currentTest);
  }

  return { failures, passes };
}

function suggestFix(failure) {
  const error = failure.error.toLowerCase();
  
  if (error.includes('expected') && error.includes('received')) {
    return 'Assertion mismatch: Compare the expected and received values. Check if the implementation matches the specification.';
  }
  if (error.includes('undefined') || error.includes('is not a function')) {
    return 'Missing or undefined function/property: Check imports, ensure the function exists, and verify the object structure.';
  }
  if (error.includes('timeout')) {
    return 'Test timeout: The async operation took too long. Check for missing await, unresolved promises, or infinite loops.';
  }
  if (error.includes('not found') || error.includes('cannot find')) {
    return 'Resource not found: Verify file paths, mock setup, and that required resources exist.';
  }
  if (error.includes('type error') || error.includes('typeerror')) {
    return 'Type error: Check that values are the expected types and that operations are valid for those types.';
  }
  
  return 'Review the error message and stack trace to identify the issue.';
}

function formatSummary(parsed, exitCode) {
  const { failures, passes } = parsed;
  const total = failures.length + passes.length;
  
  let summary = `# Test Results Summary\n\n`;
  summary += `**Status:** ${exitCode === 0 ? '✅ PASSED' : '❌ FAILED'}\n`;
  summary += `**Total Tests:** ${total}\n`;
  summary += `**Passed:** ${passes.length}\n`;
  summary += `**Failed:** ${failures.length}\n\n`;

  if (failures.length > 0) {
    summary += `## Failed Tests\n\n`;
    
    failures.forEach((failure, index) => {
      summary += `### ${index + 1}. ${failure.name}\n\n`;
      summary += `**Error:**\n\`\`\`\n${failure.error.trim()}\n\`\`\`\n\n`;
      summary += `**Suggested Fix:** ${suggestFix(failure)}\n\n`;
      if (failure.stackTrace) {
        summary += `<details>\n<summary>Stack Trace</summary>\n\n\`\`\`\n${failure.stackTrace.trim()}\n\`\`\`\n</details>\n\n`;
      }
    });
  }

  if (passes.length > 0 && passes.length <= 20) {
    summary += `## Passed Tests\n\n`;
    passes.forEach((test) => {
      summary += `- ✓ ${test}\n`;
    });
  } else if (passes.length > 20) {
    summary += `## Passed Tests\n\n`;
    summary += `${passes.length} tests passed. Showing first 10:\n\n`;
    passes.slice(0, 10).forEach((test) => {
      summary += `- ✓ ${test}\n`;
    });
    summary += `\n... and ${passes.length - 10} more.\n`;
  }

  return summary;
}

async function main() {
  console.log(`# Running Tests\n`);
  console.log(`**Directory:** ${path.resolve(targetDir)}\n`);
  console.log(`Running npm test...\n`);

  const result = await runTests(targetDir);
  
  // Combine stdout and stderr for parsing
  const fullOutput = result.stdout + '\n' + result.stderr;
  
  // Parse the output
  const parsed = parseTestOutput(fullOutput);
  
  // Generate summary
  const summary = formatSummary(parsed, result.exitCode);
  
  console.log(summary);

  // Output raw output in a collapsible section
  console.log(`\n<details>\n<summary>Raw Test Output</summary>\n\n\`\`\`\n${fullOutput}\n\`\`\`\n</details>\n`);

  process.exit(result.exitCode);
}

main().catch((error) => {
  console.error('Script error:', error.message);
  process.exit(1);
});
