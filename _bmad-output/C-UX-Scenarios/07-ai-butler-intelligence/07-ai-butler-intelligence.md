---
design_intent: D
design_status: not-started
---

# 07: 全员的AI管家体验

**Project:** Money Tracker
**Created:** 2026-04-09
**Method:** Whiteport Design Studio (WDS)

---

## Transaction (Q1)

**What this scenario covers:**
向AI提出财务问题，获得个性化洞察和可执行的优化建议。

---

## Business Goal (Q2)

**Goal:** SUSTAINABILITY: 高级付费功能变现
**Objective:** 3.1 付费转化率 >= 5%, NPS提升

---

## User & Situation (Q3)

**Persona:** 大强 Danny (Primary) — 代表全部用户
**Situation:** 用了3个月后，想知道"如果每月少吃一次外卖，一年能省多少"。周日下午在家无聊，打开APP跟AI聊聊。

---

## Driving Forces (Q4)

**Hope:** 得到量化的、基于自己真实数据的建议，而不是泛泛的"少花钱"。

**Worry:** AI给的建议不靠谱或太笼统，浪费时间。

---

## Device & Starting Point (Q5 + Q6)

**Device:** Mobile — Android
**Entry:** 打开APP，从Dashboard点击"AI管家"对话入口，或收到洞察推送通知。

---

## Best Outcome (Q7)

**User Success:**
AI基于真实数据告诉他"每月减少4次外卖可省680元，一年8160元"，并模拟存款增长曲线。

**Business Success:**
高级付费功能使用频率提升，用户NPS提升，续费意愿强。

---

## Shortest Path (Q8)

1. **AI对话** — 输入"如果少吃外卖能省多少"，AI基于真实数据生成量化回答
2. **洞察推送** — 查看AI主动生成的本月消费洞察Feed
3. **优化建议** — 查看AI生成的3条可执行省钱建议（附具体金额）
4. **消费模拟/同类对比** — 模拟"每月少4次外卖"的年度存款影响，对比同龄人消费水平 ✓

---

## Trigger Map Connections

**Persona:** 全部用户（高级功能）

**Driving Forces Addressed:**
- ✅ **Want:** 跨角色 — 从工具到顾问的跃迁
- ❌ **Fear:** 跨角色 — AI建议不靠谱或太笼统

**Business Goal:** SUSTAINABILITY — 高级付费功能变现 + NPS提升

---

## Scenario Steps

| Step | Folder | Purpose | Exit Action |
|------|--------|---------|-------------|
| 07.1 | `07.1-ai-chat/` | 向AI提问获取量化回答 | 查看洞察 |
| 07.2 | `07.2-insights-feed/` | 浏览AI主动推送的消费洞察 | 查看建议 |
| 07.3 | `07.3-optimization-suggestions/` | 查看可执行的优化建议 | 进入模拟 |
| 07.4 | `07.4-simulation-comparison/` | 模拟消费调整影响并对比同龄人 | 查看完毕 ✓ |

**First step** (07.1) includes full entry context (Q3 + Q4 + Q5 + Q6).
