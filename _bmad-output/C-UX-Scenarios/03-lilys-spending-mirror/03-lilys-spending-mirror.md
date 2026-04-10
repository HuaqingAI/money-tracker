---
design_intent: S
design_status: not-started
---

# 03: 小丽的消费真相镜子

**Project:** Money Tracker
**Created:** 2026-04-09
**Method:** Whiteport Design Studio (WDS)

---

## Transaction (Q1)

**What this scenario covers:**
浏览自己的消费流水，发现隐藏的消费模式，截图分享给闺蜜群。

---

## Business Goal (Q2)

**Goal:** GROWTH: 用户获取（社交传播 = 免费获客）
**Objective:** 2.1 种子用户1000, 2.3 评分 >= 4.5

---

## User & Situation (Q3)

**Persona:** 小丽 Lily (Secondary)
**Situation:** 25岁运营，月薪12000。月底刷小红书看到朋友晒的消费雷达图，好奇自己的。已经用了一周免费版，账单已导入。

---

## Driving Forces (Q4)

**Hope:** 看到自己的消费真相，发现那些"偷走"钱的小额消费。

**Worry:** 看到数字后产生罪恶感，被APP审判"你超支了"。

---

## Device & Starting Point (Q5 + Q6)

**Device:** Mobile — iOS
**Entry:** 打开APP进入Dashboard，看到"本月消费洞察"卡片，点击查看详情。

---

## Best Outcome (Q7)

**User Success:**
发现奶茶月花800、外卖2200，截图消费雷达图发闺蜜群，引发讨论。

**Business Success:**
社交分享带来3-5个新用户下载，口碑传播启动。

---

## Shortest Path (Q8)

1. **交易列表** — 浏览本月流水，按分类筛选看到"餐饮"占比最高
2. **交易详情** — 点击某笔奶茶消费，看到AI自动识别的品牌和分类
3. **趋势图表** — 查看近3个月消费趋势，发现餐饮逐月上升
4. **消费习惯雷达** — 看到个性化消费雷达图，点击"分享"生成精美卡片发闺蜜群 ✓

---

## Trigger Map Connections

**Persona:** 小丽 Lily (Secondary)

**Driving Forces Addressed:**
- ✅ **Want:** L1+ 看到消费真相（14/15）
- ✅ **Want:** L3+ 可分享的有趣消费报告（11/15）
- ❌ **Fear:** L2- 害怕看到真实数字的罪恶感（10/15）

**Business Goal:** GROWTH — 用户获取与口碑传播

---

## Scenario Steps

| Step | Folder | Purpose | Exit Action |
|------|--------|---------|-------------|
| 03.1 | `03.1-transaction-list/` | 浏览消费流水发现高占比分类 | 点击某笔交易 |
| 03.2 | `03.2-transaction-detail/` | 查看单笔消费AI识别详情 | 返回列表或查看趋势 |
| 03.3 | `03.3-trend-chart/` | 查看多月消费趋势 | 点击"消费雷达" |
| 03.4 | `03.4-spending-radar/` | 查看雷达图并分享 | 点击"分享" ✓ |

**First step** (03.1) includes full entry context (Q3 + Q4 + Q5 + Q6).
