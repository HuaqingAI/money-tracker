import { describe, expect, it, vi } from 'vitest';

import { Tab } from '../tab';
import { fireEvent, getA11yState, renderWithProvider } from '../test-utils';

const items = [
  { value: 'chat', label: '对话' },
  { value: 'insights', label: '洞察' },
];

describe('Tab', () => {
  it('renders default active tab and changes uncontrolled value', () => {
    const screen = renderWithProvider(<Tab items={items} defaultValue="chat" />);
    expect(getA11yState(screen.getByLabelText('对话')).selected).toBe(true);
    fireEvent.press(screen.getByLabelText('洞察'));
    expect(getA11yState(screen.getByLabelText('洞察')).selected).toBe(true);
  });

  it('calls controlled change and ignores disabled tab', () => {
    const onValueChange = vi.fn();
    const screen = renderWithProvider(
      <Tab items={[...items, { value: 'disabled', label: '禁用', disabled: true }]} value="chat" onValueChange={onValueChange} />,
    );
    fireEvent.press(screen.getByLabelText('洞察'));
    fireEvent.press(screen.getByLabelText('禁用'));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith('insights');
  });
});
