import type { Meta, StoryObj } from '@storybook/react';

import { UIProvider } from './provider';
import { Text } from './text';

const meta = {
  title: 'Components/UIProvider',
  component: Text,
} satisfies Meta<typeof UIProvider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <UIProvider>
      <Text>Provider 已加载 Tamagui theme 与 Toast 单例。</Text>
    </UIProvider>
  ),
};
