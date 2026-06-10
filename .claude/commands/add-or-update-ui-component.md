---
name: add-or-update-ui-component
description: Workflow command scaffold for add-or-update-ui-component in money-tracker.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-or-update-ui-component

Use this workflow when working on **add-or-update-ui-component** in `money-tracker`.

## Goal

Implements or updates a UI component in the design system, including its story, test, and index export.

## Common Files

- `packages/ui/src/[component].tsx`
- `packages/ui/src/[component].stories.tsx`
- `packages/ui/src/__tests__/[component].test.tsx`
- `packages/ui/src/index.ts`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update the component implementation file in packages/ui/src/
- Create or update a corresponding .stories.tsx file for Storybook in packages/ui/src/
- Create or update a corresponding test file in packages/ui/src/__tests__/
- Update packages/ui/src/index.ts to export the component

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.