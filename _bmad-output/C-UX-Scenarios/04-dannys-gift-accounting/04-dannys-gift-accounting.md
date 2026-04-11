---
design_intent: S
design_status: specified
---

# 04: 大强的人情账管理

**Project:** Money Tracker
**Created:** 2026-04-09
**Method:** Whiteport Design Studio (WDS)

---

## Transaction (Q1)

**What this scenario covers:**
收到婚礼请柬后快速查到人情历史，获取智能回礼建议，记录本次随礼。

---

## Business Goal (Q2)

**Goal:** SUSTAINABILITY: 差异化壁垒
**Objective:** 3.3 差异化功能使用率 >= 30%

---

## User & Situation (Q3)

**Persona:** 大强 Danny (Primary)
**Situation:** 收到同事张三的婚礼请柬（下周六），想查"上次张三给了我多少"。去年张三给他儿子满月随了600，但他记不清了。

---

## Driving Forces (Q4)

**Hope:** 一查就知道历史往来，做出不失礼也不超预算的决定。

**Worry:** 随少了伤感情，随多了超预算，凭感觉又不靠谱。

---

## Device & Starting Point (Q5 + Q6)

**Device:** Mobile — Android
**Entry:** 微信收到请柬后打开APP，从Dashboard点击"人情账"入口。

---

## Best Outcome (Q7)

**User Success:**
3秒查到张三历史（去年随了600），AI建议回礼600-800，大强决定随800并记录。

**Business Success:**
蓝海功能验证，竞品无法复制的差异化。

---

## Shortest Path (Q8)

1. **人情账管理** — 搜索"张三"，看到历史往来记录（去年满月随了600）
2. **人情智能建议** — AI基于历史+场景建议回礼600-800，大强选800并记录 ✓

---

## Trigger Map Connections

**Persona:** 大强 Danny (Primary)

**Driving Forces Addressed:**
- ✅ **Want:** D3+ 清楚人情随礼花了多少（11/15）
- ❌ **Fear:** D4- 不想在随礼上失礼或过度（10/15）

**Business Goal:** SUSTAINABILITY — 差异化壁垒（使用率 >= 30%）

---

## Scenario Steps

| Step | Folder | Purpose | Exit Action |
|------|--------|---------|-------------|
| 04.1 | `04.1-gift-management/` | 人情账主控台：搜索联系人、查看历史、管理事件 | 点击"获取建议" / 点击"拍照导入" |
| 04.1a | `04.1a-gift-book-import/` | 礼簿拍照OCR批量导入（数据冷启动） | 导入完成返回04.1 |
| 04.2 | `04.2-gift-smart-suggestion/` | AI回礼建议并记录 | 确认记录 ✓ |

**First step** (04.1) includes full entry context (Q3 + Q4 + Q5 + Q6).

**04.1a** is a side page (not part of main scenario flow) for data onboarding — critical for cold start.
