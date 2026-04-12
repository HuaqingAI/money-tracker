# Scenario 08 — 账户与设置管理：正式文案定稿

> 五模型战略框架审核 + 精修
> Generated: 2026-04-12
> Status: FINAL

---

## Strategic Context

```yaml
purpose: "让用户在'我的'空间找到一切需要的功能入口，在设置中确认数据安全，在个人资料中掌控身份"
persona: "大强 Danny（代表用户）— 低频审计型使用"
primary_drivers: [D5- 担心数据安全, D3- 害怕手动输入(Hub入口)]
awareness_journey: "Most Aware (日常使用)"
golden_circle: "WHY(08.0 个人空间) → HOW(08.1 安全确认) → WHAT(08.2 身份掌控)"
empowerment_aha: "08.1 数据安全四件套 — 原来我的数据是加密的、最小化采集的、我可以导出和删除的"
review_question: "大强看完数据安全说明后，会不会放心地继续用下去？"
```

---

## 08.0 My Hub

**核心动作：** 找到目标功能入口（1-2 次点击）
**驱动力锚点：** 功能入口整合 — 给散落的 P2 功能一个"家"

### 审核结果

| 元素 | 现有文案 | 判定 | 精修 |
|------|---------|------|------|
| Name Fallback | 用户 | ✅ | — |
| Badge: Free | 免费版 | ✅ | — |
| Badge: Trial | 体验会员 · 到期 {date} | ✅ | — |
| Badge: Active | 尊享会员 | ✅ | — |
| Badge: Expired | 会员已过期 | ✅ | — |
| Feature Header | 我的功能 | ✅ | — |
| Feature: Gift | 人情账 | ✅ | — |
| Feature: Family | 家庭账本 | ✅ | — |
| Feature: Identity | 多身份 | ✅ | — |
| Manual Title | 记一笔 | ✅ 与 06.1 一致 | — |
| Manual Subtitle | AI 没捕到的，手动补上 | ⚠️ "手动"触发 D3- | AI 没捕到的，补一笔 |
| Tool: Import | 导入数据 | ✅ | — |
| Tool: Category | 分类管理 | ✅ | — |
| Menu: Settings | 设置 | ✅ | — |
| Menu: Help | 帮助与反馈 | ✅ | — |
| Menu: About | 关于 | ✅ | — |

### 精修说明

- Manual Subtitle: "手动补上"中的"手动"在 06.1 禁用词列表中。改为"补一笔"——动作一致，去掉"手动"二字。

---

## 08.1 Settings

**核心动作：** 确认数据安全 → 调整通知偏好
**驱动力锚点：** D5-（担心数据安全）→ 数据安全放第一位

### 审核结果

| 元素 | 现有文案 | 判定 | 精修 |
|------|---------|------|------|
| Page Title | 设置 | ✅ | — |
| Group: Privacy | 数据与隐私 | ✅ 好，放第一位 | — |
| Data Security | 数据安全说明 | ✅ | — |
| Notification Perm | 通知权限管理 | ✅ | — |
| Perm Badge: On | 已开启 | ✅ 绿色 | — |
| Perm Badge: Off | 未开启 | ✅ 橙色 | — |
| Data Export | 数据导出 | ✅ | — |
| Clear Cache | 清除本地缓存 | ✅ | — |

### 审核结果 — 数据安全四件套

| # | 标题 | 说明 | 判定 | 精修 |
|---|------|------|------|------|
| 1 | 加密存储 | 所有财务数据使用 AES-256 加密存储，即使设备丢失也无法被读取 | ⚠️ "AES-256"偏技术 | 所有财务数据加密存储，即使设备丢失也无法被读取 |
| 2 | 传输加密 | 数据传输全程 HTTPS/TLS 加密，防止中间人窃取 | ⚠️ "HTTPS/TLS""中间人"偏技术 | 数据传输全程加密，不会被中途截取 |
| 3 | 最小化采集 | 只提取交易金额、商户名和时间，不存储通知原文 | ⚠️ "交易金额"→ | 只提取消费金额、商户名和时间，不存储通知原文 |
| 4 | 你的数据你做主 | 随时可导出全部数据，也可注销账户永久删除所有记录 | ✅ 好，掌控感 | — |

### 审核结果 — 通知偏好

| 元素 | 现有文案 | 判定 | 精修 |
|------|---------|------|------|
| Group: Notifications | 通知偏好 | ✅ | — |
| AI Insights | AI 洞察推送 | ✅ | — |
| AI Desc | 消费异常、趋势变化等智能发现 | ⚠️ "智能发现"偏产品语 | 消费变化、趋势异动等 AI 发现 |
| Report | 周报 / 月报提醒 | ✅ | — |
| Report Desc | 新报表生成时提醒查看 | ✅ | — |
| Gift Reminder | 人情提醒 | ✅ | — |
| Gift Desc | 即将到来的人情事件和回礼建议 | ✅ | — |
| Product Update | 产品更新 | ✅ | — |
| Product Desc | 新功能上线、版本更新通知 | ✅ | — |

### 审核结果 — 通用 + 关于

| 元素 | 现有文案 | 判定 | 精修 |
|------|---------|------|------|
| Group: General | 通用 | ✅ | — |
| Language | 语言 | ✅ | — |
| Currency | 默认货币 | ✅ | — |
| Dark Mode | 深色模式 | ✅ | — |
| Group: About | 关于 | ✅ | — |
| About Us | 关于我们 | ✅ | — |
| Terms | 用户协议 | ✅ | — |
| Privacy Policy | 隐私政策 | ✅ | — |
| Feedback | 意见反馈 | ✅ | — |
| Logout | 退出登录 | ✅ 红色 | — |
| Logout Confirm | 确认退出登录？ | ✅ | — |
| Logout Msg | 退出后需重新登录才能使用 | ✅ | — |
| Logout Action | 退出 | ✅ | — |
| Version | 版本 {app_version} | ✅ | — |

### 精修说明

- 数据安全四件套: 去掉 AES-256、HTTPS/TLS、"中间人"等技术术语。大强不需要知道具体加密算法，他需要知道"加密了"和"不会被截取"。
- "交易金额"→"消费金额"：全局统一。
- AI Insights Desc: "智能发现"在 06.2 禁用词（"智能""学习能力"）范围内，改为"AI 发现"。

---

## 08.2 Profile / Account

**核心动作：** 修改个人信息 / 查看会员状态 / 注销账户
**驱动力锚点：** D5-（数据掌控感）→ "你的数据你做主"的落地

### 审核结果

| 元素 | 现有文案 | 判定 | 精修 |
|------|---------|------|------|
| Page Title | 个人资料 | ✅ | — |
| Avatar Hint | 点击修改头像 | ✅ | — |
| Group: Basic | 基本信息 | ✅ | — |
| Nickname Label | 昵称 | ✅ | — |
| Nickname Sheet | 修改昵称 | ✅ | — |
| Nickname Placeholder | 输入新昵称 | ✅ | — |
| Nickname Save | 保存 | ✅ | — |
| Gender Options | 男 / 女 / 不愿透露 | ✅ 好，有"不愿透露" | — |
| Birthday | 生日 | ✅ | — |
| Group: Security | 账户安全 | ✅ | — |
| Phone Label | 手机号 | ✅ | — |
| Phone: Unbound | 未绑定 | ✅ | — |
| WeChat Label | 微信 | ✅ | — |
| WeChat: Bound | 已绑定 | ✅ | — |
| WeChat: Unbound | 未绑定 | ✅ | — |
| Unbind Confirm | 确认解绑微信？ | ✅ | — |
| Unbind Msg | 解绑后将无法使用微信登录本 APP | ✅ | — |
| Unbind Action | 解绑 | ✅ | — |
| Password | 修改密码 | ✅ | — |
| Group: Membership | 会员状态 | ✅ | — |
| Expiry | 有效期至 {expiry_date} | ✅ | — |
| Free CTA | 领取免费会员体验 > | ✅ | — |
| Trial CTA | 查看会员功能 > | ✅ | — |
| Active CTA | 管理会员 > | ✅ | — |
| Expired CTA | 续费 > | ✅ | — |
| Expired Msg | 续费解锁全部功能 | ✅ | — |
| Free Plan | 基础版 | ✅ 与 02.1 一致 | — |
| Trial Plan | 全功能体验 | ✅ | — |
| Expired Plan | 已过期 | ✅ | — |

### 审核结果 — 注销流程

| 步骤 | 现有文案 | 判定 | 精修 |
|------|---------|------|------|
| Delete Label | 注销账户 | ✅ 用"注销"非"删除" | — |
| Step 1 Warning | 注销账户将永久删除以下数据：所有交易记录和分类数据…… | ⚠️ "交易记录" | ……所有消费记录和分类…… |
| Step 2 Export | 注销前建议先导出你的数据 [导出我的数据] [继续注销] | ✅ 好，先导出 | — |
| Step 3 Verify | 短信验证码 / 微信重新授权 | ✅ | — |
| Step 4 Final | 请输入「确认注销」以完成操作 | ✅ | — |
| Step 5 Processing | 正在处理注销请求... | ✅ | — |
| Step 6 Complete | 账户已注销。感谢你使用过 {app_name} | ✅ 好，有温度 | — |

### 精修说明

- Step 1: "交易记录"→"消费记录"，全局统一。
- 注销流程 6 步设计合理——警告→导出建议→身份验证→二次确认→处理→完成，兼顾合规和用户体验。"感谢你使用过"的过去时态有温度。

---

## 全局精修汇总

### 修改清单（共 7 处）

| # | 页面 | 元素 | 原文 | 精修 | 理由 |
|---|------|------|------|------|------|
| 1 | 08.0 | Manual Subtitle | AI 没捕到的，手动补上 | AI 没捕到的，补一笔 | "手动"禁用词 |
| 2 | 08.1 | Security #1 | …AES-256 加密存储… | …加密存储… | 去技术术语 |
| 3 | 08.1 | Security #2 | …HTTPS/TLS 加密，防止中间人窃取 | …加密，不会被中途截取 | 去技术术语 |
| 4 | 08.1 | Security #3 | 只提取交易金额… | 只提取消费金额… | 全局统一 |
| 5 | 08.1 | AI Insights Desc | …智能发现 | …AI 发现 | 禁用词 |
| 6 | 08.2 | Step 1 Warning | …所有交易记录… | …所有消费记录… | 全局统一 |
| 7 | 08.1 | (EN) Security #1 | …AES-256 encrypted… | …encrypted… | 同 #2 |

### 保留不动的关键文案

| 文案 | 页面 | 锚定驱动力 |
|------|------|-----------|
| 免费版 / 体验会员 / 尊享会员 | 08.0 | 会员层级体系 |
| 记一笔 | 08.0 | D3- 轻量框架 |
| 数据与隐私（放第一位） | 08.1 | D5- 信任优先 |
| 你的数据你做主 | 08.1 | D5- 掌控感 |
| 不愿透露（性别选项） | 08.2 | 包容设计 |
| 账户已注销。感谢你使用过 {app_name} | 08.2 | 有温度的告别 |

---

## Strategic Traceability

```yaml
traceability:
  trigger_map:
    D5_negative: "08.1 数据安全四件套(第一位), 08.1 你的数据你做主, 08.2 注销流程"
    D3_negative: "08.0 '补一笔'替代'手动补上'"
  forbidden_words_check:
    手动: "08.0 已修正 ✅"
    交易: "08.1/08.2 已修正为'消费' ✅"
    智能: "08.1 已修正为'AI' ✅"
    绝对安全/请放心: "未出现 ✅"
    AES-256/HTTPS/TLS: "08.1 已修正，去技术术语 ✅"
```

---

## 全 APP 底部 Tab Bar 文案审核

| Tab | 现有 ZH | 判定 | 精修 |
|-----|---------|------|------|
| Home | 首页 | ✅ | — |
| Transactions | 交易 | ⚠️ 与 03.1 统一 | 消费 |
| AI | AI | ✅ | — |
| Me | 我的 | ✅ | — |

**说明：** 底部 Tab "交易"应与 03.1 Header Title 保持一致，统一改为"消费"。