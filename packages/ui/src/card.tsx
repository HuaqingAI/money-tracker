import type { ReactNode } from 'react';
import { Text as TamaguiText, XStack, YStack } from 'tamagui';

import { shadows } from '../tamagui.config';
import { Badge } from './badge';
import { a11yProps, IconBubble, MaybeIcon } from './component-utils';
import { Progress } from './progress';
import { Skeleton } from './skeleton';

export type CardVariant =
  | 'metric'
  | 'category'
  | 'transaction'
  | 'insight'
  | 'guidance'
  | 'prompt'
  | 'spotlight'
  | 'snapshot'
  | 'contact'
  | 'event'
  | 'locked'
  | 'share'
  | 'empty';

export interface CardAction {
  label: string;
  onPress?: () => void;
}

export interface CardProps {
  variant?: CardVariant;
  title?: ReactNode;
  subtitle?: ReactNode;
  description?: ReactNode;
  value?: ReactNode;
  meta?: ReactNode;
  icon?: ReactNode;
  badge?: string;
  progress?: number;
  children?: ReactNode;
  action?: CardAction;
  dismissAction?: CardAction;
  pressable?: boolean;
  loading?: boolean;
  expanded?: boolean;
  dismissed?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  onPress?: () => void;
}

const listHeights: Partial<Record<CardVariant, string>> = {
  transaction: '$heightTransaction',
  category: '$heightCategory',
  contact: '$heightContact',
  event: '$heightEvent',
};

/**
 * Card 只提供可复用展示/交互 primitive，不绑定业务请求、navigation 或列表虚拟化。
 * 高频 transaction/category/contact/event 变体保持固定高度，供 FlashList 等容器在页面层优化。
 */
export function Card({
  variant = 'guidance',
  title,
  subtitle,
  description,
  value,
  meta,
  icon,
  badge,
  progress,
  children,
  action,
  dismissAction,
  pressable = false,
  loading = false,
  expanded = false,
  dismissed = false,
  disabled = false,
  accessibilityLabel,
  onPress,
}: CardProps) {
  if (loading) {
    return <Skeleton variant={variant === 'transaction' ? 'list-item' : 'card'} />;
  }

  const interactive = pressable || Boolean(onPress);
  const empty = variant === 'empty';
  const metric = variant === 'metric';
  const listHeight = listHeights[variant];

  return (
    <YStack
      minHeight={listHeight}
      padding={variant === 'transaction' || variant === 'contact' || variant === 'event' ? '$3' : '$4'}
      gap="$3"
      borderRadius={empty ? 0 : '$lg'}
      backgroundColor={
        metric
          ? '$brand500'
          : variant === 'prompt'
            ? '$warmTint'
            : variant === 'locked'
              ? '$surfaceSecondary'
              : empty
                ? 'transparent'
                : '$surfacePrimary'
      }
      borderBottomWidth={variant === 'transaction' ? 1 : 0}
      borderBottomColor="$neutral100"
      opacity={dismissed || disabled ? 0.6 : 1}
      alignItems={empty ? 'center' : 'stretch'}
      {...a11yProps({
        role: interactive ? 'button' : 'summary',
        label: accessibilityLabel ?? [title, value, subtitle].filter(Boolean).join('，'),
        state: { disabled, expanded },
      })}
      onPress={disabled ? undefined : onPress}
      {...(variant === 'transaction' || empty ? {} : metric ? shadows.md : shadows.sm)}
    >
      <XStack gap="$3" alignItems={variant === 'metric' ? 'flex-start' : 'center'}>
        {icon ? <IconBubble tone={metric ? 'brand' : 'neutral'}>{<MaybeIcon icon={icon} />}</IconBubble> : null}
        <YStack flex={1} gap="$1">
          <XStack gap="$2" alignItems="center">
            {title ? (
              <TamaguiText color={metric ? '$surfacePrimary' : '$neutral800'} fontSize={metric ? '$4' : '$3'} fontWeight="600">
                {title}
              </TamaguiText>
            ) : null}
            {badge ? <Badge variant="label" label={badge} tone={variant === 'insight' ? 'brand' : 'neutral'} /> : null}
          </XStack>
          {subtitle ? (
            <TamaguiText color={metric ? '$brand100' : '$neutral500'} fontSize="$2">
              {subtitle}
            </TamaguiText>
          ) : null}
        </YStack>
        {value ? (
          <TamaguiText color={metric ? '$surfacePrimary' : '$neutral800'} fontSize={metric ? '$9' : '$4'} fontWeight="700">
            {value}
          </TamaguiText>
        ) : null}
        {dismissAction ? (
          <XStack
            minWidth={44}
            minHeight={44}
            alignItems="center"
            justifyContent="center"
            {...a11yProps({ role: 'button', label: dismissAction.label, state: { disabled } })}
            onPress={disabled ? undefined : dismissAction.onPress}
          >
            <TamaguiText color="$neutral500" fontSize="$5">
              ×
            </TamaguiText>
          </XStack>
        ) : null}
      </XStack>
      {description ? (
        <TamaguiText color={metric ? '$brand50' : '$neutral600'} fontSize="$3" numberOfLines={expanded ? undefined : 3}>
          {description}
        </TamaguiText>
      ) : null}
      {progress !== undefined ? <Progress value={progress} variant="bar" label={`${title ?? '卡片'}进度`} /> : null}
      {children}
      {meta ? (
        <TamaguiText color={metric ? '$brand100' : '$neutral500'} fontSize="$2">
          {meta}
        </TamaguiText>
      ) : null}
      {action ? (
        <XStack
          minHeight={44}
          alignItems="center"
          {...a11yProps({ role: 'button', label: action.label, state: { disabled } })}
          onPress={disabled ? undefined : action.onPress}
        >
          <TamaguiText color={metric ? '$surfacePrimary' : '$brand500'} fontSize="$3" fontWeight="600">
            {action.label}
          </TamaguiText>
        </XStack>
      ) : null}
    </YStack>
  );
}
