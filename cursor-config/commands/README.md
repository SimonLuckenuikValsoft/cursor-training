# Cursor Commands

This directory contains custom slash commands for use in Cursor.

## Available Commands

| Command | Description | Category |
|---------|-------------|----------|
| `/plan-change` | Create a structured plan with risk assessment before making changes | Planning |
| `/doc-update` | Generate or update documentation with Mermaid diagrams | Documentation |
| `/code-review` | Perform a structured code review with security and quality checks | Review |
| `/fix-lint` | Fix linting errors and format code according to team standards | Maintenance |
| `/explain-code` | Generate a detailed explanation of selected code | Learning |

## Installation

### Method 1: Project-level Commands
Copy `commands.json` to your project's `.cursor/` directory:

```bash
mkdir -p .cursor
cp cursor-config/commands/commands.json .cursor/commands.json
```

### Method 2: User-level Commands
Copy to your Cursor user configuration directory:

**macOS:**
```bash
cp cursor-config/commands/commands.json ~/Library/Application\ Support/Cursor/User/commands.json
```

**Linux:**
```bash
cp cursor-config/commands/commands.json ~/.config/Cursor/User/commands.json
```

**Windows:**
```powershell
Copy-Item cursor-config/commands/commands.json "$env:APPDATA\Cursor\User\commands.json"
```

## Usage

1. Open Cursor
2. In the chat or command palette, type `/` followed by the command name
3. For example: `/plan-change I want to add a new authentication system`

## Customizing Commands

Edit `commands.json` to:
- Add new commands
- Modify existing prompts
- Change command categories
- Adjust descriptions

### Command Structure

```json
{
  "name": "command-name",
  "description": "Short description shown in command palette",
  "prompt": "The full prompt template that will be sent to the AI",
  "category": "category-name"
}
```

### Best Practices for Prompts

1. **Be specific**: Include detailed instructions and expected output format
2. **Use structure**: Markdown headings and checklists improve output quality
3. **Include examples**: Show the AI what good output looks like
4. **Request verification**: Ask the AI to confirm understanding before acting
