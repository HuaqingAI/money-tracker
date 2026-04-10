---
title: "Product Brief: money-tracker"
status: complete
signed_off_by: Sue
created: "2026-04-08"
updated: "2026-04-09"
---

# Money Tracker -- Product Brief

**Status:** APPROVED
**Signed off by:** Sue
**Date:** 2026-04-08

---

## 1. Vision

打造一个零负担的AI财务管家 -- 通过AI自动捕获和智能管理，消灭"手动记账"的动作，让用户无感享受财务清晰的好处，同时提供人情账管理、多身份核算、智能洞察等增值能力。

**一句话定位：** 零记账的AI财务管家

---

## 2. Positioning

对于想管好钱但不愿花时间记账的中国用户，Money Tracker 是一个AI驱动的智能财务管家，让你零负担地获得财务清晰。与传统记账APP需要手动输入不同，Money Tracker 通过AI自动捕获、智能分类和主动管理，让你根本不需要"记账"这个动作。

**竞品：** 传统记账APP（随手记、鲨鱼记账等）、Excel手动记录、不记账凭感觉花
**核心差异：** 真正的AI零记账体验 + 人情账管理（蓝海）+ 多身份/多人协作 + 智能洞察

---

## 3. Target Users

### Primary: 已婚家庭 / 大强型
- 30岁左右，已婚，还房贷
- 痛点：家庭财务"说不清"，夫妻缺乏共同事实基础
- 需求：共享家庭账本 + 消费归属/受益人维度 + 同类家庭对比

### Secondary (同为第一批覆盖)

**城市白领 / 小丽型**
- 25岁左右，月光族
- 痛点：小额无感消费累积，月底震惊
- 需求：消费感知 + 可执行的优化建议

**副业人群 / 小美型**
- 28岁左右，白天上班晚上带货
- 痛点：多财务身份混在一起，副业盈亏算不清
- 需求：多身份独立核算 + 副业利润计算

**人情往来用户**
- 有活跃社交生活的中国用户
- 痛点：人情债务是网络结构，回礼决策困难
- 需求：超长周期人情管理 + 智能回礼建议

---

## 4. Product Concept: Three-Layer Architecture

### Layer 1: Zero-Input Engine (零记账引擎)
AI自动从各种渠道捕获交易，智能分类，用户几乎不需要手动操作。所有用户共享的基础能力，产品核心竞争力。

### Layer 2: Multi-Dimensional Understanding (多维度理解)
同一笔消费可以从不同维度被理解：
- 受益人维度（已婚家庭）
- 身份维度（副业人群）
- 关系维度（人情往来）
- 习惯维度（城市白领）

### Layer 3: AI Butler Intelligence (AI管家对话)
主动洞察、回答问题、给建议。从工具跃迁为顾问。

---

## 5. Core Features

### Layer 1 -- 免费层

| # | Feature | Description |
|---|---------|-------------|
| F1 | 账单自动导入 | 支持微信、支付宝账单文件导入；银行短信/通知解析 |
| F2 | AI智能分类 | 自动识别消费类别，学习用户习惯 |
| F3 | 基础报表 | 月度收支概览、分类占比、趋势图 |

### Layer 2 -- 付费层核心

| # | Feature | Primary User |
|---|---------|-------------|
| F4 | 受益人标注 | 已婚家庭 |
| F5 | 共享家庭账本 | 已婚家庭 |
| F6 | 多身份核算 | 副业人群 |
| F7 | 人情账管理 | 人情往来用户 |
| F8 | 消费习惯雷达 | 城市白领 |

### Layer 3 -- 付费层高级

| # | Feature |
|---|---------|
| F9 | AI对话 |
| F10 | 主动洞察推送 |
| F11 | 优化建议 |
| F12 | 消费模拟 |
| F13 | 同类对比 |

---

## 6. Business Model

**模式：** B2C Freemium（免费增值）

- **免费层：** F1-F3（零记账核心体验）-- 获客
- **付费层：** F4-F13（高成本AI功能 + 差异化功能）-- 变现
- **企业/团队版：** 未来规划，第一版不纳入

---

## 7. Success Metrics

**早期北极星指标：**
1. **记账覆盖率** -- AI自动捕获占实际消费的百分比，验证零记账体验
2. **用户满意度** -- NPS / 应用商店评分 / 用户反馈

**后期指标（产品验证后）：** 用户增长、留存率、付费转化率

---

## 8. Constraints

- **团队：** Sue一个人全栈开发
- **技术栈：** React Native (Expo) + Next.js + 自建Supabase (Docker) + DeepSeek/Qwen API + 阿里云ECS
- **安全合规：** 早期优先级不高，基础措施即可
- **预算：** 倾向免费/低成本托管服务（MVP年度约2000-4000元）
- **时间：** 不设硬性deadline

---

## 9. Roadmap

### Phase 1: MVP -- 验证零记账
- 账单导入（支付宝/微信）+ AI自动分类 + 基础报表 + 注册登录
- 验证目标：零记账体验是否成立？用户是否满意？

### Phase 2: 差异化 -- 多维理解
- 受益人标注 + 共享家庭账本 + 消费习惯雷达 + 多身份核算 + 人情账管理
- 目标：覆盖四类用户差异化需求，启动付费

### Phase 3: AI管家 -- 智能层
- AI对话 + 主动洞察 + 优化建议 + 消费模拟 + 同类对比
- 目标：从工具跃迁为顾问

---

## 10. Key Decisions Log

1. **Business Model:** B2C Freemium -- 高成本+最有特色功能放付费层
2. **Technology Stack:** React Native + Next.js + 自建Supabase + DeepSeek -- 一个人全栈JS/TS效率优先，中国落地版

---

## Next Steps

Product Brief complete. Ready for:
- [ ] PRD (Product Requirements Document) -- 详细需求文档
- [ ] UX Design -- 用户体验设计
- [ ] Technical Architecture -- 技术架构设计
