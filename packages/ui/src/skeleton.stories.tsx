import type { Meta, StoryObj } from '@storybook/react';
import { YStack } from 'tamagui';

import { Skeleton } from './skeleton';

const meta = {
  title: 'Components/Skeleton',
  component: Skeleton,
} satisfies Meta<typeof Skeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <YStack gap="$4">
      <Skeleton variant="card" />
      <Skeleton variant="list-item" />
      <Skeleton variant="chart" pulsing={false} />
      <Skeleton variant="text" lines={4} />
    </YStack>
  ),
};
