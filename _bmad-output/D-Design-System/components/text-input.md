# Text Input [inp-001]

**Type:** Form
**Category:** Input
**Purpose:** 文本/数字输入框，覆盖手机号、验证码、金额、备注、搜索、聊天等场景
**Library:** Tamagui v2 → `Input` component

---

## Overview

Text Input 是了然 APP 的表单输入基础组件。根据输入内容类型不同，衍生出多个变体，各自有独立的键盘类型、校验规则和视觉样式。

---

## Variants

### phone — 手机号输入
- "+86" 前缀标签 + 11位数字输入
- 数字键盘，自动格式化（3-4-4）
- ID: `reg-phone-input`

### code — 验证码输入
- 6个独立数字格子，自动聚焦下一格
- 填满自动提交
- ID: `reg-phone-code-input`

### amount — 金额输入
- "¥" 前缀，36pt 大号数字
- 自定义数字键盘（内嵌，非系统键盘）
- 最大 999,999.99，2位小数
- 自动聚焦
- ID: `manual-entry-form-amount`

### text — 普通文本
- 单行文本输入，placeholder 提示
- 用于备注、搜索等
- ID: `manual-entry-form-note`, `manual-entry-category-picker-search`

### chat — 聊天输入
- 多行（max 4行），500字符限制
- 发送按钮（右侧）
- placeholder: "问问AI管家..."
- ID: `ai-chat-input-field`

---

## States

- **default** — 空输入，显示 placeholder
- **focused** — 输入中，底部边框高亮品牌色
- **filled** — 有内容，正常显示
- **error** — 校验失败，底部边框红色 + 错误提示文字
- **disabled** — 不可输入，降低透明度

---

## Styling

| Property | phone | code | amount | text | chat |
|----------|-------|------|--------|------|------|
| Height | 48pt | 48pt | 64pt | 44pt | auto (max 4行) |
| Font Size | 16pt | 24pt | 36pt | 14pt | 14pt |
| Font Weight | 400 | 600 | 700 | 400 | 400 |
| Border | bottom 2px | per-cell border | bottom 2px | bottom 1px | rounded container |
| Border Radius | 0 | 8pt (each cell) | 0 | 0 | 20pt |
| Keyboard | numeric | numeric | custom | default | default |

### Design Tokens

```yaml
colors:
  border:
    default: $color.neutral-200
    focused: $color.brand-primary
    error: $color.semantic-error
  text: $color.text-primary
  placeholder: $color.neutral-400
  prefix: $color.text-secondary       # ¥, +86

typography:
  default:
    fontSize: $size.3.5               # 14pt
  amount:
    fontSize: $size.9                  # 36pt
    fontWeight: '700'
  code:
    fontSize: $size.6                  # 24pt
    fontWeight: '600'

spacing:
  height:
    default: 44
    large: 48
    amount: 64
  paddingHorizontal: $space.3          # 12pt
```

### Library Component (Tamagui)

```typescript
import { styled, Input as TInput } from 'tamagui'

export const Input = styled(TInput, {
  borderWidth: 0,
  borderBottomWidth: 2,
  borderBottomColor: '$neutral200',
  fontSize: '$3.5',
  paddingHorizontal: '$3',
  focusStyle: { borderBottomColor: '$brandPrimary' },

  variants: {
    variant: {
      amount: {
        fontSize: 36,
        fontWeight: '700',
        height: 64,
        textAlign: 'center',
      },
      chat: {
        borderBottomWidth: 0,
        borderRadius: '$5',
        backgroundColor: '$surface2',
        paddingHorizontal: '$4',
        multiline: true,
      },
    },
  } as const,
})
```

---

## Behavior

**Focus:** 底部边框变品牌色，键盘弹起
**Blur:** 恢复默认边框色
**Code Auto-Submit:** 6位填满自动触发验证
**Amount Custom Keyboard:** 内嵌数字键盘避免布局跳动
**Chat Send:** 右侧发送按钮，空内容时禁用

---

## Accessibility

- role: textbox
- aria-label: 输入用途描述
- aria-invalid: true (error 状态)
- aria-describedby: 错误提示文字 ID

---

## Used In

**Pages:** 8+ (01.3, 06.1, 06.2, 07.1, 03.1 搜索, 04.1 搜索)

---

## Related Components

- Button [btn-001] — 发送/提交按钮
- Modal [sht-001] — 分类选择器

---

## Version History

**Created:** 2026-04-11
**Last Updated:** 2026-04-11
