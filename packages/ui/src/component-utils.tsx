import type { ReactNode } from 'react';
import type { AccessibilityRole, Role } from 'react-native';
import { Platform } from 'react-native';
import { Text as TamaguiText, XStack, YStack } from 'tamagui';

export type DsAccessibilityRole =
  | 'alert'
  | 'alertdialog'
  | 'button'
  | 'checkbox'
  | 'dialog'
  | 'header'
  | 'image'
  | 'navigation'
  | 'progressbar'
  | 'status'
  | 'summary'
  | 'switch'
  | 'tab'
  | 'tablist'
  | 'text'
  | 'tooltip';

export interface DsAccessibilityState {
  checked?: boolean | 'mixed';
  disabled?: boolean;
  expanded?: boolean;
  selected?: boolean;
}

export interface DsAccessibilityValue {
  max?: number;
  min?: number;
  now?: number;
  text?: string;
}

export interface DsAccessibilityOptions {
  role?: DsAccessibilityRole;
  label?: string;
  state?: DsAccessibilityState;
  value?: DsAccessibilityValue;
  liveRegion?: 'none' | 'polite' | 'assertive';
  busy?: boolean;
  hidden?: boolean;
  modal?: boolean;
}

type DsAccessibilityAttrs = {
  accessibilityElementsHidden?: boolean;
  accessibilityLabel?: string;
  accessibilityLiveRegion?: 'none' | 'polite' | 'assertive';
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: DsAccessibilityState;
  accessibilityValue?: DsAccessibilityValue;
  role?: Role;
  'aria-busy'?: boolean;
  'aria-checked'?: boolean | 'mixed';
  'aria-disabled'?: boolean;
  'aria-expanded'?: boolean;
  'aria-hidden'?: boolean;
  'aria-label'?: string;
  'aria-live'?: 'polite' | 'assertive';
  'aria-modal'?: boolean;
  'aria-selected'?: boolean;
  'aria-valuemax'?: number;
  'aria-valuemin'?: number;
  'aria-valuenow'?: number;
  'aria-valuetext'?: string;
};

function getNativeRole(role?: DsAccessibilityRole): AccessibilityRole | undefined {
  if (!role) return undefined;
  if (role === 'alertdialog') return 'alert';
  if (role === 'dialog' || role === 'navigation') return 'summary';
  if (role === 'status' || role === 'tooltip') return 'text';
  return role;
}

function getWebRole(role?: DsAccessibilityRole): Role | undefined {
  if (!role || role === 'text') return undefined;
  if (role === 'image') return 'img';
  if (role === 'header') return 'banner';
  if (role === 'navigation') return 'navigation';
  if (role === 'summary') return 'region';
  return role;
}

export function a11yProps({
  role,
  label,
  state,
  value,
  liveRegion,
  busy,
  hidden,
  modal,
}: DsAccessibilityOptions): DsAccessibilityAttrs {
  if (Platform.OS !== 'web') {
    return {
      accessibilityElementsHidden: hidden,
      accessibilityLabel: label,
      accessibilityLiveRegion: liveRegion,
      accessibilityRole: getNativeRole(role),
      accessibilityState: state,
      accessibilityValue: value,
    };
  }

  const webRole = getWebRole(role);
  return {
    role: webRole,
    'aria-busy': busy,
    'aria-checked': state?.checked,
    'aria-disabled': state?.disabled,
    'aria-expanded': state?.expanded,
    'aria-hidden': hidden,
    'aria-label': label,
    'aria-live': liveRegion === 'none' ? undefined : liveRegion,
    'aria-modal': modal,
    'aria-selected': state?.selected,
    'aria-valuemax': value?.max,
    'aria-valuemin': value?.min,
    'aria-valuenow': value?.now,
    'aria-valuetext': value?.text,
  };
}

export type DsSize = 'sm' | 'md' | 'lg' | 'xl';
export type DsTone =
  | 'brand'
  | 'neutral'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'self'
  | 'spouse'
  | 'child'
  | 'family';

export const categoryColorTokens = {
  dining: '$catDining',
  transport: '$catTransport',
  shopping: '$catShopping',
  housing: '$catHousing',
  fun: '$catFun',
  health: '$catHealth',
  other: '$catOther',
} as const;

export type CategoryColorKey = keyof typeof categoryColorTokens;

export const toneColorTokens: Record<DsTone, string> = {
  brand: '$brand500',
  neutral: '$neutral500',
  success: '$success',
  error: '$error',
  warning: '$warning',
  info: '$info',
  self: '$tagSelf',
  spouse: '$tagSpouse',
  child: '$tagChild',
  family: '$tagFamily',
};

export const sizeValues: Record<DsSize, number> = {
  // Spec literals from avatar.md: 32/44/64/80 pt avatar sizes.
  sm: 32,
  md: 44,
  lg: 64,
  xl: 80,
};

export const dsMetrics = {
  avatarEditButton: 22,
  badgeDot: 8,
  badgeLabelHeight: 18,
  badgeTagHeight: 28,
  chartDonutHeight: 180,
  chartBarHeight: 200,
  chartRadarHeight: 240,
  chartDonutSegment: 48,
  chartDonutSegmentSelected: 56,
  chartLabelWidth: 72,
  chartValueWidth: 48,
  iconBubble: 36,
  modalAlertWidth: 280,
  progressBarHeight: 4,
  progressDot: 8,
  progressDotActive: 10,
  progressCircularSize: 64,
  progressCircularBorder: 6,
  searchClearButton: 28,
  skeletonAmountWidth: 64,
  skeletonAvatarSize: 36,
  skeletonCardBodyHeight: 36,
  skeletonChartHeight: 200,
  skeletonMetaHeight: 12,
  skeletonTitleHeight: 16,
  skeletonTextLineHeight: 14,
  tabIndicatorHeight: 2,
  toastZIndex: 500,
  toastToneDot: 10,
  toggleWidth: 51,
  toggleHeight: 31,
  togglePadding: 2,
  toggleThumb: 27,
  toggleThumbOffset: 20,
  tooltipChartWidth: 200,
  tooltipInfoWidth: 260,
  tooltipZIndex: 4,
  touchTarget: 44,
} as const;

export function getInitials(name?: string) {
  const normalized = name?.trim();
  if (!normalized) return '?';
  const parts = normalized.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return normalized.slice(0, 2).toUpperCase();
  return `${parts[0]?.slice(0, 1) ?? ''}${parts[1]?.slice(0, 1) ?? ''}`.toUpperCase();
}

export function clamp(value: number, min: number, max: number) {
  if (max <= min) return min;
  return Math.min(Math.max(value, min), max);
}

export function getPercent(value: number, min = 0, max = 100) {
  return ((clamp(value, min, max) - min) / (max - min || 1)) * 100;
}

export function getStableToneFromName(name?: string): DsTone {
  const palette: DsTone[] = ['brand', 'self', 'spouse', 'child', 'family', 'info'];
  const source = name?.trim() || 'avatar';
  const hash = Array.from(source).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return palette[hash % palette.length] ?? 'brand';
}

export function MaybeIcon({ icon }: { icon?: ReactNode }) {
  if (!icon) return null;
  if (typeof icon === 'string') {
    return (
      <TamaguiText color="$neutral600" fontSize="$6">
        {icon}
      </TamaguiText>
    );
  }
  return <>{icon}</>;
}

export function VisuallyGroupedText({
  title,
  subtitle,
  align = 'left',
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  align?: 'left' | 'center' | 'right';
}) {
  return (
    <YStack flex={1} gap="$1" alignItems={align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'}>
      {title ? (
        <TamaguiText color="$neutral800" fontSize="$4" fontWeight="600">
          {title}
        </TamaguiText>
      ) : null}
      {subtitle ? (
        <TamaguiText color="$neutral500" fontSize="$2">
          {subtitle}
        </TamaguiText>
      ) : null}
    </YStack>
  );
}

export function IconBubble({ children, tone = 'neutral' }: { children?: ReactNode; tone?: DsTone }) {
  return (
    <XStack
      width={dsMetrics.iconBubble}
      height={dsMetrics.iconBubble}
      borderRadius="$full"
      backgroundColor={tone === 'brand' ? '$brand50' : '$neutral100'}
      alignItems="center"
      justifyContent="center"
    >
      {children}
    </XStack>
  );
}
