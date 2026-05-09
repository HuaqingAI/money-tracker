import { describe, expect, it, vi } from 'vitest';

import { BottomTabBar } from '../bottom-tab-bar';
import { fireEvent, getA11yState, renderWithProvider } from '../test-utils';

const items = [
  { key: 'dashboard', label: '首页' },
  { key: 'report', label: '报表' },
  { key: 'my-hub', label: '我的', badge: true },
];

describe('BottomTabBar', () => {
  it('renders arbitrary tab items and active state', () => {
    const screen = renderWithProvider(<BottomTabBar items={items} activeKey="report" />);
    expect(screen.getByLabelText('底部导航')).toBeTruthy();
    expect(getA11yState(screen.getByLabelText('报表')).selected).toBe(true);
  });

  it('fires tab press and ignores disabled tabs', () => {
    const onTabPress = vi.fn();
    const screen = renderWithProvider(
      <BottomTabBar
        items={[...items, { key: 'disabled', label: '禁用', disabled: true }]}
        activeKey="dashboard"
        onTabPress={onTabPress}
      />,
    );
    fireEvent.press(screen.getByLabelText('报表'));
    fireEvent.press(screen.getByLabelText('禁用'));
    expect(onTabPress).toHaveBeenCalledTimes(1);
    expect(onTabPress).toHaveBeenCalledWith('report', items[1]);
  });

  it('renders string badges without NaN fallback', () => {
    const screen = renderWithProvider(
      <BottomTabBar items={[{ key: 'ai', label: 'AI', badge: 'NEW' }]} activeKey="ai" />,
    );
    expect(screen.getByText('NEW')).toBeTruthy();
    expect(screen.queryByText('NaN')).toBeNull();
  });
});
