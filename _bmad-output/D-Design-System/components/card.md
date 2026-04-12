# Card [crd-001]

**Type:** Content
**Category:** Container
**Purpose:** 信息分组容器，承载指标、列表项、引导、洞察等多种内容形态
**Library:** Tamagui v2 → `Card` / `YStack` component

---

## Overview

Card 是了然 APP 中最核心的内容容器组件，用于将相关信息分组展示。根据承载内容不同，衍生出 13 个变体，覆盖 20+ 个页面。

设计原则：
- 卡片是信息的"容器"，内部内容组合灵活
- 圆角和阴影层级编码信息优先级
- 可交互卡片需有明确的触摸反馈

---

## Variants

### metric — 指标摘要卡
- 全宽、渐变背景（品牌色）
- 大号金额数字（36pt bold）+ 标签 + 收支行
- 用于 Dashboard 月度摘要、报表摘要、年度人情统计
- 页面：01.7, 01.8, 04.1

### category — 分类明细卡
- 全宽、固定高度 76pt
- Icon(24pt emoji) + 分类名 + 金额(右对齐) + 进度条(4pt) + 百分比
- 可展开显示 Top3 交易
- 页面：01.7, 01.8

### transaction — 交易列表项
- 全宽、固定高度 64pt
- Icon(36pt circle) + 商户名 + 分类·时间 + 金额(右对齐)
- 金额用中性色（非红色，避免审判感）
- 底部 1px 分隔线
- 页面：03.1, 03.2

### insight — 洞察卡
- 全宽、可变高度
- Header(icon + NEW badge) + 标题 + 正文(max 3行) + 对比条 + 操作按钮 + 反馈行
- States: Unread(NEW badge), Read, Expanded, Dismissed(opacity 0.6)
- 页面：07.2, 01.8

### guidance — 引导卡
- 全宽
- Icon(24pt) + 标题 + 描述 + CTA按钮
- 用于空状态引导（通知开启、账单导入、手动记账）
- 可禁用（灰色态）
- 页面：01.7, 01.4, 01.5

### prompt — 提示卡（可消除）
- 全宽、暖色调背景
- Icon(32pt) + 标题 + 描述 + CTA + 关闭按钮(右上角 ×)
- 可消除，存储 dismissed 状态
- ⚠️ Dashboard 已不再使用（家庭共享提示被 snapshot 替代），仅保留供其他页面复用
- 页面：(原 01.7，现仅保留定义)

### spotlight — AI 管家说（🆕）
- 全宽、轻量卡片
- 🤖 Icon(24pt) + 一句话洞察文字 + 右箭头 →
- 可点击，跳转 AI Chat 并保留上下文
- 免费/付费用户均可见
- 内容策略：优先副业数据 > 家庭账本 > 消费异动
- 页面：01.7 Dashboard（Full State）
- ID: `dash-ai-spotlight`

### snapshot — 快照摘要卡（🆕）
- 全宽、圆角 12pt、轻阴影
- 标题行(icon + 标题 + CTA link) + 核心指标(大号数字) + 辅助信息(趋势/成员条)
- 数据驱动出现：有数据才显示，无数据不占位
- 各快照独立展示，不聚合不切换（替代原账本切换器方案）
- 两个实例：
  - **家庭快照** `dash-family-snapshot` — 总支出 + 成员贡献柱状条 + "查看详情"
  - **副业快照** `dash-identity-snapshot` — 净利润 + 环比趋势 + 收支明细 + "查看全部"（多身份时）
- 页面：01.7 Dashboard（Full State，仅付费会员可见）

### contact — 联系人卡
- 全宽、固定高度 76pt
- Avatar(44pt circle) + 姓名 + 关系标签 + 最近事件 + 净额(右对齐)
- 净额用中性色（人情是社交投资非损益）
- 页面：04.1

### event — 事件卡
- 全宽、固定高度 72pt
- 左边框 2pt 品牌色 + Icon(32pt emoji) + 标题·日期 + 状态/CTA(右侧)
- 支持滑动操作（完成/删除）
- 页面：04.1

### locked — 锁定/付费卡
- 全宽
- 🔒 图标 + 标题 + 高斯模糊预览(8pt blur) + 描述 + CTA
- 背景 surface-secondary
- 制造好奇缺口，引导付费
- 页面：07.2

### share — 分享预览卡
- 固定比例（3:4 报表 / 9:16 雷达）
- 月份 + 金额 + Top3分类 + 品牌水印 + 二维码
- 雷达分享默认隐藏金额（隐私保护）
- 页面：01.8, 03.4

### empty — 空状态容器
- 全宽、居中布局
- 插画(100-120pt) + 标题(H2) + 副标题 + CTA按钮
- 页面：01.7, 03.1

---

## States

### Common States (all variants):
- **default** — 正常展示
- **loading** — 骨架屏占位（Skeleton）
- **pressed** — 可交互卡片的按下反馈

### Variant-Specific States:
- **expanded** — category/insight 展开详情
- **collapsed** — category/insight 收起
- **dismissed** — prompt/insight 已消除（opacity 0.6 或隐藏）
- **unread** — insight 未读（NEW badge）
- **disabled** — guidance 不可用（灰色态）
- **locked** — 付费内容模糊遮罩

---

## Styling

### Visual Properties

| Property | 默认值 | 说明 |
|----------|--------|------|
| Padding | 12-16pt (space-md ~ space-lg) | 内边距 |
| Border Radius | 12pt | 统一圆角 |
| Background | surface-primary (white) | 默认白色 |
| Shadow | elevation-sm | 轻微阴影 |
| Margin Bottom | 8-12pt | 卡片间距 |

### Variant-Specific Styling

| Variant | Background | Shadow | Height | Special |
|---------|-----------|--------|--------|---------|
| metric | gradient(brand) | elevation-md | auto | 渐变背景 |
| category | surface-primary | elevation-sm | 76pt | 进度条 4pt |
| transaction | surface-primary | none | 64pt | 底部分隔线 |
| insight | surface-primary | elevation-sm | auto | NEW badge |
| guidance | surface-primary | elevation-sm | auto | — |
| prompt | warm-tint | elevation-sm | auto | 关闭按钮 |
| spotlight | surface-primary | elevation-sm | auto | 右箭头 → |
| snapshot | surface-primary | elevation-sm | auto | 数据驱动显隐 |
| contact | surface-primary | none | 76pt | Avatar circle |
| event | surface-primary | none | 72pt | 左边框 2pt |
| locked | surface-secondary | elevation-sm | auto | blur 8pt |
| share | brand-gradient | elevation-lg | 固定比例 | 水印+二维码 |
| empty | transparent | none | auto | 居中布局 |

### Design Tokens

```yaml
colors:
  background:
    primary: $color.surface-primary      # white
    secondary: $color.surface-secondary  # light gray
    gradient: $color.brand-gradient      # metric/share
    warm: $color.warm-tint               # prompt
  text:
    primary: $color.text-primary
    secondary: $color.text-secondary
    tertiary: $color.text-tertiary
  amount:
    neutral: $color.text-primary         # 中性色（非红绿）
    income: $color.semantic-success      # 收入绿

typography:
  title:
    fontSize: $size.3.5 ~ $size.4.5      # 14-18pt
    fontWeight: '600'
  body:
    fontSize: $size.3.25 ~ $size.3.5     # 13-14pt
    fontWeight: '400'
  caption:
    fontSize: $size.2.75 ~ $size.3.25    # 11-13pt
    fontWeight: '300'
  metric:
    fontSize: $size.9                     # 36pt
    fontWeight: '700'

spacing:
  padding: $space.3 ~ $space.4           # 12-16pt
  gap: $space.2 ~ $space.3              # 8-12pt
  marginBottom: $space.2 ~ $space.3     # 8-12pt

effects:
  borderRadius: $radius.3               # 12pt
  shadow:
    sm: $shadow.sm                       # elevation-sm
    md: $shadow.md                       # elevation-md
  blur: 8                                # locked variant
  transition: all 200ms ease-out
```

### Library Component (Tamagui)

**Base:** `Card` / `YStack` from `tamagui`

```typescript
import { styled, Card as TCard, YStack } from 'tamagui'

export const Card = styled(TCard, {
  borderRadius: '$3',        // 12pt
  padding: '$4',             // 16pt
  backgroundColor: '$surface1',
  elevation: '$1',           // shadow-sm

  variants: {
    variant: {
      metric: {
        background: 'linear-gradient(...)',
        elevation: '$2',
      },
      transaction: {
        elevation: 0,
        borderBottomWidth: 1,
        borderBottomColor: '$borderColor',
        padding: '$3',
      },
      prompt: {
        backgroundColor: '$warmTint',
      },
      locked: {
        backgroundColor: '$surface2',
      },
      empty: {
        backgroundColor: 'transparent',
        elevation: 0,
        alignItems: 'center',
      },
    },
    pressable: {
      true: {
        pressStyle: { scale: 0.98, opacity: 0.9 },
        cursor: 'pointer',
      },
    },
  } as const,

  defaultVariants: {
    variant: undefined,  // 使用默认样式
  },
})
```

---

## Behavior

### Interactions

**Tap (pressable variants):**
- category: 展开/收起 Top3 交易
- transaction: 跳转交易详情页
- contact: 跳转联系人详情
- event: 跳转事件详情
- insight: 展开/收起正文
- locked: 跳转订阅页
- spotlight: 跳转 AI Chat（保留上下文）
- snapshot: 跳转对应详情页（家庭账本/身份损益表）

**Swipe (event variant):**
- 左滑：完成/删除操作
- Duration: 200ms

**Dismiss (prompt variant):**
- 点击右上角 × 关闭
- 存储 dismissed 状态，不再显示

**Feedback (insight variant):**
- 有用 / 不感兴趣 / 分享
- "不感兴趣"不删除卡片，降低透明度至 0.6

### Animations

**展开/收起:**
- Height transition: 200ms ease-out
- Content fade-in: 150ms

**消除:**
- Slide out + fade: 300ms
- 或 opacity transition to 0.6

**Loading (Skeleton):**
- 骨架屏脉冲动画: 1.5s infinite

---

## Accessibility

**ARIA Attributes:**
- role: article (信息卡) / button (可交互卡)
- aria-label: [卡片摘要描述]
- aria-expanded: true/false (可展开卡片)
- aria-live: polite (动态更新的 insight 卡)

**Touch Target:**
- 可交互卡片整体可点击，最小高度 44pt
- 操作按钮独立触摸区域 ≥ 44×44pt

**Screen Reader:**
- 播报卡片类型 + 核心内容
- 如："餐饮分类，支出 3,280 元，占比 32%"

---

## Usage

### When to Use
- 分组展示相关信息
- 列表中的单条记录
- 引导用户完成操作
- 展示统计指标

### When Not to Use
- 纯文本段落 → 直接使用 Text
- 全屏内容 → 使用 Page/Screen 容器
- 简单分隔 → 使用 Divider

### Best Practices
- 卡片内信息层级清晰（标题 > 正文 > 辅助）
- 可交互卡片需有视觉暗示（箭头、chevron）
- 金额展示用中性色，避免红绿审判感
- 空状态用插画 + 引导文案，不留空白

---

## Used In

**Pages:** 20+

**Key Instances:**

| Page | OBJECT ID | Variant | Content |
|------|-----------|---------|---------|
| 01.7 | dash-summary | metric | 月度支出摘要 |
| 01.7 | dash-ai-spotlight | spotlight | 🆕 AI 管家说（一句话洞察） |
| 01.7 | dash-categories-item-{i} | category | 分类支出明细 |
| 01.7 | dash-family-snapshot | snapshot | 🆕 家庭快照（总支出+成员贡献） |
| 01.7 | dash-identity-snapshot | snapshot | 🆕 副业快照（净利润+趋势） |
| 01.7 | dash-guide-card-* | guidance | 空状态引导卡 |
| 01.7 | ~~dash-family-prompt~~ | ~~prompt~~ | ❌ 已废弃，被 snapshot 替代 |
| 01.7 | dash-empty | empty | Dashboard 空状态 |
| 01.8 | report-summary | metric | 报表月度摘要 |
| 01.8 | report-category-card-{i} | category | 报表分类明细 |
| 01.8 | report-insight-card-{i} | insight | AI 洞察卡 |
| 01.8 | report-share-card | share | 分享预览卡 |
| 03.1 | txn-list-item-{id} | transaction | 交易列表项 |
| 03.4 | radar-share-card | share | 雷达分享卡 |
| 04.1 | gift-mgmt-contact-{id} | contact | 联系人卡 |
| 04.1 | gift-mgmt-upcoming-event-{id} | event | 待办事件卡 |
| 04.1 | gift-mgmt-annual | metric | 年度人情统计 |
| 07.2 | insight-card-{id} | insight | 洞察推送卡 |
| 07.2 | insights-locked-card | locked | 付费锁定卡 |

---

## Related Components

- Button [btn-001] — 卡片内 CTA 按钮
- Badge [待创建] — NEW/标签/状态标记
- Progress Bar [待创建] — category 卡内进度条
- Avatar [待创建] — contact 卡内头像
- Skeleton [待创建] — loading 骨架屏

---

## Version History

**Created:** 2026-04-11
**Last Updated:** 2026-04-11

**Changes:**
- 2026-04-11: 从 20+ 个 UX 规格页面提取创建，11 个变体
- 2026-04-11: Dashboard 规格变更 — 新增 spotlight、snapshot 变体，prompt 在 Dashboard 中废弃（13 变体）

---

## Notes

- share 变体生成的是静态图片（非交互组件），实现时可能需要独立的 ShareCardGenerator
- locked 变体的 blur 效果需要 Tamagui 的 `blurRadius` 或 RN 的 `@react-native-community/blur`
- transaction 变体高频使用（列表场景），需关注渲染性能，考虑 FlashList 配合
