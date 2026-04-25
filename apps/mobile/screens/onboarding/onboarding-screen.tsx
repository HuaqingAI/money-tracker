import { Text } from '@money-tracker/ui';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { startTransition, useCallback } from 'react';
import { BackHandler, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, YStack } from 'tamagui';

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
  const insets = useSafeAreaInsets();
  const pageWidth = Math.max(width, 0);
  const reduceMotionEnabled = useReducedMotionPreference();
  const scrollViewRef = React.useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const isShortViewport = height < 760;
  const topBarHeight = isShortViewport ? 40 : 48;
  const imageFrameHeight = isShortViewport ? 312 : 356;
  const slideTextHeight = isShortViewport ? 132 : 146;
  const bottomClearance = insets.bottom + 132;
  const imageMaxHeight = isShortViewport ? 258 : 292;

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

  const fallbackSlide = ONBOARDING_SLIDES[0];
  if (!fallbackSlide) {
    throw new Error('Onboarding requires at least one slide.');
  }

  const activeSlide = ONBOARDING_SLIDES[currentIndex] ?? fallbackSlide;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.screen}>
        <YStack
          alignItems="flex-end"
          height={topBarHeight}
          justifyContent="center"
          paddingHorizontal="$6"
        >
          <GhostTextButton label={ONBOARDING_ACTION_LABELS.skip} onPress={goToRegister} />
        </YStack>

        <YStack flex={1} minHeight={0} paddingBottom={bottomClearance}>
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
              <YStack
                key={slide.key}
                height="100%"
                paddingHorizontal="$5"
                width={pageWidth}
              >
                <YStack
                  alignItems="center"
                  height={imageFrameHeight}
                  justifyContent="center"
                  flexShrink={0}
                >
                  <OnboardingVisual maxHeight={imageMaxHeight} tone={slide.tone} />
                </YStack>
                <YStack
                  height={slideTextHeight}
                  gap={isShortViewport ? '$2' : '$3'}
                  justifyContent="flex-start"
                  paddingHorizontal="$3"
                  paddingTop={isShortViewport ? '$2' : '$3'}
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
                <YStack flex={1} minHeight={0} />
              </YStack>
            ))}
          </ScrollView>
        </YStack>

        <YStack style={[styles.bottomBar, { bottom: insets.bottom + 24 }]} gap="$4">
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    left: 24,
    position: 'absolute',
    right: 24,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  screen: {
    backgroundColor: '#F9FAFB',
    flex: 1,
    position: 'relative',
  },
  scrollContent: {
    flexGrow: 1,
  },
  scrollView: {
    flex: 1,
  },
});
