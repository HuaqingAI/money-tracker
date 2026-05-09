import { describe, expect, it } from 'vitest';

import { Divider } from '../divider';
import { renderWithProvider } from '../test-utils';

describe('Divider', () => {
  it('renders full and inset separators with labels', () => {
    expect(renderWithProvider(<Divider />).getByLabelText('分隔线')).toBeTruthy();
    expect(renderWithProvider(<Divider variant="inset" accessibilityLabel="缩进分隔线" />).getByLabelText('缩进分隔线')).toBeTruthy();
  });
});
