import { describe, expect, it, vi } from 'vitest';

import { SearchBar } from '../search-bar';
import { act, fireEvent, renderWithProvider, waitFor } from '../test-utils';

describe('SearchBar', () => {
  it('changes text and debounces callback', async () => {
    const onChangeText = vi.fn();
    const onDebouncedChange = vi.fn();
    const screen = renderWithProvider(
      <SearchBar onChangeText={onChangeText} onDebouncedChange={onDebouncedChange} debounceMs={1} />,
    );
    fireEvent.changeText(screen.getByLabelText('搜索输入'), '咖啡');
    expect(onChangeText).toHaveBeenCalledWith('咖啡');
    await waitFor(() => expect(onDebouncedChange).toHaveBeenCalledWith('咖啡'));
  });

  it('clears filled input and renders empty result', () => {
    const onClear = vi.fn();
    const screen = renderWithProvider(<SearchBar defaultValue="咖啡" emptyResult onClear={onClear} />);
    fireEvent.press(screen.getByLabelText('清空搜索'));
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(screen.getByText('没有找到相关结果')).toBeTruthy();
  });

  it('cancels pending debounce when cleared', () => {
    vi.useFakeTimers();
    const onDebouncedChange = vi.fn();
    const screen = renderWithProvider(<SearchBar onDebouncedChange={onDebouncedChange} />);

    fireEvent.changeText(screen.getByLabelText('搜索输入'), '咖啡');
    fireEvent.press(screen.getByLabelText('清空搜索'));
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onDebouncedChange).toHaveBeenCalledTimes(1);
    expect(onDebouncedChange).toHaveBeenCalledWith('');
    act(() => {
      screen.renderer.unmount();
    });
    vi.useRealTimers();
  });
});
