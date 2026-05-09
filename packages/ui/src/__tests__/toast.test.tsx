import { useEffect } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { act, fireEvent, renderWithProvider } from '../test-utils';
import { Toast, useToast } from '../toast';

function QueueDemo() {
  const { showToast } = useToast();
  useEffect(() => {
    showToast({ id: 'first', title: '第一条', durationMs: 100 });
    showToast({ id: 'second', title: '第二条', durationMs: 100 });
  }, [showToast]);
  return null;
}

describe('Toast', () => {
  it('renders variants and dismiss action', () => {
    const onDismiss = vi.fn();
    const screen = renderWithProvider(<Toast id="t1" title="设置已保存" variant="success" onDismiss={onDismiss} />);
    expect(screen.getByText('设置已保存')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('关闭提示'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders optional action', () => {
    const onPress = vi.fn();
    const screen = renderWithProvider(
      <Toast id="t2" title="已记录" action={{ label: '调整分类', onPress }} />,
    );
    fireEvent.press(screen.getByLabelText('调整分类'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows queued provider messages one at a time', () => {
    vi.useFakeTimers();
    const screen = renderWithProvider(<QueueDemo />);
    expect(screen.getByText('第一条')).toBeTruthy();
    expect(screen.queryByText('第二条')).toBeNull();

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(screen.getByText('第二条')).toBeTruthy();
    act(() => {
      screen.renderer.unmount();
    });
    vi.useRealTimers();
  });
});
