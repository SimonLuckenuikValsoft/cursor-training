# Exercise 02: Debug Mode and Browser Agent

## Overview

This exercise teaches you to use **Cursor's Debug mode** to fix runtime bugs and the **Browser Agent** to identify and fix accessibility issues. The Task Manager app contains intentional bugs and accessibility violations.

## Learning Objectives

- Use Debug mode to identify and fix runtime errors
- Use the Browser Agent to perform accessibility audits
- Fix common accessibility issues (labels, contrast, heading hierarchy)
- Fix responsive layout bugs

## Setup

```bash
cd examples/02-debug-and-browser-agent
npm install
```

## Run the Application

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Run Accessibility Check (Static)

```bash
npm run test:a11y
```

This script performs basic static analysis. For a complete audit, use the Browser Agent.

## Intentional Issues to Find and Fix

### Bug 1: Wrong Task Gets Deleted
**Type:** Logic Bug  
**Location:** `src/App.tsx`, `deleteTask` function  
**Symptoms:** When you click delete on one task, a different task gets removed

**Exercise:** Use Debug mode to trace the issue:
```
Debug: The delete button is deleting the wrong task. Trace through the deleteTask function and identify the off-by-one error.
```

### Bug 2: Layout Breaks on Mobile
**Type:** CSS Bug  
**Location:** `src/styles.css`  
**Symptoms:** At viewport width < 600px, the form overflows horizontally

**Exercise:** Use the Browser Agent to inspect responsive behavior:
```
Use the browser to check this page at 400px width. Identify any layout overflow issues and fix them.
```

### Accessibility Issue 1: Missing Form Labels
**Type:** WCAG 2.1 Level A  
**Location:** `src/components/TaskForm.tsx`  
**Problem:** Input and select elements have no associated labels

**Exercise:**
```
Run an accessibility audit on this page. Focus on form elements that are missing labels and fix them.
```

### Accessibility Issue 2: Low Contrast Text
**Type:** WCAG 2.1 Level AA  
**Location:** `src/styles.css`  
**Problem:** Subtitle and footer text have insufficient color contrast

**Exercise:**
```
Check the color contrast ratios on this page. The subtitle and footer text appear to have low contrast. Fix them to meet WCAG AA standards (4.5:1 for normal text).
```

### Accessibility Issue 3: Heading Hierarchy
**Type:** WCAG 2.1 Level A  
**Location:** `src/App.tsx`, `src/components/TaskList.tsx`  
**Problem:** Page uses h3, h5, h6 instead of proper h1, h2, h3 sequence

**Exercise:**
```
Analyze the heading structure of this page. Fix the heading hierarchy to follow a logical sequence starting with h1.
```

### Accessibility Issue 4: Color-Only Priority Indicators
**Type:** WCAG 2.1 Level A  
**Location:** `src/components/TaskList.tsx`  
**Problem:** Priority badges convey meaning through color alone

**Exercise:**
```
The priority badges use color alone to indicate priority level. This fails WCAG. Add text labels or patterns so colorblind users can understand priority.
```

### Accessibility Issue 5: Buttons Without Accessible Names
**Type:** WCAG 2.1 Level A  
**Location:** `src/components/TaskList.tsx`  
**Problem:** Delete buttons show only "×" with no accessible name

**Exercise:**
```
The delete buttons only show × symbols. Add aria-label attributes to make them accessible to screen reader users.
```

## Using Debug Mode

1. Open the app in your browser
2. In Cursor, switch to **Debug mode**
3. Describe the bug you're seeing
4. Follow Cursor's guidance to set breakpoints and trace execution

**Example Debug Prompt:**
```
I'm clicking delete on "Review pull request" but "Write documentation" gets deleted instead. Help me debug this issue.
```

## Using Browser Agent

1. Ensure the app is running (`npm run dev`)
2. In Cursor, activate the **Browser Agent**
3. Give it a task related to the running application

**Example Browser Agent Prompts:**

```
Open http://localhost:3000 and perform an accessibility audit using axe-core or similar. Report all issues found.
```

```
Navigate to http://localhost:3000, resize to mobile width (375px), and check if the form layout is broken.
```

```
Test the delete button functionality on http://localhost:3000. Create a new task, then try to delete it. Report any bugs.
```

## Verification Checklist

After fixing all issues:

- [ ] Delete button removes the correct task
- [ ] Form layout works at 375px width
- [ ] All form elements have visible or aria labels
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Heading hierarchy is h1 → h2 → h3
- [ ] Priority indicators include text, not just color
- [ ] Delete buttons have aria-labels
- [ ] `npm run test:a11y` passes with no issues

## Success Criteria

You've completed this exercise when:
1. The accessibility check passes (`npm run test:a11y`)
2. All 5 accessibility issues are fixed
3. Both bugs (delete logic, responsive layout) are fixed
4. You can explain each fix and its accessibility impact
