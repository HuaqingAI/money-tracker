# Toast [tst-001]

**Type:** Feedback
**Category:** Notification
**Purpose:** 轻量级操作反馈，自动消失的浮动提示
**Library:** Tamagui v2 → `Toast` component

---

## Overview

Toast 用于操作成功/失败的即时反馈，不打断用户流程。浮动在页面顶部或底部，自动消失。

---

## Variants

### success — 成功提示
- Lucide `check-circle` (success 色) + 文字 + 可选操作按钮
- 自动消失 2s
- 实例："已记录 ¥50.00 食品·生鲜"

### error — 错误提示
- Lucide `alert-circle` (error 色) + 文字
- 自动消失 3s

### info — 信息提示
- Lucide `info` (brand 色) + 文字
- 自动消失 2.5s
- 实例："已分享，有据可说"（01.8 分享成功）

---

## Key Instances

| Page | OBJECT ID | Variant | Content |
|------|-----------|---------|---------|
| 06.1 | manual-entry-success | success | 已记录 ¥{amount} {category} |
| 01.8 | report-share-success | info | 已分享，有据可说 |
| 08.1 | settings-save-success | success | 设置已保存 |

---

## Styling

| Property | Value |
|----------|-------|
| Position | 顶部浮动，SafeArea 下方 |
| Height | auto (单行 44pt) |
| Width | 屏幕宽 - 32pt padding |
| Border Radius | 12pt |
| Background | surface-primary + elevation-md |
| Icon Size | 20pt |
| Text Size | 14pt |
| Auto Dismiss | 2-3s |
| Animation | slide-down 200ms + fade-out |

### Design Tokens

```yaml
colors:
  success:
    icon: $color.semantic-success
  error:
    icon: $color.semantic-error
  info:
    icon: $color.brand-primary
  background: $color.surface-primary
  text: $color.text-primary

effects:
  shadow: $shadow.md
  borderRadius: $radius.3
  animation: slideDown 200ms ease-out
```

### Library Component (Tamagui)

```typescript
import { Toast, useToastState } from '@tamagui/toast'

<Toast duration={2000} enterStyle={{ y: -20, opacity: 0 }}>
  <Toast.Title>已记录 ¥50.00</Toast.Title>
  <Toast.Action altText="调整分类">
    <Button variant="ghost" size="sm">调整分类</Button>
  </Toast.Action>
</Toast>
```

---

## Behavior

**Auto Dismiss:** 2-3s 后自动消失
**Action Button:** 可选内联操作（如"调整分类"跳转 06.2）
**Swipe:** 上滑可提前关闭
**Queue:** 多个 Toast 排队展示，不叠加

---

## Accessibility

- role: status
- aria-live: polite
- 屏幕阅读器播报内容

---

## Used In

**Pages:** 5+ (01.8, 06.1, 08.1, 02.2, 06.2)

---

## Version History

**Created:** 2026-04-11
