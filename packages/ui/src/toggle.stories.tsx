import type { Meta, StoryObj } from '@storybook/react';
import { XStack } from 'tamagui';

import { Toggle } from './toggle';

const meta = {
  title: 'Components/Toggle',
  component: Toggle,
  args: {
    checked: true,
    label: '洞察推送',
  },
} satisfies Meta<typeof Toggle>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <XStack gap="$4">
      <Toggle checked label="开启" />
      <Toggle checked={false} label="关闭" />
      <Toggle variant="tristate" value="system" label="深色模式" />
      <Toggle disabled label="禁用" />
    </XStack>
  ),
};
