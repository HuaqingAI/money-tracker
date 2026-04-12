# Tab / Segment [tab-001]

**Type:** Navigation
**Category:** Page-Level Navigation
**Purpose:** 页面内顶部 Tab 切换，用于同一页面内的内容分区
**Library:** Tamagui v2 → `Tabs` component

---

## Overview

Tab/Segment 是页面内的内容切换组件，用于在同一页面内组织平行内容区域。支持点击和左右滑动切换。

---

## Variants

### segment — 等宽分段控件
- 2-3 个等宽 Tab，底部滑动指示器
- 用于：注册页（微信/手机号）、AI页（对话/洞察）
- ID: `reg-method`, `ai-tab-switcher`

### mode — 模式切换
- 3 个等宽 Tab，高亮当前模式
- 用于：手动记账（语音/表单/截图）
- ID: `manual-entry-modes`

---

## Key Instances

| Page | OBJECT ID | Tabs | Default Active |
|------|-----------|------|----------------|
| 01.3 | reg-method | 微信 / 手机号 | 微信 |
| 07.1 | ai-tab-switcher | 对话 / 洞察 | 对话 |
| 06.1 | manual-entry-modes | 语音 / 表单 / 截图 | 表单 |

---

## States

- **active** — 品牌色文字 + 底部指示器（2pt 品牌色）
- **inactive** — neutral-500 文字，无指示器

---

## Styling

| Property | Value |
|----------|-------|
| Height | 44pt |
| Background | surface-primary |
| Tab Width | 等分（100% / tab count） |
| Active Text | brand-primary, 600 weight |
| Inactive Text | neutral-500, 400 weight |
| Font Size | 15pt |
| Indicator | 2pt height, brand-primary, 底部 |
| Indicator Animation | spring, 200ms |

### Design Tokens

```yaml
colors:
  active: $color.brand-primary
  inactive: $color.neutral-500
  indicator: $color.brand-primary
  background: $color.surface-primary

typography:
  fontSize: $size.3.75               # 15pt
  activeWeight: '600'
  inactiveWeight: '400'

spacing:
  height: 44
  indicatorHeight: 2

effects:
  indicatorTransition: spring 200ms
```

### Library Component (Tamagui)

```typescript
import { Tabs } from 'tamagui'

<Tabs defaultValue="tab1" orientation="horizontal">
  <Tabs.List>
    <Tabs.Tab value="tab1"><Tabs.Tab.Text>微信</Tabs.Tab.Text></Tabs.Tab>
    <Tabs.Tab value="tab2"><Tabs.Tab.Text>手机号</Tabs.Tab.Text></Tabs.Tab>
  </Tabs.List>
  <Tabs.Content value="tab1">{/* content */}</Tabs.Content>
  <Tabs.Content value="tab2">{/* content */}</Tabs.Content>
</Tabs>
```

---

## Behavior

**Tap:** 切换到对应 Tab 内容
**Swipe:** 左右滑动切换（ai-tab-switcher 支持）
**Indicator:** 跟随手势平滑滑动

---

## Accessibility

- role: tablist (容器) / tab (每个 item) / tabpanel (内容)
- aria-selected: true/false
- 键盘：← → 切换 Tab

---

## Used In

**Pages:** 3 (01.3, 06.1, 07.1)

---

## Related Components

- Header [nav-002] — Tab 通常位于 Header 下方
- Bottom Tab Bar [nav-001] — 全局导航 vs 页面内导航

---

## Version History

**Created:** 2026-04-11
**Last Updated:** 2026-04-11
