import { Stack } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'welcome',
};
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: '#F9FAFB',
        },
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
