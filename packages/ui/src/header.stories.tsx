import type { Meta, StoryObj } from '@storybook/react';
import { YStack } from 'tamagui';

import { Header } from './header';

const meta = {
  title: 'Components/Header',
  component: Header,
  args: {
    title: '我的',
  },
} satisfies Meta<typeof Header>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <YStack gap="$3">
      <Header variant="root" title="我的" />
      <Header variant="stack" title="设置" leftAction={{ key: 'back', label: '返回' }} scrolled />
      <Header variant="modal" title="记一笔" leftAction={{ key: 'close', label: '关闭' }} />
    </YStack>
  ),
};
