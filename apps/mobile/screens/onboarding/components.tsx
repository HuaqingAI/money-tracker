import { Button, shadows,Text } from '@money-tracker/ui';
import * as React from 'react';
import { AccessibilityInfo, Pressable } from 'react-native';
import { Circle, Separator, Stack, XStack, YStack } from 'tamagui';

import type { OnboardingVisualTone } from './content';

export function BrandLockup() {
  return (
    <YStack ai="center" gap="$3">
      <Stack
        width={64}
        height={64}
        br="$xl"
        bg="$brand500"
        jc="center"
        ai="center"
        style={shadows.md}
      >
        <Stack
          width={32}
          height={32}
          br="$md"
          borderWidth={2}
          borderColor="$surfacePrimary"
          ai="center"
          jc="center"
          opacity={0.9}
        >
          <Text color="$surfacePrimary" fontSize={18} fontWeight="700">
            +
          </Text>
        </Stack>
      </Stack>
      <Text variant="h2" color="$brand500">
        了然
      </Text>
    </YStack>
  );
}

export function GhostTextButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.72 : 1,
      })}
    >
      <XStack px="$2" py="$2">
        <Text variant="bodyMedium" color="$neutral500">
          {label}
        </Text>
      </XStack>
    </Pressable>
  );
}

export function SecondaryActionButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <XStack
        width="100%"
        height={44}
        br="$lg"
        borderWidth={1}
        borderColor="$brand500"
        bg="$surfacePrimary"
        ai="center"
        jc="center"
      >
        <Text variant="bodyMedium" color="$brand500">
          {label}
        </Text>
      </XStack>
    </Pressable>
  );
}

export function PrimaryActionButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Button width="100%" onPress={onPress}>
      {label}
    </Button>
  );
}

export function ProgressDots({
  currentIndex,
  total,
}: {
  currentIndex: number;
  total: number;
}) {
  return (
    <XStack
      accessibilityLabel={`第 ${currentIndex + 1} 页，共 ${total} 页`}
      accessibilityRole="progressbar"
      ai="center"
      jc="center"
      gap="$2"
    >
      {Array.from({ length: total }, (_, index) => {
        const isActive = index === currentIndex;

        return (
          <Stack
            key={index}
            width={isActive ? 20 : 8}
            height={isActive ? 10 : 8}
            br="$full"
            bg={isActive ? '$brand500' : '$neutral200'}
            opacity={isActive ? 1 : 0.7}
          />
        );
      })}
    </XStack>
  );
}

export function WelcomeHero() {
  return (
    <Stack width={292} height={320} ai="center" jc="center">
      <Circle
        size={220}
        bg="$brand100"
        opacity={0.42}
        pos="absolute"
        top={28}
      />

      <FloatingCard side="left" top={16} rotate="-12deg">
        <YStack gap="$2">
          <Text variant="caption" color="$neutral500">
            支付宝
          </Text>
          <Text variant="bodyMedium" color="$neutral800">
            午餐
          </Text>
          <Text fontSize={18} fontWeight="700" color="$brand500">
            -¥36
          </Text>
        </YStack>
      </FloatingCard>

      <Stack
        width={150}
        height={272}
        br={36}
        bg="$neutral900"
        borderWidth={6}
        borderColor="$neutral800"
        style={shadows.lg}
      >
        <Stack
          width={64}
          height={16}
          br="$lg"
          bg="$neutral900"
          pos="absolute"
          top={0}
          left="50%"
          ml={-32}
          zIndex={2}
        />
        <YStack flex={1} bg="$surfacePrimary" br={30} px="$4" pt={40} pb="$4" gap="$3">
          <Text variant="caption" color="$neutral500">
            今日支出
          </Text>
          <Text variant="metric" color="$neutral900" fontSize={32}>
            ¥128
          </Text>
          <MetricPill color="$catDining" label="餐饮" value="¥56" />
          <MetricPill color="$catTransport" label="交通" value="¥22" />
          <MetricPill color="$catShopping" label="购物" value="¥50" />
          <YStack mt="auto" gap="$2">
            <Separator borderColor="$neutral100" />
            <Text variant="caption" color="$brand500">
              已自动归类 3 笔消费
            </Text>
          </YStack>
        </YStack>
      </Stack>

      <FloatingCard side="right" bottom={38} rotate="8deg">
        <YStack gap="$2">
          <XStack ai="center" gap="$2">
            <Circle size={10} bg="$success" />
            <Text variant="caption" color="$neutral500">
              微信支付
            </Text>
          </XStack>
          <Text variant="bodyMedium" color="$neutral800">
            通勤地铁
          </Text>
          <Text fontSize={18} fontWeight="700" color="$neutral900">
            -¥4
          </Text>
        </YStack>
      </FloatingCard>
    </Stack>
  );
}

export function OnboardingVisual({ tone }: { tone: OnboardingVisualTone }) {
  if (tone === 'capture') {
    return <CaptureVisual />;
  }

  if (tone === 'categorize') {
    return <CategorizeVisual />;
  }

  return <AssistantVisual />;
}

export function useReducedMotionPreference() {
  const [reduceMotionEnabled, setReduceMotionEnabled] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;

    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (isMounted) {
        setReduceMotionEnabled(Boolean(enabled));
      }
    });

    const subscription = AccessibilityInfo.addEventListener?.(
      'reduceMotionChanged',
      (enabled) => setReduceMotionEnabled(Boolean(enabled)),
    );

    return () => {
      isMounted = false;
      subscription?.remove?.();
    };
  }, []);

  return reduceMotionEnabled;
}

function FloatingCard({
  children,
  side,
  top,
  bottom,
  rotate,
}: React.PropsWithChildren<{
  side: 'left' | 'right';
  top?: number;
  bottom?: number;
  rotate: string;
}>) {
  return (
    <YStack
      pos="absolute"
      top={top}
      bottom={bottom}
      left={side === 'left' ? 0 : undefined}
      right={side === 'right' ? 0 : undefined}
      width={128}
      px="$3"
      py="$3"
      br="$xl"
      bg="$surfacePrimary"
      borderWidth={1}
      borderColor="$neutral100"
      style={[
        shadows.md,
        {
          transform: [{ rotate }],
        },
      ]}
    >
      {children}
    </YStack>
  );
}

function MetricPill({
  color,
  label,
  value,
}: {
  color: '$catDining' | '$catTransport' | '$catShopping';
  label: string;
  value: string;
}) {
  return (
    <XStack ai="center" gap="$2" px="$3" py="$2" br="$lg" bg="$neutral50">
      <Circle size={10} bg={color} />
      <Text flex={1} variant="caption" color="$neutral600">
        {label}
      </Text>
      <Text variant="bodyMedium" color="$neutral800">
        {value}
      </Text>
    </XStack>
  );
}

function CaptureVisual() {
  return (
    <Stack width={292} height={300} ai="center" jc="center">
      <Circle size={232} bg="$brand50" pos="absolute" top={32} opacity={0.95} />
      <FloatingBadge left={18} top={36} bg="$success" label="支付宝" />
      <FloatingBadge right={18} bottom={72} bg="$brand500" label="微信支付" />
      <PhoneShell>
        <YStack gap="$3">
          <FeedCard label="午餐" amount="-¥36" accent="$catDining" />
          <FeedCard label="地铁" amount="-¥4" accent="$catTransport" />
          <FeedCard label="超市" amount="-¥58" accent="$catShopping" />
        </YStack>
      </PhoneShell>
    </Stack>
  );
}

function CategorizeVisual() {
  return (
    <Stack width={292} height={300} ai="center" jc="center">
      <Circle size={224} bg="$warmTint" pos="absolute" top={36} opacity={0.95} />
      <XStack pos="absolute" top={34} gap="$2">
        <CategoryChip bg="$catDining" label="餐饮" />
        <CategoryChip bg="$catTransport" label="交通" />
        <CategoryChip bg="$catShopping" label="购物" />
      </XStack>
      <YStack
        width={220}
        px="$4"
        py="$4"
        gap="$3"
        br={28}
        bg="$surfacePrimary"
        borderWidth={1}
        borderColor="$neutral100"
        style={shadows.lg}
      >
        <Text variant="bodyMedium" color="$neutral800">
          自动归类中
        </Text>
        <CategoryRow label="餐饮" color="$catDining" width={132} />
        <CategoryRow label="交通" color="$catTransport" width={88} />
        <CategoryRow label="购物" color="$catShopping" width={116} />
        <XStack mt="$2" ai="center" gap="$2">
          <Circle size={10} bg="$success" />
          <Text variant="caption" color="$neutral600">
            打开就是分好的
          </Text>
        </XStack>
      </YStack>
    </Stack>
  );
}

function AssistantVisual() {
  return (
    <Stack width={300} height={300} ai="center" jc="center">
      <Circle size={228} bg="$brand50" pos="absolute" top={36} opacity={0.95} />
      <YStack
        width={220}
        gap="$3"
        px="$4"
        py="$4"
        br={28}
        bg="$surfacePrimary"
        borderWidth={1}
        borderColor="$neutral100"
        style={shadows.lg}
      >
        <Text variant="caption" color="$neutral500">
          本月支出
        </Text>
        <Text variant="metric" fontSize={32} color="$neutral900">
          ¥4,860
        </Text>
        <CategoryRow label="餐饮" color="$catDining" width={124} />
        <CategoryRow label="交通" color="$catTransport" width={72} />
        <CategoryRow label="购物" color="$catShopping" width={102} />
      </YStack>
      <YStack
        pos="absolute"
        top={22}
        right={0}
        width={168}
        gap="$2"
        px="$3"
        py="$3"
        br="$xl"
        bg="$surfacePrimary"
        borderWidth={1}
        borderColor="$neutral100"
        style={shadows.md}
      >
        <XStack ai="center" gap="$2">
          <Circle size={14} bg="$brand500" />
          <Text variant="caption" color="$brand500">
            AI 管家说
          </Text>
        </XStack>
        <Text variant="bodyMedium" color="$neutral800">
          本月餐饮支出比上月多出 15%
        </Text>
      </YStack>
    </Stack>
  );
}

function FloatingBadge({
  label,
  bg,
  left,
  right,
  top,
  bottom,
}: {
  label: string;
  bg: '$brand500' | '$success';
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
}) {
  return (
    <XStack
      pos="absolute"
      left={left}
      right={right}
      top={top}
      bottom={bottom}
      px="$3"
      py="$2"
      br="$xl"
      bg={bg}
      ai="center"
      jc="center"
      style={shadows.sm}
    >
      <Text variant="caption" color="$surfacePrimary">
        {label}
      </Text>
    </XStack>
  );
}

function PhoneShell({ children }: React.PropsWithChildren) {
  return (
    <Stack
      width={168}
      height={276}
      br={36}
      bg="$neutral900"
      borderWidth={6}
      borderColor="$neutral800"
      style={shadows.lg}
    >
      <Stack
        width={68}
        height={16}
        br="$lg"
        bg="$neutral900"
        pos="absolute"
        top={0}
        left="50%"
        ml={-34}
        zIndex={2}
      />
      <YStack flex={1} bg="$surfacePrimary" br={30} px="$4" pt={40} pb="$4">
        {children}
      </YStack>
    </Stack>
  );
}

function FeedCard({
  label,
  amount,
  accent,
}: {
  label: string;
  amount: string;
  accent: '$catDining' | '$catTransport' | '$catShopping';
}) {
  return (
    <XStack
      ai="center"
      gap="$3"
      px="$3"
      py="$3"
      br="$lg"
      bg="$neutral50"
      borderWidth={1}
      borderColor="$neutral100"
    >
      <Circle size={12} bg={accent} />
      <Text flex={1} variant="bodyMedium" color="$neutral800">
        {label}
      </Text>
      <Text variant="caption" color="$neutral600">
        {amount}
      </Text>
    </XStack>
  );
}

function CategoryChip({
  label,
  bg,
}: {
  label: string;
  bg: '$catDining' | '$catTransport' | '$catShopping';
}) {
  return (
    <XStack px="$3" py="$2" br="$xl" bg={bg}>
      <Text variant="caption" color="$surfacePrimary">
        {label}
      </Text>
    </XStack>
  );
}

function CategoryRow({
  label,
  color,
  width,
}: {
  label: string;
  color: '$catDining' | '$catTransport' | '$catShopping';
  width: number;
}) {
  return (
    <YStack gap="$2">
      <XStack ai="center" jc="space-between">
        <Text variant="caption" color="$neutral600">
          {label}
        </Text>
        <Text variant="caption" color="$neutral500">
          已整理
        </Text>
      </XStack>
      <Stack height={8} br="$full" bg="$neutral100" overflow="hidden">
        <Stack height="100%" width={width} bg={color} br="$full" />
      </Stack>
    </YStack>
  );
}
