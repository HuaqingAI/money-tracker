import '../tamagui.config';

import type { Preview } from '@storybook/react';
import type { ReactNode } from 'react';

import { UIProvider } from '../src/provider';

function StorybookProvider({ children }: { children: ReactNode }) {
  return <UIProvider defaultTheme="light">{children}</UIProvider>;
}

const preview: Preview = {
  decorators: [
    (Story) => (
      <StorybookProvider>
        <Story />
      </StorybookProvider>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
