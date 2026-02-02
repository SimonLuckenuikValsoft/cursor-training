# Cursor Skills Configuration

Skills are reusable capabilities that Cursor can invoke to perform specific tasks. This directory contains skills that wrap repository scripts and tools.

## Available Skills

### 1. Run Tests and Summarize Failures

**Skill Name:** `run-tests`

**Description:** Executes the test suite and provides a structured summary of any failures, including suggested fixes.

**Usage in Cursor:**
```
Run the test suite and summarize any failures. Use the run-tests skill.
```

**Script:** `scripts/run_tests_and_summarize.js`

**Capabilities:**
- Runs `npm test` in the specified directory
- Parses test output to identify failures
- Groups failures by test file
- Suggests potential fixes based on error messages
- Provides a pass/fail summary

---

### 2. Generate Documentation

**Skill Name:** `generate-docs`

**Description:** Analyzes source code and generates comprehensive documentation including README, API reference, and Mermaid diagrams.

**Usage in Cursor:**
```
Generate documentation for the src/ directory. Use the generate-docs skill.
```

**Script:** `scripts/generate_docs.js`

**Capabilities:**
- Scans source files for exports and JSDoc comments
- Generates README.md with project overview
- Creates API.md with function/class documentation
- Produces Mermaid diagrams for class relationships
- Outputs to a specified docs/ directory

---

### 3. Analyze Dependencies

**Skill Name:** `analyze-deps`

**Description:** Analyzes project dependencies for security vulnerabilities, outdated packages, and unused dependencies.

**Usage in Cursor:**
```
Check for outdated or vulnerable dependencies. Use the analyze-deps skill.
```

**Script:** `scripts/analyze_dependencies.js`

**Capabilities:**
- Runs `npm audit` for security vulnerabilities
- Checks for outdated packages
- Identifies unused dependencies
- Suggests updates and removals

---

## Skill Configuration Format

Skills are configured in Cursor settings. Each skill specifies:

```json
{
  "name": "skill-name",
  "description": "What this skill does",
  "trigger": "How to invoke this skill",
  "script": "scripts/script-name.js",
  "args": ["--flag", "value"],
  "workingDirectory": "${workspaceFolder}",
  "outputFormat": "markdown"
}
```

## Creating New Skills

1. Create a script in `scripts/` that performs the task
2. Make the script output structured data (JSON or Markdown)
3. Document the skill in this file
4. Configure the skill in Cursor settings

### Script Requirements

- Scripts should be executable: `chmod +x script.js`
- Use a shebang line: `#!/usr/bin/env node`
- Accept command-line arguments for flexibility
- Output to stdout in a parseable format
- Exit with code 0 on success, non-zero on failure

### Example Script Template

```javascript
#!/usr/bin/env node

const args = process.argv.slice(2);
const targetDir = args[0] || '.';

async function main() {
  try {
    // Perform the skill's task
    const result = await doSomething(targetDir);
    
    // Output structured result
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
```

## Integration with Cursor

### Automatic Skill Detection
Cursor can automatically detect skills from this configuration by indexing the `cursor-config/skills/` directory.

### Manual Configuration
Alternatively, add skills to `.cursor/settings.json`:

```json
{
  "cursor.skills": [
    {
      "name": "run-tests",
      "script": "./cursor-config/skills/scripts/run_tests_and_summarize.js"
    }
  ]
}
```

## Best Practices

1. **Single Responsibility**: Each skill should do one thing well
2. **Idempotent**: Running a skill multiple times should be safe
3. **Informative Output**: Provide clear, actionable output
4. **Error Handling**: Gracefully handle failures with helpful messages
5. **Documentation**: Keep this file updated with all skills
