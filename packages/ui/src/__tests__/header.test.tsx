import { describe, expect, it, vi } from 'vitest';

import { Header } from '../header';
import { fireEvent, renderWithProvider } from '../test-utils';

describe('Header', () => {
  it('renders root and stack titles', () => {
    expect(renderWithProvider(<Header title="我的" />).getByText('我的')).toBeTruthy();
    expect(renderWithProvider(<Header variant="stack" title="设置" />).getByText('设置')).toBeTruthy();
  });

  it('fires header action press', () => {
    const onPress = vi.fn();
    const screen = renderWithProvider(
      <Header title="设置" leftAction={{ key: 'back', label: '返回', onPress }} />,
    );
    fireEvent.press(screen.getByLabelText('返回'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
