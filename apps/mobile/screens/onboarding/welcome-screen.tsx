import { Text } from '@money-tracker/ui';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { Animated, Easing, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, YStack } from 'tamagui';

import {
  BrandLockup,
  PrimaryActionButton,
  useReducedMotionPreference,
  WelcomeHero,
} from './components';
import { WELCOME_CONTENT } from './content';

export function WelcomeScreen() {
  const router = useRouter();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reduceMotionEnabled = useReducedMotionPreference();
  const [brandOpacity] = React.useState(() => new Animated.Value(0));
  const [heroOpacity] = React.useState(() => new Animated.Value(0));
  const [copyOpacity] = React.useState(() => new Animated.Value(0));
  const [ctaOpacity] = React.useState(() => new Animated.Value(0));
  const [floatingOffset] = React.useState(() => new Animated.Value(0));
  const isShortViewport = height < 760;
  const heroMaxHeight = Math.min(isShortViewport ? 220 : 270, Math.round(height * 0.34));

  React.useEffect(() => {
    if (reduceMotionEnabled) {
      brandOpacity.setValue(1);
      heroOpacity.setValue(1);
      copyOpacity.setValue(1);
      ctaOpacity.setValue(1);
      floatingOffset.setValue(0);
      return;
    }

    const intro = Animated.stagger(100, [
      createFadeUpAnimation(brandOpacity),
      createFadeUpAnimation(heroOpacity),
      createFadeUpAnimation(copyOpacity),
      createFadeUpAnimation(ctaOpacity),
    ]);

    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatingOffset, {
          toValue: -8,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatingOffset, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    intro.start();
    floatLoop.start();

    return () => {
      intro.stop();
      floatLoop.stop();
    };
  }, [brandOpacity, copyOpacity, ctaOpacity, floatingOffset, heroOpacity, reduceMotionEnabled]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.screen}>
        <YStack
          flex={1}
          paddingBottom={insets.bottom + 108}
          paddingHorizontal={isShortViewport ? '$5' : '$6'}
          paddingTop={isShortViewport ? '$2' : '$4'}
        >
          <Animated.View style={[createAnimatedStyle(brandOpacity, 0), styles.brandWrapper]}>
            <BrandLockup compact={isShortViewport} />
          </Animated.View>

          <YStack alignItems="center" flex={1} justifyContent="center" minHeight={0}>
            <Animated.View style={[createAnimatedStyle(heroOpacity, 16), styles.heroWrapper]}>
              <Animated.View
                style={
                  !reduceMotionEnabled
                    ? {
                        transform: [{ translateY: floatingOffset }],
                      }
                    : undefined
                }
              >
                <WelcomeHero maxHeight={heroMaxHeight} />
              </Animated.View>
            </Animated.View>
          </YStack>

          <Animated.View style={createAnimatedStyle(copyOpacity, 18)}>
            <YStack alignItems="center" gap={isShortViewport ? '$2' : '$3'}>
              <Text
                fontSize={isShortViewport ? 25 : 28}
                fontWeight="700"
                color="#1F2937"
                textAlign="center"
                lineHeight={isShortViewport ? 31 : 34}
              >
                {WELCOME_CONTENT.title}
              </Text>
              <Text
                fontSize={isShortViewport ? 15 : 16}
                color="#6B7280"
                textAlign="center"
                lineHeight={isShortViewport ? 22 : 25}
              >
                {WELCOME_CONTENT.subtitle}
              </Text>
            </YStack>
          </Animated.View>
        </YStack>

        <View style={[styles.bottomBar, { bottom: insets.bottom + 24 }]}>
          <Animated.View style={[createAnimatedStyle(ctaOpacity, 18), styles.fullWidth]}>
            <PrimaryActionButton
              label={WELCOME_CONTENT.cta.label}
              onPress={() => router.push(WELCOME_CONTENT.cta.href)}
            />
          </Animated.View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function createFadeUpAnimation(value: Animated.Value) {
  value.setValue(0);

  return Animated.timing(value, {
    toValue: 1,
    duration: 360,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  });
}

function createAnimatedStyle(value: Animated.Value, offset: number) {
  return {
    opacity: value,
    transform: [
      {
        translateY: value.interpolate({
          inputRange: [0, 1],
          outputRange: [offset, 0],
        }),
      },
    ],
  };
}

const styles = StyleSheet.create({
  bottomBar: {
    left: 24,
    position: 'absolute',
    right: 24,
  },
  fullWidth: {
    width: '100%',
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
  brandWrapper: {
    alignSelf: 'center',
  },
  heroWrapper: {
    alignSelf: 'center',
  },
});
