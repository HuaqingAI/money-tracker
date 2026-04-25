import { shadows, Text } from '@money-tracker/ui';
import * as React from 'react';
import { AccessibilityInfo, Pressable, useWindowDimensions } from 'react-native';
import { Circle, View, XStack, YStack } from 'tamagui';

import type { OnboardingVisualTone } from './content';

const BRAND_GREEN = '#1A6B5A';
const BRAND_GREEN_DARK = '#155648';
const BRAND_TINT = '#E8F3EF';
const GLASS_FILL = 'rgba(255, 255, 255, 0.78)';
const GLASS_BORDER = 'rgba(255, 255, 255, 0.95)';
const NEUTRAL_50 = '#F9FAFB';
const NEUTRAL_100 = '#F3F4F6';
const NEUTRAL_200 = '#E5E7EB';
const NEUTRAL_500 = '#6B7280';
const NEUTRAL_800 = '#1F2937';
const NEUTRAL_900 = '#111827';
const ORANGE = '#FB923C';
const BLUE = '#3B82F6';
const PURPLE = '#8B5CF6';
const SUCCESS = '#22C55E';

export function BrandLockup() {
  return (
    <YStack ai="center" gap="$3">
      <YStack
        width={64}
        height={64}
        br={16}
        bg={BRAND_GREEN}
        jc="center"
        ai="center"
        style={brandShadow}
      >
        <View width={24} height={24} br={4} bg="rgba(255, 255, 255, 0.18)" />
        <View width={28} height={4} br="$full" bg="#FFFFFF" pos="absolute" />
        <View width={4} height={28} br="$full" bg="#FFFFFF" pos="absolute" />
      </YStack>
      <Text fontSize={20} fontWeight="700" color={BRAND_GREEN}>
        了然
      </Text>
    </YStack>
  );
}

export function GhostTextButton({ label, onPress }: { label: string; onPress: () => void }) {
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
        <Text fontSize={16} fontWeight="500" color={NEUTRAL_500}>
          {label}
        </Text>
      </XStack>
    </Pressable>
  );
}

export function SecondaryActionButton({ label, onPress }: { label: string; onPress: () => void }) {
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
        height={56}
        br={12}
        borderWidth={2}
        borderColor={BRAND_GREEN}
        bg="#FFFFFF"
        ai="center"
        jc="center"
      >
        <Text fontSize={16} fontWeight="700" color={BRAND_GREEN}>
          {label}
        </Text>
      </XStack>
    </Pressable>
  );
}

export function PrimaryActionButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.96 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <XStack
        width="100%"
        height={56}
        br={12}
        bg={BRAND_GREEN}
        ai="center"
        jc="center"
        style={primaryButtonShadow}
      >
        <Text fontSize={16} fontWeight="700" color="#FFFFFF">
          {label}
        </Text>
      </XStack>
    </Pressable>
  );
}

export function ProgressDots({ currentIndex, total }: { currentIndex: number; total: number }) {
  return (
    <XStack
      accessibilityLabel={`第 ${currentIndex + 1} 页，共 ${total} 页`}
      accessibilityRole="progressbar"
      ai="center"
      jc="center"
      gap={8}
    >
      {Array.from({ length: total }, (_, index) => {
        const isActive = index === currentIndex;

        return (
          <YStack
            key={index}
            width={isActive ? 24 : 8}
            height={8}
            br="$full"
            bg={isActive ? BRAND_GREEN : NEUTRAL_200}
          />
        );
      })}
    </XStack>
  );
}

export function WelcomeHero() {
  const scale = useVisualScale(280);

  return (
    <View
      width={280}
      height={280}
      ai="center"
      jc="center"
      style={{
        transform: [{ scale }],
      }}
    >
      <Circle size={280} bg={BRAND_GREEN} opacity={0.1} pos="absolute" top={0} />

      <WelcomeSkeletonCard side="left" top={24} rotate="-12deg" />

      <View
        width={128}
        height={224}
        br={40}
        bg={NEUTRAL_800}
        borderWidth={6}
        borderColor={NEUTRAL_800}
        style={shadows.lg}
        overflow="hidden"
      >
        <View
          width={64}
          height={24}
          br={12}
          bg={NEUTRAL_800}
          pos="absolute"
          top={0}
          left="50%"
          ml={-32}
          zIndex={2}
        />
        <YStack flex={1} bg="#FFFFFF" px="$4" pt={42} pb="$4" gap="$3">
          <SkeletonBlock width="76%" height={12} />
          <SkeletonBlock width="52%" height={12} />
          <YStack height={80} br={12} bg={BRAND_TINT} ai="center" jc="center" mt="$1">
            <Circle size={34} bg={BRAND_GREEN} opacity={0.2} />
          </YStack>
          <YStack mt="auto" gap="$2">
            <SkeletonBlock width="84%" height={10} />
            <SkeletonBlock width="60%" height={10} />
          </YStack>
        </YStack>
      </View>

      <WelcomeSkeletonCard side="right" bottom={40} rotate="6deg" wide />
    </View>
  );
}

export function OnboardingVisual({ tone }: { tone: OnboardingVisualTone }) {
  const scale = useVisualScale(tone === 'assistant' ? 280 : 240);

  if (tone === 'capture') {
    return <CaptureVisual scale={scale} />;
  }

  if (tone === 'categorize') {
    return <CategorizeVisual scale={scale} />;
  }

  return <AssistantVisual scale={scale} />;
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

    const subscription = AccessibilityInfo.addEventListener?.('reduceMotionChanged', (enabled) =>
      setReduceMotionEnabled(Boolean(enabled)),
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
    <View
      pos="absolute"
      top={top}
      bottom={bottom}
      left={side === 'left' ? -16 : undefined}
      right={side === 'right' ? -16 : undefined}
      px="$3"
      py="$3"
      br={16}
      bg={GLASS_FILL}
      borderWidth={1}
      borderColor={GLASS_BORDER}
      style={[
        glassShadow,
        {
          transform: [{ rotate }],
        },
      ]}
    >
      {children}
    </View>
  );
}

function WelcomeSkeletonCard({
  side,
  top,
  bottom,
  rotate,
  wide = false,
}: {
  side: 'left' | 'right';
  top?: number;
  bottom?: number;
  rotate: string;
  wide?: boolean;
}) {
  return (
    <FloatingCard side={side} top={top} bottom={bottom} rotate={rotate}>
      <YStack width={wide ? 120 : 104} height={wide ? 68 : 56}>
        {wide ? (
          <>
            <XStack ai="center" gap="$2" mb="$3">
              <Circle size={24} bg={ORANGE} />
              <SkeletonBlock width={58} height={12} color={NEUTRAL_200} />
            </XStack>
            <SkeletonBlock width={96} height={20} color={NEUTRAL_800} />
          </>
        ) : (
          <>
            <SkeletonBlock width={32} height={8} color={BRAND_GREEN} opacity={0.2} />
            <SkeletonBlock width={64} height={16} color={BRAND_GREEN} opacity={0.4} mt="$2" />
            <XStack mt="auto" jc="flex-end">
              <SkeletonBlock width={40} height={12} color={BRAND_GREEN} opacity={0.6} />
            </XStack>
          </>
        )}
      </YStack>
    </FloatingCard>
  );
}

function CaptureVisual({ scale }: { scale: number }) {
  return (
    <View
      width={240}
      height={240}
      ai="center"
      jc="center"
      style={{
        transform: [{ scale }],
      }}
    >
      <Circle size={240} bg={BRAND_GREEN} pos="absolute" top={0} opacity={0.05} />
      <PaymentBadge right={0} top={8} bg={SUCCESS} label="支" rotate="12deg" />
      <PaymentBadge left={0} bottom={20} bg={BRAND_GREEN} label="微" rotate="-12deg" />
      <PhoneShell>
        <YStack gap="$3" pt="$1">
          <SkeletonBlock width="100%" height={8} />
          <SkeletonBlock width="66%" height={8} />
          <PulseCard />
          <PulseCard muted />
        </YStack>
      </PhoneShell>
    </View>
  );
}

function CategorizeVisual({ scale }: { scale: number }) {
  return (
    <View
      width={240}
      height={240}
      ai="center"
      jc="center"
      style={{
        transform: [{ scale }],
      }}
    >
      <Circle size={240} bg={ORANGE} pos="absolute" top={0} opacity={0.05} />
      <XStack gap="$3" mb="$4">
        <CategoryBubble bg="#FFEDD5" color={ORANGE} label="餐" />
        <CategoryBubble bg="#DBEAFE" color={BLUE} label="行" />
        <CategoryBubble bg="#F3E8FF" color={PURPLE} label="购" />
      </XStack>
      <YStack
        width={192}
        height={128}
        px="$4"
        py="$4"
        gap="$3"
        br={16}
        bg="#FFFFFF"
        borderWidth={2}
        borderColor={NEUTRAL_100}
        style={shadows.lg}
      >
        <CategorySkeletonRow color={ORANGE} width={96} />
        <CategorySkeletonRow color={BLUE} width={64} />
        <CategorySkeletonRow color={PURPLE} width={82} />
      </YStack>
    </View>
  );
}

function AssistantVisual({ scale }: { scale: number }) {
  return (
    <View
      width={280}
      height={280}
      ai="center"
      jc="center"
      style={{
        transform: [{ scale }],
      }}
    >
      <Circle size={280} bg={BRAND_GREEN} pos="absolute" top={0} opacity={0.1} />
      <YStack
        width={192}
        height={256}
        gap="$4"
        px="$4"
        py="$4"
        br={16}
        bg="#FFFFFF"
        borderWidth={1}
        borderColor={NEUTRAL_100}
        style={shadows.lg}
      >
        <XStack jc="space-between" ai="center">
          <SkeletonBlock width={48} height={12} />
          <Circle size={24} bg={NEUTRAL_50} />
        </XStack>
        <YStack gap="$2">
          <SkeletonBlock width={34} height={8} color={NEUTRAL_500} opacity={0.2} />
          <SkeletonBlock width={96} height={24} color={BRAND_GREEN} opacity={0.2} />
        </YStack>
        <YStack pt="$4" gap="$3">
          <DashboardBar color={ORANGE} width="66%" />
          <DashboardBar color={BLUE} width="36%" />
        </YStack>
      </YStack>
      <YStack
        pos="absolute"
        top={0}
        right={0}
        width={176}
        gap="$2"
        px="$3"
        py="$3"
        br={16}
        bg={GLASS_FILL}
        borderWidth={1}
        borderColor={GLASS_BORDER}
        style={glassShadow}
      >
        <XStack ai="center" gap="$2">
          <Circle size={16} bg={BRAND_GREEN} />
          <Text fontSize={10} fontWeight="700" color={BRAND_GREEN}>
            管家说
          </Text>
        </XStack>
        <Text fontSize={11} fontWeight="500" lineHeight={15} color={NEUTRAL_800}>
          本月餐饮支出比上个月多出 15%
        </Text>
      </YStack>
    </View>
  );
}

function PaymentBadge({
  label,
  bg,
  left,
  right,
  top,
  bottom,
  rotate,
}: {
  label: string;
  bg: string;
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  rotate: string;
}) {
  return (
    <XStack
      pos="absolute"
      left={left}
      right={right}
      top={top}
      bottom={bottom}
      width={64}
      height={64}
      br={16}
      bg={bg}
      ai="center"
      jc="center"
      style={[shadows.lg, { transform: [{ rotate }] }]}
    >
      <Text fontSize={24} fontWeight="700" color="#FFFFFF">
        {label}
      </Text>
    </XStack>
  );
}

function PhoneShell({ children }: React.PropsWithChildren) {
  return (
    <View
      width={128}
      height={192}
      br={24}
      bg="#FFFFFF"
      borderWidth={4}
      borderColor={NEUTRAL_100}
      style={shadows.lg}
    >
      <YStack flex={1} px="$4" py="$4">
        {children}
      </YStack>
    </View>
  );
}

function SkeletonBlock({
  width,
  height,
  color = NEUTRAL_100,
  opacity,
  mt,
}: {
  width: number | string;
  height: number;
  color?: string;
  opacity?: number;
  mt?: '$1' | '$2' | '$3' | '$4';
}) {
  return <View width={width} height={height} br="$full" bg={color} opacity={opacity} mt={mt} />;
}

function PulseCard({ muted = false }: { muted?: boolean }) {
  return <YStack height={48} br={10} bg={BRAND_TINT} opacity={muted ? 0.78 : 0.95} />;
}

function CategoryBubble({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <XStack width={48} height={48} br="$full" bg={bg} ai="center" jc="center">
      <Text fontSize={18} fontWeight="700" color={color}>
        {label}
      </Text>
    </XStack>
  );
}

function CategorySkeletonRow({ color, width }: { color: string; width: number }) {
  return (
    <XStack ai="center" gap="$3">
      <View width={24} height={24} br={6} bg={color} />
      <SkeletonBlock width={width} height={12} />
    </XStack>
  );
}

function DashboardBar({ color, width }: { color: string; width: string }) {
  return (
    <YStack gap="$2">
      <XStack jc="space-between">
        <SkeletonBlock width={40} height={8} />
        <SkeletonBlock width={32} height={8} />
      </XStack>
      <View height={8} br="$full" bg={NEUTRAL_50} overflow="hidden">
        <View height="100%" width={width} bg={color} br="$full" />
      </View>
    </YStack>
  );
}

function useVisualScale(designWidth: number) {
  const { width } = useWindowDimensions();
  const availableWidth = Math.max(width - 64, 240);
  return Math.min(1, availableWidth / designWidth);
}

const brandShadow = {
  shadowColor: BRAND_GREEN_DARK,
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.2,
  shadowRadius: 18,
  elevation: 8,
} as const;

const glassShadow = {
  shadowColor: NEUTRAL_900,
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.07,
  shadowRadius: 32,
  elevation: 6,
} as const;

const primaryButtonShadow = {
  shadowColor: BRAND_GREEN,
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.22,
  shadowRadius: 18,
  elevation: 6,
} as const;
