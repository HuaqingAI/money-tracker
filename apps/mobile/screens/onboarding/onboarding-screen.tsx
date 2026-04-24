import { Text } from '@money-tracker/ui';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { startTransition, useCallback } from 'react';
import {
  BackHandler,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { YStack } from 'tamagui';

import {
  GhostTextButton,
  OnboardingVisual,
  PrimaryActionButton,
  ProgressDots,
  SecondaryActionButton,
  useReducedMotionPreference,
} from './components';
import { AUTH_ROUTES, ONBOARDING_ACTION_LABELS, ONBOARDING_SLIDES } from './content';

export function OnboardingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const pageWidth = Math.max(width - 32, 0);
  const reduceMotionEnabled = useReducedMotionPreference();
  const scrollViewRef = React.useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const goToSlide = useCallback(
    (nextIndex: number) => {
      const clampedIndex = Math.max(
        0,
        Math.min(nextIndex, ONBOARDING_SLIDES.length - 1),
      );

      startTransition(() => {
        setCurrentIndex(clampedIndex);
      });

      scrollViewRef.current?.scrollTo({
        x: clampedIndex * pageWidth,
        animated: !reduceMotionEnabled,
      });
    },
    [pageWidth, reduceMotionEnabled],
  );

  const goToRegister = useCallback(() => {
    router.push(AUTH_ROUTES.register);
  }, [router]);

  React.useEffect(() => {
    scrollViewRef.current?.scrollTo({
      x: currentIndex * pageWidth,
      animated: false,
    });
  }, [currentIndex, pageWidth]);

  React.useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (currentIndex === 0) {
        router.replace(AUTH_ROUTES.welcome);
        return true;
      }

      goToSlide(currentIndex - 1);
      return true;
    });

    return () => subscription.remove();
  }, [currentIndex, goToSlide, router]);

  const activeSlide = ONBOARDING_SLIDES[currentIndex] ?? ONBOARDING_SLIDES[0];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <YStack flex={1} bg="$surfacePage" px="$4" pt="$2" pb="$4">
        <YStack ai="flex-end" minHeight={44}>
          <GhostTextButton
            label={ONBOARDING_ACTION_LABELS.skip}
            onPress={goToRegister}
          />
        </YStack>

        <YStack flex={1}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            bounces={false}
            onMomentumScrollEnd={(event) => {
              const nextIndex = Math.round(
                event.nativeEvent.contentOffset.x / pageWidth,
              );

              startTransition(() => {
                setCurrentIndex(nextIndex);
              });
            }}
            scrollEventThrottle={16}
            showsHorizontalScrollIndicator={false}
          >
            {ONBOARDING_SLIDES.map((slide) => (
              <YStack key={slide.key} width={pageWidth} flex={1} px="$1">
                <YStack flex={1} ai="center" jc="center" pb="$4">
                  <OnboardingVisual tone={slide.tone} />
                </YStack>
                <YStack gap="$3" pb="$8">
                  <Text
                    variant="h1"
                    color="$neutral900"
                    textAlign="center"
                    lineHeight={32}
                  >
                    {slide.title}
                  </Text>
                  <Text
                    variant="body"
                    color="$neutral500"
                    textAlign="center"
                    lineHeight={24}
                  >
                    {slide.subtitle}
                  </Text>
                </YStack>
              </YStack>
            ))}
          </ScrollView>
        </YStack>

        <YStack gap="$5">
          <ProgressDots currentIndex={currentIndex} total={ONBOARDING_SLIDES.length} />
          {activeSlide.href ? (
            <PrimaryActionButton label={activeSlide.ctaLabel} onPress={goToRegister} />
          ) : (
            <SecondaryActionButton
              label={activeSlide.ctaLabel}
              onPress={() => goToSlide(currentIndex + 1)}
            />
          )}
        </YStack>
      </YStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
});
