/**
 * Tamagui 主配置
 *
 * Source of Truth: _bmad-output/D-Design-System/design-tokens.md
 * Mapping Spec:    packages/ui/token-mapping.md
 * Tamagui version: 2.0.0-rc.41
 *
 * 约束：
 * - 所有数值必须来自设计 Token，禁止硬编码近似值
 * - Dark mode 占位（与 light 同值），后续 Story 填充真实 dark 色
 * - 不引入字体文件；fonts.*.family 仅声明系统 fallback
 */

import { createAnimations } from '@tamagui/animations-react-native';
import { createFont, createTamagui, createTokens } from 'tamagui';

// ---------- Fonts ----------

const latinStack =
  "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const cjkStack =
  "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif";
const defaultFamily = `${latinStack}, ${cjkStack}`;
const monoFamily = "'Fira Code', 'SF Mono', monospace";

// Design-token → numeric scale（详见 token-mapping.md §5.2）
const bodySize = {
  1: 12, // text-small
  2: 13, // text-caption
  3: 14, // text-body
  4: 14, // text-body-medium
  5: 15, // text-tab
  6: 16, // text-button
  7: 17, // text-h2
  8: 20, // text-h1
  9: 36, // text-metric
  10: 11, // text-badge
  11: 10, // text-tabbar
} as const;

// leading-normal = 1.5；leading-tight = 1.2（用于 h1/h2/metric）
const tightIdx = new Set<number>([7, 8, 9]);
const bodyLineHeight = Object.fromEntries(
  Object.entries(bodySize).map(([k, v]) => {
    const n = Number(k);
    const mult = tightIdx.has(n) ? 1.2 : 1.5;
    return [n, Math.round(v * mult)];
  }),
) as Record<keyof typeof bodySize, number>;

const bodyWeight = {
  1: '400',
  2: '400',
  3: '400',
  4: '500',
  5: '600',
  6: '600',
  7: '600',
  8: '700',
  9: '700',
  10: '700',
  11: '500',
} as const;

const bodyLetterSpacing = Object.fromEntries(
  Object.keys(bodySize).map((k) => [Number(k), 0]),
) as Record<keyof typeof bodySize, number>;

const bodyFont = createFont({
  family: defaultFamily,
  size: bodySize,
  lineHeight: bodyLineHeight,
  weight: bodyWeight,
  letterSpacing: bodyLetterSpacing,
});

const headingFont = createFont({
  family: defaultFamily,
  size: bodySize,
  lineHeight: bodyLineHeight,
  weight: {
    1: '600',
    2: '600',
    3: '600',
    4: '600',
    5: '600',
    6: '600',
    7: '600',
    8: '700',
    9: '700',
    10: '700',
    11: '600',
  },
  letterSpacing: bodyLetterSpacing,
});

const monoFont = createFont({
  family: monoFamily,
  size: bodySize,
  lineHeight: bodyLineHeight,
  weight: bodyWeight,
  letterSpacing: bodyLetterSpacing,
});

// ---------- Tokens ----------

const color = {
  // Brand
  brand50: '#EEF2FF',
  brand100: '#E0E7FF',
  brand200: '#C7D2FE',
  brand500: '#6366F1',
  brand600: '#4F46E5',
  brand700: '#4338CA',
  brand900: '#312E81',
  // Neutral
  neutral50: '#F9FAFB',
  neutral100: '#F3F4F6',
  neutral200: '#E5E7EB',
  neutral300: '#D1D5DB',
  neutral400: '#9CA3AF',
  neutral500: '#6B7280',
  neutral600: '#4B5563',
  neutral700: '#374151',
  neutral800: '#1F2937',
  neutral900: '#111827',
  // Semantic
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  // Category
  catDining: '#F97316',
  catTransport: '#3B82F6',
  catShopping: '#8B5CF6',
  catHousing: '#06B6D4',
  catFun: '#EC4899',
  catHealth: '#22C55E',
  catOther: '#6B7280',
  // Special
  trendUp: '#F97316',
  trendDown: '#06B6D4',
  giftNeutral: '#6B7280',
  savingGreen: '#22C55E',
  warmTint: '#FFF7ED',
  tagSelf: '#6366F1',
  tagSpouse: '#EC4899',
  tagChild: '#F97316',
  tagFamily: '#22C55E',
  // Surface
  surfacePrimary: '#FFFFFF',
  surfaceSecondary: '#F3F4F6',
  surfacePage: '#F9FAFB',
  backdrop: 'rgba(0,0,0,0.5)',
} as const;

const space = {
  // Tamagui dev-mode 校验要求 `true` 默认键（createTamagui 源码中硬编码 `$true`）。
  // 取值对齐 `space-4 = 16`（设计系统默认间距），与 size.true 保持一致以符合 Tamagui 官方约定。
  true: 16,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
} as const;

const size = {
  ...space,
  heightButtonPrimary: 48,
  heightButtonSecondary: 44,
  heightHeader: 44,
  heightTabbar: 56,
  heightInput: 48,
  heightSearch: 40,
  heightChip: 32,
  heightTab: 44,
  heightTransaction: 64,
  heightEvent: 72,
  heightCategory: 76,
  heightContact: 76,
  heightFab: 56,
  heightVoice: 80,
} as const;

const radius = {
  // Tamagui dev-mode 校验要求 tokens.radius 与 tokens.size 的 key 至少有一个重叠。
  // 通过 `true` 默认键与 size.true（16）对齐，既满足校验又保留语义化 key。取值对齐 `radius-md = 8`。
  true: 8,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

const zIndex = {
  0: 0,
  1: 100,
  2: 200,
  3: 300,
  4: 400,
  5: 500,
} as const;

const tokens = createTokens({
  color,
  space,
  size,
  radius,
  zIndex,
});

// ---------- Shadows（组件级常量，不在 tokens 中） ----------

export const shadows = {
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;

// ---------- Themes ----------

// Light：真实值
const lightTheme = {
  background: color.surfacePage,
  surface: color.surfacePrimary,
  surfaceAlt: color.surfaceSecondary,
  color: color.neutral700,
  colorHeading: color.neutral800,
  colorMuted: color.neutral500,
  borderColor: color.neutral200,
  backdrop: color.backdrop,
  brand: color.brand500,
} as const;

// Dark：占位（与 light 同值；后续 Story 替换真实 dark 色值）
const darkTheme = { ...lightTheme };

// ---------- Animations ----------

const animations = createAnimations({
  fast: { type: 'timing', duration: 100 },
  normal: { type: 'timing', duration: 200 },
  slow: { type: 'timing', duration: 300 },
  chart: { type: 'timing', duration: 400 },
  spring: { type: 'spring', damping: 15, mass: 1, stiffness: 180 },
});

// ---------- Config ----------

export const config = createTamagui({
  animations,
  tokens,
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
  fonts: {
    body: bodyFont,
    heading: headingFont,
    mono: monoFont,
  },
  defaultFont: 'body',
  shorthands: {},
  // media：使用 Tamagui 默认 breakpoints（MVP 未定义自定义断点）
});

export type Conf = typeof config;

export default config;
