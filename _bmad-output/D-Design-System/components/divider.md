# Divider [div-001]

**Type:** Layout
**Category:** Separator
**Purpose:** 视觉分隔线，用于列表项和内容区块之间
**Library:** Tamagui v2 → `Separator` component

---

## Variants

### full — 全宽分隔线
- 左右无缩进，1px neutral-100
- 用于：Section 之间

### inset — 缩进分隔线
- 左侧缩进（对齐图标右侧），1px neutral-100
- 用于：列表项之间（交易列表、设置列表）

---

## Styling

```yaml
colors:
  line: $color.neutral-100
spacing:
  height: 1                    # 0.5-1px
  insetLeft: 60                # 对齐 icon+gap
```

### Library Component

```typescript
import { Separator } from 'tamagui'
<Separator borderColor="$neutral100" />
```

---

## Used In

**Pages:** 6+ (03.1, 04.1, 06.1, 08.0, 08.1, 08.2)

---

## Version History

**Created:** 2026-04-11
