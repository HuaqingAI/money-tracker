import { styled, Text as TamaguiText } from 'tamagui';

/**
 * Text 基础组件 + 设计 token 变体
 *
 * 对齐 `design-tokens.md` Font Scale：
 * - text-body（3）：14 / 400，正文
 * - text-body-medium（4）：14 / 500，列表项标题
 * - text-caption（2）：13 / 400，辅助说明
 * - text-h1（8）：20 / 700，根页面大标题
 * - text-h2（7）：17 / 600，子页面 Header
 * - text-metric（9）：36 / 700，金额大数字
 * - text-button（6）：16 / 600，按钮文字（Button 组件内部已固化）
 * - text-small（1）：12 / 400
 *
 * 其他 scale（tab / badge / tabbar）在需要的组件内就地使用 `fontSize="$5"` 等引用。
 */
export const Text = styled(TamaguiText, {
  name: 'Text',
  color: '$neutral700',
  fontSize: '$3',
  fontWeight: '400',

  variants: {
    variant: {
      body: {
        fontSize: '$3',
        fontWeight: '400',
        color: '$neutral700',
      },
      bodyMedium: {
        fontSize: '$4',
        fontWeight: '500',
        color: '$neutral700',
      },
      caption: {
        fontSize: '$2',
        fontWeight: '400',
        color: '$neutral500',
      },
      small: {
        fontSize: '$1',
        fontWeight: '400',
        color: '$neutral500',
      },
      h1: {
        fontSize: '$8',
        fontWeight: '700',
        color: '$neutral800',
      },
      h2: {
        fontSize: '$7',
        fontWeight: '600',
        color: '$neutral800',
      },
      metric: {
        fontSize: '$9',
        fontWeight: '700',
        color: '$neutral900',
      },
    },
  } as const,

  defaultVariants: {
    variant: 'body',
  },
});
