# Tooltip / Popover [pop-001]

**Type:** Feedback
**Category:** Overlay
**Purpose:** 轻量浮动提示，用于图表数据点详情、功能说明、辅助信息展示
**Library:** Tamagui v2 → `Popover` / 自定义浮层

---

## Overview

Tooltip 是锚定在触发元素附近的浮动信息层，用于展示不适合常驻在界面上的补充信息。在了然 APP 中主要用于图表交互和功能说明。

---

## Variants

### chart-tip — 图表数据提示
- 深色背景（neutral-900）+ 白色文字
- 三角指针指向数据点
- 内容：金额 + 月份/分类 + 百分比
- 触摸数据点显示，移开消失
- 页面：03.3 趋势图, 03.4 雷达图, 01.8 饼图

### info-tip — 功能说明提示
- 浅色背景 + 正常文字
- 点击 Lucide `info` 图标触发
- 内容：功能解释文字
- 点击外部关闭
- 页面：07.1 AI Chat, 08.1 Settings

---

## States

- **hidden** — 不可见
- **visible** — 显示，带 fade-in 动画
- **positioned** — 自动定位（上/下/左/右，避免溢出屏幕）

---

## Styling

### chart-tip

```yaml
colors:
  background: $color.neutral-900
  text: $color.white
  pointer: $color.neutral-900

spacing:
  padding: 8pt 12pt
  borderRadius: $radius.md          # 8pt
  pointerSize: 6pt
  maxWidth: 200pt

typography:
  fontSize: $size.3.25              # 13pt
  fontWeight: '500'

effects:
  animation: fade 150ms ease
  shadow: $shadow.md
```

### info-tip

```yaml
colors:
  background: $color.surface-primary
  text: $color.text-primary
  border: $color.neutral-200

spacing:
  padding: 12pt 16pt
  borderRadius: $radius.lg          # 12pt
  maxWidth: 260pt

effects:
  animation: fade + scale 200ms ease
  shadow: $shadow.lg
```

### Library Component (Tamagui)

```typescript
import { Popover } from 'tamagui'

// Info Tooltip
<Popover>
  <Popover.Trigger>
    <Button icon={Info} variant="icon" />
  </Popover.Trigger>
  <Popover.Content
    borderRadius="$3"
    padding="$3"
    elevation="$4"
    enterStyle={{ y: -4, opacity: 0 }}
    animation="quick"
  >
    <Popover.Arrow />
    <Text>{tooltipContent}</Text>
  </Popover.Content>
</Popover>

// Chart Tooltip — 通常由图表库内置
// victory-native: VictoryTooltip
// react-native-gifted-charts: pointerConfig
```

---

## Behavior

**Chart Tip:** 触摸/hover 数据点显示，移开 300ms 后消失
**Info Tip:** 点击 `info` 图标 toggle 显示/隐藏
**Auto Position:** 自动检测屏幕边界，调整弹出方向
**Dismiss:** 点击外部区域关闭

---

## Accessibility

- role: tooltip
- aria-describedby: 关联触发元素
- 键盘：Escape 关闭
- 屏幕阅读器：播报 tooltip 内容

---

## Used In

**Pages:** 4+ (01.8, 03.3, 03.4, 07.1)

| Page | Variant | Trigger | Content |
|------|---------|---------|---------|
| 01.8 | chart-tip | 饼图扇区触摸 | 分类名 + ¥金额 + 百分比 |
| 03.3 | chart-tip | 折线数据点触摸 | ¥金额 + 月份 |
| 03.4 | chart-tip | 雷达顶点触摸 | 维度名 + 评分 + 占比 |
| 07.1 | info-tip | `info` 图标点击 | AI 功能说明 |

---

## Related Components

- Chart [chr-001] — chart-tip 是图表的交互伴侣
- Button [btn-001] — icon variant 触发 info-tip
- Modal [sht-001] — 更重量级的信息展示

---

## Version History

**Created:** 2026-04-11
