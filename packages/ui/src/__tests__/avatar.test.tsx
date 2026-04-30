import { describe, expect, it, vi } from 'vitest';

import { Avatar } from '../avatar';
import { fireEvent, renderWithProvider } from '../test-utils';

describe('Avatar', () => {
  it('renders initials with image role and label', () => {
    const screen = renderWithProvider(<Avatar name="Sue Wang" />);
    expect(screen.getByLabelText('Sue Wang的头像')).toBeTruthy();
    expect(screen.getByText('SW')).toBeTruthy();
  });

  it('supports editable interaction', () => {
    const onEditPress = vi.fn();
    const screen = renderWithProvider(<Avatar name="Sue" editable onEditPress={onEditPress} />);
    fireEvent.press(screen.getByLabelText('编辑头像'));
    expect(onEditPress).toHaveBeenCalledTimes(1);
  });

  it('shows loading overlay', () => {
    const screen = renderWithProvider(<Avatar name="Sue" loading />);
    expect(screen.getByLabelText('头像上传中')).toBeTruthy();
  });
});
