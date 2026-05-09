import { describe, expect, it } from 'vitest';

import { renderWithProvider } from '../test-utils';
import { Tooltip } from '../tooltip';

describe('Tooltip', () => {
  it('renders visible info and chart tips', () => {
    expect(renderWithProvider(<Tooltip visible content="功能说明" />).getByText('功能说明')).toBeTruthy();
    expect(renderWithProvider(<Tooltip variant="chart-tip" visible content="餐饮 ¥3,280" />).getByText('餐饮 ¥3,280')).toBeTruthy();
  });

  it('hides content when not visible', () => {
    expect(renderWithProvider(<Tooltip content="隐藏" />).queryByText('隐藏')).toBeNull();
  });
});
