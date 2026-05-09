import { describe, expect, it, vi } from 'vitest';

import { Progress } from '../progress';
import { getA11yValue, renderWithProvider } from '../test-utils';

describe('Progress', () => {
  it('renders progressbar accessibility value', () => {
    const screen = renderWithProvider(<Progress value={42} label="导入进度" />);
    expect(getA11yValue(screen.getByLabelText('导入进度')).now).toBe(42);
  });

  it('renders counter and stalled message', () => {
    const screen = renderWithProvider(<Progress variant="counter" value={2} total={3} max={3} label="正在识别" />);
    expect(screen.getByText('正在识别 2/3')).toBeTruthy();
    expect(renderWithProvider(<Progress state="stalled" value={2} />).getByText('处理中，请稍候')).toBeTruthy();
  });

  it('calls onComplete when complete state reaches max', () => {
    const onComplete = vi.fn();
    renderWithProvider(<Progress value={100} state="complete" onComplete={onComplete} />);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
