#!/usr/bin/env node

/**
 * Generate Documentation
 * 
 * This skill script analyzes source code and generates documentation
 * including README, API reference, and Mermaid diagrams.
 * 
 * Usage: node generate_docs.js [source-directory] [output-directory]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = process.argv[2] || './src';
const outputDir = process.argv[3] || './docs';

// Ensure output directory exists
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Get all TypeScript/JavaScript files recursively
function getSourceFiles(dir, files = []) {
  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (!['node_modules', 'dist', 'build', '.git'].includes(entry.name)) {
        getSourceFiles(fullPath, files);
      }
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name) && !entry.name.includes('.test.') && !entry.name.includes('.spec.')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Parse a source file for exports and JSDoc comments
function parseFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(sourceDir, filePath);
  
  const exports = [];
  const classes = [];
  const functions = [];
  const interfaces = [];

  // Find exported classes
  const classRegex = /\/\*\*[\s\S]*?\*\/\s*export\s+class\s+(\w+)/g;
  let match;
  while ((match = classRegex.exec(content)) !== null) {
    const jsdocMatch = content.slice(0, match.index).match(/\/\*\*([\s\S]*?)\*\/\s*$/);
    classes.push({
      name: match[1],
      jsdoc: jsdocMatch ? jsdocMatch[1].trim() : '',
      file: relativePath,
    });
  }

  // Find exported interfaces
  const interfaceRegex = /export\s+interface\s+(\w+)/g;
  while ((match = interfaceRegex.exec(content)) !== null) {
    interfaces.push({
      name: match[1],
      file: relativePath,
    });
  }

  // Find exported functions
  const functionRegex = /\/\*\*[\s\S]*?\*\/\s*export\s+(?:async\s+)?function\s+(\w+)/g;
  while ((match = functionRegex.exec(content)) !== null) {
    const jsdocMatch = content.slice(0, match.index).match(/\/\*\*([\s\S]*?)\*\/\s*$/);
    functions.push({
      name: match[1],
      jsdoc: jsdocMatch ? jsdocMatch[1].trim() : '',
      file: relativePath,
    });
  }

  return { classes, functions, interfaces, file: relativePath };
}

// Generate class diagram in Mermaid format
function generateClassDiagram(allClasses) {
  let diagram = '```mermaid\nclassDiagram\n';
  
  for (const cls of allClasses) {
    diagram += `    class ${cls.name} {\n`;
    diagram += `    }\n`;
  }
  
  // Try to infer relationships from file structure
  const modules = new Map();
  for (const cls of allClasses) {
    const dir = path.dirname(cls.file);
    if (!modules.has(dir)) {
      modules.set(dir, []);
    }
    modules.get(dir).push(cls.name);
  }
  
  // Add note about modules
  diagram += '\n';
  for (const [module, classes] of modules) {
    if (classes.length > 1) {
      diagram += `    note for ${classes[0]} "${module}"\n`;
    }
  }
  
  diagram += '```';
  return diagram;
}

// Generate README content
function generateReadme(projectName, classes, functions, interfaces) {
  let readme = `# ${projectName}\n\n`;
  readme += `## Overview\n\n`;
  readme += `This project contains ${classes.length} classes, ${functions.length} functions, and ${interfaces.length} interfaces.\n\n`;
  
  readme += `## Installation\n\n`;
  readme += '```bash\nnpm install\n```\n\n';
  
  readme += `## Quick Start\n\n`;
  readme += '```typescript\nimport { /* exports */ } from \'./src\';\n```\n\n';
  
  readme += `## Modules\n\n`;
  
  const modules = new Set();
  for (const cls of classes) {
    modules.add(path.dirname(cls.file));
  }
  
  for (const module of modules) {
    if (module === '.') continue;
    readme += `- **${module}**: `;
    const moduleClasses = classes.filter(c => path.dirname(c.file) === module);
    readme += moduleClasses.map(c => c.name).join(', ');
    readme += '\n';
  }
  
  readme += `\n## API Reference\n\n`;
  readme += `See [API.md](./API.md) for detailed API documentation.\n\n`;
  
  readme += `## Architecture\n\n`;
  readme += `See [ARCHITECTURE.md](./ARCHITECTURE.md) for system architecture and diagrams.\n`;
  
  return readme;
}

// Generate API documentation
function generateApiDocs(classes, functions, interfaces) {
  let api = `# API Reference\n\n`;
  
  if (interfaces.length > 0) {
    api += `## Interfaces\n\n`;
    for (const iface of interfaces) {
      api += `### ${iface.name}\n\n`;
      api += `**File:** \`${iface.file}\`\n\n`;
    }
  }
  
  if (classes.length > 0) {
    api += `## Classes\n\n`;
    for (const cls of classes) {
      api += `### ${cls.name}\n\n`;
      api += `**File:** \`${cls.file}\`\n\n`;
      if (cls.jsdoc) {
        // Clean up JSDoc
        const cleanJsdoc = cls.jsdoc
          .replace(/\n\s*\*/g, '\n')
          .replace(/^\s*\*\s*/gm, '')
          .trim();
        api += `${cleanJsdoc}\n\n`;
      }
    }
  }
  
  if (functions.length > 0) {
    api += `## Functions\n\n`;
    for (const func of functions) {
      api += `### ${func.name}\n\n`;
      api += `**File:** \`${func.file}\`\n\n`;
      if (func.jsdoc) {
        const cleanJsdoc = func.jsdoc
          .replace(/\n\s*\*/g, '\n')
          .replace(/^\s*\*\s*/gm, '')
          .trim();
        api += `${cleanJsdoc}\n\n`;
      }
    }
  }
  
  return api;
}

// Generate architecture documentation with diagrams
function generateArchitectureDocs(classes, projectName) {
  let arch = `# Architecture\n\n`;
  arch += `## System Overview\n\n`;
  arch += `${projectName} is organized into the following components:\n\n`;
  
  // Group by directory
  const modules = new Map();
  for (const cls of classes) {
    const dir = path.dirname(cls.file) || 'root';
    if (!modules.has(dir)) {
      modules.set(dir, []);
    }
    modules.get(dir).push(cls);
  }
  
  for (const [module, moduleClasses] of modules) {
    arch += `### ${module === '.' ? 'Core' : module}\n\n`;
    for (const cls of moduleClasses) {
      arch += `- **${cls.name}**\n`;
    }
    arch += '\n';
  }
  
  arch += `## Class Diagram\n\n`;
  arch += generateClassDiagram(classes);
  arch += '\n\n';
  
  arch += `## Data Flow\n\n`;
  arch += '```mermaid\nflowchart LR\n';
  arch += '    Input --> Processing --> Output\n';
  arch += '```\n\n';
  
  arch += `## Sequence Diagram (Generic Flow)\n\n`;
  arch += '```mermaid\nsequenceDiagram\n';
  arch += '    participant Client\n';
  arch += '    participant Service\n';
  arch += '    participant Storage\n';
  arch += '    Client->>Service: Request\n';
  arch += '    Service->>Storage: Query\n';
  arch += '    Storage-->>Service: Data\n';
  arch += '    Service-->>Client: Response\n';
  arch += '```\n';
  
  return arch;
}

async function main() {
  console.log('# Documentation Generation\n');
  console.log(`**Source Directory:** ${path.resolve(sourceDir)}`);
  console.log(`**Output Directory:** ${path.resolve(outputDir)}\n`);

  // Ensure source directory exists
  if (!fs.existsSync(sourceDir)) {
    console.error(`Error: Source directory "${sourceDir}" does not exist.`);
    process.exit(1);
  }

  ensureDir(outputDir);

  // Get all source files
  const files = getSourceFiles(sourceDir);
  console.log(`Found ${files.length} source files.\n`);

  // Parse all files
  const allClasses = [];
  const allFunctions = [];
  const allInterfaces = [];

  for (const file of files) {
    const parsed = parseFile(file);
    allClasses.push(...parsed.classes);
    allFunctions.push(...parsed.functions);
    allInterfaces.push(...parsed.interfaces);
  }

  console.log(`Discovered:`);
  console.log(`- ${allClasses.length} classes`);
  console.log(`- ${allFunctions.length} functions`);
  console.log(`- ${allInterfaces.length} interfaces\n`);

  // Get project name from package.json if available
  let projectName = path.basename(process.cwd());
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    projectName = packageJson.name || projectName;
  }

  // Generate documentation files
  const readme = generateReadme(projectName, allClasses, allFunctions, allInterfaces);
  const api = generateApiDocs(allClasses, allFunctions, allInterfaces);
  const architecture = generateArchitectureDocs(allClasses, projectName);

  // Write files
  fs.writeFileSync(path.join(outputDir, 'README.md'), readme);
  fs.writeFileSync(path.join(outputDir, 'API.md'), api);
  fs.writeFileSync(path.join(outputDir, 'ARCHITECTURE.md'), architecture);

  console.log('Generated files:');
  console.log(`- ${path.join(outputDir, 'README.md')}`);
  console.log(`- ${path.join(outputDir, 'API.md')}`);
  console.log(`- ${path.join(outputDir, 'ARCHITECTURE.md')}`);
  console.log('\n✅ Documentation generation complete!');
}

main().catch((error) => {
  console.error('Script error:', error.message);
  process.exit(1);
});
