import { Input as TamaguiInput, styled } from 'tamagui';

/**
 * TextInput 基础组件
 *
 * 对齐 `design-tokens.md` / `components/text-input.md`：
 * - 高度：height-input（48pt）
 * - 圆角：radius-lg（12）
 * - 底色：surfacePrimary（白）；填充态底色：neutral100
 * - 边框：neutral200（默认）；focus: brand500
 * - Placeholder: neutral400
 * - 文本：text-body 14 / 400，颜色 neutral700
 */
export const TextInput = styled(TamaguiInput, {
  name: 'TextInput',
  height: '$heightInput',
  borderRadius: '$lg',
  borderWidth: 1,
  borderColor: '$neutral200',
  backgroundColor: '$surfacePrimary',
  paddingHorizontal: '$4',
  color: '$neutral700',
  placeholderTextColor: '$neutral400',
  fontSize: '$3',
  focusStyle: {
    borderColor: '$brand500',
  },
});
