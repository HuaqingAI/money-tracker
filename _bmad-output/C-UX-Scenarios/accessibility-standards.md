# Accessibility Specification Standards

**Project:** Money Tracker
**Created:** 2026-04-11
**Author:** Freya (WDS Designer)
**Target:** WCAG 2.1 Level AA
**Platform:** React Native (Expo)

---

## Purpose

本文档定义全局无障碍规范，供所有页面规格和开发实现参照。每个页面规格中不再逐一列出 ARIA 属性，而是通过组件类型映射表统一定义。

---

## React Native Accessibility Property Mapping

React Native 使用 `accessibility*` 属性而非 Web ARIA 属性。以下为映射关系：

| Web ARIA | React Native | 说明 |
|----------|-------------|------|
| `aria-label` | `accessibilityLabel` | 屏幕阅读器朗读的文本 |
| `role` | `accessibilityRole` | 元素角色（button, link, header 等） |
| `aria-hint` | `accessibilityHint` | 操作后果提示 |
| `aria-hidden` | `accessibilityElementsHidden` | 对辅助技术隐藏 |
| `aria-live` | `accessibilityLiveRegion` | 动态内容通知（polite/assertive） |
| `aria-selected` | `accessibilityState.selected` | 选中状态 |
| `aria-disabled` | `accessibilityState.disabled` | 禁用状态 |
| `aria-checked` | `accessibilityState.checked` | 勾选状态 |
| `aria-expanded` | `accessibilityState.expanded` | 展开/折叠状态 |

---

## Component Accessibility Rules

### Buttons

| Property | Rule |
|----------|------|
| `accessibilityRole` | `"button"` |
| `accessibilityLabel` | 使用 OBJECT ID 对应的 ZH 文案（当前语言）。如果按钮只有图标无文字，必须提供描述性 label |
| `accessibilityHint` | 仅在操作后果不明显时提供（如"双击将删除此记录"） |
| `accessibilityState.disabled` | 按钮禁用时设为 `true` |

**示例：**
```
// import-skip-link
accessibilityRole="button"
accessibilityLabel="跳过，先看看"
```

### Text Input / Form Fields

| Property | Rule |
|----------|------|
| `accessibilityRole` | `"text"` 或 `"search"` |
| `accessibilityLabel` | 字段标签文案 |
| `accessibilityHint` | 输入格式提示（如"请输入11位手机号"） |
| `accessibilityState.disabled` | 字段禁用时设为 `true` |

**错误状态关联：**
- 错误消息使用 `accessibilityLiveRegion="assertive"` 立即通知
- 错误字段使用 `accessibilityState.invalid=true` (React Native 0.71+)

### Toggle Switch

| Property | Rule |
|----------|------|
| `accessibilityRole` | `"switch"` |
| `accessibilityLabel` | 开关对应的功能名称 |
| `accessibilityState.checked` | 当前开关状态 |
| `accessibilityValue` | `{ text: "开启" }` 或 `{ text: "关闭" }` |

### Navigation Tab Bar

| Property | Rule |
|----------|------|
| Container `accessibilityRole` | `"tabbar"` |
| Tab Item `accessibilityRole` | `"tab"` |
| `accessibilityState.selected` | 当前激活的 Tab 设为 `true` |
| `accessibilityLabel` | Tab 名称 + Badge 内容（如"交易，3条新记录"） |

### Cards (Clickable)

| Property | Rule |
|----------|------|
| `accessibilityRole` | `"button"` |
| `accessibilityLabel` | 卡片核心信息摘要（如"张三，最近随礼500元"） |
| `accessibilityHint` | "双击查看详情" |

### Images

| Property | Rule |
|----------|------|
| 信息性图片 | `accessibilityLabel` = 描述性文本 |
| 装饰性图片 | `accessibilityElementsHidden={true}` |
| 图标+文字组合 | 图标设为 hidden，文字承载 label |

### Charts & Data Visualization

| Property | Rule |
|----------|------|
| `accessibilityRole` | `"image"` |
| `accessibilityLabel` | 图表数据的文字摘要（如"3月消费趋势：餐饮1280元占比35%，较上月增长12%"） |
| 注意 | 图表必须提供等效的文字描述，不能仅依赖视觉 |

### Slider

| Property | Rule |
|----------|------|
| `accessibilityRole` | `"adjustable"` |
| `accessibilityLabel` | 滑块用途（如"每月减少外卖次数"） |
| `accessibilityValue` | `{ min: 0, max: 30, now: 4 }` |
| `accessibilityActions` | `increment` / `decrement` |

### Modal / Bottom Sheet

| Property | Rule |
|----------|------|
| `accessibilityViewIsModal` | `true`（焦点陷阱在 Modal 内） |
| 关闭按钮 | `accessibilityLabel="关闭"`, `accessibilityRole="button"` |
| 打开时 | 焦点自动移到 Modal 标题或第一个交互元素 |

### Loading States

| Property | Rule |
|----------|------|
| `accessibilityRole` | `"progressbar"` 或无 |
| `accessibilityLabel` | "加载中" |
| `accessibilityLiveRegion` | `"polite"` — 加载完成时通知 |

### Toast / Snackbar

| Property | Rule |
|----------|------|
| `accessibilityLiveRegion` | `"polite"` |
| `accessibilityLabel` | Toast 文案内容 |
| 注意 | Toast 必须被屏幕阅读器朗读，不能仅依赖视觉 |

---

## OBJECT ID to accessibilityLabel Mapping Rule

**规则：** 每个 OBJECT ID 对应的 ZH/EN 文案即为该元素的 `accessibilityLabel`。开发时按以下优先级取值：

1. 如果元素有显式文案（ZH/EN）→ 使用文案作为 label
2. 如果元素只有图标 → 使用 OBJECT ID 对应的语义描述
3. 如果元素是容器 → 不设 label，让子元素各自承载

**命名约定：** `accessibilityLabel` 使用当前语言的用户可见文案，不使用 OBJECT ID 本身。

---

## Focus Management Rules

| 场景 | 焦点行为 |
|------|---------|
| 页面加载完成 | 焦点移到页面标题（H1） |
| Modal 打开 | 焦点移到 Modal 标题 |
| Modal 关闭 | 焦点回到触发元素 |
| Toast 出现 | 通过 liveRegion 通知，焦点不移动 |
| 表单提交错误 | 焦点移到第一个错误字段 |
| 列表加载更多 | 焦点保持在当前位置 |
| Tab 切换 | 焦点移到新 Tab 内容区域 |

---

## Reduced Motion

| 场景 | 降级方案 |
|------|---------|
| 页面转场动画 | 改为淡入淡出（无滑动） |
| Loading 动画（01.6 等） | 改为静态进度条 + 文字百分比 |
| 微交互（按钮反馈等） | 保留，但移除弹跳/缩放效果 |
| 自动轮播 | 停止自动播放，仅手动切换 |

**检测方式：** `AccessibilityInfo.isReduceMotionEnabled()` (React Native)

---

## Color & Contrast

| 要求 | 标准 |
|------|------|
| 正文文字 | 对比度 >= 4.5:1 (WCAG AA) |
| 大号文字 (>= 18pt) | 对比度 >= 3:1 |
| 交互元素边框 | 对比度 >= 3:1 |
| 焦点指示器 | 对比度 >= 3:1，且不仅依赖颜色 |
| 错误状态 | 红色 + 图标/文字，不仅依赖颜色 |
| 成功状态 | 绿色 + 图标/文字，不仅依赖颜色 |

---

## Implementation Checklist (Per Page)

开发每个页面时，对照此清单：

- [ ] 所有按钮有 `accessibilityRole="button"` + `accessibilityLabel`
- [ ] 所有表单字段有 `accessibilityLabel` + 错误关联
- [ ] 所有图片有 `accessibilityLabel` 或标记为装饰性
- [ ] 所有 Toggle 有 `accessibilityRole="switch"` + `accessibilityState`
- [ ] Tab Bar 有正确的 role 和 selected 状态
- [ ] Modal 有 `accessibilityViewIsModal={true}` + 焦点管理
- [ ] 动态内容有 `accessibilityLiveRegion`
- [ ] 图表有文字摘要替代
- [ ] Reduced motion 降级已实现
- [ ] 颜色对比度达标

---

_Generated using WDS Specification Audit Workflow by Freya_
_This document supersedes per-page ARIA definitions — all pages reference this global standard_
