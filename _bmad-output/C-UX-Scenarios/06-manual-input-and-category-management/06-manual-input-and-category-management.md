---
design_intent: D
design_status: specified
---

# 06: 全员的手动记账与分类补充

**Project:** Money Tracker
**Created:** 2026-04-09
**Method:** Whiteport Design Studio (WDS)

---

## Transaction (Q1)

**What this scenario covers:**
发现一笔AI未捕获的消费，通过表单/语音/截图快速补充记录并调整分类。

---

## Business Goal (Q2)

**Goal:** PRIMARY: 提升AI捕获覆盖率
**Objective:** 1.1 AI捕获覆盖率 >= 80%, 1.2 手动输入 <= 3次/周

---

## User & Situation (Q3)

**Persona:** 大强 Danny (Primary) — 代表全部用户
**Situation:** 在菜市场花了50块现金买菜，这笔没有电子支付记录。回到家想起来，打开APP补一笔。

---

## Driving Forces (Q4)

**Hope:** 3秒内搞定补充记录，不要打断生活节奏。

**Worry:** 补一笔消费要填一堆字段，还不如不记。

---

## Device & Starting Point (Q5 + Q6)

**Device:** Mobile — Android
**Entry:** 打开APP，点击Dashboard底部的"+"快速记账按钮。

---

## Best Outcome (Q7)

**User Success:**
语音说"菜市场50块"，AI自动识别为"食品-生鲜"分类，3秒完成。

**Business Success:**
捕获率从80%提升，用户感知到"几乎全自动"。

---

## Shortest Path (Q8)

1. **手动记账** — 选择语音模式，说"菜市场50块"，AI自动填充金额+分类
2. **分类管理** — 确认AI分类正确（食品-生鲜），必要时调整
3. **iOS快捷指令配置指引** — iOS用户可从这里配置Siri快捷方式（非必经路径） ✓

---

## Trigger Map Connections

**Persona:** 全部用户

**Driving Forces Addressed:**
- ✅ **Want:** 跨角色 — 保持捕获覆盖率完整
- ❌ **Fear:** D3- 害怕又要手动输入（14/15）

**Business Goal:** PRIMARY — 零记账体验的补充覆盖

---

## Scenario Steps

| Step | Folder | Purpose | Exit Action |
|------|--------|---------|-------------|
| 06.1 | `06.1-manual-entry/` | 快速补充一笔消费 | 确认保存 |
| 06.2 | `06.2-category-management/` | 查看和调整AI分类规则 | 确认分类 |
| 06.3 | `06.3-ios-shortcuts-guide/` | 配置iOS快捷指令 | 完成配置 ✓ |

**First step** (06.1) includes full entry context (Q3 + Q4 + Q5 + Q6).
