# Design Tokens — 了然 (Liaoran)

**Status:** Defined
**Library:** Tamagui v2
**Icon Library:** Lucide Icons (`lucide-react-native` / `@tamagui/lucide-icons`)
**Last Updated:** 2026-04-11

---

## Colors

### Brand

| Token | Hex | Usage |
|-------|-----|-------|
| `brand-50` | `#EEF2FF` | 极浅背景、hover 态 |
| `brand-100` | `#E0E7FF` | 浅背景、选中态底色 |
| `brand-200` | `#C7D2FE` | 边框、分隔 |
| `brand-500` | `#6366F1` | **主品牌色** — CTA、active 态、链接 |
| `brand-600` | `#4F46E5` | hover 加深 |
| `brand-700` | `#4338CA` | pressed 加深 |
| `brand-900` | `#312E81` | 深色文字强调 |

### Neutral

| Token | Hex | Usage |
|-------|-----|-------|
| `neutral-50` | `#F9FAFB` | 页面背景 |
| `neutral-100` | `#F3F4F6` | 卡片次级背景、输入框背景 |
| `neutral-200` | `#E5E7EB` | 边框、分隔线、Toggle OFF |
| `neutral-300` | `#D1D5DB` | 禁用边框 |
| `neutral-400` | `#9CA3AF` | Placeholder、inactive icon |
| `neutral-500` | `#6B7280` | 次要文字、ghost 按钮 |
| `neutral-600` | `#4B5563` | 辅助文字 |
| `neutral-700` | `#374151` | 正文文字 |
| `neutral-800` | `#1F2937` | 标题文字 |
| `neutral-900` | `#111827` | 最深文字、Tooltip 背景 |

### Semantic

| Token | Hex | Usage |
|-------|-----|-------|
| `success` | `#22C55E` | 成功、收入、省钱 |
| `error` | `#EF4444` | 错误、红点角标 |
| `warning` | `#F59E0B` | 警告 |
| `info` | `#3B82F6` | 信息提示 |

### Category (分类固定色映射)

| Token | Hex | Category |
|-------|-----|----------|
| `cat-dining` | `#F97316` | 餐饮 Orange |
| `cat-transport` | `#3B82F6` | 交通 Blue |
| `cat-shopping` | `#8B5CF6` | 购物 Purple |
| `cat-housing` | `#06B6D4` | 居住 Cyan |
| `cat-fun` | `#EC4899` | 娱乐 Pink |
| `cat-health` | `#22C55E` | 健康 Green |
| `cat-other` | `#6B7280` | 其他 Gray |

### Special

| Token | Hex | Usage |
|-------|-----|-------|
| `trend-up` | `#F97316` | 趋势上升（橙，非红） |
| `trend-down` | `#06B6D4` | 趋势下降（青，非绿） |
| `gift-neutral` | `#6B7280` | 人情净额（中性色） |
| `saving-green` | `#22C55E` | 省钱潜力（正向激励） |
| `warm-tint` | `#FFF7ED` | 提示卡暖色背景 |
| `tag-self` | `#6366F1` | 受益人：为自己 |
| `tag-spouse` | `#EC4899` | 受益人：为配偶 |
| `tag-child` | `#F97316` | 受益人：为孩子 |
| `tag-family` | `#22C55E` | 受益人：为家庭 |

### Surface

| Token | Hex | Usage |
|-------|-----|-------|
| `surface-primary` | `#FFFFFF` | 卡片、Modal 背景 |
| `surface-secondary` | `#F3F4F6` | 次级容器、locked 卡 |
| `surface-page` | `#F9FAFB` | 页面背景 |
| `backdrop` | `rgba(0,0,0,0.5)` | Modal 遮罩 |

---

## Typography

### Font Family

```
Primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
Chinese: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif
Mono: 'Fira Code', 'SF Mono', monospace
```

### Font Scale

| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| `text-metric` | 36pt | 700 | 金额大数字（Dashboard、报表） |
| `text-h1` | 20pt | 700 | 根页面大标题 |
| `text-h2` | 17pt | 600 | 子页面 Header 标题 |
| `text-button` | 16pt | 600 | Primary Button |
| `text-tab` | 15pt | 600/400 | Tab 标签 |
| `text-body` | 14pt | 400 | 正文 |
| `text-body-medium` | 14pt | 500 | 列表项标题 |
| `text-caption` | 13pt | 400 | 辅助说明、分类·时间 |
| `text-small` | 12pt | 400 | 小字说明 |
| `text-badge` | 11pt | 700 | Badge 标签（NEW） |
| `text-tabbar` | 10pt | 500 | Tab Bar 标签 |

### Line Height

| Token | Value | Usage |
|-------|-------|-------|
| `leading-tight` | 1.2 | 标题、大数字 |
| `leading-normal` | 1.5 | 正文 |
| `leading-relaxed` | 1.75 | 长段落 |

---

## Spacing

### Scale

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4pt | 最小间距、icon-label gap |
| `space-2` | 8pt | Chip 间距、紧凑 gap |
| `space-3` | 12pt | 卡片内 padding（紧凑） |
| `space-4` | 16pt | 卡片内 padding（标准）、水平 margin |
| `space-5` | 20pt | Section 间距 |
| `space-6` | 24pt | Modal padding、大间距 |
| `space-8` | 32pt | Section 大间距 |

### Component Heights

| Token | Value | Usage |
|-------|-------|-------|
| `height-button-primary` | 48pt | Primary Button |
| `height-button-secondary` | 44pt | Secondary Button |
| `height-header` | 44pt | Header（+ SafeArea） |
| `height-tabbar` | 56pt | Bottom Tab Bar（+ SafeArea） |
| `height-input` | 48pt | 标准输入框 |
| `height-search` | 40pt | 搜索栏 |
| `height-chip` | 32pt | Filter Chip |
| `height-tab` | 44pt | Tab/Segment |
| `height-transaction` | 64pt | 交易列表项 |
| `height-event` | 72pt | 事件卡 |
| `height-category` | 76pt | 分类卡 |
| `height-contact` | 76pt | 联系人卡 |
| `height-fab` | 56pt | FAB |
| `height-voice` | 80pt | 语音按钮 |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 4pt | Badge label、小元素 |
| `radius-md` | 8pt | Ghost Button、代码块 |
| `radius-lg` | 12pt | 卡片、Primary Button、输入框 |
| `radius-xl` | 16pt | Modal、Sheet |
| `radius-full` | 50% / 9999px | 圆形（Avatar、FAB、Chip、Dot） |

---

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-xs` | `0 1px 2px rgba(0,0,0,0.04)` | Tab Bar 顶部 |
| `shadow-sm` | `0 1px 3px rgba(0,0,0,0.06)` | 标准卡片 |
| `shadow-md` | `0 4px 12px rgba(0,0,0,0.08)` | Metric 卡、Toast、FAB |
| `shadow-lg` | `0 8px 24px rgba(0,0,0,0.12)` | Share 卡、Modal |

---

## Transitions

| Token | Value | Usage |
|-------|-------|-------|
| `duration-fast` | 100ms | 按钮 press |
| `duration-normal` | 200ms | 状态切换、Tab 指示器 |
| `duration-slow` | 300ms | Modal 进出、卡片展开 |
| `duration-chart` | 400ms | 图表 morphing |
| `easing-default` | `ease-out` | 通用 |
| `easing-spring` | `spring(damping: 15)` | FAB 弹入、雷达 bloom |

---

## Icons

**Library:** Lucide Icons
**Packages:**
- React Native: `lucide-react-native`
- Tamagui: `@tamagui/lucide-icons`
- Web/Next.js: `lucide-react`

**Default Size:** 24pt (与 text-body 对齐)
**Stroke Width:** 2 (Lucide 默认)

### Icon Mapping

| Usage | Lucide Icon Name |
|-------|-----------------|
| Home Tab | `home` |
| Transactions Tab | `receipt` |
| AI Tab | `bot` |
| Me Tab | `user` |
| Back | `chevron-left` |
| Close | `x` |
| Share | `share-2` |
| Search | `search` |
| Plus/FAB | `plus` |
| Settings | `settings` |
| Notification | `bell` |
| Report/Chart | `bar-chart-3` |
| Camera | `camera` |
| Microphone | `mic` |
| Lock | `lock` |
| Gift | `gift` |
| Calendar | `calendar` |
| Wallet | `wallet` |
| Chevron Right | `chevron-right` |
| Info | `info` |
| Success | `check-circle` |
| Error | `alert-circle` |
| Send | `send` |
| Edit | `pencil` |
| Delete | `trash-2` |
| Filter | `sliders-horizontal` |
| Download | `download` |
| Upload | `upload` |
