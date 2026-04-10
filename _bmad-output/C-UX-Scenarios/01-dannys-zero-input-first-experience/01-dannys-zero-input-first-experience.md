---
design_intent: S
design_status: not-started
---

# 01: 大强的零记账初体验

**Project:** Money Tracker
**Created:** 2026-04-09
**Method:** Whiteport Design Studio (WDS)

---

## Transaction (Q1)

**What this scenario covers:**
从下载APP到看到自动分类的月度消费报表，全程不需要手动输入任何一笔消费。这是产品"零记账"核心承诺的首次验证时刻。

---

## Business Goal (Q2)

**Goal:** PRIMARY: 验证零记账体验（THE ENGINE）
**Objective:** 1.1 AI捕获覆盖率 >= 80%, 1.2 用户每周手动输入 <= 3次

---

## User & Situation (Q3)

**Persona:** 大强 Danny (Primary)
**Situation:** 31岁已婚爸爸，二线城市中层，月供6500。周六晚上哄完3岁儿子睡觉，打开银行APP发现余额比预期少了2000多。跟小芳提了一句"这个月怎么又没剩多少"，气氛瞬间尴尬。他躺在沙发上拿起手机，决定搜一下有没有不用手动记的记账工具。

---

## Driving Forces (Q4)

**Hope:** 真的有一个不用动手就能告诉我钱去哪了的工具。

**Worry:** 又是一个需要手动输入金额、选分类、写备注的记账APP，下载了又坚持不了两周。

---

## Device & Starting Point (Q5 + Q6)

**Device:** Mobile — Android
**Entry:** 周六晚上躺沙发上，在应用商店搜索"自动记账"或"AI记账"，看到 Money Tracker 的描述写着"零记账"，下载安装打开。

---

## Best Outcome (Q7)

**User Success:**
导入支付宝账单后5分钟内看到自动分类的月度报表，发现餐饮花了3200、交通花了1800，截图发给小芳说"你看这个月钱花在哪了"，全程没手动输入一笔。

**Business Success:**
首次体验验证零记账承诺成立，大强授权通知监听权限（未来自动捕获），完成注册成为留存用户。

---

## Shortest Path (Q8)

1. **Welcome / Splash** — 看到"零记账的AI财务管家"，产品承诺一目了然
2. **Onboarding 引导页** — 3页滑动：零输入 → 自动分类 → 智能报表，建立信任
3. **注册 / 登录** — 手机号一键注册（微信登录备选）
4. **权限授权页** — 理解为什么需要通知读取权限，清晰的隐私承诺，授权
5. **账单导入** — 选择支付宝，按提示导出CSV文件并上传
6. **导入处理中** — 看到AI实时分类动画，"正在识别132笔交易..."
7. **Dashboard / 首页** — 月度消费概览出现：总支出、分类卡片、关键数字
8. **月度报表** — 完整的分类报表，餐饮3200、交通1800，一键分享给小芳 ✓

---

## Trigger Map Connections

**Persona:** 大强 Danny (Primary)

**Driving Forces Addressed:**
- ✅ **Want:** D2+ 不动手就知道钱去哪了（15/15）
- ❌ **Fear:** D3- 害怕又要手动输入（14/15）

**Business Goal:** PRIMARY — 验证零记账体验（AI捕获 >= 80%，手动输入 <= 3次/周）

---

## Scenario Steps

| Step | Folder | Purpose | Exit Action |
|------|--------|---------|-------------|
| 01.1 | `01.1-welcome/` | 传达产品核心承诺 | 点击"开始" |
| 01.2 | `01.2-onboarding/` | 建立零记账信任 | 滑动完成引导 |
| 01.3 | `01.3-registration/` | 快速注册 | 提交手机号验证 |
| 01.4 | `01.4-permission/` | 授权通知读取 | 点击"允许" |
| 01.5 | `01.5-bill-import/` | 导入支付宝账单 | 上传CSV文件 |
| 01.6 | `01.6-import-processing/` | 等待AI分类 | 自动跳转Dashboard |
| 01.7 | `01.7-dashboard/` | 查看消费概览 | 点击"查看完整报表" |
| 01.8 | `01.8-monthly-report/` | 查看详细报表并分享 | 点击"分享给小芳" ✓ |

**First step** (01.1) includes full entry context (Q3 + Q4 + Q5 + Q6).
**On-step interactions** (that don't leave the step) are documented as storyboard items within each page spec.
