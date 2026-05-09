import type { Meta, StoryObj } from '@storybook/react';
import { YStack } from 'tamagui';

import { Tab } from './tab';

const items = [
  { value: 'wechat', label: '微信' },
  { value: 'phone', label: '手机号' },
];

const meta = {
  title: 'Components/Tab',
  component: Tab,
  args: {
    items,
    defaultValue: 'wechat',
  },
} satisfies Meta<typeof Tab>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <YStack gap="$3">
      <Tab items={items} defaultValue="wechat" />
      <Tab variant="mode" items={[{ value: 'voice', label: '语音' }, { value: 'form', label: '表单' }, { value: 'shot', label: '截图' }]} defaultValue="form" />
    </YStack>
  ),
};
