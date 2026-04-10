# UX Scenarios: Money Tracker

> 场景大纲：将触发地图中的用户角色连接到具体的用户旅程

**Created:** 2026-04-09
**Author:** Sue with Saga
**Method:** Whiteport Design Studio (WDS)

---

## Scenario Summary

| ID | Scenario | Persona | Pages | Priority | Status |
|----|----------|---------|-------|----------|--------|
| 01 | 大强的零记账初体验 | 大强 Danny (Primary) | 8 | ⭐ P1 | ✅ Outlined |
| 02 | 大强的家庭共享账本 | 大强 Danny (Primary) | 3 | ⭐ P1 | ✅ Outlined |
| 03 | 小丽的消费真相镜子 | 小丽 Lily (Secondary) | 4 | ⭐ P1 | ✅ Outlined |
| 04 | 大强的人情账管理 | 大强 Danny (Primary) | 2 | P2 | ✅ Outlined |
| 05 | 小美的多身份核算 | 小美 Mei (Tertiary) | 2 | P2 | ✅ Outlined |
| 06 | 手动记账与分类补充 | 全部用户 | 3 | P2 | ✅ Outlined |
| 07 | AI管家智能层 | 全部用户 | 4 | P3 | ✅ Outlined |
| 08 | 账户与设置管理 | 全部用户 | 2 | P3 | ✅ Outlined |

---

## Scenarios

### [01: 大强的零记账初体验](01-dannys-zero-input-first-experience/01-dannys-zero-input-first-experience.md)
**Persona:** 大强 Danny — 不动手就知道钱去哪了（15/15）
**Pages:** Welcome, Onboarding, 注册/登录, 权限授权, 账单导入, 导入处理中, Dashboard, 月度报表
**User Value:** 从下载到看到自动分类月度报表，全程零手动输入
**Business Value:** 验证零记账核心承诺，AI捕获覆盖率 >= 80%

---

### [02: 大强的家庭共享账本](02-dannys-family-shared-ledger/02-dannys-family-shared-ledger.md)
**Persona:** 大强 Danny — 用共同数字讨论家庭开支（14/15）
**Pages:** 订阅/付费, 共享家庭账本, 受益人标注
**User Value:** 夫妻看同一份数据，"你花了多少"变成"我们花了多少"
**Business Value:** 付费转化 + 双用户绑定 = 极高留存率

---

### [03: 小丽的消费真相镜子](03-lilys-spending-mirror/03-lilys-spending-mirror.md)
**Persona:** 小丽 Lily — 看到消费真相（14/15）
**Pages:** 交易列表, 交易详情, 趋势图表, 消费习惯雷达
**User Value:** "原来奶茶花了800" + 可截图分享的消费雷达图
**Business Value:** 社交传播 = 免费获客引擎，目标评分 >= 4.5

---

### [04: 大强的人情账管理](04-dannys-gift-accounting/04-dannys-gift-accounting.md)
**Persona:** 大强 Danny — 清楚人情随礼花了多少（11/15）
**Pages:** 人情账管理, 人情智能建议
**User Value:** 3秒查到历史，智能建议回礼区间，不失礼也不超预算
**Business Value:** 蓝海功能，差异化使用率 >= 30%

---

### [05: 小美的多身份核算](05-meis-multi-identity-accounting/05-meis-multi-identity-accounting.md)
**Persona:** 小美 Mei — 清楚副业到底赚了没有（14/15）
**Pages:** 多身份管理, 身份损益表
**User Value:** "净利润2847，时薪23块" -- 副业真相一目了然
**Business Value:** 最高付费意愿用户群，付费转化 >= 5%

---

### [06: 手动记账与分类补充](06-manual-input-and-category-management/06-manual-input-and-category-management.md)
**Persona:** 全部用户 — AI未捕获时的快速补充
**Pages:** 手动记账, 分类管理, iOS快捷指令配置指引
**User Value:** 3秒内完成补充记录（表单/语音/截图），保持覆盖率
**Business Value:** 提升AI捕获覆盖率，降低用户手动负担感知

---

### [07: AI管家智能层](07-ai-butler-intelligence/07-ai-butler-intelligence.md)
**Persona:** 全部用户 — 从工具到顾问的跃迁
**Pages:** AI对话, 洞察推送, 优化建议, 消费模拟/同类对比
**User Value:** 个性化财务顾问：问答 + 主动洞察 + 可执行建议
**Business Value:** 高级付费功能变现 + NPS提升

---

### [08: 账户与设置管理](08-account-and-settings/08-account-and-settings.md)
**Persona:** 全部用户 — 数据安全感知（大强 D5- 11/15）
**Pages:** 设置, 个人资料/账户
**User Value:** 掌控感 + 数据安全透明 + 隐私配置
**Business Value:** 信任门槛达标，防止因安全顾虑流失

---

## Page Coverage Matrix

| # | Page | Scenario | Purpose in Flow |
|---|------|----------|----------------|
| 1 | Welcome / Splash | 01 | 传达"零记账"核心承诺 |
| 2 | Onboarding 引导页 | 01 | 建立零记账信任（3页滑动） |
| 3 | 注册 / 登录 | 01 | 快速注册（手机号/微信） |
| 4 | 权限授权页 | 01 | Android通知监听授权 |
| 5 | 账单导入 | 01 | 支付宝/微信CSV上传 |
| 6 | 导入处理中 | 01 | AI实时分类进度动画 |
| 7 | 手动记账 | 06 | 表单/语音/截图快速补充 |
| 8 | Dashboard / 首页 | 01 | 月度消费概览（核心着陆页） |
| 9 | 交易列表 | 03 | 浏览消费流水，按分类筛选 |
| 10 | 交易详情 | 03 | AI识别的品牌和分类 |
| 11 | 分类管理 | 06 | AI分类规则查看与调整 |
| 12 | 月度报表 | 01 | 分类报表 + 一键分享 |
| 13 | 趋势图表 | 03 | 多月消费趋势线 |
| 14 | 设置 | 08 | 数据安全、通知、权限管理 |
| 15 | 个人资料 / 账户 | 08 | 用户信息、订阅状态 |
| 16 | 订阅 / 付费 | 02 | 付费功能对比与订阅 |
| 17 | iOS 快捷指令配置指引 | 06 | Siri Shortcuts设置教程 |
| 18 | 共享家庭账本 | 02 | 创建账本、邀请家人 |
| 19 | 受益人标注 | 02 | "为谁花"维度标记 |
| 20 | 人情账管理 | 04 | 按人管理随礼历史 |
| 21 | 人情智能建议 | 04 | 回礼区间建议 + 记录 |
| 22 | 多身份管理 | 05 | 创建/切换财务身份 |
| 23 | 身份损益表 | 05 | 各身份独立收支报告 |
| 24 | 消费习惯雷达 | 03 | 消费雷达图 + 分享卡片 |
| 25 | AI 对话 | 07 | 自然语言财务问答 |
| 26 | 洞察推送 | 07 | AI主动消费洞察Feed |
| 27 | 优化建议 | 07 | 可执行省钱建议 |
| 28 | 消费模拟 / 同类对比 | 07 | 假设场景模拟 + 同龄人对比 |

**Coverage:** 28/28 pages assigned to scenarios -- 100% coverage, no duplicates.

---

## Next Phase

These scenario outlines feed into **Phase 4: UX Design** where each page gets:
- 详细页面规格
- 线框图草稿
- 组件定义
- 交互详情

---

_Generated with Whiteport Design Studio framework_
