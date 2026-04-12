# Header / TopBar [nav-002]

**Type:** Navigation
**Category:** Page Navigation
**Purpose:** 页面顶部导航栏，提供标题、返回、操作按钮
**Library:** Tamagui v2 → 自定义组件（配合 Expo Router Stack Header）

---

## Overview

Header 是页面级导航组件，展示当前页面标题，提供返回导航和右侧操作按钮。根据页面层级不同，分为根页面 Header（无返回键）和子页面 Header（有返回键）。

---

## Variants

### root — 根页面 Header
- 无返回键，大标题或月份选择器
- 用于 Tab 根页面（Dashboard、交易列表、AI、我的）

### stack — 子页面 Header
- 左侧返回箭头（←），居中标题
- 用于从根页面跳转的子页面（设置、详情、报表等）

### modal — Modal Header
- 左侧关闭按钮（✕），居中标题
- 用于全屏 Modal（手动记账、分享预览等）

---

## Key Instances

| Page | OBJECT ID | Variant | Title ZH | Left | Right |
|------|-----------|---------|----------|------|-------|
| 01.7 | dash-month-header | root | {month}月消费 | — | `chevron-left` `chevron-right` 月份切换 |
| 01.8 | report-header | stack | 月度报表 | `chevron-left` | `share-2` |
| 03.1 | txn-list-header | root | 交易 | (条件性 `chevron-left`) | `search` |
| 07.1 | ai-chat-header | root | AI管家 | — | `info` |
| 08.0 | hub-header | root | 我的 | — | — |
| 08.1 | set-topbar | stack | 设置 | `chevron-left` | — |
| 06.1 | manual-entry-header | modal | 记一笔 | `x` | — |
| 02.1 | sub-topbar | stack | — | `chevron-left` | — |

---

## States

- **default** — 正常展示
- **scrolled** — 页面滚动后添加底部阴影/分隔线（视觉层级提升）

---

## Styling

| Property | Value |
|----------|-------|
| Height | 44pt + SafeArea top |
| Background | surface-primary (white) / transparent |
| Title Size | 17pt (居中) / 20pt (root 大标题左对齐) |
| Title Weight | 600 |
| Icon Size | 24pt |
| Icon Color | neutral-700 |
| Border Bottom | scrolled 时 1px neutral-100 |

### Design Tokens

```yaml
colors:
  background: $color.surface-primary
  title: $color.text-primary
  icon: $color.neutral-700
  border: $color.neutral-100

typography:
  title:
    center:
      fontSize: $size.4.25        # 17pt
      fontWeight: '600'
    large:
      fontSize: $size.5           # 20pt
      fontWeight: '700'

spacing:
  height: 44                      # + SafeArea top
  horizontalPadding: $space.4     # 16pt
  iconTouchTarget: 44             # min touch area
```

### Library Component (Tamagui + Expo Router)

```typescript
import { styled, XStack, Text } from 'tamagui'

const Header = styled(XStack, {
  height: 44,
  paddingHorizontal: '$4',
  alignItems: 'center',
  backgroundColor: '$surface1',
  paddingTop: '$safeAreaTop',

  variants: {
    variant: {
      root: { /* 大标题左对齐 */ },
      stack: { justifyContent: 'center' },
      modal: { justifyContent: 'center' },
    },
    scrolled: {
      true: {
        borderBottomWidth: 1,
        borderBottomColor: '$neutral100',
      },
    },
  } as const,
})
```

---

## Behavior

**Back (← arrow):** 返回上一页（stack.goBack）
**Close (✕):** 关闭 Modal，如有未保存内容弹出确认
**Right Actions:** 页面特定操作（搜索、分享、信息等）
**Scroll Shadow:** 页面滚动 > 0 时显示底部分隔线
**Swipe Gesture (Dashboard root):** 左右滑动切换月份（新增，与 ← → 按钮并存），sticky 定位

---

## Accessibility

- role: navigation
- aria-label: "页面导航"
- 返回/关闭按钮: aria-label "返回" / "关闭"
- 触摸区域 ≥ 44×44pt

---

## Used In

**Pages:** 25+ (几乎所有页面)

---

## Related Components

- Button [btn-001] — icon variant 用于返回/关闭/操作
- Bottom Tab Bar [nav-001] — 全局导航搭档

---

## Version History

**Created:** 2026-04-11
**Last Updated:** 2026-04-11
