# Scenario 06 — 手动记账与分类管理：正式文案定稿

> 五模型战略框架审核 + 精修
> Generated: 2026-04-12
> Status: FINAL

---

## Strategic Context

```yaml
purpose: "让用户在 3 秒内补一笔 AI 未捕获的消费，同时提供分类规则的透明化管理——补充而非替代零记账"
persona: "大强 Danny（代表用户）— 菜市场买菜、朋友转账请客等现金/非标场景"
primary_drivers: [D3- 害怕手动输入, D2+ 不动手就知道(AI分类管理延伸)]
awareness_journey: "Most Aware (日常使用)"
golden_circle: "WHY(06.1 补一笔≠手动记账) → HOW(06.2 AI分类透明管理) → WHAT(06.3 iOS快捷触发)"
empowerment_aha: "06.2 准确率数字 — 原来 AI 已经这么准了"
review_question: "大强在菜市场付完现金后，会不会顺手补一笔？"
```

---

## 06.1 Manual Entry

**核心动作：** 输入金额 → 选分类 → 保存
**驱动力锚点：** D3-（害怕手动输入）→ "记一笔"而非"手动记账"

### 审核结果

| 元素 | 现有文案 | 判定 | 精修 |
|------|---------|------|------|
| Page Title | 记一笔 | ✅ 好，轻量 | — |
| Mode: Voice | 语音 | ✅ | — |
| Mode: Form | 表单 | ⚠️ "表单"偏技术 | 键盘 |
| Mode: Screenshot | 截图 | ✅ | — |
| Amount Placeholder | 金额 | ✅ | — |
| Category Default | 选择分类 | ✅ | — |
| Category AI | {emoji} {category}·{subcategory} | ✅ 有 AI badge | — |
| Note Placeholder | 备注（选填） | ✅ | — |
| Save Button | 保存 | ✅ | — |
| Voice Button | 按住说话 | ✅ 好，明确交互 | — |
| Voice Hint | 试试说：菜市场50块 | ✅ 好，具象化 | — |
| Voice Edit | 修改 | ✅ | — |
| Voice Save | 保存 | ✅ | — |
| Voice Error | 没听清，再说一次？ | ✅ 好，轻松语气 | — |
| Voice Retry | 再试一次 | ✅ | — |
| Screenshot Picker | 拍照或选择截图 | ✅ | — |
| OCR Results | 识别到 {count} 笔消费： | ✅ | — |
| OCR Save | 保存 {checked_count} 笔 | ✅ | — |
| OCR Processing | 正在识别消费信息... | ✅ | — |
| OCR Error | 未识别到消费信息，试试手动输入？ | ⚠️ "手动输入"触发 D3- | 没识别出来，试试语音或键盘？ |
| OCR Manual Button | 手动输入 | ⚠️ | 自己填 |
| Category Search | 搜索分类 | ✅ | — |
| Category Frequent | 常用 | ✅ | — |
| Success Message | 已记录 ¥{amount} {category} | ✅ | — |
| Success Action | 调整分类 | ✅ | — |

### 精修说明

- Mode: Form: "表单"是开发者用语，大强说的是"键盘"——他看到数字键盘就知道该怎么操作。
- OCR Error: "手动输入"直接触发 D3-。改为"语音或键盘"引导到其他低摩擦模式。
- OCR Manual Button: "手动输入"→"自己填"，更口语。

---

## 06.2 Category Management

**核心动作：** 查看 AI 准确率 → 修正规则 → 创建自定义分类
**驱动力锚点：** D2+（AI 分类管理延伸）→ 准确率是信任锚点

### 审核结果

| 元素 | 现有文案 | 判定 | 精修 |
|------|---------|------|------|
| Page Title | 分类管理 | ✅ | — |
| Accuracy Label | AI 分类准确率 | ✅ | — |
| Stats Line 1 | 本月 {total} 笔自动分类 | ✅ | — |
| Stats Line 2 | 其中 {corrected} 笔被手动修正 | ⚠️ "手动修正"偏技术 | 其中 {corrected} 笔被你调整过 |
| Rule Edit Title | 编辑规则 | ✅ | — |
| Merchant Label | 商户 | ✅ | — |
| Current Category | 当前分类 | ✅ | — |
| New Category | 修改为 | ✅ | — |
| Retroactive Check | 同时修改历史记录 | ✅ 好，默认勾选 | — |
| Retroactive Desc | (将修改 {count} 笔记录) | ✅ 展示影响范围 | — |
| Edit Cancel | 取消 | ✅ | — |
| Edit Confirm | 确认修改 | ✅ | — |
| Create Button | + 创建自定义分类 | ✅ | — |
| iOS Shortcuts | iOS 快捷指令配置 | ✅ iOS only | — |
| Create Title | 创建自定义分类 | ✅ | — |
| Name Placeholder | 如：宠物 | ✅ | — |
| Icon Label | 选择图标 | ✅ | — |
| Parent Category | 归属大类 | ✅ | — |
| Create Confirm | 创建 | ✅ | — |

### 精修说明

- Stats Line 2: "被手动修正"→"被你调整过"——主语从"手动"转到"你"，Badass Users 原则。

---

## 06.3 iOS Shortcuts Guide

**核心动作：** 配置 Siri/BackTap/截图快捷触发
**驱动力锚点：** D3-（手动输入恐惧）→ "让记一笔变得比打开 APP 还快"
**备注：** Phase 2 轻量规格，无完整 Object ID

### 审核结果

| 元素 | 现有文案 | 判定 | 精修 |
|------|---------|------|------|
| Page Title | 快速触发记账 | ⚠️ "记账"禁用词 | 快速记一笔 |
| Tab: Voice | 🎤 语音 | ✅ | — |
| Tab: Key | 📲 按键 | ✅ | — |
| Tab: Screenshot | 📸 截屏 | ✅ | — |
| Voice Hero | 嘿Siri，记一笔午饭38块 | ✅ 好，具象化 | — |
| Voice Sub | 适合：开车、做饭 | ✅ 场景化 | — |
| Preset 1 | 语音记账 | ⚠️ | 语音记一笔 |
| Preset 1 Trigger | 记一笔{描述}{金额} | ✅ | — |
| Preset 1 Action | 添加到Siri | ✅ | — |
| Preset 2 | 快速记固定消费 | ✅ | — |
| Preset 2 Trigger | 记通勤打车 | ✅ | — |
| Key Hero | 双击手机背面，直接弹出记账 | ⚠️ "记账" | 双击手机背面，直接弹出记一笔 |
| Key Sub | 适合：地铁、会议后 | ✅ | — |
| Key Step 1 | 安装"快速记账"快捷指令 | ⚠️ | 安装"快速记一笔"快捷指令 |
| Key Step 2 | 打开 iOS 设置 > ... > 选择"快速记账" | ⚠️ | …选择"快速记一笔" |
| Action Button | iPhone 15 Pro 用户？也可以绑定到 Action Button | ✅ | — |
| Screenshot Hero | 截屏支付页，自动识别金额 | ✅ | — |
| Screenshot Sub | 适合：刚付完款 | ✅ | — |
| Screenshot Note | App 安装后自动出现在系统分享菜单中 | ✅ 好，零配置 | — |
| Test Button | 开始测试 | ✅ | — |

### 精修说明

- "记账"全局替换为"记一笔"：与 06.1 页面标题保持一致，也与全 APP 禁用词规则对齐。

---

## 全局精修汇总

### 修改清单（共 9 处）

| # | 页面 | 元素 | 原文 | 精修 | 理由 |
|---|------|------|------|------|------|
| 1 | 06.1 | Mode: Form | 表单 | 键盘 | 去开发者术语 |
| 2 | 06.1 | OCR Error | …试试手动输入？ | …试试语音或键盘？ | 避免 D3- |
| 3 | 06.1 | OCR Manual Button | 手动输入 | 自己填 | 口语化 |
| 4 | 06.2 | Stats Line 2 | …被手动修正 | …被你调整过 | Badass Users |
| 5 | 06.3 | Page Title | 快速触发记账 | 快速记一笔 | "记账"禁用词 |
| 6 | 06.3 | Preset 1 | 语音记账 | 语音记一笔 | 同上 |
| 7 | 06.3 | Key Hero | …弹出记账 | …弹出记一笔 | 同上 |
| 8 | 06.3 | Key Step 1 | 快速记账 | 快速记一笔 | 同上 |
| 9 | 06.3 | Key Step 2 | 快速记账 | 快速记一笔 | 同上 |

### 保留不动的关键文案

| 文案 | 页面 | 锚定驱动力 |
|------|------|-----------|
| 记一笔 | 06.1 | D3- 轻量化框架 |
| 按住说话 | 06.1 | 隐私控制 |
| 试试说：菜市场50块 | 06.1 | 具象化引导 |
| 没听清，再说一次？ | 06.1 | 轻松语气 |
| AI 分类准确率 {rate}% | 06.2 | D2+ 信任锚点 |
| 同时修改历史记录 (将修改 N 笔) | 06.2 | 追溯修改透明 |
| 嘿Siri，记一笔午饭38块 | 06.3 | 具象化场景 |

---

## Strategic Traceability

```yaml
traceability:
  trigger_map:
    D3_negative: "06.1 '记一笔'框架, 06.1 语音/截图模式, 06.3 快捷触发"
    D2_positive: "06.2 准确率数字(信任锚点), 06.2 规则透明化"
  forbidden_words_check:
    手动: "06.1 OCR Error/Button 已修正, 06.2 Stats已修正 ✅"
    记账: "06.3 全部修正为'记一笔' ✅"
    填写/必填: "未出现 ✅"
    表单: "06.1 已修正为'键盘' ✅"
```