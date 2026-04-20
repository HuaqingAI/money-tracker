import { Button as TamaguiButton, styled } from 'tamagui';

/**
 * Primary Button
 *
 * 对齐 `_bmad-output/D-Design-System/components/button.md` 规格：
 * - 高度：height-button-primary（48pt）
 * - 圆角：radius-lg（12）
 * - 底色：brand500；pressed: brand700 + scale(0.97)；disabled: brand500 + opacity 0.5
 * - 文本：text-button 16pt / 600，前景 surfacePrimary（白）
 *
 * 设计说明：Tamagui v2 RC41 下 `Button` 的类型签名仅含 Stack 属性，
 * 文本样式（color/fontSize/fontWeight）必须通过 `Button.Text` 子组件设置。
 * 这里采用 `styled(Button)` 定义 frame 样式，`styled(Button.Text)` 定义文本样式，
 * 并用 `styleable` 包一层将 string children 自动包进 `ButtonText`，
 * 保持 `<Button>文本</Button>` 的简单调用 API。
 * 后续 variant（secondary / ghost / fab）在组件库 Story 扩展。
 */
const ButtonFrame = styled(TamaguiButton, {
  name: 'Button',
  height: '$heightButtonPrimary',
  borderRadius: '$lg',
  paddingHorizontal: '$4',
  backgroundColor: '$brand500',
  pressStyle: {
    backgroundColor: '$brand700',
    scale: 0.97,
  },
  disabledStyle: {
    backgroundColor: '$brand500',
    opacity: 0.5,
  },
});

const ButtonText = styled(TamaguiButton.Text, {
  name: 'ButtonText',
  color: '$surfacePrimary',
  fontSize: '$6',
  fontWeight: '600',
});

export const Button = ButtonFrame.styleable((props, ref) => {
  const { children, ...rest } = props;
  return (
    <ButtonFrame ref={ref} {...rest}>
      {typeof children === 'string' ? <ButtonText>{children}</ButtonText> : children}
    </ButtonFrame>
  );
});

Button.displayName = 'Button';
