# Filter Chip [chp-001]

**Type:** Interactive
**Category:** Filter
**Purpose:** 水平可滚动的筛选标签，用于分类过滤和快捷金额选择
**Library:** Tamagui v2 → 自定义组件

---

## Variants

### filter — 筛选 Chip
- 水平滚动容器
- Selected: 品牌色背景 + 白色文字
- Unselected: neutral-100 背景 + neutral-700 文字
- 支持 emoji/icon 前缀
- 用于：交易列表分类筛选、趋势图时间范围
- 页面：03.1, 03.3

### amount — 快捷金额 Chip
- 预设金额选项（¥200, ¥500, ¥800, ¥1000）
- 选中态同 filter
- 用于：人情账快捷金额
- 页面：04.1

---

## States

- **selected** — 品牌色背景 + 白色文字
- **unselected** — neutral-100 背景 + neutral-700 文字
- **count** — 右侧显示匹配数量（可选）

---

## Styling

```yaml
colors:
  selected:
    background: $color.brand-primary
    text: $color.white
  unselected:
    background: $color.neutral-100
    text: $color.neutral-700

spacing:
  height: 32
  paddingH: $space.3           # 12pt
  gap: $space.2                # 8pt (chips 间距)
  borderRadius: $radius.full   # pill shape

typography:
  fontSize: $size.3.25         # 13pt
  fontWeight: '500'
```

### Library Component

```typescript
import { styled, XStack, Text } from 'tamagui'

const Chip = styled(XStack, {
  height: 32, paddingHorizontal: '$3',
  borderRadius: '$full', alignItems: 'center',
  variants: {
    selected: {
      true: { backgroundColor: '$brandPrimary' },
      false: { backgroundColor: '$neutral100' },
    },
  } as const,
})
```

---

## Used In

**Pages:** 3+ (03.1, 03.3, 04.1)

---

## Version History

**Created:** 2026-04-11
