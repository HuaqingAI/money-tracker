import { describe, expect, it, vi } from 'vitest';

import { categoryColorTokens, Chart, type ChartDatum } from '../chart';
import { fireEvent, renderWithProvider } from '../test-utils';

const data: ChartDatum[] = [
  { key: 'dining', label: '餐饮', value: 32, category: 'dining' },
  { key: 'shopping', label: '购物', value: 25, category: 'shopping' },
];

describe('Chart', () => {
  it('renders accessible fallback summary', () => {
    const screen = renderWithProvider(<Chart variant="bar" data={data} summary="4月消费分布" />);
    expect(screen.getByLabelText('4月消费分布')).toBeTruthy();
    expect(screen.getByText('餐饮')).toBeTruthy();
  });

  it('handles datum press', () => {
    const onDatumPress = vi.fn();
    const screen = renderWithProvider(<Chart variant="donut" data={data} onDatumPress={onDatumPress} />);
    fireEvent.press(screen.getByLabelText('餐饮 32'));
    expect(onDatumPress).toHaveBeenCalledWith(data[0]);
  });

  it('calculates donut percentages from total', () => {
    const screen = renderWithProvider(<Chart variant="donut" data={data} />);
    expect(screen.getByText('56%')).toBeTruthy();
    expect(screen.queryByText('100%')).toBeNull();
  });

  it('renders line, radar, loading, empty, and error states', () => {
    expect(renderWithProvider(<Chart variant="line" data={data} />).getByText('餐饮')).toBeTruthy();
    expect(renderWithProvider(<Chart variant="radar" data={data} />).getByText('购物')).toBeTruthy();
    expect(renderWithProvider(<Chart variant="bar" data={data} state="loading" />).getByLabelText('图表加载中')).toBeTruthy();
    expect(renderWithProvider(<Chart variant="bar" data={[]} state="empty" />).getByText('暂无数据')).toBeTruthy();
    expect(renderWithProvider(<Chart variant="bar" data={data} state="error" />).getByText('图表加载失败')).toBeTruthy();
  });

  it('exports typed category color mapping', () => {
    expect(categoryColorTokens.dining).toBe('$catDining');
  });
});
