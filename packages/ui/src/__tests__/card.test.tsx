import { describe, expect, it, vi } from 'vitest';

import { Card } from '../card';
import { fireEvent, renderWithProvider } from '../test-utils';

describe('Card', () => {
  it('renders metric content', () => {
    const screen = renderWithProvider(<Card variant="metric" title="月度支出" value="¥3,280" />);
    expect(screen.getByText('月度支出')).toBeTruthy();
    expect(screen.getByText('¥3,280')).toBeTruthy();
  });

  it('supports pressable accessibility and interaction', () => {
    const onPress = vi.fn();
    const screen = renderWithProvider(<Card title="交易" pressable onPress={onPress} />);
    fireEvent.press(screen.getByLabelText('交易'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not trigger disabled interaction', () => {
    const onPress = vi.fn();
    const screen = renderWithProvider(<Card title="锁定" disabled onPress={onPress} />);
    fireEvent.press(screen.getByLabelText('锁定'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('does not trigger disabled child actions', () => {
    const onAction = vi.fn();
    const onDismiss = vi.fn();
    const screen = renderWithProvider(
      <Card title="锁定" disabled action={{ label: '查看', onPress: onAction }} dismissAction={{ label: '关闭', onPress: onDismiss }} />,
    );
    fireEvent.press(screen.getByLabelText('查看'));
    fireEvent.press(screen.getByLabelText('关闭'));
    expect(onAction).not.toHaveBeenCalled();
    expect(onDismiss).not.toHaveBeenCalled();
  });
});
