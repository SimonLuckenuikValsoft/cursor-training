# Cursor Training MCP Server

A minimal Model Context Protocol (MCP) server that provides tools for the Cursor training exercises.

## Overview

This MCP server demonstrates how to extend Cursor's capabilities with custom tools. It provides:

- **listRepoFiles**: Explore the repository structure
- **readTrainingSection**: Read specific sections from the training document
- **lookupComponentGuidelines**: Get coding guidelines for component types
- **getExerciseHint**: Get hints for training exercises

## Installation

```bash
cd cursor-config/mcp/mcp-server
npm install
```

## Running the Server

The server runs as a stdio-based MCP server and is launched by Cursor when configured:

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

## Configuration in Cursor

### Method 1: Project Configuration

Create or update `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "training-tools": {
      "command": "node",
      "args": ["./cursor-config/mcp/mcp-server/index.js"]
    }
  }
}
```

### Method 2: User Configuration

Add to your Cursor settings:

**macOS:** `~/Library/Application Support/Cursor/User/settings.json`
**Linux:** `~/.config/Cursor/User/settings.json`

```json
{
  "cursor.mcp.servers": {
    "training-tools": {
      "command": "node",
      "args": ["/path/to/cursor-config/mcp/mcp-server/index.js"]
    }
  }
}
```

## Available Tools

### listRepoFiles

List files in a directory of the repository.

**Parameters:**
- `directory` (string, optional): Path relative to workspace root
- `pattern` (string, optional): File extension filter (e.g., ".ts")

**Example usage in Cursor:**
```
Use the listRepoFiles tool to show me all TypeScript files in examples/01-tabs-refactor/src
```

### readTrainingSection

Read a specific section from the training document.

**Parameters:**
- `section` (string, required): Section name (e.g., "Module 1", "tabs", "agent")

**Example usage in Cursor:**
```
Use readTrainingSection to get the content about browser agent
```

### lookupComponentGuidelines

Get coding guidelines for a specific component type.

**Parameters:**
- `componentType` (string, required): One of "react-component", "api-handler", "test", "service-class"

**Example usage in Cursor:**
```
Use lookupComponentGuidelines to get best practices for writing React components
```

### getExerciseHint

Get a hint for a training exercise without the full solution.

**Parameters:**
- `exerciseNumber` (number, required): Exercise 1, 2, or 3
- `hintLevel` (number, optional): 1=subtle, 2=moderate, 3=direct

**Example usage in Cursor:**
```
I'm stuck on exercise 2. Use getExerciseHint with exerciseNumber 2 and hintLevel 2
```

## How MCP Works

MCP (Model Context Protocol) is a standard for extending AI assistants with external tools and resources.

### Architecture

```
┌─────────────┐     stdio     ┌─────────────┐
│   Cursor    │ ◄───────────► │ MCP Server  │
│  (Client)   │               │  (Node.js)  │
└─────────────┘               └─────────────┘
```

### Communication Flow

1. Cursor launches the MCP server as a subprocess
2. Server advertises available tools via `ListTools`
3. Cursor sends `CallTool` requests when tools are needed
4. Server executes the tool and returns results
5. Cursor incorporates results into its responses

### Creating New Tools

To add a new tool:

1. Add the tool definition to the `TOOLS` array:

```javascript
{
  name: 'myNewTool',
  description: 'What this tool does',
  inputSchema: {
    type: 'object',
    properties: {
      param1: { type: 'string', description: 'Parameter description' },
    },
    required: ['param1'],
  },
}
```

2. Implement the tool function:

```javascript
function myNewTool(param1) {
  // Tool logic here
  return { result: 'data' };
}
```

3. Add the case to the switch statement in the request handler:

```javascript
case 'myNewTool':
  result = myNewTool(args?.param1);
  break;
```

## Troubleshooting

### Server not starting
- Ensure `@modelcontextprotocol/sdk` is installed
- Check that Node.js version is 18+
- Verify the path in mcp.json is correct

### Tools not appearing in Cursor
- Restart Cursor after configuration changes
- Check Cursor's Output panel for MCP errors
- Verify the server starts without errors: `npm start`

### Tool execution fails
- Check the server's stderr output for errors
- Verify tool parameters match the schema
- Test the tool function directly in Node.js

## Further Reading

- [Cursor MCP Documentation](https://cursor.com/docs/context/mcp)
- [MCP Specification](https://modelcontextprotocol.io)
- [Building MCP Servers](https://modelcontextprotocol.io/docs/servers)
