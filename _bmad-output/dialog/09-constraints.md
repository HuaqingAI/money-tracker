# Constraints Dialog

**Step:** Phase 1 - Step 9: Constraints
**Completed:** 2026-04-08
**Session:** 1

---

## Conversation Flow

### Discussion
**Saga:** 技术、预算、合规、时间、平台约束？

**Sue:** 技术栈需要建议；自己一个人开发；安全合规优先级不高（早期用户不会因为安全做得好就信任你）

### Technical Discussion
经过详细讨论Java/Spring vs Next.js/Node的权衡，以及Next.js长期可扩展性的分析，Sue确认选择Next.js全栈方案。

**关键讨论点：**
- Java适合大团队大系统，但一个人开发效率太低
- Next.js能撑到10万用户级别
- 后期风险是"局部重构"（拆出计算密集任务）而非"推倒重来"
- Sue认同这个渐进式演进路径

---

## Reflection Quality

- Technical stack discussion was thorough with multiple rounds
- Sue made informed decision after understanding trade-offs

---

## Confirmed Constraints

### Team
- **开发者:** Sue，一个人全栈开发
- **含义:** 技术选型必须优先考虑个人开发效率，而非系统性能上限

### Technology Stack (决策)

| 层 | 选择 | 理由 |
|---|------|------|
| 移动端 | React Native (Expo) | 跨平台，一套代码出iOS+Android |
| 后端 + 管理后台 | Next.js (全栈) | 统一JS/TS技术栈，API Routes + 管理页面共用 |
| 数据库 + 认证 | Supabase (PostgreSQL + Auth) | 托管服务，零运维 |
| AI能力 | Claude/GPT API | 直接调用，不自建模型 |
| 部署 | Vercel + Supabase Cloud | Serverless，按需计费 |
| 推送 | FCM / OneSignal | 主动洞察推送是核心功能 |

### Security / Compliance
- 早期优先级不高
- 基础安全措施做好即可，不需要过度投入
- 理由：早期用户不会因为安全做得好就信任产品，信任来自产品体验

### Budget
- 一个人开发，倾向使用免费/低成本托管服务
- Vercel + Supabase 免费额度够MVP阶段使用

### Timeline
- 未明确指定，后续Launch Requirements阶段确定

### Evolution Strategy
- 现在：Next.js全栈快速验证
- 中期：计算密集模块（定时任务、AI批处理）拆成独立worker
- 后期：按需拆微服务，Next.js保持做API网关和管理后台
