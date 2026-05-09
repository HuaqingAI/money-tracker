import { describe, expect, it } from 'vitest';

import { Skeleton } from '../skeleton';
import { renderWithProvider } from '../test-utils';

describe('Skeleton', () => {
  it('renders loading accessibility label for variants', () => {
    expect(renderWithProvider(<Skeleton variant="card" />).getByLabelText('内容加载中')).toBeTruthy();
    expect(renderWithProvider(<Skeleton variant="chart" pulsing={false} />).getByLabelText('内容加载中')).toBeTruthy();
  });
});
