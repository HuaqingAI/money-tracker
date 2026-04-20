import type { ReactNode } from 'react';
import { TamaguiProvider } from 'tamagui';

import { config } from '../tamagui.config';

export interface UIProviderProps {
  children: ReactNode;
  defaultTheme?: 'light' | 'dark';
}

/**
 * UI 包的统一 Provider。应用入口（apps/mobile 的 `_layout.tsx`）
 * 必须在路由根部套一层 `<UIProvider>`，以注入 Tamagui 配置。
 *
 * dark mode 的真实 theme 值将在后续 Story 填充；当前 `defaultTheme="light"`。
 */
export function UIProvider({
  children,
  defaultTheme = 'light',
}: UIProviderProps) {
  return (
    <TamaguiProvider config={config} defaultTheme={defaultTheme}>
      {children}
    </TamaguiProvider>
  );
}
