# Prototype Roadmap: Scenario 07 — AI管家智能层

**Scenario:** 07-ai-butler-intelligence
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
| Typography | System Default (PingFang SC / Noto Sans CJK) |
| Language | 中文 (zh-CN) |
| Demo Data | 大强一家 (demo-data.json) — 扩展 AI 对话/洞察/建议/模拟数据 |

---

## Pages (4)

| # | Page | Name | Status |
|---|------|------|--------|
| 07.1 | AI Chat | AI对话 | built |
| 07.2 | Insights Feed | 洞察推送 | built |
| 07.3 | Optimization Suggestions | 优化建议 | built |
| 07.4 | Simulation Comparison | 消费模拟/同类对比 | built |

---

## Scenario Context

- **角色：** 大强 Danny（代表全部用户）
- **情境：** 用了3个月后，周日下午在家，想知道"少吃外卖能省多少"
- **情感弧线：** 好奇提问 → 量化惊喜 → 洞察发现 → 行动决策 → 对比安心
- **核心设计原则：**
  - AI 回答基于真实数据，每个数字都是可点击的数据锚点
  - 免费用户 3 次对话计量（渐进式 Paywall）
  - 洞察推送模糊 Paywall（高斯模糊 8pt）
  - 优化建议正向"省钱潜力"框架
  - 消费模拟滑块带触觉反馈
  - 同类对比用百分位而非排名

## Notes

- 07.1 和 07.2 在同一 AI Tab 下用顶部 Tab 切换（对话 | 洞察）
- AI Chat 返回结构化 JSON（data_card + action_buttons + followup）
- 省钱金额用绿色（正向激励语境，区别于 03.x 中性色）
