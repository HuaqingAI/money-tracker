# Toggle / Switch [swi-001]

**Type:** Form
**Category:** Control
**Purpose:** 二态/三态开关，用于设置项的启用/禁用
**Library:** Tamagui v2 → `Switch` component

---

## Overview

Toggle 用于设置页面中的偏好控制，支持标准二态（ON/OFF）和特殊三态（Off/On/Follow System）。

---

## Variants

### standard — 标准开关
- ON/OFF 二态
- 用于：通知开关、功能开关
- ID: `set-notif-insights`, `set-notif-report`, `set-notif-gift`

### tristate — 三态开关
- Off → On → Follow System 循环
- 用于：深色模式
- ID: `set-item-darkmode`

---

## States

- **on** — 品牌色背景，滑块右侧
- **off** — neutral-200 背景，滑块左侧
- **disabled** — 降低透明度，不可交互（系统权限未开启时）
- **system** — 三态专用，显示"跟随系统"标签

---

## Styling

| Property | ON | OFF | Disabled |
|----------|-----|-----|----------|
| Track BG | brand-primary | neutral-200 | neutral-100 |
| Thumb | white | white | neutral-300 |
| Width | 51pt | 51pt | 51pt |
| Height | 31pt | 31pt | 31pt |
| Thumb Size | 27pt | 27pt | 27pt |
| Opacity | 1.0 | 1.0 | 0.5 |

### Design Tokens

```yaml
colors:
  on: $color.brand-primary
  off: $color.neutral-200
  thumb: $color.white
  disabled: $color.neutral-100

spacing:
  width: 51
  height: 31
  thumbSize: 27

effects:
  transition: all 200ms ease
  borderRadius: $radius.full
```

### Library Component (Tamagui)

```typescript
import { Switch } from 'tamagui'

<Switch size="$4" checked={value} onCheckedChange={onChange}>
  <Switch.Thumb animation="quick" />
</Switch>
```

---

## Behavior

**Tap:** 切换状态，静默保存（无 Toast）
**Disabled:** 系统通知权限未开启时，点击跳转系统设置
**Tristate:** 循环切换 Off → On → System

---

## Accessibility

- role: switch
- aria-checked: true/false
- aria-label: 设置项名称

---

## Used In

**Pages:** 2+ (08.1, 01.4)

| Page | OBJECT ID | Variant | Label |
|------|-----------|---------|-------|
| 08.1 | set-notif-insights | standard | 洞察推送 |
| 08.1 | set-notif-report | standard | 月度报表提醒 |
| 08.1 | set-notif-gift | standard | 人情提醒 |
| 08.1 | set-item-darkmode | tristate | 深色模式 |

---

## Version History

**Created:** 2026-04-11
