import type { Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';
import { Button as TamaguiButton, YStack } from 'tamagui';

import { Toast, useToast } from './toast';

const meta = {
  title: 'Components/Toast',
  component: Toast,
  args: {
    id: 'story-toast',
    title: '已记录 ¥50.00 食品·生鲜',
    variant: 'success',
  },
} satisfies Meta<typeof Toast>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <YStack gap="$3" minHeight={280}>
      <Toast id="success" title="设置已保存" variant="success" />
      <Toast id="error" title="保存失败" description="请稍后重试" variant="error" />
      <Toast id="warning" title="网络不稳定" variant="warning" />
      <Toast id="info" title="已分享，有据可说" variant="info" />
    </YStack>
  ),
};

function ProviderQueueDemo() {
  const { showToast } = useToast();
  useEffect(() => {
    showToast({ id: 'story-queue-success', title: '设置已保存', variant: 'success', durationMs: 1800 });
    showToast({ id: 'story-queue-info', title: '已分享，有据可说', variant: 'info', durationMs: 1800 });
  }, [showToast]);

  return (
    <YStack minHeight={220} justifyContent="center">
      <TamaguiButton
        onPress={() =>
          showToast({
            title: '已记录 ¥50.00 食品·生鲜',
            variant: 'success',
            action: { label: '调整分类', onPress: () => undefined },
          })
        }
      >
        触发 Toast
      </TamaguiButton>
    </YStack>
  );
}

export const ProviderQueue: Story = {
  render: () => <ProviderQueueDemo />,
};
