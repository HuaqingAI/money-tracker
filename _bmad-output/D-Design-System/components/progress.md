# Progress Indicator [prg-001]

**Type:** Feedback
**Category:** Status
**Purpose:** 展示进度状态，包括线性进度条、页面指示器、动态计数器
**Library:** Tamagui v2 → 自定义组件

---

## Overview

Progress Indicator 用于向用户传达操作进度或当前位置。在了然 APP 中主要出现在 Onboarding 页面指示、导入处理进度、规则确认进度等场景。

---

## Variants

### dots — 页面指示器
- 3个圆形点，当前页填充+放大，其他空心
- 用于：Onboarding 三页滑动
- ID: `onboarding-progress`

### bar — 线性进度条
- 4pt 高度，品牌色填充，带微光效果
- 平滑动画增长
- 用于：导入处理进度、规则确认进度
- ID: `processing-progress-bar`, `tag-action-bar`

### counter — 动态计数器
- 数字滚动效果，"正在识别 {current}/{total} 笔交易"
- 用于：导入处理页
- ID: `processing-progress-counter`

### circular — 环形进度（预留）
- 环形进度指示
- 用于：AI 覆盖率等统计展示

### inline — 行内进度指示器（🆕）
- 文字 + 进度条一行内展示
- "AI 已覆盖 96.2% 的交易"
- 用于：Dashboard AI 覆盖率
- ID: `dash-ai-coverage`

---

## States

- **idle** — 初始状态（0%）
- **active** — 进行中，动画填充
- **complete** — 100% 完成，可触发完成回调
- **stalled** — 停滞（连接问题），显示提示

---

## Styling

| Property | dots | bar | counter |
|----------|------|-----|---------|
| Height | 8pt (active 10pt) | 4pt | auto |
| Width | 8pt per dot | 100% | auto |
| Color (active) | brand-primary | brand-primary | text-primary |
| Color (inactive) | neutral-200 | neutral-100 (track) | text-secondary |
| Gap | 8pt between dots | — | — |
| Animation | 0.2s scale | smooth fill | number scroll |
| Special | — | 微光扫描效果 | — |

### Design Tokens

```yaml
colors:
  active: $color.brand-primary
  track: $color.neutral-100
  inactive: $color.neutral-200
  text: $color.text-primary

spacing:
  dots:
    size: 8
    activeSize: 10
    gap: $space.2                    # 8pt
  bar:
    height: 4
    borderRadius: 2

effects:
  dots:
    transition: all 200ms ease
  bar:
    transition: width 300ms ease-out
    shimmer: linear-gradient sweep    # 微光效果
  counter:
    numberScroll: 200ms ease
```

### Library Component (Tamagui)

```typescript
import { styled, XStack, YStack } from 'tamagui'

// Dots
const Dot = styled(XStack, {
  width: 8, height: 8,
  borderRadius: '$full',
  backgroundColor: '$neutral200',
  variants: {
    active: {
      true: {
        width: 10, height: 10,
        backgroundColor: '$brandPrimary',
      },
    },
  } as const,
})

// Bar
const ProgressBar = styled(YStack, {
  height: 4,
  borderRadius: 2,
  backgroundColor: '$neutral100',
  overflow: 'hidden',
})

const ProgressFill = styled(YStack, {
  height: '100%',
  borderRadius: 2,
  backgroundColor: '$brandPrimary',
  // width controlled by animated value
})
```

---

## Behavior

**Bar Animation:** 平滑填充，不跳跃
**Dots Transition:** 当前点放大 + 填充色，< 0.2s
**Counter Scroll:** 数字滚动效果，每次 +1
**Stalled:** 30s 无进展显示"处理中，请稍候"提示
**Complete:** 触发完成回调（如跳转 Dashboard）

---

## Accessibility

- role: progressbar
- aria-valuenow: 当前值
- aria-valuemin: 0
- aria-valuemax: 100 (或 total)
- aria-label: "导入进度" / "第 {n} 页，共 3 页"

---

## Used In

**Pages:** 5+ (01.2, 01.6, 01.7, 02.3, 06.2)

---

## Related Components

- Card [crd-001] — category 卡内嵌进度条
- Header [nav-002] — dots 可位于 Header 下方

---

## Version History

**Created:** 2026-04-11
**Last Updated:** 2026-04-11
