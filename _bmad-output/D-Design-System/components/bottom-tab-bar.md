# Bottom Tab Bar [nav-001]

**Type:** Navigation
**Category:** Global Navigation
**Purpose:** APP 全局底部导航栏，4栏固定展示，贯穿所有主页面
**Library:** Tamagui v2 → 自定义组件（配合 Expo Router Tab Navigator）

---

## Overview

Bottom Tab Bar 是了然 APP 的全局导航骨架，固定在屏幕底部，提供首页、交易、AI、我的四个一级入口。除 Onboarding 流程（01.1-01.6）和全屏 Modal 外，所有页面均展示。

---

## Tabs

| Index | ID | Label ZH | Label EN | Icon (Lucide) | Active Page |
|-------|-----|----------|----------|---------------|-------------|
| 0 | tabbar-home | 首页 | Home | `home` | 01.7 Dashboard |
| 1 | tabbar-transactions | 交易 | Transactions | `receipt` | 03.1 Transaction List |
| 2 | tabbar-ai | AI | AI | `bot` | 07.1 AI Chat |
| 3 | tabbar-me | 我的 | Me | `user` | 08.0 My Hub |

---

## States

- **active** — 图标填充色 + 品牌色文字，当前所在 Tab（Lucide: filled variant 或 strokeWidth 加粗）
- **inactive** — 图标线框 + neutral-400 文字（Lucide: 默认 strokeWidth 2）
- **badge** — AI Tab 右上角红点，有未读洞察时显示

---

## Styling

| Property | Value |
|----------|-------|
| Height | 56pt + SafeArea bottom |
| Background | surface-primary (white) |
| Border Top | 1px neutral-100 |
| Shadow | elevation-xs (subtle) |
| Icon Size | 24pt |
| Label Size | 10pt |
| Label Weight | 500 (active: 600) |
| Active Color | brand-primary |
| Inactive Color | neutral-400 |
| Badge | 8pt red dot, offset top-right of icon |

### Design Tokens

```yaml
colors:
  active: $color.brand-primary
  inactive: $color.neutral-400
  background: $color.surface-primary
  border: $color.neutral-100
  badge: $color.semantic-error    # red dot

typography:
  label:
    fontSize: $size.2.5           # 10pt
    fontWeight: '500'
    activeWeight: '600'

spacing:
  height: 56                      # + SafeArea
  iconSize: 24
  iconLabelGap: $space.1          # 4pt
  badgeSize: 8

effects:
  borderTop: 1px solid $color.neutral-100
  shadow: $shadow.xs
```

### Library Component (Tamagui + Expo Router)

```typescript
// 基于 Expo Router Tabs + Tamagui 样式
import { Tabs } from 'expo-router'
import { styled, XStack, YStack, Text } from 'tamagui'

// Tab Bar 容器
const TabBarContainer = styled(XStack, {
  height: 56,
  backgroundColor: '$surface1',
  borderTopWidth: 1,
  borderTopColor: '$neutral100',
  paddingBottom: '$safeAreaBottom',
})

// 单个 Tab Item
const TabItem = styled(YStack, {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$1',

  variants: {
    active: {
      true: { /* brand color */ },
      false: { /* neutral color */ },
    },
  } as const,
})
```

---

## Behavior

### Interactions

**Tap:** 切换到对应 Tab 的根页面
**Long Press:** 无
**Badge:** AI Tab 有未读洞察时显示红点，进入后清除

### Visibility Rules

| 场景 | Tab Bar 显示 |
|------|-------------|
| Onboarding 流程 (01.1-01.6) | 隐藏 |
| 全屏 Modal / Bottom Sheet | 隐藏 |
| 键盘弹起 (07.1 Chat) | 隐藏 |
| 其他所有页面 | 显示 |

---

## Accessibility

- role: tablist (容器) / tab (每个 item)
- aria-selected: true/false
- aria-label: Tab 名称
- 最小触摸区域: 每个 Tab 宽度 = 屏幕宽/4, 高度 56pt

---

## Used In

**Pages:** 20+ (所有主页面)

---

## Related Components

- Header [nav-002] — 页面顶部导航
- Badge [bdg-001] — AI Tab 未读红点

---

## Version History

**Created:** 2026-04-11
**Last Updated:** 2026-04-11

**Changes:**
- 2026-04-11: 从 UX 规格提取创建
