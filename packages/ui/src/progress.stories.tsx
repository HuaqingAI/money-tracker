import type { Meta, StoryObj } from '@storybook/react';
import { YStack } from 'tamagui';

import { Progress } from './progress';

const meta = {
  title: 'Components/Progress',
  component: Progress,
  args: {
    value: 62,
    label: '导入进度',
  },
} satisfies Meta<typeof Progress>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <YStack gap="$4">
      <Progress variant="dots" value={1} label="第 2 页，共 3 页" />
      <Progress variant="bar" value={62} label="导入进度" />
      <Progress variant="counter" value={12} max={30} total={30} label="正在识别" />
      <Progress variant="circular" value={82} label="AI 覆盖率" />
      <Progress variant="inline" value={96} label="AI 已覆盖交易" />
    </YStack>
  ),
};
