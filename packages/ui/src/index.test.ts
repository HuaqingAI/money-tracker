import { describe, expect, it } from 'vitest';

import * as uiExports from './index';

describe('@money-tracker/ui public exports', () => {
  it('exposes the documented public API from the barrel file', () => {
    expect(uiExports.UIProvider).toBeTypeOf('function');
    expect(uiExports.Button).toBeDefined();
    expect(uiExports.Text).toBeDefined();
    expect(uiExports.TextInput).toBeDefined();
    expect(uiExports.config).toBeDefined();
    expect(uiExports.shadows).toMatchObject({
      xs: expect.any(Object),
      sm: expect.any(Object),
      md: expect.any(Object),
      lg: expect.any(Object),
    });
  });
});
