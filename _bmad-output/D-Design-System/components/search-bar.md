# Search Bar [src-001]

**Type:** Form
**Category:** Search
**Purpose:** 搜索输入栏，支持实时过滤和筛选触发
**Library:** Tamagui v2 → `Input` + 自定义容器

---

## Overview

Search Bar 是带有搜索图标、清除按钮的输入容器，用于交易搜索、联系人搜索、分类搜索等场景。

---

## Variants

### sticky — 吸顶搜索栏
- 固定在列表顶部，滚动时保持可见
- 🔍 图标 + 输入框 + 清除按钮(✕)
- 页面：03.1 交易列表

### inline — 内嵌搜索栏
- 嵌入 Bottom Sheet 或页面内
- 用于：分类选择器搜索、联系人搜索
- 页面：06.1 分类选择器, 04.1 联系人搜索

---

## States

- **idle** — 显示 placeholder + 搜索图标
- **focused** — 输入中，显示清除按钮
- **filled** — 有内容，实时过滤结果
- **empty-result** — 搜索无结果，显示提示

---

## Styling

```yaml
colors:
  background: $color.neutral-100
  icon: $color.neutral-400
  text: $color.text-primary
  placeholder: $color.neutral-400
  clear: $color.neutral-500

spacing:
  height: 40
  borderRadius: $radius.5     # 20pt (pill)
  paddingH: $space.3          # 12pt
  iconSize: 18

typography:
  fontSize: $size.3.5         # 14pt
```

---

## Behavior

**Input:** 实时过滤（debounce 300ms）
**Clear (✕):** 清空输入，恢复完整列表
**Cancel:** iOS 风格取消按钮（可选）

---

## Used In

**Pages:** 3+ (03.1, 04.1, 06.2)

---

## Version History

**Created:** 2026-04-11
