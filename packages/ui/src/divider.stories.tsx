import type { Meta, StoryObj } from '@storybook/react';
import { YStack } from 'tamagui';

import { Divider } from './divider';
import { Text } from './text';

const meta = {
  title: 'Components/Divider',
  component: Divider,
} satisfies Meta<typeof Divider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <YStack gap="$3">
      <Text>全宽分隔线</Text>
      <Divider />
      <Text>缩进分隔线</Text>
      <Divider variant="inset" />
    </YStack>
  ),
};
