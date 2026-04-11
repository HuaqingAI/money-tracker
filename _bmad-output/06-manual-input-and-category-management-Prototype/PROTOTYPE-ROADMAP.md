# Prototype Roadmap: Scenario 06 — 手动记账与分类管理

**Scenario:** 06-manual-input-and-category-management
**Created:** 2026-04-11
**Status:** Setup Complete

---

## Configuration

| Setting | Value |
|---------|-------|
| Device | Mobile-Only (375px-428px) |
| Test Viewports | iPhone SE (375×667), iPhone 14 Pro (393×852), iPhone 14 Pro Max (428×926) |
| Touch Optimized | Yes |
| Hover Interactions | None |
| Design Fidelity | Design System Components |
| Brand Direction | 沉稳信任系（深青/蓝）— 复用 Scenario 01 |
| Typography | System Default (PingFang SC / Noto Sans CJK SC) |
| Language | 中文 (zh-CN) |
| Demo Data | 大强一家 (demo-data.json) — 扩展分类规则/手动记账数据 |

---

## Pages (3)

| # | Page | Name | Status |
|---|------|------|--------|
| 06.1 | Manual Entry | 记一笔 | built |
| 06.2 | Category Management | 分类管理 | built |
| 06.3 | iOS Shortcuts Guide | 快速触发记账 | built |

---

## Scenario Context

- **角色：** 大强 Danny（代表全部用户）
- **情境：** 菜市场花了50块现金，回家补一笔
- **情感弧线：** 想起漏记 → 快速补录 → 确认分类 → 安心
- **核心设计原则：**
  - "记一笔"框架（非"手动记账"），降低心理负担
  - 表单/语音/截图三模式，3秒内完成
  - 自定义数字键盘，避免系统键盘布局跳动
  - 分类准确率正向展示（96.2%）
  - 规则追溯修改默认勾选
