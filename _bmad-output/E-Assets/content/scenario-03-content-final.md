# Scenario 03 — 小丽的消费真相镜子：正式文案定稿

> 五模型战略框架审核 + 精修
> Generated: 2026-04-12
> Status: FINAL

---

## Strategic Context

```yaml
purpose: "让 Solution Aware 的小丽在 4 页内从'看到真相'到'分享给闺蜜'，完成从被动查看到主动传播的转化"
persona: "小丽 Lily — 25岁单身互联网运营，月薪12000，知道花得多但不知道多在哪"
primary_drivers: [L1+ 看到消费真相, L2+ 发现隐性消费模式, L3+ 可分享的有趣报告, L1- 不想花精力记账, L4- 不想用丑APP]
awareness_journey: "Product Aware → Most Aware"
golden_circle: "WHY(03.1 看到真相) → HOW(03.2 单笔显微镜) → WHAT(03.3 趋势+03.4 雷达分享)"
empowerment_aha: "03.4 消费雷达 — '天哪我这个月奶茶竟然花了800！'"
review_question: "小丽看完雷达图后，会不会截图发闺蜜群？"
```

---

## 审核标准

| 维度 | 检查项 |
|------|--------|
| Trigger Map | 文案是否锚定小丽的 L1+/L2+/L3+ 驱动力？ |
| Badass Users | 语气是否年轻、有趣、不说教？ |
| Awareness | 信息密度是否匹配小丽的快速浏览习惯？ |
| Action | 每页文案是否驱动当前页的核心动作？ |
| Golden Circle | 真相(WHY) → 细节(HOW) → 分享(WHAT)？ |
| 禁用词 | 是否避开了"记账"、审判性语言（红色、超支、浪费）？ |

---

## 03.1 Transaction List

**核心动作：** 浏览消费列表，点击进入单笔详情
**驱动力锚点：** L1+（看到消费真相）→ 精确数字
**认知水平：** Product Aware → Product Aware

### 审核结果

| 元素 | 现有文案 | 判定 | 精修 |
|------|---------|------|------|
| Header Title | 交易 | ⚠️ "交易"偏金融术语 | 消费 |
| Month Label | {month}月 | ✅ | — |
| Month+Filter | {month}月 {category_name} | ✅ | — |
| Category Pct | 占总支出 {percentage}% | ✅ | — |
| Month Switcher | ▾ 切换月份 | ✅ | — |
| Filter: All | 全部 | ✅ | — |
| Search Placeholder | 搜索交易... | ⚠️ 同上 | 搜索消费... |
| Search Cancel | 取消 | ✅ | — |
| Search History | 最近搜索 | ✅ | — |
| Search Count | 找到 {count} 笔 "{keyword}" | ✅ | — |
| Search Summary | 本月 "{keyword}" 合计：{count} 笔 共 ¥{total} | ✅ 好，汇总有价值 | — |
| Search Empty | 没有找到 "{keyword}" 相关交易 | ⚠️ | 没有找到 "{keyword}" 相关消费 |
| Empty Headline | 还没有交易记录 | ⚠️ | 还没有消费记录 |
| Empty Subtitle | 开启通知读取或导入账单，消费自动出现 | ✅ | — |
| Empty CTA (Android) | 去开启 | ✅ | — |
| Empty CTA (Other) | 去导入 | ✅ | — |

### 精修说明

- "交易"全局替换为"消费"：小丽不会说"我的交易"，她说"我的消费"。"交易"是金融/后端术语，在面向 C 端用户的界面中应统一为"消费"。这个修改影响 Header Title、Search Placeholder、Search Empty、Empty Headline 四处。
- 列表本身的交互文案（日期分组、金额展示）无需修改，数据驱动内容不涉及文案审核。

### EN 精修

| 元素 | 现有 EN | 精修 EN |
|------|---------|---------|
| Header Title | Transactions | Spending |
| Search Placeholder | Search transactions... | Search spending... |
| Search Empty | No transactions found for... | No spending found for... |
| Empty Headline | No transactions yet | No spending yet |

---

## 03.2 Transaction Detail

**核心动作：** 查看单笔消费细节，修正分类
**驱动力锚点：** L1+（精确数字）+ L2+（发现隐性模式）→ 品牌洞察
**认知水平：** Product Aware → Product Aware

### 审核结果

| 元素 | 现有文案 | 判定 | 精修 |
|------|---------|------|------|
| Header Title | 交易详情 | ⚠️ | 消费详情 |
| Info Header | 交易信息 | ⚠️ | 消费信息 |
| Category Label | 分类 | ✅ | — |
| Channel Label | 支付渠道 | ✅ | — |
| Original Desc | 原始摘要 | ⚠️ 偏技术 | 原始描述 |
| Source Label | 数据来源 | ✅ | — |
| Source: Import | 账单导入 | ✅ | — |
| Source: Notification | 通知读取 | ✅ | — |
| Source: Manual | 手动录入 | ⚠️ "手动"触发 L1- | 自己记的 |
| Notes Label | 备注 | ✅ | — |
| Notes Placeholder | 点击添加 | ✅ | — |
| Category Selector Title | 选择分类 | ✅ | — |
| Category Confirm | 确认 | ✅ | — |
| Notes Editor Title | 备注 | ✅ | — |
| Notes Input | 添加备注... | ✅ | — |
| Notes Save | 保存 | ✅ | — |
| Insights Header | 消费洞察 | ✅ | — |
| Brand Insight | 本月{brand}消费 | ✅ 好，品牌维度 | — |
| Brand CTA | 查看消费趋势 → | ✅ | — |
| Category Insight | 本月{category}·{subcategory} | ✅ | — |
| Category CTA | 查看消费趋势 → | ✅ | — |
| Delete Button | 删除这笔交易 | ⚠️ | 删除这笔消费 |
| Delete Dialog Title | 确认删除 | ✅ | — |
| Delete Dialog Msg | 删除后无法恢复，确定删除这笔 ¥{amount} 的交易吗？ | ⚠️ | 删除后无法恢复，确定删除这笔 ¥{amount} 的消费吗？ |
| Delete Confirm | 删除 | ✅ | — |
| Delete Cancel | 取消 | ✅ | — |

### 精修说明

- "交易"→"消费"：与 03.1 保持一致，全局统一。
- "原始摘要"→"原始描述"："摘要"是数据库字段名，"描述"更通俗。
- "手动录入"→"自己记的"：小丽看到"手动录入"会想到"又要手动"（L1-），"自己记的"更轻松，像是在说"这笔是你自己加的"。
- 品牌洞察（"本月瑞幸消费"）是 03.2 的亮点设计，完美命中 L2+（发现隐性消费模式），保留不动。

### EN 精修

| 元素 | 现有 EN | 精修 EN |
|------|---------|---------|
| Header Title | Transaction Detail | Spending Detail |
| Info Header | Transaction Info | Spending Info |
| Original Desc | Original Description | ✅ 保留 |
| Source: Manual | Manual Entry | Added by you |
| Delete Button | Delete this transaction | Delete this entry |
| Delete Dialog | ...delete this ¥{amount} transaction? | ...delete this ¥{amount} entry? |

---

## 03.3 Trend Chart

**核心动作：** 查看消费趋势，发现变化原因
**驱动力锚点：** L2+（发现隐性消费模式）→ 趋势可视化
**认知水平：** Product Aware → Most Aware

### 审核结果

| 元素 | 现有文案 | 判定 | 精修 |
|------|---------|------|------|
| Top Bar Title | 消费趋势 | ✅ | — |
| Time: 3M | 近3月 | ✅ | — |
| Time: 6M | 近6月 | ✅ | — |
| Time: 12M | 近12月 | ✅ | — |
| Total Chart Label | 总消费趋势 | ✅ | — |
| Category Chart Label | {分类名}趋势 | ✅ | — |
| Annotation: Rising | 逐月上升 ↑{pct}% | ✅ 中性表述 | — |
| Annotation: Falling | 有所回落 ↓{pct}% | ✅ 好，"回落"不说"下降" | — |
| Annotation: Stable | 保持平稳 | ✅ | — |
| Annotation: Fluctuating | 波动明显 | ✅ | — |
| MoM Header | 本月变化 | ✅ | — |
| MoM Rising | 较上月多了 ¥{amount} | ✅ 中性 | — |
| MoM Falling | 较上月少了 ¥{amount} | ✅ 中性 | — |
| MoM Reason | 主因：外卖消费增加 | ✅ 好，AI 归因 | — |
| Monthly Bar Header | 月度对比 | ✅ | — |
| Radar CTA Title | 看看你的消费雷达 | ✅ 好奇驱动 | — |
| Radar CTA Subtitle | 发现更多消费画像 | ⚠️ "消费画像"偏专业 | 看看你是什么消费类型 |
| Single-Month Fallback | 积累下个月数据后，趋势就出来了 | ✅ 好，不说"数据不足" | — |
| Filter: All | 全部 | ✅ | — |

### 精修说明

- Radar CTA Subtitle: "消费画像"是产品/数据术语，小丽不会这么说。"看看你是什么消费类型"更像闺蜜之间的话题，也更好奇驱动。
- 趋势标注用橙+青双色（非红+绿），避免色觉障碍和涨跌心理暗示——这个设计决策在文案层面体现为"逐月上升"/"有所回落"的中性措辞，而非"超支"/"节省"。保留不动。
- "积累下个月数据后，趋势就出来了"比"数据不足"好太多——正向预期而非负面状态。

### EN 精修

| 元素 | 现有 EN | 精修 EN |
|------|---------|---------|
| Radar CTA Subtitle | Discover your spending portrait | See what type of spender you are |

---

## 03.4 Spending Radar

**核心动作：** 查看雷达图 → 分享给闺蜜
**驱动力锚点：** L3+（可分享的有趣报告）+ L2+（发现隐性模式）→ 社交货币
**认知水平：** Most Aware → Most Aware (传播者)

### 审核结果 — Radar Chart

| 元素 | 现有文案 | 判定 | 精修 |
|------|---------|------|------|
| Top Bar Title | 消费雷达 | ✅ | — |
| Month Label | {year}年{month}月 | ✅ | — |
| Tooltip | {分类名} ¥{amount} {score}分 · 占总消费{percent}% | ✅ | — |
| Consumer Label | 你的消费标签：「{label}」 | ✅ 好，社交货币 | — |

### 审核结果 — Consumer Labels

| 条件 | 现有标签 | 判定 | 精修 |
|------|---------|------|------|
| 餐饮>60%+外卖>50% | 外卖达人 | ✅ 有趣 | — |
| 餐饮>60%+饮品>15笔 | 奶茶星人 | ✅ 好，年轻化 | — |
| 购物>40% | 购物狂想家 | ✅ 好，"狂想家"不说"狂" | — |
| 交通>30% | 城市漫游者 | ✅ | — |
| 娱乐>25% | 快乐制造机 | ✅ 正向 | — |
| 生活缴费>40% | 居家达人 | ✅ | — |
| 均匀(max<30%) | 均衡生活家 | ✅ | — |
| 单维度>70% | {维度}专注者 | ✅ | — |
| Default | 自在消费派 | ✅ 好，不审判 | — |

### 审核结果 — AI Fun Insights

| 条件 | 现有标题 | 判定 | 精修 |
|------|---------|------|------|
| 饮品>¥500 | 你的奶茶消费 | ✅ | — |
| 饮品 Desc | 可以绕地球 {distance} 圈 | ✅ 好，有趣的类比 | — |
| 外卖>20笔 | 你的外卖消费 | ✅ | — |
| 外卖 Desc | {night_percent}% 发生在晚上8点后，你是深夜觅食族 | ✅ 好，不说"不健康" | — |
| 品牌>5笔 | 你最爱的品牌 | ✅ | — |
| 品牌 Desc | 本月光顾 {brand} {count} 次，是你的「月度最佳」 | ✅ 好，正向框架 | — |
| 打车>¥800 | 你的打车里程 | ✅ | — |
| 打车 Desc | 相当于从北京到 {city} | ✅ 好，具象化 | — |
| 周末>工作日2x | 你的周末消费力 | ⚠️ "消费力"偏营销 | 你的周末模式 |
| 周末 Desc | 周末日均消费 ¥{weekend_avg}，是工作日的 {ratio} 倍 | ✅ | — |
| 最大单笔 | 本月最壕一笔 | ✅ 好，年轻化 | — |
| >100笔 | 消费频率王 | ✅ | — |
| Default | 你的消费节奏 | ✅ | — |

### 审核结果 — Dimension Details & Comparison

| 元素 | 现有文案 | 判定 | 精修 |
|------|---------|------|------|
| Dimensions Header | 各维度详情 | ⚠️ "维度"偏数据术语 | 分类详情 |
| Dimension Insight | 外卖占68%，最爱瑞幸 | ✅ 好，具体有趣 | — |
| Month Compare Header | 月份对比 | ✅ | — |
| AI Insights Header | AI 发现 | ✅ | — |

### 审核结果 — Share Flow

| 元素 | 现有文案 | 判定 | 精修 |
|------|---------|------|------|
| Share Button | 分享给好友 | ✅ | — |
| Channel: WeChat | 微信 | ✅ | — |
| Channel: Moments | 朋友圈 | ✅ | — |
| Channel: Save | 保存图片 | ✅ | — |
| Channel: XHS | 小红书 | ✅ | — |
| Share Card Title | 我的{month}月消费雷达 | ✅ | — |
| Share Card Brand | 零记账 AI 财务管家 | ⚠️ "零记账"是内部术语 | 了然 · AI 财务管家 |
| Share Success | 已发出，坐等评论 | ✅ 好，年轻化语气 | — |
| Share Subtitle | 下个月雷达图会有新变化 | ✅ 好，留存钩子 | — |
| Empty State | 还没有消费数据 | ✅ | — |
| Empty Subtitle | 导入账单后生成你的消费雷达 | ✅ | — |
| Empty CTA | 去导入账单 | ✅ | — |
| Save Toast | 已保存到相册 | ✅ | — |

### 精修说明

- Share Card Brand: "零记账"是产品内部概念名，分享卡片面向外部用户（小丽的闺蜜），应使用产品正式名称"了然"。加上"AI 财务管家"定位语。
- "各维度详情"→"分类详情"："维度"是数据分析术语，小丽说的是"分类"。
- "你的周末消费力"→"你的周末模式"："消费力"有营销味，"模式"更中性有趣。
- Consumer Labels 和 Fun Insights 整体质量极高——"奶茶星人""购物狂想家""深夜觅食族"都是小丽会截图分享的社交货币。"本月最壕一笔"的年轻化语气完美匹配 L4-（不想用丑/老气APP）。

### EN 精修

| 元素 | 现有 EN | 精修 EN |
|------|---------|---------|
| Dimensions Header | Dimension Details | Category Details |
| Weekend Title | Your Weekend Spending | Your Weekend Mode |
| Share Card Brand | (not specified) | Liaoran · AI Finance Butler |

---

## 全局精修汇总

### 修改清单（共 14 处）

| # | 页面 | 元素 | 原文 | 精修 | 理由 |
|---|------|------|------|------|------|
| 1 | 03.1 | Header Title | 交易 | 消费 | C端用户术语 |
| 2 | 03.1 | Search Placeholder | 搜索交易... | 搜索消费... | 同上 |
| 3 | 03.1 | Search Empty | …相关交易 | …相关消费 | 同上 |
| 4 | 03.1 | Empty Headline | 还没有交易记录 | 还没有消费记录 | 同上 |
| 5 | 03.2 | Header Title | 交易详情 | 消费详情 | 同上 |
| 6 | 03.2 | Info Header | 交易信息 | 消费信息 | 同上 |
| 7 | 03.2 | Original Desc | 原始摘要 | 原始描述 | 去技术术语 |
| 8 | 03.2 | Source: Manual | 手动录入 | 自己记的 | 避免触发 L1- |
| 9 | 03.2 | Delete Button+Dialog | …交易… | …消费… | 统一术语 |
| 10 | 03.3 | Radar CTA Subtitle | 发现更多消费画像 | 看看你是什么消费类型 | 去术语+好奇驱动 |
| 11 | 03.4 | Dimensions Header | 各维度详情 | 分类详情 | 去数据术语 |
| 12 | 03.4 | Weekend Title | 你的周末消费力 | 你的周末模式 | 去营销味 |
| 13 | 03.4 | Share Card Brand | 零记账 AI 财务管家 | 了然 · AI 财务管家 | 用产品正式名称 |
| 14 | 03.2 | Source: Manual (EN) | Manual Entry | Added by you | 同 #8 |

### 保留不动的关键文案（战略对齐确认）

| 文案 | 页面 | 锚定驱动力 |
|------|------|-----------|
| 消费（统一后） | 03.1 | L1+ 看到消费真相 |
| 本月{brand}消费 | 03.2 | L2+ 发现隐性模式 |
| 逐月上升/有所回落/保持平稳 | 03.3 | 中性表述，不审判 |
| 积累下个月数据后，趋势就出来了 | 03.3 | 正向预期 |
| 看看你的消费雷达 | 03.3 | L3+ 好奇驱动 |
| 奶茶星人/购物狂想家/深夜觅食族 | 03.4 | L3+ 社交货币 |
| 已发出，坐等评论 | 03.4 | L3+ 年轻化语气 |
| 下个月雷达图会有新变化 | 03.4 | 留存钩子 |

---

## Strategic Traceability

```yaml
traceability:
  trigger_map:
    L1_positive: "03.1 消费列表（精确数字）, 03.2 消费详情（单笔显微镜）"
    L2_positive: "03.2 品牌洞察, 03.3 趋势标注+AI归因, 03.4 Consumer Labels"
    L3_positive: "03.4 分享流程（微信/朋友圈/小红书）, 03.4 Fun Insights"
    L1_negative: "03.2 '自己记的'替代'手动录入', 全局零手动设计"
    L4_negative: "03.4 年轻化语气（奶茶星人/本月最壕/坐等评论）"
    L2_negative: "03.3 中性趋势标注（不说超支/浪费）, 03.4 正向Consumer Labels"
  awareness_journey:
    product_aware: "03.1-03.2 — 看到数据，建立信任"
    most_aware: "03.3-03.4 — 发现模式，成为传播者"
  badass_users:
    capability_not_feature: "14 处精修中 8 处涉及去术语、转用户视角"
    aha_moment: "03.4 看到消费雷达+Consumer Label"
    skill_gained: "清楚知道钱花在哪，用有趣的方式分享给朋友"
  golden_circle:
    why: "03.1 — 你的消费，一笔一笔都在这里"
    how: "03.2-03.3 — 点进去看细节，看趋势，看原因"
    what: "03.4 — 你是'奶茶星人'，分享给闺蜜看看"
  forbidden_words_check:
    记账: "未出现 ✅"
    交易: "03.1/03.2 已全部修正为'消费' ✅"
    超支: "未出现 ✅"
    浪费: "未出现 ✅"
    消费画像: "03.3 已修正 ✅"
    维度: "03.4 已修正为'分类' ✅"
```