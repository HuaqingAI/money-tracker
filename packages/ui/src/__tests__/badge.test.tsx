import { describe, expect, it, vi } from 'vitest';

import { Badge } from '../badge';
import { fireEvent, getA11yState, renderWithProvider } from '../test-utils';

describe('Badge', () => {
  it('renders label and dot variants', () => {
    const screen = renderWithProvider(<Badge label="NEW" />);
    expect(screen.getByText('NEW')).toBeTruthy();
  });

  it('marks tag selected state and handles press', () => {
    const onPress = vi.fn();
    const screen = renderWithProvider(<Badge variant="tag" label="为自己" selected onPress={onPress} />);
    const tag = screen.getByLabelText('为自己');
    expect(getA11yState(tag).checked).toBe(true);
    fireEvent.press(tag);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not press disabled tag', () => {
    const onPress = vi.fn();
    const screen = renderWithProvider(<Badge variant="tag" label="禁用" disabled onPress={onPress} />);
    fireEvent.press(screen.getByLabelText('禁用'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
