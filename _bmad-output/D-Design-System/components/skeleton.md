# Skeleton [skn-001]

**Type:** Feedback
**Category:** Loading
**Purpose:** 骨架屏占位，在数据加载时提供内容结构预览，减少感知等待时间
**Library:** Tamagui v2 → 自定义组件（`MotiView` 动画）

---

## Overview

Skeleton 在数据未就绪时展示与真实内容形状匹配的灰色占位块，配合脉冲动画暗示"正在加载"。比 spinner 更优雅，因为用户能预判即将出现的内容结构。

---

## Variants

### card — 卡片骨架
- 匹配 Card 组件的尺寸和布局
- 用于：Dashboard metric 卡、category 卡、insight 卡
- 页面：01.7, 07.2

### list-item — 列表项骨架
- 匹配 transaction/contact 列表项的 icon + text + amount 布局
- 固定高度 64pt（transaction）/ 76pt（contact）
- 页面：03.1, 04.1

### chart — 图表骨架
- 匹配图表区域的矩形占位
- 高度与对应图表一致（180-240pt）
- 页面：01.8, 03.3, 03.4

### text — 文字行骨架
- 单行/多行文字占位条
- 宽度随机（60%-100%）模拟自然文本
- 通用

---

## States

- **pulsing** — 默认态，neutral-200 → neutral-100 脉冲循环
- **static** — 无动画（低性能设备降级）

---

## Styling

```yaml
colors:
  base: $color.neutral-200
  highlight: $color.neutral-100

effects:
  animation: pulse 1.5s ease-in-out infinite
  borderRadius: 匹配目标组件的 borderRadius

shapes:
  circle: border-radius 50%    # Avatar 占位
  rect: border-radius 8pt      # 卡片/图表占位
  line: border-radius 4pt, height 12-16pt  # 文字行占位
```

### Library Component

```typescript
import { styled, YStack } from 'tamagui'
import { MotiView } from 'moti'

const Skeleton = ({ width, height, circle }) => (
  <MotiView
    from={{ opacity: 0.5 }}
    animate={{ opacity: 1 }}
    transition={{ loop: true, duration: 1500, type: 'timing' }}
    style={{
      width, height,
      borderRadius: circle ? height / 2 : 8,
      backgroundColor: '#E5E7EB',
    }}
  />
)
```

---

## Behavior

**Pulse Animation:** 1.5s infinite，opacity 0.5 ↔ 1.0
**Transition:** 数据就绪后 fade-out 200ms，真实内容 fade-in
**Count:** 列表骨架默认渲染 5 条占位项

---

## Accessibility

- aria-busy: true
- aria-label: "内容加载中"
- 屏幕阅读器播报"正在加载"

---

## Used In

**Pages:** 5+ (01.7, 01.8, 03.1, 03.3, 07.2)

---

## Related Components

- Card [crd-001] — card 骨架匹配 Card 布局
- Chart [chr-001] — chart 骨架匹配图表尺寸
- Progress [prg-001] — 进度条是另一种加载反馈

---

## Version History

**Created:** 2026-04-11
