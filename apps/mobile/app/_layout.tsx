import { UIProvider } from '@money-tracker/ui';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <UIProvider defaultTheme="light">
      <Stack />
    </UIProvider>
  );
}
