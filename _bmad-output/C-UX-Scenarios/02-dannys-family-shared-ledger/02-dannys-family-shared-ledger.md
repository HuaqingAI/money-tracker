---
design_intent: S
design_status: not-started
---

# 02: 大强的家庭共享账本

**Project:** Money Tracker
**Created:** 2026-04-09
**Method:** Whiteport Design Studio (WDS)

---

## Transaction (Q1)

**What this scenario covers:**
前期免费领取全功能会员体验，邀请小芳加入共享家庭账本，让夫妻看到同一份消费数据。后续到期后通过付费墙转化。

> **运营策略决策 (2026-04-11)：** 前期全功能免费体验拉新，后续通过到期转化实现付费。02.1 页面规格已按"免费领取"设计，付费墙（Paywall）由后续迭代覆盖。

---

## Business Goal (Q2)

**Goal:** GROWTH（留存 >= 40%）+ SUSTAINABILITY（前期免费获客，后续付费转化 >= 5%）
**Objective:** 2.2 30日留存率 >= 40%, 3.1 付费转化率 >= 5%（到期后转化）

---

## User & Situation (Q3)

**Persona:** 大强 Danny (Primary)
**Situation:** 用了两周免费版，觉得自己看报表挺好的。周末小芳问"这个月我们到底花了多少"，他想到如果小芳也能看到就不用吵了。

---

## Driving Forces (Q4)

**Hope:** 用共同的数字讨论家庭开支，不再各说各话。

**Worry:** 付费后老婆不愿意用，钱白花了。

---

## Device & Starting Point (Q5 + Q6)

**Device:** Mobile — Android
**Entry:** Dashboard上看到"邀请家人共享"提示卡片，点击进入。

---

## Best Outcome (Q7)

**User Success:**
小芳收到邀请加入，两人看到同一份月度报表，标注了"为谁花"的维度。

**Business Success:**
一次付费转化 + 双用户绑定，留存率大幅提升。

---

## Shortest Path (Q8)

1. **订阅/付费** — 免费领取全功能会员体验（前期拉新阶段无需付费）
2. **共享家庭账本** — 创建家庭账本，生成邀请链接发给小芳
3. **受益人标注** — 标注近期消费的受益人（"为孩子""为家庭""个人"） ✓

---

## Trigger Map Connections

**Persona:** 大强 Danny (Primary)

**Driving Forces Addressed:**
- ✅ **Want:** D1+ 用共同数字讨论家庭开支（14/15）
- ✅ **Want:** D5+ 让老婆也能看到同一份数据（13/15）

**Business Goal:** GROWTH（留存）+ SUSTAINABILITY（付费转化）

---

## Scenario Steps

| Step | Folder | Purpose | Exit Action |
|------|--------|---------|-------------|
| 02.1 | `02.1-subscription/` | 免费领取全功能会员体验 | 领取成功 |
| 02.2 | `02.2-shared-family-ledger/` | 创建共享账本并邀请小芳 | 发送邀请链接 |
| 02.3 | `02.3-beneficiary-tagging/` | 标注消费受益人维度 | 完成标注 ✓ |

**First step** (02.1) includes full entry context (Q3 + Q4 + Q5 + Q6).
