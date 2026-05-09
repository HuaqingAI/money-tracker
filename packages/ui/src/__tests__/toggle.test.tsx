import { describe, expect, it, vi } from 'vitest';

import { fireEvent, renderWithProvider } from '../test-utils';
import { Toggle } from '../toggle';

describe('Toggle', () => {
  it('fires standard checked change', () => {
    const onCheckedChange = vi.fn();
    const screen = renderWithProvider(<Toggle checked={false} label="洞察推送" onCheckedChange={onCheckedChange} />);
    fireEvent.press(screen.getByLabelText('洞察推送'));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('cycles tristate and ignores disabled', () => {
    const onValueChange = vi.fn();
    const screen = renderWithProvider(<Toggle variant="tristate" value="on" label="深色模式" onValueChange={onValueChange} />);
    fireEvent.press(screen.getByLabelText('深色模式'));
    expect(onValueChange).toHaveBeenCalledWith('system');

    const disabled = renderWithProvider(<Toggle disabled label="禁用" onValueChange={onValueChange} />);
    fireEvent.press(disabled.getByLabelText('禁用'));
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });
});
