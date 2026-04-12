# Scenario 04 — 大强的人情账管理：正式文案定稿

> 五模型战略框架审核 + 精修
> Generated: 2026-04-12
> Status: FINAL

---

## Strategic Context

```yaml
purpose: "让大强在收到请柬时 30 秒内查到历史、看到建议、做出决定，消除'随多少合适'的焦虑"
persona: "大强 Danny — 人情随礼年支出近2万，凭感觉随'差不多'的数字"
primary_drivers: [D3+ 清楚人情花了多少, D4- 不想失礼或过度, D3- 害怕手动输入]
awareness_journey: "Most Aware (深度使用付费功能)"
golden_circle: "WHY(04.1 关系全景) → HOW(04.1a 批量导入) → WHAT(04.2 AI建议决策)"
empowerment_aha: "04.2 — AI 给了区间建议，我心里有底了"
review_question: "大强收到同事张三的婚礼请柬后，会不会打开人情账查一下？"
```

---

## 04.1 Gift Management

**核心动作：** 搜索联系人 → 查看往来历史 → 进入 AI 建议
**驱动力锚点：** D3+（清楚人情花了多少）→ 以人为中心的关系网络

### 审核结果

| 元素 | 现有文案 | 判定 | 精修 |
|------|---------|------|------|
| Page Title | 人情账 | ✅ 口语化 | — |
| Action: Record | 记一笔 | ✅ 好，与 06.1 一致 | — |
| Action: Scan | 拍照导入礼簿 | ✅ | — |
| Action: File Import | 从表格导入 | ✅ | — |
| Search Placeholder | 搜索联系人... | ✅ | — |
| Annual Card | {year}年人情总览 | ✅ | — |
| Stat: Given | 送出 | ✅ | — |
| Stat: Received | 收到 | ✅ | — |
| Stat: Net | 净支出 | ✅ 中性 | — |
| Stat: Contacts | 往来 {count} 人 | ✅ | — |
| Upcoming Title | 即将到来 | ✅ | — |
| Upcoming: Undecided | 待定 · 去看建议 → | ✅ 好，引导 04.2 | — |
| Upcoming: Decided | ¥{amount} · 已准备 | ✅ | — |
| Add Event | + 添加即将到来的事件 | ✅ | — |
| Event: Contact | 谁的事？ | ✅ 好，口语化 | — |
| Event: Note | 备注（选填，如酒店地址） | ✅ 实用 | — |
| Event Save | 添加事件 | ✅ | — |
| Contact List Title | 最近往来 | ✅ | — |
| Detail: Net | 净额 | ✅ 中性色 | — |
| Detail: Timeline | 往来时间线 | ✅ | — |
| AI CTA Title | 获取回礼建议 | ✅ | — |
| AI CTA Sub (event) | {name}{event}{date}，AI帮你算该随多少 | ⚠️ "算该随"偏指令 | {name}{event}{date}，看看 AI 怎么建议 |
| AI CTA Sub (no event) | 根据往来历史，AI为你推荐合适的金额 | ✅ | — |
| Add Record | ＋ 添加往来记录 | ✅ | — |
| Amount Chips | ¥200/500/600/800/1000/2000 | ✅ 快捷金额 | — |
| Empty Headline | 人情往来，一笔一笔都帮你记着 | ✅ 好，温暖 | — |
| Empty Subtitle | 办过酒席？拍张礼簿照片，几十条记录一次导入 | ✅ 好，场景化 | — |
| Empty CTA | 拍照导入礼簿 | ✅ | — |
| Empty Secondary | 先记一笔 > | ✅ | — |

### 精修说明

- AI CTA Sub: "AI帮你算该随多少"中"算该随"暗示 AI 在做决定，与 04.2 的"参谋而非指令"策略冲突。改为"看看 AI 怎么建议"保留用户决策权。
- 其余文案质量极高。"人情往来，一笔一笔都帮你记着"是温暖的承诺，"谁的事？"的口语化问法降低输入压力。

---

## 04.1a Gift Book Import

**核心动作：** 拍照 → 确认识别 → 补充事件信息 → 完成导入
**驱动力锚点：** D3-（害怕手动输入）→ "一拍全有"

### 审核结果

| 元素 | 现有文案 | 判定 | 精修 |
|------|---------|------|------|
| Page Title | 导入礼簿 | ✅ | — |
| Album Button | 选相册 | ✅ | — |
| Capture Tips | 平放礼簿，光线均匀，确保文字清晰可见 | ✅ 实用 | — |
| Multi-Page Hint | 多页？连续拍摄后一起识别 | ✅ 好，口语化 | — |
| Start Button | 开始识别 ({count}张) | ✅ | — |
| Processing Title | 正在识别礼簿... | ✅ | — |
| Processing Sub | 逐行辨认姓名和金额 | ✅ 好，拟人化 | — |
| Progress | 已识别 {done} / 约{total} 条 | ✅ | — |
| Select All | 全选 | ✅ | — |
| Record Count | 识别到 {count} 条记录 | ✅ | — |
| Review Instruction | 请确认识别结果是否正确 | ⚠️ "请确认"偏正式 | 看看识别得对不对 |
| Confidence: Name | 姓名不确定 | ✅ 用"不确定"非"错误" | — |
| Confidence: Amount | 金额不确定 | ✅ | — |
| Confidence: Both | 需要确认 | ✅ | — |
| Issue Summary | ⚠️ {count} 条需要确认 | ✅ | — |
| Next (no issues) | 下一步：补充事件信息 | ✅ | — |
| Next (has issues) | 下一步（{count} 条待确认） | ✅ | — |
| Event Title | 这些记录来自哪次事件？ | ✅ 好，口语化 | — |
| Direction Default | 收到 | ✅ 合理默认 | — |
| Event Desc Placeholder | 事件描述（选填，如"儿子满月宴"） | ✅ | — |
| Import Confirm | 确认导入 {count} 条记录 | ✅ | — |
| Success Headline | 导入完成 | ✅ | — |
| View CTA | 查看人情账 | ✅ | — |
| Continue CTA | 继续导入 | ✅ | — |

### 精修说明

- Review Instruction: "请确认识别结果是否正确"偏正式，"看看识别得对不对"更像朋友帮忙后让你验收。

---

## 04.2 Gift Smart Suggestion

**核心动作：** 查看 AI 建议区间 → 选择金额 → 确认记录
**驱动力锚点：** D4-（不想失礼或过度）→ "心里有底的决定"

### 审核结果

| 元素 | 现有文案 | 判定 | 精修 |
|------|---------|------|------|
| Page Title | 回礼建议 | ✅ | — |
| AI Label | AI 建议 | ✅ | — |
| Recommended | 推荐: ¥{amount} | ✅ | — |
| Reasoning Title | 建议依据 | ✅ 好，推理透明 | — |
| History Example | 张三在你儿子满月宴时随了 ¥600 | ✅ 好，口语化 | — |
| Event Tier | 婚礼规格通常高于满月宴，建议持平或略高 | ✅ | — |
| Relation | 同事关系，建议保持礼尚往来的平衡 | ✅ | — |
| Cultural Norm | 当地婚礼同事随礼常见区间 ¥500-¥1,000 | ✅ | — |
| Reference Title | 同类参考 | ✅ | — |
| Reference Disclaimer | 参考区间基于文化惯例，仅供参考 | ✅ 好，尊重决策权 | — |
| Amount Title | 选择金额 | ✅ | — |
| Recommended Badge | 推荐 | ✅ | — |
| Custom Amount | 自定义金额 | ✅ | — |
| Confirm Button | 确认并记录 ¥{amount} | ✅ | — |
| Reminder (unset) | 设置婚礼日提醒？ | ✅ 实用 | — |
| Reminder (set) | 已设置 {date} 提醒 ✓ | ✅ | — |
| Success Headline | 已记录 | ✅ | — |
| Success Summary | {name}{event} 送 ¥{amount} | ✅ | — |
| Success Subtitle | 人情账已更新 | ✅ | — |
| View CTA | 查看人情账 | ✅ | — |
| Return Home | 返回首页 | ✅ | — |
| Loading | 正在分析... | ✅ | — |
| Loading Sub | 综合历史往来和场景惯例为你计算 | ⚠️ "为你计算"偏技术 | 综合历史往来和当地惯例 |
| Edit Save | 重新计算建议 | ⚠️ "计算"偏技术 | 重新分析 |

### 精修说明

- Loading Sub: "为你计算"有技术感，去掉后更简洁。"场景惯例"改为"当地惯例"更口语。
- Edit Save: "重新计算"→"重新分析"，AI 在"分析"比"计算"更有温度。

---

## 全局精修汇总

### 修改清单（共 5 处）

| # | 页面 | 元素 | 原文 | 精修 | 理由 |
|---|------|------|------|------|------|
| 1 | 04.1 | AI CTA Sub | AI帮你算该随多少 | 看看 AI 怎么建议 | 保留用户决策权 |
| 2 | 04.1a | Review Instruction | 请确认识别结果是否正确 | 看看识别得对不对 | 口语化 |
| 3 | 04.2 | Loading Sub | 综合历史往来和场景惯例为你计算 | 综合历史往来和当地惯例 | 去技术感 |
| 4 | 04.2 | Edit Save | 重新计算建议 | 重新分析 | AI"分析"更有温度 |
| 5 | 04.2 | (EN) Loading Sub | Combining history and cultural norms | ✅ 保留 | — |

### 保留不动的关键文案

| 文案 | 页面 | 锚定驱动力 |
|------|------|-----------|
| 人情往来，一笔一笔都帮你记着 | 04.1 | D3+ 温暖承诺 |
| 谁的事？ | 04.1 | 口语化输入 |
| 逐行辨认姓名和金额 | 04.1a | 拟人化 AI |
| 参考区间基于文化惯例，仅供参考 | 04.2 | D4- 尊重决策权 |
| 张三在你儿子满月宴时随了 ¥600 | 04.2 | 推理透明 |

---

## Strategic Traceability

```yaml
traceability:
  trigger_map:
    D3_positive: "04.1 人情关系网全景, 04.1a 批量导入"
    D4_negative: "04.2 AI 建议区间(非单一数字), 04.2 Reasoning 透明"
    D3_negative: "04.1 快捷金额Chips, 04.1a 一拍全有, 04.2 一键确认"
  cultural_sensitivity:
    funeral: "04.2 用'参考'替代'建议'，避免'规格''常见'措辞"
  forbidden_words_check:
    债务/欠款: "未出现 ✅"
    应该/必须: "未出现 ✅"
    OCR/识别引擎: "未出现 ✅"
    算法/模型: "未出现 ✅"
```