```markdown
# money-tracker Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns and workflows used in the `money-tracker` TypeScript codebase. You'll learn the project's coding conventions, how to add or update UI components, how to implement or modify API endpoints and shared schemas, and how to write and organize tests. The repository follows conventional commit messages and maintains a modular, well-tested structure for both frontend and backend code.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `moneyTracker.ts`, `userProfile.test.tsx`

### Import Style
- Use **relative imports** within packages.
  - Example:
    ```typescript
    import { formatCurrency } from './utils/formatCurrency';
    ```

### Export Style
- **Mixed**: Both named and default exports are used.
  - Named export example:
    ```typescript
    export function calculateBalance() { ... }
    ```
  - Default export example:
    ```typescript
    export default MoneyTracker;
    ```

### Commit Messages
- Use **conventional commit** format.
  - Prefixes: `fix`, `feat`
  - Example: `feat: add currency selector to settings page`

## Workflows

### Add or Update UI Component
**Trigger:** When you want to add or update a UI component in the design system package.  
**Command:** `/new-ui-component`

1. **Create or update the component implementation file**  
   - Path: `packages/ui/src/[component].tsx`
   - Example:
     ```tsx
     // packages/ui/src/Button.tsx
     export function Button(props) { ... }
     ```

2. **Create or update a Storybook story for the component**  
   - Path: `packages/ui/src/[component].stories.tsx`
   - Example:
     ```tsx
     // packages/ui/src/Button.stories.tsx
     import { Button } from './Button';
     export default { title: 'Button', component: Button };
     ```

3. **Create or update a test file for the component**  
   - Path: `packages/ui/src/__tests__/[component].test.tsx`
   - Example:
     ```tsx
     // packages/ui/src/__tests__/Button.test.tsx
     import { render } from '@testing-library/react';
     import { Button } from '../Button';
     test('renders button', () => { ... });
     ```

4. **Export the component in the index file**  
   - Path: `packages/ui/src/index.ts`
   - Example:
     ```typescript
     export * from './Button';
     ```

### API or Shared Schema Change
**Trigger:** When you want to add or update an API endpoint or shared schema/type.  
**Command:** `/new-api-endpoint`

1. **Create or update the API route implementation and test files**  
   - Path: `apps/api/app/api/[feature]/[endpoint]/route.ts`
   - Test: `apps/api/app/api/[feature]/[endpoint]/route.test.ts`

2. **Update or add service files and their tests**  
   - Path: `apps/api/lib/[feature]/[service].ts`
   - Test: `apps/api/lib/[feature]/[service].test.ts`

3. **Update or add shared schema and type definitions**  
   - Schemas: `packages/shared/schemas/[schema].ts`
   - Types: `packages/shared/types/[type].ts`
   - Schema tests: `packages/shared/schemas/[schema].test.ts`

4. **Add a new migration if the database structure changes**  
   - Path: `supabase/migrations/[timestamp]_[description].sql`

5. **Update scripts or configs as needed**  
   - Example: `supabase/scripts/gen-types.mjs`

## Testing Patterns

- **Framework:** [vitest](https://vitest.dev/)
- **Test file pattern:** `*.test.tsx`
- **Test organization:**  
  - UI component tests are in `packages/ui/src/__tests__/`
  - API/service tests are in their respective `__tests__` directories or alongside the implementation.
- **Example test:**
  ```tsx
  // packages/ui/src/__tests__/Input.test.tsx
  import { render } from '@testing-library/react';
  import { Input } from '../Input';
  test('renders input', () => {
    const { getByPlaceholderText } = render(<Input placeholder="Amount" />);
    expect(getByPlaceholderText('Amount')).toBeInTheDocument();
  });
  ```

## Commands

| Command             | Purpose                                             |
|---------------------|-----------------------------------------------------|
| /new-ui-component   | Scaffold a new or updated UI component workflow     |
| /new-api-endpoint   | Scaffold a new or updated API/schema workflow       |
```
