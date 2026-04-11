# Prototype Roadmap: Scenario 08 — 账户与设置管理

**Scenario:** 08-account-and-settings
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
| Demo Data | 大强一家 (demo-data.json) — 扩展账户/设置/会员数据 |

---

## Pages (3)

| # | Page | Name | Status |
|---|------|------|--------|
| 08.0 | My Hub | 我的 Hub | built |
| 08.1 | Settings | 设置 | built |
| 08.2 | Profile / Account | 个人资料/账户 | built |

---

## Scenario Context

- **角色：** 大强 Danny（代表全部用户）
- **情境：** 首次导入账单后，想确认财务数据安全，在设置里找安全说明
- **情感弧线：** 担忧安全 → 找到入口 → 看到保障 → 安心继续
- **核心设计原则：**
  - 数据安全放第一位（IA 优先级 = 信任优先级）
  - 安全详情行内折叠，降低"快速安心"摩擦
  - Hub 页面提供 Profile Card + Feature Grid + Menu List
  - 会员卡片 4 视觉态（Free/Trial/Active/Expired）
  - 注销流程 6 步多重确认（合规：个人信息保护法）
  - Hub Feature Grid 对免费用户显示付费功能（带锁标）

## Notes

- 08.0 My Hub 是"我的"Tab 落地页，08.1/08.2 是 push 目标页
- Profile Card 头像 64pt（vs Settings 48pt），强调"个人空间"感
- 08.2 付费会员管理页（Active 状态 CTA 目标）为 Open Issue，本次原型做概要级别
