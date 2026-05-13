# Component Library Configuration — 了然 (Liaoran)

**Library:** Tamagui v2
**Version:** ^2.x (latest stable)
**License:** MIT (open source core)
**Last Updated:** 2026-05-13

## Installation

```bash
# Expo project
npx create-tamagui@latest

# Or add to existing Expo project
npm install tamagui @tamagui/config

# Icon library — Lucide Icons
npm install @tamagui/lucide-icons lucide-react-native
```

## Library Components Used

This design system uses Tamagui as the base component library.

### Component Mappings

Format: `WDS Component → Tamagui Component`

[To be populated as components are added]

## Customizations

### Theme Configuration

```typescript
import { createTamagui } from 'tamagui'
import { config } from '@tamagui/config/v3'

const liaoran = createTamagui({
  ...config,
  tokens: {
    color: {
      brand50: '#E8F5F1',
      brand100: '#D1EBE3',
      brand200: '#A3D7C7',
      brand300: '#75C3AB',
      brand400: '#47AF8F',
      brand500: '#1A6B5A',
      brand600: '#165A4B',
      brand700: '#0F4F42',
      brand800: '#0A3A31',
      brand900: '#052520',
      success: '#22C55E',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6',
    },
    space: {
      // Spacing scale — 待定义
    },
    size: {
      // Component sizes — 待定义
    },
    radius: {
      // Border radius — 待定义
    },
  },
  themes: {
    light: {
      brandPrimary: '$brand500',
      brandPrimaryHover: '$brand600',
      brandPrimaryPressed: '$brand700',
      brandSubtle: '$brand50',
    },
    dark: {
      // Dark theme — 待定义（如需要）
    },
  },
})

export default liaoran
```

## Brand Assets

| Token | Source |
|-------|--------|
| `logoAppPrimary` | `_bmad-output/D-Design-System/02-Assets/logos/app-logo-house-receipt.svg` |

Runtime apps should export platform-specific PNG assets from the SVG source instead of maintaining independent logo drawings.

## Cross-Platform Strategy

| Platform | Runtime | Notes |
|----------|---------|-------|
| iOS | React Native (Expo) | Tamagui native driver |
| Android | React Native (Expo) | Tamagui native driver |
| Web | Next.js 14+ | Tamagui SSR + compiler optimization |

Tamagui 的编译时优化确保跨平台 token 一致性，同时保持各平台原生性能。

---

**Library documentation:** https://tamagui.dev/docs
