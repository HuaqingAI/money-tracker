---
name: api-or-shared-schema-change
description: Workflow command scaffold for api-or-shared-schema-change in money-tracker.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /api-or-shared-schema-change

Use this workflow when working on **api-or-shared-schema-change** in `money-tracker`.

## Goal

Adds or updates API endpoints and their associated shared schemas, types, and migrations.

## Common Files

- `apps/api/app/api/*/*/route.ts`
- `apps/api/app/api/*/*/route.test.ts`
- `apps/api/lib/*/*.ts`
- `apps/api/lib/*/*.test.ts`
- `packages/shared/schemas/*.ts`
- `packages/shared/schemas/*.test.ts`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update API route implementation and test files in apps/api/app/api/[feature]/[endpoint]/
- Update or add service files and their tests in apps/api/lib/[feature]/
- Update or add shared schema and type definitions in packages/shared/schemas/ and packages/shared/types/
- If database structure changes, add a new migration in supabase/migrations/
- Update scripts or configs as needed (e.g., supabase/scripts/gen-types.mjs)

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.