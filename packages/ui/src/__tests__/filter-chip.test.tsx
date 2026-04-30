import { describe, expect, it, vi } from 'vitest';

import { FilterChip } from '../filter-chip';
import { fireEvent, getA11yState, renderWithProvider } from '../test-utils';

describe('FilterChip', () => {
  it('renders selected filter with count', () => {
    const screen = renderWithProvider(<FilterChip label="餐饮" selected count={12} />);
    expect(screen.getByText('餐饮')).toBeTruthy();
    expect(screen.getByText('12')).toBeTruthy();
    expect(getA11yState(screen.getByLabelText('筛选 餐饮')).selected).toBe(true);
  });

  it('fires press and ignores disabled', () => {
    const onPress = vi.fn();
    const active = renderWithProvider(<FilterChip label="交通" onPress={onPress} />);
    fireEvent.press(active.getByLabelText('筛选 交通'));
    const disabled = renderWithProvider(<FilterChip label="禁用" disabled onPress={onPress} />);
    fireEvent.press(disabled.getByLabelText('筛选 禁用'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
