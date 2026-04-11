# Component Library Configuration — 了然 (Liaoran)

**Library:** Tamagui v2
**Version:** ^2.x (latest stable)
**License:** MIT (open source core)
**Last Updated:** 2026-04-11

## Installation

```bash
# Expo project
npx create-tamagui@latest

# Or add to existing Expo project
npm install tamagui @tamagui/config
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
      // Primary — 待定义
      // Semantic — 待定义
      // 人情中性色、省钱绿、趋势橙+青
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
      // Light theme — 待定义
    },
    dark: {
      // Dark theme — 待定义（如需要）
    },
  },
})

export default liaoran
```

## Cross-Platform Strategy

| Platform | Runtime | Notes |
|----------|---------|-------|
| iOS | React Native (Expo) | Tamagui native driver |
| Android | React Native (Expo) | Tamagui native driver |
| Web | Next.js 14+ | Tamagui SSR + compiler optimization |

Tamagui 的编译时优化确保跨平台 token 一致性，同时保持各平台原生性能。

---

**Library documentation:** https://tamagui.dev/docs
