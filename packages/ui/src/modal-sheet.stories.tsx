import type { Meta, StoryObj } from '@storybook/react';

import { ModalSheet } from './modal-sheet';
import { Text } from './text';

const meta = {
  title: 'Components/ModalSheet',
  component: ModalSheet,
  args: {
    open: true,
    variant: 'sheet',
    title: '服务协议与隐私保护',
    children: <Text>这里展示面板内容。</Text>,
  },
} satisfies Meta<typeof ModalSheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Alert: Story = {
  args: {
    variant: 'alert',
    title: '放弃记录？',
    description: '离开后当前输入不会保存。',
    confirmAction: { label: '确认' },
    cancelAction: { label: '取消' },
  },
};
