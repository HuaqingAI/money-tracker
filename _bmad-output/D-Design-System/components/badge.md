# Badge [bdg-001]

**Type:** Content
**Category:** Indicator
**Purpose:** 状态标记、标签、数字角标，用于标注新内容、分类属性、计数等
**Library:** Tamagui v2 → 自定义组件

---

## Overview

Badge 是轻量级的视觉标记组件，附着在其他组件上提供额外信息。在了然 APP 中用于未读标记、受益人标签、试用计量等场景。

---

## Variants

### dot — 红点标记
- 8pt 圆形红点，无文字
- 附着在图标右上角
- 用于：AI Tab 未读洞察提示
- ID: AI Tab badge

### label — 文字标签
- 紧凑圆角矩形，文字 + 背景色
- 用于："NEW" 未读标记、"固定支出" 标签
- ID: `insight-card-{id}-badge`

### tag — 可选标签 (Chip)
- 圆角矩形，selected/unselected 两态
- 用于：受益人标签（为自己/为配偶/为孩子/为家庭）
- ID: `tag-chip-self`, `tag-chip-spouse`, `tag-chip-child`, `tag-chip-family`

### counter — 计量标签
- 文字标签变体，显示计数
- 用于：AI 免费体验次数 "免费体验 2/3"
- ID: `ai-chat-header-trial`

---

## States

### dot:
- **visible** — 有未读内容
- **hidden** — 无未读内容

### label:
- **default** — 正常展示

### tag:
- **selected** — 填充色背景 + 白色文字
- **unselected** — 灰色边框 + 灰色文字

---

## Styling

| Property | dot | label | tag (selected) | tag (unselected) | counter |
|----------|-----|-------|----------------|-------------------|---------|
| Height | 8pt | 18pt | 28pt | 28pt | 18pt |
| Padding H | — | 6pt | 12pt | 12pt | 6pt |
| Border Radius | 50% | 4pt | 14pt | 14pt | 4pt |
| Background | semantic-error | brand-primary | variant-color | transparent | neutral-100 |
| Text Color | — | white | white | neutral-500 | text-secondary |
| Font Size | — | 11pt | 13pt | 13pt | 13pt |
| Font Weight | — | 700 | 500 | 400 | 400 |
| Border | — | — | — | 1px neutral-300 | — |

### Tag Color Variants (受益人)

| Tag | ID | Color (selected) |
|-----|----|-------------------|
| 为自己 | tag-chip-self | brand-primary |
| 为配偶 | tag-chip-spouse | pink-500 |
| 为孩子 | tag-chip-child | orange-500 |
| 为家庭 | tag-chip-family | green-500 |

### Design Tokens

```yaml
colors:
  dot: $color.semantic-error
  label:
    background: $color.brand-primary
    text: $color.white
  tag:
    self: $color.brand-primary
    spouse: $color.pink-500
    child: $color.orange-500
    family: $color.green-500
    unselected:
      border: $color.neutral-300
      text: $color.neutral-500
  counter:
    background: $color.neutral-100
    text: $color.text-secondary

typography:
  label:
    fontSize: $size.2.75             # 11pt
    fontWeight: '700'
  tag:
    fontSize: $size.3.25             # 13pt
    fontWeight: '500'

spacing:
  dot: 8
  label:
    paddingH: $space.1.5            # 6pt
    height: 18
  tag:
    paddingH: $space.3              # 12pt
    height: 28
```

---

## Behavior

**Tag Tap:** 切换 selected/unselected 状态
**Dot:** 自动根据数据状态显示/隐藏
**Label:** 静态展示，不可交互

---

## Accessibility

- role: status (dot/label) / checkbox (tag)
- aria-label: 标签内容描述
- tag: aria-checked true/false

---

## Used In

**Pages:** 10+ (01.7, 02.3, 03.1, 07.1, 07.2, 08.0)

---

## Related Components

- Card [crd-001] — Badge 常附着在 Card 上
- Bottom Tab Bar [nav-001] — dot 附着在 AI Tab

---

## Version History

**Created:** 2026-04-11
**Last Updated:** 2026-04-11
