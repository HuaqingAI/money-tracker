# Prototype Roadmap: Scenario 02 — 大强的家庭共享账本

**Scenario:** 02-dannys-family-shared-ledger
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
| Design Fidelity | Design System Components (沿用 Scenario 01 设计系统) |
| Brand Direction | 沉稳信任系（深青/蓝） |
| Typography | System Default (PingFang SC / Noto Sans CJK) |
| Language | 中文 (zh-CN) |
| Demo Data | 大强一家 — 扩展版 (demo-data.json) |

---

## Pages (3)

| # | Page | Name | Status |
|---|------|------|--------|
| 02.1 | Subscription | 订阅/付费（免费领取） | built |
| 02.2 | Shared Family Ledger | 共享家庭账本 | built |
| 02.3 | Beneficiary Tagging | 受益人标注 | built |

---

## Scenario Context

- **角色:** 大强 Danny（Primary persona）
- **情境:** 用了两周免费版，小芳问"这个月我们到底花了多少"，想让小芳也能看到
- **情感弧线:** 好奇（免费领取）→ 期待（创建共享）→ 安心（同一份事实）→ 满足（标注完成）
- **入口:** Dashboard 上的"邀请家人共享"提示卡片
- **出口:** 受益人标注完成，夫妻看到同一份带"为谁花"维度的报表

## Design Continuity (from Scenario 01)

- 沿用 Scenario 01 的 Tailwind config 和 liaoran 色板
- 沿用 Bottom Tab Bar 组件模式
- 沿用卡片、按钮、过渡动画等 UI 模式
- 导航从 01.7 Dashboard 的提示卡片进入
