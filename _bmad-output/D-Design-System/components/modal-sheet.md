# Modal / Bottom Sheet [sht-001]

**Type:** Feedback
**Category:** Overlay
**Purpose:** 覆盖层容器，用于确认对话框、分享预览、选择器等需要用户聚焦的交互
**Library:** Tamagui v2 → `Sheet` / `AlertDialog` / `Dialog`

---

## Overview

Modal/Bottom Sheet 是了然 APP 中处理确认、预览、选择等需要打断主流程的交互容器。根据内容类型和紧急程度，分为底部面板（Sheet）和居中对话框（Dialog）两大形态。

---

## Variants

### alert — 居中确认对话框
- 居中弹出、半透明遮罩
- 标题 + 描述 + 双按钮（确认/取消）
- 用于：解绑确认、放弃记录、退出确认
- 实例：`prof-item-wechat-confirm`, `processing-back-dialog`

### sheet — 底部面板
- 从底部滑入、可下拉关闭
- 可变高度（内容决定）
- 用于：协议确认、分享预览、分类选择
- 实例：`reg-agreement-popup`, `report-share-preview`, `manual-entry-category-picker`

### picker — 选择器面板
- 底部面板变体，固定 60% 屏幕高度
- 搜索栏 + 列表内容
- 用于：分类选择、日期选择
- 实例：`manual-entry-category-picker`

---

## Key Instances

| Page | OBJECT ID | Variant | Title ZH | Buttons |
|------|-----------|---------|----------|---------|
| 01.3 | reg-agreement-popup | sheet | 服务协议与隐私保护 | 同意并继续 / 不同意 |
| 01.6 | processing-back-dialog | alert | AI 正在处理中 | 去首页 / 继续等待 |
| 01.8 | report-share-preview | sheet | — | 微信 / 保存图片 |
| 06.1 | manual-entry-category-picker | picker | 选择分类 | (点选即关闭) |
| 06.1 | (discard confirm) | alert | 放弃记录？ | 确认 / 取消 |
| 08.2 | prof-item-wechat-confirm | alert | 确认解绑微信？ | 解绑 / 取消 |

---

## States

- **closed** — 不可见
- **opening** — 动画进入中
- **open** — 完全展开
- **closing** — 动画退出中

---

## Styling

| Property | alert | sheet | picker |
|----------|-------|-------|--------|
| Position | 居中 | 底部 | 底部 |
| Width | 280pt | 100% | 100% |
| Max Height | auto | 80% screen | 60% screen |
| Border Radius | 16pt | 16pt (top) | 16pt (top) |
| Background | surface-primary | surface-primary | surface-primary |
| Backdrop | rgba(0,0,0,0.5) | rgba(0,0,0,0.5) | rgba(0,0,0,0.5) |
| Handle Bar | — | 4×36pt neutral-200 | 4×36pt neutral-200 |
| Padding | 24pt | 16pt | 16pt |

### Design Tokens

```yaml
colors:
  background: $color.surface-primary
  backdrop: rgba(0, 0, 0, 0.5)
  handle: $color.neutral-200

spacing:
  alert:
    padding: $space.6              # 24pt
    buttonGap: $space.3            # 12pt
  sheet:
    padding: $space.4              # 16pt
    handleWidth: 36
    handleHeight: 4
    handleMarginTop: $space.2      # 8pt

effects:
  borderRadius:
    alert: $radius.4               # 16pt
    sheet: $radius.4               # 16pt (top only)
  animation:
    duration: 300ms
    easing: ease-out
```

### Library Component (Tamagui)

```typescript
import { Sheet, AlertDialog } from 'tamagui'

// Bottom Sheet
<Sheet modal snapPoints={[80]} dismissOnSnapToBottom>
  <Sheet.Overlay />
  <Sheet.Handle />
  <Sheet.Frame padding="$4" borderTopLeftRadius="$4" borderTopRightRadius="$4">
    {children}
  </Sheet.Frame>
</Sheet>

// Alert Dialog
<AlertDialog>
  <AlertDialog.Portal>
    <AlertDialog.Overlay />
    <AlertDialog.Content borderRadius="$4" padding="$6" width={280}>
      <AlertDialog.Title>{title}</AlertDialog.Title>
      <AlertDialog.Description>{description}</AlertDialog.Description>
      <AlertDialog.Cancel>{cancelLabel}</AlertDialog.Cancel>
      <AlertDialog.Action>{confirmLabel}</AlertDialog.Action>
    </AlertDialog.Content>
  </AlertDialog.Portal>
</AlertDialog>
```

---

## Behavior

**Backdrop Tap:** 关闭（alert 可配置为不可关闭）
**Sheet Pull Down:** 下拉关闭
**Animation:** slide-up 300ms ease-out (sheet) / fade+scale 200ms (alert)
**Keyboard:** ESC 关闭

---

## Accessibility

- role: dialog / alertdialog
- aria-modal: true
- 焦点陷阱：打开时焦点锁定在 Modal 内
- 关闭后焦点返回触发元素

---

## Used In

**Pages:** 15+

---

## Related Components

- Button [btn-001] — Modal 内确认/取消按钮
- Card [crd-001] — Sheet 内容容器

---

## Version History

**Created:** 2026-04-11
**Last Updated:** 2026-04-11
