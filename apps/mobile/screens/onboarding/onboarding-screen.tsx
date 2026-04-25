import { Text } from '@money-tracker/ui';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { startTransition, useCallback } from 'react';
import { BackHandler, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
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
  const { height, width } = useWindowDimensions();
  const pageWidth = Math.max(width, 0);
  const reduceMotionEnabled = useReducedMotionPreference();
  const scrollViewRef = React.useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const isShortViewport = height < 700;
  const topBarHeight = isShortViewport ? 36 : 44;
  const bottomControlsHeight = isShortViewport ? 104 : 124;
  const slideTextHeight = isShortViewport ? 132 : 150;
  const imageMaxHeight = Math.max(
    178,
    height - topBarHeight - bottomControlsHeight - slideTextHeight - (isShortViewport ? 56 : 84),
  );

  const goToSlide = useCallback(
    (nextIndex: number) => {
      const clampedIndex = Math.max(0, Math.min(nextIndex, ONBOARDING_SLIDES.length - 1));

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
      <YStack
        flex={1}
        bg="$surfacePage"
        pt={isShortViewport ? '$2' : '$3'}
        pb={isShortViewport ? '$3' : '$5'}
      >
        <YStack ai="flex-end" height={topBarHeight} px="$6">
          <GhostTextButton label={ONBOARDING_ACTION_LABELS.skip} onPress={goToRegister} />
        </YStack>

        <YStack flex={1} minHeight={0}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            bounces={false}
            onMomentumScrollEnd={(event) => {
              const nextIndex = Math.round(event.nativeEvent.contentOffset.x / pageWidth);

              startTransition(() => {
                setCurrentIndex(nextIndex);
              });
            }}
            scrollEventThrottle={16}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            style={styles.scrollView}
          >
            {ONBOARDING_SLIDES.map((slide) => (
              <YStack key={slide.key} width={pageWidth} height="100%" px="$5">
                <YStack flex={1} minHeight={0} ai="center" jc="center">
                  <OnboardingVisual maxHeight={imageMaxHeight} tone={slide.tone} />
                </YStack>
                <YStack
                  height={slideTextHeight}
                  gap={isShortViewport ? '$2' : '$3'}
                  jc="flex-start"
                  px="$3"
                  pt={isShortViewport ? '$1' : '$2'}
                >
                  <Text
                    fontSize={isShortViewport ? 21 : 23}
                    fontWeight="700"
                    color="#1F2937"
                    textAlign="center"
                    lineHeight={isShortViewport ? 27 : 30}
                  >
                    {slide.title}
                  </Text>
                  <Text
                    fontSize={isShortViewport ? 14 : 15}
                    color="#6B7280"
                    textAlign="center"
                    lineHeight={isShortViewport ? 21 : 23}
                  >
                    {slide.subtitle}
                  </Text>
                </YStack>
              </YStack>
            ))}
          </ScrollView>
        </YStack>

        <YStack
          height={bottomControlsHeight}
          gap={isShortViewport ? '$4' : '$6'}
          jc="flex-end"
          px="$8"
        >
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
  scrollContent: {
    flexGrow: 1,
  },
  scrollView: {
    flex: 1,
  },
});
