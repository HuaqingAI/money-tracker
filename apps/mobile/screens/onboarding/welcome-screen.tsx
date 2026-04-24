import { Text } from '@money-tracker/ui';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { YStack } from 'tamagui';

import {
  BrandLockup,
  PrimaryActionButton,
  useReducedMotionPreference,
  WelcomeHero,
} from './components';
import { WELCOME_CONTENT } from './content';

export function WelcomeScreen() {
  const router = useRouter();
  const reduceMotionEnabled = useReducedMotionPreference();
  const [brandOpacity] = React.useState(() => new Animated.Value(0));
  const [heroOpacity] = React.useState(() => new Animated.Value(0));
  const [copyOpacity] = React.useState(() => new Animated.Value(0));
  const [ctaOpacity] = React.useState(() => new Animated.Value(0));
  const [floatingOffset] = React.useState(() => new Animated.Value(0));

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
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <YStack flex={1} bg="$surfacePage" px="$4" pt="$4" pb="$4">
        <Animated.View style={createAnimatedStyle(brandOpacity, 0)}>
          <BrandLockup />
        </Animated.View>

        <YStack flex={1} ai="center" jc="center">
          <Animated.View style={createAnimatedStyle(heroOpacity, 16)}>
            <Animated.View
              style={
                !reduceMotionEnabled
                  ? {
                      transform: [{ translateY: floatingOffset }],
                    }
                  : undefined
              }
            >
              <WelcomeHero />
            </Animated.View>
          </Animated.View>
        </YStack>

        <YStack gap="$6" pb="$2">
          <Animated.View style={createAnimatedStyle(copyOpacity, 18)}>
            <YStack gap="$3" ai="center">
              <Text
                variant="h1"
                color="$neutral900"
                textAlign="center"
                lineHeight={32}
              >
                {WELCOME_CONTENT.title}
              </Text>
              <Text
                variant="body"
                color="$neutral500"
                textAlign="center"
                lineHeight={24}
              >
                {WELCOME_CONTENT.subtitle}
              </Text>
            </YStack>
          </Animated.View>

          <Animated.View style={createAnimatedStyle(ctaOpacity, 18)}>
            <PrimaryActionButton
              label={WELCOME_CONTENT.cta.label}
              onPress={() => router.push(WELCOME_CONTENT.cta.href)}
            />
          </Animated.View>
        </YStack>
      </YStack>
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
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
});
