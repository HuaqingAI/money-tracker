import type { Meta, StoryObj } from '@storybook/react';

import { TextInput } from './text-input';

const meta = {
  title: 'Components/TextInput',
  component: TextInput,
  args: {
    placeholder: '请输入金额',
  },
} satisfies Meta<typeof TextInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = {
  args: {
    value: '128.00',
  },
};
