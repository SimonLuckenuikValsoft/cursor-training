#!/usr/bin/env node

/**
 * Cursor Training MCP Server
 * 
 * A minimal Model Context Protocol (MCP) server that provides tools
 * for the Cursor training exercises.
 * 
 * Tools provided:
 * - listRepoFiles: List files in the repository
 * - readTrainingSection: Read a specific section from the training document
 * - lookupComponentGuidelines: Get coding guidelines for a component type
 * - getExerciseHint: Get hints for training exercises
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get workspace root (3 levels up from mcp-server)
const workspaceRoot = path.resolve(__dirname, '..', '..', '..');

// Create MCP server
const server = new Server(
  {
    name: 'cursor-training-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
const TOOLS = [
  {
    name: 'listRepoFiles',
    description: 'List files in a directory of the repository. Useful for exploring the codebase structure.',
    inputSchema: {
      type: 'object',
      properties: {
        directory: {
          type: 'string',
          description: 'The directory path relative to workspace root (e.g., "examples/01-tabs-refactor/src")',
          default: '.',
        },
        pattern: {
          type: 'string',
          description: 'Optional file extension filter (e.g., ".ts", ".tsx")',
        },
      },
      required: [],
    },
  },
  {
    name: 'readTrainingSection',
    description: 'Read a specific section from the Cursor training document. Sections are identified by module name.',
    inputSchema: {
      type: 'object',
      properties: {
        section: {
          type: 'string',
          description: 'The section to read (e.g., "Module 1", "tabs", "agent", "browser", "mcp", "rules")',
        },
      },
      required: ['section'],
    },
  },
  {
    name: 'lookupComponentGuidelines',
    description: 'Get coding guidelines and best practices for a specific component type.',
    inputSchema: {
      type: 'object',
      properties: {
        componentType: {
          type: 'string',
          description: 'The type of component (e.g., "react-component", "api-handler", "test", "service-class")',
        },
      },
      required: ['componentType'],
    },
  },
  {
    name: 'getExerciseHint',
    description: 'Get a hint for a specific training exercise without giving away the full solution.',
    inputSchema: {
      type: 'object',
      properties: {
        exerciseNumber: {
          type: 'number',
          description: 'The exercise number (1, 2, or 3)',
        },
        hintLevel: {
          type: 'number',
          description: 'Hint level 1-3 (1=subtle, 2=moderate, 3=direct)',
          default: 1,
        },
      },
      required: ['exerciseNumber'],
    },
  },
];

// Component guidelines data
const COMPONENT_GUIDELINES = {
  'react-component': {
    title: 'React Component Guidelines',
    practices: [
      'Use functional components with hooks',
      'Implement proper TypeScript typing for props',
      'Add accessibility attributes (aria-label, role, etc.)',
      'Use semantic HTML elements',
      'Implement error boundaries for error handling',
      'Memoize expensive computations with useMemo',
      'Use useCallback for event handlers passed to children',
    ],
    example: `
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  label, 
  onClick, 
  disabled = false 
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
    >
      {label}
    </button>
  );
};`,
  },
  'api-handler': {
    title: 'API Handler Guidelines',
    practices: [
      'Validate all input parameters',
      'Use proper HTTP status codes',
      'Implement rate limiting',
      'Log requests and responses (excluding sensitive data)',
      'Handle errors gracefully with descriptive messages',
      'Use async/await consistently',
      'Implement request timeouts',
    ],
    example: `
export async function handleRequest(req: Request): Promise<Response> {
  try {
    const body = await validateInput(req.body);
    const result = await processRequest(body);
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    logger.error('Request failed', { error });
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 });
  }
}`,
  },
  'test': {
    title: 'Test Writing Guidelines',
    practices: [
      'Follow Arrange-Act-Assert pattern',
      'Use descriptive test names that explain the expected behavior',
      'Test one behavior per test',
      'Mock external dependencies',
      'Include edge cases and error scenarios',
      'Keep tests independent of each other',
      'Avoid testing implementation details',
    ],
    example: `
describe('UserService', () => {
  it('should return user when valid ID is provided', async () => {
    // Arrange
    const mockRepo = { findById: jest.fn().mockResolvedValue({ id: '1', name: 'Test' }) };
    const service = new UserService(mockRepo);
    
    // Act
    const result = await service.getUser('1');
    
    // Assert
    expect(result).toEqual({ id: '1', name: 'Test' });
    expect(mockRepo.findById).toHaveBeenCalledWith('1');
  });
});`,
  },
  'service-class': {
    title: 'Service Class Guidelines',
    practices: [
      'Use dependency injection for testability',
      'Implement interfaces for abstractions',
      'Keep methods focused on single responsibility',
      'Handle errors at appropriate levels',
      'Add JSDoc documentation for public methods',
      'Use meaningful names that reflect business domain',
      'Implement proper logging and monitoring',
    ],
    example: `
export class PaymentService {
  constructor(
    private readonly gateway: PaymentGateway,
    private readonly logger: Logger
  ) {}

  /**
   * Process a payment transaction.
   * @param amount - The payment amount in cents
   * @param customerId - The customer identifier
   * @returns Payment result with transaction ID
   * @throws PaymentError if processing fails
   */
  async processPayment(amount: number, customerId: string): Promise<PaymentResult> {
    this.logger.info('Processing payment', { amount, customerId });
    // Implementation...
  }
}`,
  },
};

// Exercise hints data
const EXERCISE_HINTS = {
  1: {
    title: 'Exercise 01: Tabs and Refactoring',
    hints: [
      'Look for repeated patterns in the validation functions. Notice how they all check for empty values, length, and format?',
      'Consider creating a generic validation function that takes a configuration object. The config could specify min/max length, required status, and a regex pattern.',
      'Create a `createValidator` factory function that returns a validation function. Use it like: `const validateName = createValidator({ required: true, minLength: 2, pattern: /^[a-zA-Z]+$/ })`',
    ],
  },
  2: {
    title: 'Exercise 02: Debug and Browser Agent',
    hints: [
      'The delete bug is in App.tsx. Pay attention to how the index is calculated in the deleteTask function.',
      'Look at line where `wrongIndex` is calculated. The `+ 1` is causing the off-by-one error. The function deletes the next task instead of the selected one.',
      'For accessibility: Form inputs need labels (use `<label htmlFor>`), buttons need aria-labels, color contrast must meet WCAG AA (4.5:1 ratio), and headings should follow h1 → h2 → h3 order.',
    ],
  },
  3: {
    title: 'Exercise 03: Documentation and Mermaid',
    hints: [
      'Start by asking Cursor to analyze the module structure. Use Agent mode for comprehensive analysis across all files.',
      'For Mermaid diagrams, ask Cursor to identify the relationships between classes first. PaymentProcessor depends on Gateway, FraudDetector, AuditLogger, and NotificationService.',
      'Generate docs in this order: 1) README with overview, 2) API.md with all exports, 3) ARCHITECTURE.md with class and sequence diagrams, 4) SECURITY.md for fraud detection details.',
    ],
  },
};

// Tool implementations
function listRepoFiles(directory, pattern) {
  const targetDir = path.join(workspaceRoot, directory || '.');
  
  if (!fs.existsSync(targetDir)) {
    return { error: `Directory not found: ${directory}` };
  }
  
  const files = [];
  
  function walkDir(dir, relativePath = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relPath = path.join(relativePath, entry.name);
      
      // Skip node_modules, .git, dist
      if (['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
        continue;
      }
      
      if (entry.isDirectory()) {
        files.push({ name: relPath + '/', type: 'directory' });
        walkDir(fullPath, relPath);
      } else {
        if (!pattern || entry.name.endsWith(pattern)) {
          files.push({ name: relPath, type: 'file' });
        }
      }
    }
  }
  
  walkDir(targetDir);
  
  return {
    directory,
    fileCount: files.filter(f => f.type === 'file').length,
    directoryCount: files.filter(f => f.type === 'directory').length,
    files: files.slice(0, 50), // Limit to 50 entries
    truncated: files.length > 50,
  };
}

function readTrainingSection(section) {
  const trainingPath = path.join(workspaceRoot, 'training', 'cursor-team-training.md');
  
  if (!fs.existsSync(trainingPath)) {
    return { error: 'Training document not found. It may not have been generated yet.' };
  }
  
  const content = fs.readFileSync(trainingPath, 'utf-8');
  
  // Search for section headers
  const sectionLower = section.toLowerCase();
  const lines = content.split('\n');
  let inSection = false;
  let sectionContent = [];
  let sectionTitle = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this is a section header matching our search
    if (line.startsWith('#') && line.toLowerCase().includes(sectionLower)) {
      inSection = true;
      sectionTitle = line;
      sectionContent = [line];
      continue;
    }
    
    // If we're in a section, collect content until next same-level header
    if (inSection) {
      if (line.startsWith('# ') || (line.startsWith('## ') && sectionTitle.startsWith('## '))) {
        break; // End of section
      }
      sectionContent.push(line);
    }
  }
  
  if (sectionContent.length === 0) {
    return { 
      error: `Section "${section}" not found.`,
      availableSections: 'Try: "Module 1", "tabs", "agent", "browser", "mcp", "rules", "capstone"',
    };
  }
  
  return {
    section: sectionTitle,
    content: sectionContent.join('\n'),
    lineCount: sectionContent.length,
  };
}

function lookupComponentGuidelines(componentType) {
  const guidelines = COMPONENT_GUIDELINES[componentType.toLowerCase()];
  
  if (!guidelines) {
    return {
      error: `Unknown component type: ${componentType}`,
      availableTypes: Object.keys(COMPONENT_GUIDELINES),
    };
  }
  
  return guidelines;
}

function getExerciseHint(exerciseNumber, hintLevel = 1) {
  const exercise = EXERCISE_HINTS[exerciseNumber];
  
  if (!exercise) {
    return {
      error: `Unknown exercise number: ${exerciseNumber}`,
      availableExercises: Object.keys(EXERCISE_HINTS).map(Number),
    };
  }
  
  const level = Math.min(Math.max(1, hintLevel), 3);
  
  return {
    exercise: exercise.title,
    hintLevel: level,
    hint: exercise.hints[level - 1],
    moreHintsAvailable: level < 3,
  };
}

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    let result;
    
    switch (name) {
      case 'listRepoFiles':
        result = listRepoFiles(args?.directory, args?.pattern);
        break;
      case 'readTrainingSection':
        result = readTrainingSection(args?.section);
        break;
      case 'lookupComponentGuidelines':
        result = lookupComponentGuidelines(args?.componentType);
        break;
      case 'getExerciseHint':
        result = getExerciseHint(args?.exerciseNumber, args?.hintLevel);
        break;
      default:
        result = { error: `Unknown tool: ${name}` };
    }
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: error.message }),
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Cursor Training MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
