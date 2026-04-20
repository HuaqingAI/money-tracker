import { Button, Text, TextInput } from '@money-tracker/ui';
import { useState } from 'react';
import { YStack } from 'tamagui';

export default function HomeScreen() {
  const [value, setValue] = useState('');

  return (
    <YStack flex={1} jc="center" ai="center" gap="$4" padding="$4" bg="$surfacePage">
      <Text variant="h1">了然 — Money Tracker</Text>
      <Text variant="caption">Story 0.2 · Tamagui v2 RC 基础组件验证</Text>
      <TextInput
        placeholder="测试输入"
        value={value}
        onChangeText={setValue}
        width={240}
      />
      <Button onPress={() => setValue('')}>确认</Button>
    </YStack>
  );
}
