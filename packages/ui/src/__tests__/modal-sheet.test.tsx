import { describe, expect, it } from 'vitest';

import { ModalSheet } from '../modal-sheet';
import { renderWithProvider } from '../test-utils';
import { Text } from '../text';

describe('ModalSheet', () => {
  it('renders alert content when open', () => {
    const screen = renderWithProvider(
      <ModalSheet testMode open variant="alert" title="放弃记录？" description="离开后当前输入不会保存。" />,
    );
    expect(screen.getByText('放弃记录？')).toBeTruthy();
  });

  it('renders sheet content when open', () => {
    const screen = renderWithProvider(
      <ModalSheet testMode open variant="sheet" title="选择分类">
        <Text>餐饮</Text>
      </ModalSheet>,
    );
    expect(screen.getByText('选择分类')).toBeTruthy();
  });

  it('exposes dialog semantics in the deterministic test path', () => {
    const screen = renderWithProvider(<ModalSheet testMode open variant="picker" title="选择分类" />);
    expect(screen.getByLabelText('选择分类')).toBeTruthy();
  });
});
