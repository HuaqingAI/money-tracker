import type { Meta, StoryObj } from '@storybook/react';

import { BottomTabBar } from './bottom-tab-bar';

const items = [
  { key: 'dashboard', label: '首页', icon: '⌂' },
  { key: 'report', label: '报表', icon: '◇' },
  { key: 'ai', label: 'AI', icon: '✦', badge: true },
  { key: 'my-hub', label: '我的', icon: '○' },
];

const meta = {
  title: 'Components/BottomTabBar',
  component: BottomTabBar,
  args: {
    items,
    activeKey: 'dashboard',
  },
} satisfies Meta<typeof BottomTabBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ThreeTabAdaptation: Story = {
  args: {
    items: items.filter((item) => item.key !== 'ai'),
    activeKey: 'report',
  },
};

export const DisabledAndBadges: Story = {
  args: {
    items: [
      { key: 'dashboard', label: '首页', icon: '⌂' },
      { key: 'report', label: '报表', icon: '◇', badge: 3 },
      { key: 'ai', label: 'AI', icon: '✦', badge: 'NEW' },
      { key: 'my-hub', label: '我的', icon: '○', disabled: true },
    ],
    activeKey: 'ai',
  },
};
