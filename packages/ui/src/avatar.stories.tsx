import type { Meta, StoryObj } from '@storybook/react';
import { XStack } from 'tamagui';

import { Avatar } from './avatar';

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  args: {
    name: 'Sue Wang',
  },
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <XStack gap="$3" alignItems="center">
      <Avatar name="Sue Wang" size="sm" />
      <Avatar name="Sue Wang" size="md" />
      <Avatar name="Sue Wang" size="lg" editable />
      <Avatar name="Sue Wang" size="xl" loading />
    </XStack>
  ),
};
