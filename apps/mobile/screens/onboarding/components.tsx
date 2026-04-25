import { Text } from '@money-tracker/ui';
import * as React from 'react';
import { AccessibilityInfo, Image, Pressable, useWindowDimensions } from 'react-native';
import { XStack, YStack } from 'tamagui';

import appLogo from '../../assets/onboarding/app-logo-house-receipt.png';
import heroWelcome from '../../assets/onboarding/hero-welcome.png';
import onboardingZeroInput from '../../assets/onboarding/onboarding-01-zero-input.png';
import onboardingAutoCategorize from '../../assets/onboarding/onboarding-02-auto-categorize.png';
import onboardingAiButler from '../../assets/onboarding/onboarding-03-ai-butler.png';
import type { OnboardingVisualTone } from './content';

const BRAND_GREEN = '#1A6B5A';
const BRAND_GREEN_DARK = '#155648';
const NEUTRAL_200 = '#E5E7EB';
const NEUTRAL_500 = '#6B7280';

const onboardingVisuals: Record<OnboardingVisualTone, number> = {
  capture: onboardingZeroInput,
  categorize: onboardingAutoCategorize,
  assistant: onboardingAiButler,
};

export function BrandLockup({ compact = false }: { compact?: boolean }) {
  const logoSize = compact ? 48 : 56;

  return (
    <XStack ai="center" jc="center" gap="$3">
      <Image
        accessibilityIgnoresInvertColors
        accessibilityLabel="了然应用图标"
        resizeMode="contain"
        source={appLogo}
        style={{
          width: logoSize,
          height: logoSize,
          borderRadius: compact ? 12 : 14,
          ...brandShadow,
        }}
      />
      <Text fontSize={compact ? 20 : 22} fontWeight="700" color={BRAND_GREEN}>
        了然
      </Text>
    </XStack>
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

export function WelcomeHero({ maxHeight }: { maxHeight: number }) {
  const { width } = useWindowDimensions();
  const { assetWidth, assetHeight } = useContainedAssetSize({
    availableWidth: Math.max(width - 40, 220),
    maxHeight,
    maxWidth: 336,
  });

  return (
    <Image
      accessibilityIgnoresInvertColors
      accessibilityLabel="欢迎页视觉插图"
      resizeMode="contain"
      source={heroWelcome}
      style={{
        width: assetWidth,
        height: assetHeight,
      }}
    />
  );
}

export function OnboardingVisual({
  maxHeight,
  tone,
}: {
  maxHeight: number;
  tone: OnboardingVisualTone;
}) {
  const { width } = useWindowDimensions();
  const { assetWidth, assetHeight } = useContainedAssetSize({
    availableWidth: Math.max(width - 56, 208),
    maxHeight,
    maxWidth: 328,
  });

  return (
    <Image
      accessibilityIgnoresInvertColors
      accessibilityLabel="引导页视觉插图"
      resizeMode="contain"
      source={onboardingVisuals[tone]}
      style={{
        width: assetWidth,
        height: assetHeight,
      }}
    />
  );
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

function useContainedAssetSize({
  availableWidth,
  maxHeight,
  maxWidth,
}: {
  availableWidth: number;
  maxHeight: number;
  maxWidth: number;
}) {
  const assetAspectRatio = 720 / 560;
  const safeMaxHeight = Math.max(maxHeight, 160);
  const assetWidth = Math.floor(
    Math.min(availableWidth, maxWidth, safeMaxHeight * assetAspectRatio),
  );
  const assetHeight = Math.round(assetWidth / assetAspectRatio);

  return { assetHeight, assetWidth };
}

const brandShadow = {
  shadowColor: BRAND_GREEN_DARK,
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.2,
  shadowRadius: 18,
  elevation: 8,
} as const;

const primaryButtonShadow = {
  shadowColor: BRAND_GREEN,
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.22,
  shadowRadius: 18,
  elevation: 6,
} as const;
