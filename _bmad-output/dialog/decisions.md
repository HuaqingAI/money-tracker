# Key Decisions Log

**Project:** Money Tracker
**Started:** 2026-04-08

---

## Decision 1: Business Model

**Date:** 2026-04-08
**Step:** Phase 1 - Step 5: Business Model

### Discussion

**Saga:** Money Tracker 最终靠什么赚钱？有没有可能未来会有企业/团队版本？

**Sue:** 免费增值吧；我觉得会有（企业版）

**Saga:** 免费增值的分界线？企业版是第一版还是未来？

**Sue:** 高成本的以及最有特色的放付费层；企业版是未来规划

### Decision

**Business Model:** B2C Freemium（免费增值）

- **免费层：** 基础AI记账（自动捕获、基础分类、基本报表）
- **付费层：** 高成本AI功能（深度分析、消费模拟、压力测试）+ 最有特色的差异化功能（人情账管理、多身份核算、AI财务对话、智能改善建议）
- **企业/团队版：** 未来规划，第一版不纳入

### Rationale

用免费的"零记账"核心体验降低获客门槛，用付费的差异化能力变现。高成本AI功能放付费层控制成本，最有特色功能放付费层提升转化动力。

### Implications

- 产品架构需要支持免费/付费功能分层
- 免费层必须足够好用以吸引和留住用户
- 付费层价值需要清晰可感知
- 未来需要预留企业/团队版的扩展空间

---

## Decision 2: Technology Stack

**Date:** 2026-04-08
**Step:** Phase 1 - Step 9: Constraints

### Discussion

经过Java/Spring vs Next.js/Node的详细权衡，以及Next.js长期可扩展性的分析。

**Sue的关键问题：** Next.js能撑到最终形态吗？后期有重构风险吗？
**结论：** 风险是"局部重构"（拆出计算密集任务）而非"推倒重来"，可接受。

### Decision

**全栈技术栈：** React Native + Next.js + Supabase + AI API + Vercel

### Rationale

一个人开发，全JS/TS统一技术栈效率最高。托管服务优先，把精力集中在产品逻辑而非基础设施。后期可渐进式演进（拆微服务），不需要推倒重来。

### Implications

- 全JS/TS，前后端代码可复用
- 依赖Vercel和Supabase的托管服务
- AI能力通过API调用，不自建模型
- 后期计算密集任务可能需要拆独立worker
