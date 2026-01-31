# Cursor Team Training Repository

A comprehensive hands-on training package for software teams adopting Cursor as their AI-powered development environment.

## Overview

This repository contains everything needed to train a software team on Cursor:

- **Training Document:** Complete module-based curriculum
- **Example Projects:** Hands-on exercises with intentional bugs
- **Configuration Files:** Rules, commands, skills, and MCP server

## Repository Structure

```
├── training/
│   ├── cursor-team-training.md     # Main training document (start here)
│   └── README.md                   # Training quick start
│
├── examples/
│   ├── 01-tabs-refactor/           # Tab completion and refactoring exercise
│   │   ├── src/                    # TypeScript module with code duplication
│   │   └── tests/                  # Test suite
│   │
│   ├── 02-debug-and-browser-agent/ # Debug mode and accessibility exercise
│   │   ├── src/                    # React app with intentional bugs
│   │   └── scripts/                # Accessibility check script
│   │
│   └── 03-agent-docs-and-mermaid/  # Documentation generation exercise
│       ├── src/                    # Multi-module payment service
│       └── docs/                   # Target for generated documentation
│
└── cursor-config/
    ├── rules/                      # Team coding standards (.mdc files)
    ├── commands/                   # Custom slash commands
    ├── skills/                     # Skill definitions and scripts
    └── mcp/                        # MCP server for training tools
```

## Quick Start

### 1. Clone and Open

```bash
git clone <repository-url>
cd cursor-training
cursor .
```

### 2. Start Training

Open `training/cursor-team-training.md` and follow Module 1.

### 3. Run Example Projects

Each example has its own setup:

```bash
# Example 01: Tabs and Refactoring
cd examples/01-tabs-refactor
npm install && npm test

# Example 02: Debug and Browser Agent
cd examples/02-debug-and-browser-agent
npm install && npm run dev

# Example 03: Documentation and Mermaid
cd examples/03-agent-docs-and-mermaid
npm install && npm test
```

### 4. Install Cursor Configuration

```bash
# Create .cursor directory
mkdir -p .cursor/rules

# Copy configuration
cp cursor-config/rules/*.mdc .cursor/rules/
cp cursor-config/commands/commands.json .cursor/
cp cursor-config/mcp/mcp.json .cursor/

# Install MCP server
cd cursor-config/mcp/mcp-server
npm install
```

Restart Cursor to load the configuration.

## Training Modules

| Module | Topics | Time |
|--------|--------|------|
| **1. Getting Started** | Installation, core concepts, first interaction | 20 min |
| **2. Tab Completion** | Inline suggestions, refactoring with tabs | 30 min |
| **3. Operating Modes** | Ask, Plan, Agent, Debug modes | 45 min |
| **4. Browser Agent** | Accessibility audits, visual debugging | 30 min |
| **5. Documentation** | README generation, Mermaid diagrams, indexing | 30 min |
| **6. Rules & Commands** | Team standards, custom slash commands, skills | 30 min |
| **7. MCP** | Model Context Protocol, custom tools | 30 min |
| **8. Cloud Agents** | Background tasks, safe operations | 20 min |
| **Capstone** | Full integration exercise | 60 min |

**Total:** 4-6 hours

## Cursor Concepts Covered

- **Tabs:** Intelligent code completion and suggestions
- **Modes:** Ask, Plan, Agent, Debug for different tasks
- **Browser Agent:** UI testing and accessibility audits
- **Indexing:** Documentation and codebase context
- **Rules:** Project-specific AI behavior guidelines
- **Commands:** Reusable prompt templates
- **Skills:** Script-powered capabilities
- **MCP:** External tool integration
- **Cloud Agents:** Background task execution

## Example Project Details

### 01-tabs-refactor
A TypeScript module with intentional code duplication. Learners use tab completion to:
- Identify duplication patterns
- Create generic abstractions
- Refactor while maintaining tests

**Defect:** Repeated validation logic that can be consolidated.

### 02-debug-and-browser-agent
A React task manager with bugs and accessibility issues:
- Off-by-one error in delete function
- Missing form labels
- Low contrast text
- Broken heading hierarchy
- Responsive layout issues

**Defects:** Logic bug, accessibility violations, CSS issues.

### 03-agent-docs-and-mermaid
A payment processing service with multiple modules but no documentation:
- PaymentProcessor core logic
- Gateway implementations (Stripe, PayPal)
- Fraud detection
- Audit logging
- Notifications

**Target:** Generate README, API docs, and Mermaid diagrams.

## Configuration Files

### Rules (`cursor-config/rules/`)
- `00-team-baseline.mdc` - General coding standards
- `10-tests-first.mdc` - TDD practices
- `20-security-sensitive.mdc` - Security code handling

### Commands (`cursor-config/commands/`)
- `/plan-change` - Structured change planning
- `/doc-update` - Documentation generation
- `/code-review` - Comprehensive code review
- `/fix-lint` - Lint error resolution
- `/explain-code` - Code explanation

### Skills (`cursor-config/skills/`)
- `run_tests_and_summarize.js` - Test runner with failure analysis
- `generate_docs.js` - Documentation generator
- `analyze_dependencies.js` - Dependency checker

### MCP (`cursor-config/mcp/`)
- `mcp-server/` - Training MCP server with tools:
  - `listRepoFiles` - File listing
  - `readTrainingSection` - Training content access
  - `lookupComponentGuidelines` - Coding guidelines
  - `getExerciseHint` - Exercise hints

## Prerequisites

- **Cursor:** Download from [cursor.com](https://cursor.com)
- **Node.js:** Version 18 or later
- **Git:** For version control
- **Knowledge:** Basic TypeScript/JavaScript

## Links to Official Documentation

- [Cursor Features](https://cursor.com/features)
- [Quickstart Guide](https://cursor.com/docs/get-started/quickstart)
- [Operating Modes](https://cursor.com/docs/agent/modes)
- [Browser Integration](https://cursor.com/docs/agent/browser)
- [Rules Documentation](https://cursor.com/docs/context/rules)
- [MCP Documentation](https://cursor.com/docs/context/mcp)
- [Cloud Agents](https://cursor.com/docs/cloud-agent)
- [Best Practices Blog](https://cursor.com/blog/agent-best-practices)

## License

This training material is provided for educational purposes.
