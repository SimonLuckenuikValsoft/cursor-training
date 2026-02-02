# Exercise 01: Tabs and Refactoring

## Overview

This exercise teaches you to use **Cursor's tab completion** to identify and refactor duplicated code patterns. The `userService.ts` file contains intentional code duplication that you'll clean up using Cursor's AI-assisted suggestions.

## Learning Objectives

- Use Cursor's tab completion to accept intelligent code suggestions
- Identify code duplication patterns with AI assistance
- Refactor repetitive code into reusable abstractions
- Maintain test coverage during refactoring

## Setup

```bash
cd examples/01-tabs-refactor
npm install
```

## Run Tests (Before Refactoring)

```bash
npm test
```

All tests should pass. This baseline ensures your refactoring doesn't break existing functionality.

## Intentional Duplication Targets

Open `src/userService.ts` and look for these patterns:

### Target 1: Validation Functions (Lines 26-67)
Three validation functions (`validateUserName`, `validateUserEmail`, `validateUserRole`) share a common pattern:
- Check if value is empty
- Check length constraints
- Check format with regex
- Return `{ valid: boolean; error?: string }`

**Refactor Goal**: Create a generic `validate()` function or validation factory.

### Target 2: CRUD Error Handling (Lines 70-160)
All CRUD operations follow the same pattern:
- Try/catch wrapper
- Return `{ success: boolean; data?: T; error?: string }`
- Similar error messages

**Refactor Goal**: Create a `withErrorHandling()` wrapper or Result type utility.

### Target 3: Formatting Functions (Lines 163-200)
Three formatting functions share structure:
- Build an array of lines
- Add header/separator
- Add user fields
- Add footer
- Join with newlines

**Refactor Goal**: Create a `formatUser()` factory that accepts a format template.

## Exercise Steps

### Step 1: Open in Cursor
Open the `src/userService.ts` file in Cursor.

### Step 2: Use Tab Completion
1. Position your cursor at the end of the `validateUserRole` function
2. Start typing a new function: `function createValidator(`
3. Watch for Cursor's tab completion suggestions
4. Press **Tab** to accept suggestions that help create a generic validator

### Step 3: Refactor with AI Assistance
Use these prompts in Cursor:

**Prompt 1 - Identify duplication:**
```
Analyze this file and identify all duplicated code patterns. List each pattern with line numbers.
```

**Prompt 2 - Refactor validation:**
```
Create a generic validation factory that eliminates the duplication in validateUserName, validateUserEmail, and validateUserRole. Keep the existing functions as wrappers for backward compatibility.
```

**Prompt 3 - Refactor error handling:**
```
Create a Result type and a withErrorHandling utility function to reduce the try/catch boilerplate in the CRUD operations.
```

### Step 4: Verify Tests Still Pass
```bash
npm test
```

### Step 5: Build the Project
```bash
npm run build
```

## Verification Checklist

- [ ] All original tests pass
- [ ] Code duplication is reduced by at least 30%
- [ ] New abstractions are well-typed
- [ ] Build completes without errors
- [ ] Original function signatures are preserved (backward compatible)

## Common Issues

### Tab Completion Not Appearing
- Ensure Cursor is properly connected to the AI backend
- Try pressing `Ctrl+Space` to trigger suggestions manually
- Check that the file is saved

### Tests Failing After Refactor
- Run individual test files to isolate failures
- Check that you preserved the original function signatures
- Ensure async/await is handled correctly if you introduced promises

## Success Criteria

You've completed this exercise when:
1. Tests pass with `npm test`
2. You've refactored at least 2 of the 3 duplication targets
3. You can explain the abstractions you created
