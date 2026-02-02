# Cursor Team Training

This directory contains the training materials for the Cursor hands-on workshop.

## Quick Start

1. Open the main training document: [cursor-team-training.md](./cursor-team-training.md)
2. Follow the modules in order, or jump to specific topics
3. Use the example projects in `../examples/` for hands-on exercises

## Training Structure

The training is organized into 8 modules plus a capstone exercise:

| Module | Topic | Duration |
|--------|-------|----------|
| 1 | Getting Started with Cursor | 20 min |
| 2 | Tabs and Tab Completion | 30 min |
| 3 | Operating Modes (Ask, Plan, Agent, Debug) | 45 min |
| 4 | Browser Agent | 30 min |
| 5 | Documentation and Indexing | 30 min |
| 6 | Rules, Commands, and Skills | 30 min |
| 7 | Model Context Protocol (MCP) | 30 min |
| 8 | Cloud Agents | 20 min |
| Capstone | Full integration exercise | 60 min |

**Total Duration:** 4-6 hours

## How to Run the Exercises

Each example project has its own setup instructions. General steps:

### Example 01: Tabs and Refactoring
```bash
cd ../examples/01-tabs-refactor
npm install
npm test        # Run tests
npm run build   # Build TypeScript
```

### Example 02: Debug and Browser Agent
```bash
cd ../examples/02-debug-and-browser-agent
npm install
npm run dev     # Start development server
npm run test:a11y  # Run accessibility check
```

### Example 03: Documentation and Mermaid
```bash
cd ../examples/03-agent-docs-and-mermaid
npm install
npm test        # Run tests
npm run build   # Build TypeScript
```

## Cursor Configuration

Configuration files are in `../cursor-config/`:

- **Rules:** `rules/*.mdc` - Team coding standards
- **Commands:** `commands/commands.json` - Custom slash commands
- **Skills:** `skills/` - Scripts and skill definitions
- **MCP:** `mcp/` - MCP server configuration

### Installing Configuration

```bash
# Copy rules
mkdir -p .cursor/rules
cp ../cursor-config/rules/*.mdc .cursor/rules/

# Copy commands
cp ../cursor-config/commands/commands.json .cursor/

# Copy MCP configuration
cp ../cursor-config/mcp/mcp.json .cursor/

# Install MCP server
cd ../cursor-config/mcp/mcp-server
npm install
```

After copying, restart Cursor to load the configuration.

## Prerequisites

- Cursor installed and configured
- Node.js 18+
- Git
- Basic TypeScript/JavaScript knowledge

## Getting Help

- Check the troubleshooting section in the training document
- Review the [Cursor Documentation](https://cursor.com/docs)
- Ask questions in your team's designated channel
