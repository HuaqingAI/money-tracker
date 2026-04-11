# Button [btn-001]

**Type:** Interactive
**Category:** Action
**Purpose:** 触发主要和次要操作，贯穿全部30个页面
**Library:** Tamagui v2 → `Button` component

---

## Overview

Button 是了然 APP 中最基础的交互组件，用于触发操作、提交表单、导航跳转。所有页面均使用 Button 的不同变体。

设计原则：
- 每个页面最多一个 Primary Button（视觉焦点唯一）
- 文案使用动作导向（"开始体验" 而非 "开始"）
- 触摸目标 ≥ 44pt（无障碍合规）

---

## Variants

### primary — 主要 CTA
- 全宽、品牌色背景、白色文字
- 高度 48pt，圆角 12pt
- 用于页面核心操作（"开始体验"、"微信一键登录"、"免费领取"、"保存"）

### secondary — 次要操作
- 全宽、描边样式（outlined）、品牌色文字
- 高度 44pt，圆角 12pt
- 用于辅助操作（"查看完整报表"、"创建家庭账本"）

### ghost — 幽灵按钮
- 无背景无边框、品牌色或灰色文字
- 用于低优先级操作（"先不了，继续基础版"、"暂时跳过"、"稍后再说"）

### icon — 图标按钮
- 仅图标、无文字标签
- 尺寸 24-32pt
- 用于导航返回（←）、关闭（✕）、消除（×）

### fab — 浮动操作按钮
- 圆形 56pt、品牌色背景、白色图标
- 带阴影 elevation-md
- 仅 Dashboard 页使用（＋ 快速记账入口）

### special-voice — 语音按钮
- 圆形 80pt、品牌色背景
- 长按触发录音，松开提交
- 仅 06.1 手动记账页使用

---

## States

### Required States (all variants):
- **default** — 正常可交互状态
- **disabled** — 不可交互（条件未满足时），降低透明度 0.5

### Optional States:
- **loading** — 异步操作进行中，显示 spinner 替代文字
- **countdown** — 倒计时状态（验证码按钮专用："重新获取(58s)"）
- **pressed** — 按下反馈，轻微缩放 0.97

### State Descriptions:

| State | Background | Text | Border | Opacity | Extra |
|-------|-----------|------|--------|---------|-------|
| default | brand-primary | white | none | 1.0 | — |
| disabled | brand-primary | white | none | 0.5 | pointer-events: none |
| loading | brand-primary | hidden | none | 1.0 | Spinner 居中 |
| pressed | brand-primary-dark | white | none | 1.0 | scale(0.97) |
| countdown | neutral-200 | neutral-500 | none | 1.0 | 倒计时文字 |

---

## Styling

### Visual Properties

| Property | primary | secondary | ghost | icon | fab |
|----------|---------|-----------|-------|------|-----|
| Height | 48pt | 44pt | auto | 32pt | 56pt |
| Width | 100% | 100% | auto | 32pt | 56pt |
| Border Radius | 12pt | 12pt | 8pt | 50% | 50% |
| Background | brand-primary | transparent | transparent | transparent | brand-primary |
| Text Color | white | brand-primary | neutral-500 | neutral-700 | white |
| Border | none | 1px brand-primary | none | none | none |
| Font Size | 16pt | 14pt | 14pt | — | — |
| Font Weight | 600 | 500 | 400 | — | — |
| Shadow | none | none | none | none | elevation-md |

### Design Tokens

```yaml
colors:
  primary:
    background: $color.brand-primary
    text: $color.white
    pressed: $color.brand-primary-dark
  secondary:
    background: transparent
    text: $color.brand-primary
    border: $color.brand-primary
  ghost:
    text: $color.neutral-500
  disabled:
    opacity: 0.5

typography:
  primary:
    fontSize: $size.4    # 16pt
    fontWeight: '600'
  secondary:
    fontSize: $size.3.5  # 14pt
    fontWeight: '500'

spacing:
  paddingHorizontal: $space.4   # 16pt
  paddingVertical: $space.3     # 12pt
  iconGap: $space.2             # 8pt

effects:
  borderRadius:
    default: $radius.3    # 12pt
    pill: $radius.full    # 50%
  shadow:
    fab: $shadow.md
  transition: all 150ms ease
```

### Library Component (Tamagui)

**Base:** `Button` from `tamagui`
**Customizations:**
- 覆盖默认 borderRadius → 12pt（Tamagui 默认较小）
- 添加 pressed scale animation（Tamagui 原生支持 pressStyle）
- FAB 变体需自定义 circular + shadow

```typescript
// Tamagui Button 映射示例
import { styled, Button as TButton } from 'tamagui'

export const Button = styled(TButton, {
  borderRadius: '$3',       // 12pt
  fontWeight: '600',
  pressStyle: { scale: 0.97 },

  variants: {
    variant: {
      primary: {
        backgroundColor: '$brandPrimary',
        color: '$white',
      },
      secondary: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '$brandPrimary',
        color: '$brandPrimary',
      },
      ghost: {
        backgroundColor: 'transparent',
        color: '$neutral500',
        fontWeight: '400',
      },
    },
  } as const,

  defaultVariants: {
    variant: 'primary',
  },
})
```

---

## Behavior

### Interactions

**Tap/Click:**
触发关联操作（表单提交、导航跳转、API 调用等）

**Press (pressStyle):**
- 缩放至 0.97
- 背景色加深一级
- Duration: 100ms

**Long Press (special-voice only):**
- 开始录音
- 脉冲动画 + 红色指示器
- 松开结束录音并提交

**Focus:**
- 蓝色外轮廓 ring（无障碍键盘导航）

### Animations

**FAB 首次加载:**
- Spring bounce 弹入动画
- Duration: 300ms, damping: 15

**Loading Spinner:**
- 旋转动画替代按钮文字
- Duration: infinite, 1s per rotation

---

## Accessibility

**ARIA Attributes:**
- role: button
- aria-label: [按钮文案，图标按钮需显式标注]
- aria-disabled: true [disabled 状态]
- aria-busy: true [loading 状态]
- accessibilityRole: "button" (React Native)

**Keyboard Support:**
- Enter/Space: 触发点击
- Tab: 焦点导航

**Touch Target:**
- 最小 44×44pt（WCAG 2.5.5）
- Icon Button 视觉 24-32pt，触摸区域扩展至 44pt

**Screen Reader:**
播报按钮文案 + 状态（"微信一键登录，按钮"、"保存，已禁用"）

---

## Usage

### When to Use
- 页面核心操作（提交、确认、导航）
- 表单提交
- 触发弹窗或底部面板
- 快速入口（FAB）

### When Not to Use
- 纯文本导航 → 使用 Link 组件
- 状态切换 → 使用 Toggle/Switch
- 选项选择 → 使用 Radio/Checkbox
- Tab 切换 → 使用 Tab 组件

### Best Practices
- 每个视图最多一个 primary variant（视觉焦点唯一）
- 文案使用动作导向（"去开启" 而非 "开启"）
- 异步操作必须展示 loading 状态
- disabled 状态需配合提示说明原因
- FAB 不与底部 Tab Bar 重叠

---

## Used In

**Pages:** 30/30（全部页面）

**Key Instances:**

| Page | OBJECT ID | Variant | Label |
|------|-----------|---------|-------|
| 01.1 | welcome-cta-button | primary | 开始体验 |
| 01.3 | reg-wechat-button | primary | 微信一键登录 |
| 01.3 | reg-phone-submit | primary | 登录 / 注册 |
| 01.3 | reg-phone-get-code | secondary | 获取验证码 |
| 01.3 | reg-agreement-popup-agree | primary | 同意并继续 |
| 01.3 | reg-agreement-popup-disagree | ghost | 不同意 |
| 01.4 | perm-cta-enable | primary | 去开启通知读取 |
| 01.4 | perm-cta-skip | ghost | 暂时跳过 |
| 01.7 | dash-report-cta-button | secondary | 查看完整报表 |
| 01.7 | dash-fab-button | fab | ＋ |
| 02.1 | sub-cta-button | primary | 免费领取 |
| 02.1 | sub-cta-skip | ghost | 先不了，继续基础版 |
| 06.1 | manual-entry-form-save | primary | 保存 |
| 06.1 | manual-entry-voice-button | special-voice | 按住说话 |

---

## Related Components

- Link [待创建] — 文本样式导航
- Toggle [待创建] — 状态切换
- Tab [待创建] — 标签页切换
- Bottom Sheet [待创建] — 按钮常触发底部面板

---

## Version History

**Created:** 2026-04-11
**Last Updated:** 2026-04-11

**Changes:**
- 2026-04-11: 从 30 个 UX 规格页面提取创建，6 个变体

---

## Notes

- brand-primary 具体色值待 design-tokens.md 定义后回填
- special-voice 变体仅 06.1 使用，如后续无复用可考虑独立为专用组件
- countdown 状态仅验证码场景使用，可考虑封装为 CodeButton 子组件
