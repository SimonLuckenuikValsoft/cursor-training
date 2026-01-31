#!/usr/bin/env node

/**
 * Analyze Dependencies
 * 
 * This skill script analyzes project dependencies for:
 * - Security vulnerabilities (via npm audit)
 * - Outdated packages
 * - Potentially unused dependencies
 * 
 * Usage: node analyze_dependencies.js [target-directory]
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDir = process.argv[2] || process.cwd();

function runCommand(command, args, cwd) {
  return new Promise((resolve) => {
    const proc = spawn(command, args, {
      cwd,
      shell: true,
      env: process.env,
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      resolve({ exitCode: code, stdout, stderr });
    });
  });
}

async function runAudit(dir) {
  console.log('## Security Audit\n');
  
  const result = await runCommand('npm', ['audit', '--json'], dir);
  
  try {
    const audit = JSON.parse(result.stdout);
    
    if (audit.metadata) {
      const { vulnerabilities } = audit.metadata;
      const total = Object.values(vulnerabilities).reduce((a, b) => a + b, 0);
      
      if (total === 0) {
        console.log('✅ No vulnerabilities found.\n');
      } else {
        console.log(`⚠️ Found ${total} vulnerabilities:\n`);
        console.log(`| Severity | Count |`);
        console.log(`|----------|-------|`);
        for (const [severity, count] of Object.entries(vulnerabilities)) {
          if (count > 0) {
            console.log(`| ${severity} | ${count} |`);
          }
        }
        console.log('');
        console.log('Run `npm audit fix` to auto-fix where possible.\n');
      }
    }
  } catch (e) {
    // npm audit might not return valid JSON in all cases
    if (result.stdout.includes('found 0 vulnerabilities')) {
      console.log('✅ No vulnerabilities found.\n');
    } else {
      console.log('Could not parse audit results. Raw output:\n');
      console.log('```');
      console.log(result.stdout || result.stderr);
      console.log('```\n');
    }
  }
}

async function checkOutdated(dir) {
  console.log('## Outdated Packages\n');
  
  const result = await runCommand('npm', ['outdated', '--json'], dir);
  
  try {
    const outdated = JSON.parse(result.stdout || '{}');
    const packages = Object.entries(outdated);
    
    if (packages.length === 0) {
      console.log('✅ All packages are up to date.\n');
    } else {
      console.log(`Found ${packages.length} outdated packages:\n`);
      console.log('| Package | Current | Wanted | Latest |');
      console.log('|---------|---------|--------|--------|');
      
      for (const [name, info] of packages) {
        console.log(`| ${name} | ${info.current || 'N/A'} | ${info.wanted || 'N/A'} | ${info.latest || 'N/A'} |`);
      }
      console.log('');
      console.log('Run `npm update` to update to wanted versions.\n');
    }
  } catch (e) {
    if (result.stdout.trim() === '') {
      console.log('✅ All packages are up to date.\n');
    } else {
      console.log('Could not parse outdated results.\n');
    }
  }
}

async function findUnusedDependencies(dir) {
  console.log('## Potentially Unused Dependencies\n');
  
  const packageJsonPath = path.join(dir, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.log('No package.json found.\n');
    return;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const dependencies = Object.keys(packageJson.dependencies || {});
  
  if (dependencies.length === 0) {
    console.log('No dependencies to check.\n');
    return;
  }
  
  // Get all source files
  const srcDir = path.join(dir, 'src');
  if (!fs.existsSync(srcDir)) {
    console.log('No src/ directory found. Skipping unused dependency check.\n');
    return;
  }
  
  function getAllFiles(directory, files = []) {
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory() && !entry.name.includes('node_modules')) {
        getAllFiles(fullPath, files);
      } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
    return files;
  }
  
  const files = getAllFiles(srcDir);
  let allContent = '';
  for (const file of files) {
    allContent += fs.readFileSync(file, 'utf-8') + '\n';
  }
  
  const potentiallyUnused = [];
  
  for (const dep of dependencies) {
    // Check if the dependency is imported anywhere
    const importPatterns = [
      `from ['"]${dep}['"]`,
      `from ['"]${dep}/`,
      `require\\(['"]${dep}['"]\\)`,
      `require\\(['"]${dep}/`,
    ];
    
    const isUsed = importPatterns.some(pattern => 
      new RegExp(pattern).test(allContent)
    );
    
    if (!isUsed) {
      potentiallyUnused.push(dep);
    }
  }
  
  if (potentiallyUnused.length === 0) {
    console.log('✅ All dependencies appear to be in use.\n');
  } else {
    console.log(`Found ${potentiallyUnused.length} potentially unused dependencies:\n`);
    for (const dep of potentiallyUnused) {
      console.log(`- ${dep}`);
    }
    console.log('\n**Note:** This is a simple static analysis. Some dependencies may be used dynamically or in configuration files.\n');
    console.log('Verify before removing: `npm uninstall <package>`\n');
  }
}

async function main() {
  console.log('# Dependency Analysis\n');
  console.log(`**Directory:** ${path.resolve(targetDir)}\n`);
  
  // Check if package.json exists
  const packageJsonPath = path.join(targetDir, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.error('Error: No package.json found in target directory.');
    process.exit(1);
  }
  
  await runAudit(targetDir);
  await checkOutdated(targetDir);
  await findUnusedDependencies(targetDir);
  
  console.log('---\n');
  console.log('✅ Dependency analysis complete.');
}

main().catch((error) => {
  console.error('Script error:', error.message);
  process.exit(1);
});
