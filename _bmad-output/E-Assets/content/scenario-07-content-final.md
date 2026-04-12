# Scenario 07 — AI管家智能层：正式文案定稿

> 五模型战略框架审核 + 精修
> Generated: 2026-04-12
> Status: FINAL

---

## Strategic Context

```yaml
purpose: "让用户从'看到数据'升级为'与数据对话'，AI 主动发现问题、给出建议、模拟未来"
persona: "大强 Danny（代表用户）— 已认可零记账价值，想进一步了解消费"
primary_drivers: [D2+ 不动手就知道(AI延伸), D1+ 用数字讨论(AI对话)]
awareness_journey: "Most Aware (深度使用付费功能)"
golden_circle: "WHY(07.1 数据会说话) → HOW(07.2 AI主动发现+07.3 具体建议) → WHAT(07.4 模拟未来)"
empowerment_aha: "07.1 AI 回答包含具体数字 — '原来 AI 真的读了我的账单'"
review_question: "大强问完 AI 后，会不会觉得'这个管家比我自己还了解我的消费'？"
```

---

## 07.1 AI Chat

**核心动作：** 输入问题 → 获得数据锚定的回答
**驱动力锚点：** D2+（不动手就知道的终极延伸）→ "你的数据会说话"

### 审核结果

| 元素 | 现有文案 | 判定 | 精修 |
|------|---------|------|------|
| Tab: Chat | 对话 | ✅ | — |
| Tab: Insights | 洞察 | ✅ | — |
| Trial Counter | 免费体验 {used}/{total} | ✅ | — |
| Welcome Title | 你的数据会说话 | ✅ 好，核心叙事 | — |
| Welcome Desc | 我已经分析了你 {months} 个月的消费数据，涵盖 {total_txn} 笔交易。问我任何问题。 | ⚠️ "交易"+"问我任何问题"偏宽泛 | 我已经分析了你 {months} 个月的消费，{total_txn} 笔。想知道什么？ |
| Suggestions Title | 💬 推荐问题 | ✅ | — |
| Suggestion 0 | 这个月花最多的是什么 | ✅ 好，用户视角 | — |
| Suggestion 1 | 外卖花了多少 | ✅ | — |
| Suggestion 2 | 帮我跟上个月对比 | ✅ | — |
| Suggestion 3 | 有什么能省钱的建议 | ✅ | — |
| AI Name | AI管家 | ✅ | — |
| Action: Delivery | 查看外卖明细 | ✅ | — |
| Action: Trend | 查看趋势图 | ✅ | — |
| Action: Optimize | 查看优化建议 | ✅ | — |
| Action: Simulate | 模拟存款增长 | ✅ | — |
| Action: Insights | 查看更多洞察 | ✅ | — |
| Typing: Category | 正在分析你的{category}消费数据 | ⚠️ "消费数据"偏技术 | 正在看你的{category}消费 |
| Typing: Comparison | 正在对比你最近几个月的数据 | ⚠️ | 正在对比你最近几个月 |
| Typing: Savings | 正在寻找省钱机会 | ✅ | — |
| Typing: Generic | 正在分析你的消费数据 | ⚠️ | 正在看你的消费 |
| Input Placeholder | 问问AI管家... | ✅ | — |
| Input Disabled | 升级后继续对话... | ✅ | — |
| Paywall Title | 解锁AI管家 | ✅ | — |
| Paywall Desc | 你已体验了 3 次AI对话，升级后可无限提问，还能获得主动洞察和优化建议 | ✅ | — |
| Paywall CTA | 免费领取7天体验 | ✅ | — |
| Info Title | 关于AI管家 | ✅ | — |
| Info: Privacy | 你的数据仅在你的设备和加密服务器间传输，不会分享给第三方 | ✅ | — |
| Info: Data-based | 所有回答基于你的真实消费数据，不是通用建议 | ✅ | — |
| Info: Disclaimer | AI可能偶尔出错，重要财务决策请以实际账单为准 | ✅ 好，诚实 | — |
| Info Close | 知道了 | ✅ | — |

### 精修说明

- Welcome Desc: "涵盖 N 笔交易"偏正式+技术。精修为"{total_txn} 笔"更轻量。"问我任何问题"太宽泛（AI 只懂消费数据），改为"想知道什么？"更聚焦。
- Typing Hints: "消费数据"重复出现，去掉"数据"二字——AI 在"看你的消费"比"分析你的消费数据"更有温度。

---

## 07.2 Insights Feed

**核心动作：** 浏览 AI 洞察卡片 → 点击行动按钮
**驱动力锚点：** D2+（AI 主动告诉你）→ "你没注意到的事，AI 替你注意了"

### 审核结果

| 元素 | 现有文案 | 判定 | 精修 |
|------|---------|------|------|
| Summary Count | 本月已生成 {count} 条洞察 | ✅ | — |
| Summary Time | 最新更新: {relative_time} | ✅ | — |
| Badge: NEW | NEW | ✅ | — |
| Expand (collapsed) | 展开 | ✅ | — |
| Expand (expanded) | 收起 | ✅ | — |
| Action: View Details | 查看明细 | ✅ | — |
| Action: Ask AI | 追问AI | ✅ 好 | — |
| Action: View Trend | 查看趋势 | ✅ | — |
| Action: View Tips | 查看建议 | ✅ | — |
| Action: Full Compare | 详细对比 | ✅ | — |
| Helpful (default) | 👍 有用 | ✅ | — |
| Helpful (selected) | 👍 已标记 | ✅ | — |
| Not Relevant (default) | 👎 不相关 | ✅ | — |
| Not Relevant (selected) | 👎 已反馈 | ✅ | — |
| Locked Title | 还有 {remaining} 条洞察 | ✅ | — |
| Locked Desc | 升级查看全部洞察 | ✅ | — |
| Locked CTA | 免费领取7天体验 | ✅ | — |
| Empty Headline | AI正在分析你的消费数据 | ⚠️ "消费数据" | AI 正在分析你的消费 |
| Empty Subtitle | 洞察将在数据积累后生成，通常需要 1-2 周的数据 | ⚠️ "数据"重复 | 积累 1-2 周消费后，洞察就来了 |
| Empty CTA | 去跟AI聊聊 | ✅ 好，轻松 | — |

### 审核结果 — Insight Templates

| 类型 | 标题 | 判定 | 精修 |
|------|------|------|------|
| 分类环比 | {category}消费环比{direction} | ✅ | — |
| 消费模式 | {brand}消费习惯 | ✅ | — |
| 固定支出 | 固定支出占比{level} | ✅ | — |
| 异常消费 | 检测到异常消费 | ⚠️ "检测到"偏系统语言 | 有几笔大额消费 |
| 存款趋势 | 月结余趋势 | ✅ | — |

### 精修说明

- Empty: 去掉"数据"重复，精修为更口语化的表达。
- 异常消费标题: "检测到异常消费"像系统警报，改为"有几笔大额消费"——事实陈述而非警告，呼应真相镜子原则。

---

## 07.3 Optimization Suggestions

**核心动作：** 查看省钱建议 → 采纳 → 追踪执行
**驱动力锚点：** D4+（确认存款够应急）→ "省钱潜力"正向框架

### 审核结果

| 元素 | 现有文案 | 判定 | 精修 |
|------|---------|------|------|
| Page Title | 优化建议 | ✅ | — |
| Monthly Suffix | /月 | ✅ | — |
| Yearly Suffix | /年 | ✅ | — |
| Data Basis | 基于你近{n}个月的真实消费数据分析 | ⚠️ "数据分析" | 基于你近{n}个月的真实消费 |
| Suggestions Header | AI为你找到的建议 | ✅ | — |
| Category (example) | 🍜 减少外卖频率 | ✅ | — |
| Monthly Badge | 每月可省 ¥{amount} | ✅ 绿色正向 | — |
| Expand Toggle | 展开详情 ∨ | ✅ | — |
| Current Column | 当前 | ✅ | — |
| Suggested Column | 建议 | ✅ | — |
| Monthly Savings | 月省：¥{monthly} | ✅ | — |
| Yearly Savings | 年省：¥{yearly} | ✅ | — |
| Adopt Button | 采纳 | ✅ | — |
| Dismiss Button | 暂不考虑 | ✅ 好，低愧疚 | — |
| Simulate Button | 模拟效果 → | ✅ | — |
| Tracking Header | 执行追踪 | ✅ | — |
| Tracking Title | 🍜 减少外卖（已采纳） | ✅ | — |
| Progress Desc | 本月进度：已减少{actual}次 | ✅ | — |
| Saved Amount | 本月已省：¥{amount} | ✅ 绿色 | — |
| Sim CTA Title | 模拟省钱效果 | ✅ | — |
| Sim CTA Sub | 看看一年能攒多少 | ✅ | — |
| All Dismissed | 下个月AI会根据新数据生成新建议 | ⚠️ | 下个月 AI 会根据新消费生成新建议 |
| Insufficient | 再用{n}个月，AI就能给你精准建议了 | ✅ | — |

### 精修说明

- Data Basis/All Dismissed: "数据"→"消费"，全局统一。

---

## 07.4 Simulation & Comparison

**核心动作：** 调整滑块看省钱曲线 → 查看同类对比
**驱动力锚点：** D4+（确认存款够应急）→ 模拟未来给信心

### 审核结果

| 元素 | 现有文案 | 判定 | 精修 |
|------|---------|------|------|
| Page Title | 省钱模拟 | ✅ | — |
| Tab: Simulation | 消费模拟 | ✅ | — |
| Tab: Peer | 同类对比 | ✅ | — |
| Params Header | 调整你的省钱方案 | ✅ | — |
| Current Value | 当前 {value}{unit}/月 | ✅ | — |
| Savings Preview | 每月可省 ¥{amount} | ✅ | — |
| Curve Subtitle | 一年可多存 | ✅ | — |
| Legend: Current | ● 当前趋势 | ✅ | — |
| Legend: Optimized | ● 优化后 | ✅ | — |
| Milestone: 3m | 3个月后 | ✅ | — |
| Milestone: 6m | 6个月后 | ✅ | — |
| Milestone: 12m | 12个月后 | ✅ | — |
| Share Button | 分享我的省钱计划 | ✅ | — |
| Share Watermark | Money Tracker -- AI帮你省 | ⚠️ 产品名不一致 | 了然 · AI 帮你省 |
| Peer Percentile | 超过 {pct}% 的同龄人 | ✅ 好，百分位 | — |
| Position Label | 在同收入人群中排{level} | ✅ | — |
| Level: 0-20% | 非常节省 | ✅ | — |
| Level: 20-40% | 偏节省 | ✅ | — |
| Level: 40-60% | 中等水平 | ✅ | — |
| Level: 60-80% | 中等偏上 | ✅ 中性 | — |
| Level: 80-100% | 偏高消费 | ✅ 中性，不说"超支" | — |
| Position Desc | 与你同城市、相近年龄和收入水平的用户对比 | ✅ | — |
| Category Header | 分类对比 | ✅ | — |
| User Bar | 你 ¥{amount} | ✅ | — |
| Median Bar | 同类中位 ¥{amount} | ✅ | — |
| Higher | 你高于 {pct}% 的人 | ✅ 橙色 | — |
| Lower | 你低于 {pct}% 的人 | ✅ 绿色 | — |
| Disclaimer | 基于同城市、相近收入水平的匿名用户数据... | ✅ 好，透明 | — |
| All Max | 试着减少一些，看看效果 | ✅ | — |
| All Zero | 完全戒断不太现实，试试适度调整 | ✅ 好，不审判 | — |
| Peer Insufficient | 你所在的城市暂时还没有足够的对比数据 | ⚠️ "对比数据"偏技术 | 你所在的城市暂时还没有足够的同类用户 |

### 精修说明

- Share Watermark: "Money Tracker"→"了然"，与 03.4 分享卡片一致，使用产品正式名称。
- Peer Insufficient: "对比数据"→"同类用户"，更直觉。

---

## 全局精修汇总

### 修改清单（共 12 处）

| # | 页面 | 元素 | 原文 | 精修 | 理由 |
|---|------|------|------|------|------|
| 1 | 07.1 | Welcome Desc | …涵盖 N 笔交易。问我任何问题。 | …N 笔。想知道什么？ | 精简+聚焦 |
| 2 | 07.1 | Typing: Category | 正在分析你的{category}消费数据 | 正在看你的{category}消费 | 去技术感 |
| 3 | 07.1 | Typing: Comparison | 正在对比你最近几个月的数据 | 正在对比你最近几个月 | 精简 |
| 4 | 07.1 | Typing: Generic | 正在分析你的消费数据 | 正在看你的消费 | 同 #2 |
| 5 | 07.2 | Empty Headline | AI正在分析你的消费数据 | AI 正在分析你的消费 | 去"数据" |
| 6 | 07.2 | Empty Subtitle | 洞察将在数据积累后生成… | 积累 1-2 周消费后，洞察就来了 | 口语化 |
| 7 | 07.2 | Anomaly Title | 检测到异常消费 | 有几笔大额消费 | 真相镜子原则 |
| 8 | 07.3 | Data Basis | …真实消费数据分析 | …真实消费 | 去"数据分析" |
| 9 | 07.3 | All Dismissed | …根据新数据… | …根据新消费… | 统一 |
| 10 | 07.4 | Share Watermark | Money Tracker -- AI帮你省 | 了然 · AI 帮你省 | 产品名统一 |
| 11 | 07.4 | Peer Insufficient | …对比数据 | …同类用户 | 去术语 |
| 12 | 07.2 | (EN) Anomaly Title | Unusual spending detected | Some large purchases this month | 同 #7 |

### 保留不动的关键文案

| 文案 | 页面 | 锚定驱动力 |
|------|------|-----------|
| 你的数据会说话 | 07.1 | 核心叙事 |
| AI可能偶尔出错，重要财务决策请以实际账单为准 | 07.1 | 诚实信任 |
| 👍 有用 / 👎 不相关 | 07.2 | 反馈训练闭环 |
| 暂不考虑 | 07.3 | 低愧疚措辞 |
| 完全戒断不太现实，试试适度调整 | 07.4 | 不审判 |
| 偏高消费（非"超支"） | 07.4 | 中性表述 |

---

## Strategic Traceability

```yaml
traceability:
  trigger_map:
    D2_positive: "07.1 AI对话(数据会说话), 07.2 AI主动推送"
    D4_positive: "07.3 省钱潜力, 07.4 模拟存款增长"
  truth_mirror_principle:
    enforced_at: "07.1 禁用超支/浪费, 07.2 禁用警告/不合理, 07.3 暂不考虑(非忽略), 07.4 偏高消费(非超支)"
  forbidden_words_check:
    超支/浪费: "未出现 ✅"
    警告/不合理: "未出现 ✅"
    检测到异常: "07.2 已修正为'有几笔大额消费' ✅"
    数据(冗余): "多处已精简 ✅"
    Money Tracker: "07.4 已修正为'了然' ✅"
```