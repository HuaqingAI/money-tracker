import type { Meta, StoryObj } from '@storybook/react';
import { YStack } from 'tamagui';

import { Chart, type ChartDatum } from './chart';

const data: ChartDatum[] = [
  { key: 'dining', label: '餐饮', value: 3280, category: 'dining' },
  { key: 'shopping', label: '购物', value: 2150, category: 'shopping' },
  { key: 'transport', label: '交通', value: 760, category: 'transport' },
];

const meta = {
  title: 'Components/Chart',
  component: Chart,
  args: {
    variant: 'bar',
    title: '消费分布',
    data,
  },
} satisfies Meta<typeof Chart>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <YStack gap="$3">
      <Chart variant="donut" title="环形图" data={data} />
      <Chart variant="line" title="趋势图" data={data} />
      <Chart variant="radar" title="雷达图" data={data} />
      <Chart variant="bar" title="柱状图" data={data} />
    </YStack>
  ),
};

export const Loading: Story = {
  args: {
    state: 'loading',
    title: '加载中',
  },
};

export const Empty: Story = {
  args: {
    data: [],
    state: 'empty',
    title: '空状态',
  },
};

export const Error: Story = {
  args: {
    state: 'error',
    title: '错误状态',
  },
};
