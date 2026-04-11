---
design_intent: D
design_status: not-started
---

# 08: 全员的账户与设置管理

**Project:** Money Tracker
**Created:** 2026-04-09
**Method:** Whiteport Design Studio (WDS)

---

## Transaction (Q1)

**What this scenario covers:**
管理个人信息、配置隐私设置、确认数据安全措施。

---

## Business Goal (Q2)

**Goal:** 支撑所有目标（信任门槛）
**Objective:** 防止因安全顾虑导致的卸载流失

---

## User & Situation (Q3)

**Persona:** 大强 Danny (Primary) — 代表全部用户
**Situation:** 首次导入账单后，想确认自己的财务数据是安全的。在设置里找数据安全相关的说明。

---

## Driving Forces (Q4)

**Hope:** 确认数据加密存储、不会被泄露，安心继续使用。

**Worry:** 银行卡信息、消费明细、家庭收入全在这里，万一泄露后果严重。

---

## Device & Starting Point (Q5 + Q6)

**Device:** Mobile — Android
**Entry:** 从Dashboard底部Tab"我的"进入 08.0 My Hub。

---

## Best Outcome (Q7)

**User Success:**
看到清晰的数据安全说明（本地优先、加密存储），配置好通知偏好，安心关闭页面。

**Business Success:**
信任门槛达标，防止因安全顾虑导致的卸载流失。

---

## Shortest Path (Q8)

1. **我的 Hub** — 底部 Tab "我的"首页，展示资料卡、会员状态、快捷功能入口
2. **设置** — 查看数据安全说明、配置通知偏好、管理权限
3. **个人资料/账户** — 更新个人信息、查看账户状态 ✓

---

## Trigger Map Connections

**Persona:** 全部用户

**Driving Forces Addressed:**
- ❌ **Fear:** D5- 担心财务数据安全（11/15）

**Business Goal:** 支撑所有目标 — 信任门槛达标

---

## Scenario Steps

| Step | Folder | Purpose | Exit Action |
|------|--------|---------|-------------|
| 08.0 | `08.0-my-hub/` | "我的"Tab 首页，资料 + 快捷入口 | 点击"设置"或"个人资料" |
| 08.1 | `08.1-settings/` | 查看安全说明并配置偏好 | 返回 Hub 或底部 Tab |
| 08.2 | `08.2-profile-account/` | 更新个人信息 | 关闭页面 ✓ |

**First step** (08.0) is the Tab landing page. 08.1 and 08.2 are push destinations from Hub.
