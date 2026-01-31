#!/usr/bin/env node

/**
 * Accessibility Check Script
 * 
 * This script performs a static analysis of the React components
 * to identify common accessibility issues.
 * 
 * For a full runtime check, use the Browser Agent in Cursor.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, '..', 'src');

const issues = [];

// Patterns to check
const checks = [
  {
    name: 'Missing input labels',
    pattern: /<input[^>]*(?!.*aria-label)(?!.*id=).*>/g,
    message: 'Input element may be missing an associated label or aria-label',
  },
  {
    name: 'Missing select labels',
    pattern: /<select[^>]*(?!.*aria-label)(?!.*id=).*>/g,
    message: 'Select element may be missing an associated label or aria-label',
  },
  {
    name: 'Empty buttons',
    pattern: /<button[^>]*>\s*[×✕✖]\s*<\/button>/g,
    message: 'Button contains only a symbol - add aria-label for screen readers',
  },
  {
    name: 'Heading hierarchy',
    pattern: /<h[3-6]/g,
    message: 'Using lower-level heading - check if heading hierarchy is correct',
  },
  {
    name: 'Color-only indicators',
    pattern: /className=.*priority.*>\s*{?\/\*|<span[^>]*priority[^>]*>\s*<\/span>/g,
    message: 'Element may rely on color alone to convey meaning',
  },
];

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(srcDir, filePath);
  
  checks.forEach(check => {
    const matches = content.match(check.pattern);
    if (matches) {
      matches.forEach(match => {
        // Find line number
        const lines = content.split('\n');
        let lineNum = 0;
        let charCount = 0;
        const matchIndex = content.indexOf(match);
        
        for (let i = 0; i < lines.length; i++) {
          charCount += lines[i].length + 1;
          if (charCount > matchIndex) {
            lineNum = i + 1;
            break;
          }
        }
        
        issues.push({
          file: relativePath,
          line: lineNum,
          check: check.name,
          message: check.message,
          snippet: match.substring(0, 60) + (match.length > 60 ? '...' : ''),
        });
      });
    }
  });
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      checkFile(filePath);
    }
  });
}

console.log('🔍 Accessibility Check\n');
console.log('Scanning source files...\n');

walkDir(srcDir);

if (issues.length === 0) {
  console.log('✅ No accessibility issues detected!\n');
  process.exit(0);
} else {
  console.log(`⚠️  Found ${issues.length} potential accessibility issues:\n`);
  
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. [${issue.check}]`);
    console.log(`   File: ${issue.file}:${issue.line}`);
    console.log(`   Issue: ${issue.message}`);
    console.log(`   Code: ${issue.snippet}`);
    console.log('');
  });
  
  console.log('Run the Browser Agent in Cursor for a comprehensive accessibility audit.');
  console.log('');
  
  // Exit with error code to indicate issues found
  process.exit(1);
}
