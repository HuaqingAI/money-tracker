# Design Token → Tamagui Token 映射表

**Source of Truth:** `_bmad-output/D-Design-System/design-tokens.md`
**Tamagui Version:** `2.0.0-rc.41`
**Consumer:** `packages/ui/tamagui.config.ts`
**Story:** 0.2 UI 设计系统基础

---

## 1. 映射原则

1. **禁止硬编码**：所有数值必须来源于 `design-tokens.md` 字面值
2. **kebab-case → camelCase**：设计 token `brand-500` → Tamagui key `brand500`；`cat-dining` → `catDining`
3. **保留原语义**：Tamagui key 保留设计 token 的语义前缀（`brand`/`neutral`/`cat`/`tag`），不做重命名合并
4. **Tamagui 标准分类**：`tokens.color` / `tokens.space` / `tokens.size` / `tokens.radius` / `tokens.zIndex` + `fonts` / `themes` / `animations`
5. **Dark mode**：`themes.dark` 占位（与 light 同值），由后续 Story 填充真实 dark 值
6. **未覆盖 Token**：组件级高度（`height-*`）放入 `tokens.size`；Shadow/Transition 以组件样式或 `animations` 呈现

---

## 2. Colors (→ `tokens.color.*`)

### 2.1 Brand

| Design Token | Tamagui Key | Hex | Usage |
|---|---|---|---|
| `brand-50` | `brand50` | `#EEF2FF` | 极浅背景、hover 态 |
| `brand-100` | `brand100` | `#E0E7FF` | 浅背景、选中态底色 |
| `brand-200` | `brand200` | `#C7D2FE` | 边框、分隔 |
| `brand-500` | `brand500` | `#6366F1` | **主品牌色** — CTA、active 态、链接 |
| `brand-600` | `brand600` | `#4F46E5` | hover 加深 |
| `brand-700` | `brand700` | `#4338CA` | pressed 加深 |
| `brand-900` | `brand900` | `#312E81` | 深色文字强调 |

### 2.2 Neutral

| Design Token | Tamagui Key | Hex | Usage |
|---|---|---|---|
| `neutral-50` | `neutral50` | `#F9FAFB` | 页面背景 |
| `neutral-100` | `neutral100` | `#F3F4F6` | 卡片次级背景、输入框背景 |
| `neutral-200` | `neutral200` | `#E5E7EB` | 边框、分隔线、Toggle OFF |
| `neutral-300` | `neutral300` | `#D1D5DB` | 禁用边框 |
| `neutral-400` | `neutral400` | `#9CA3AF` | Placeholder、inactive icon |
| `neutral-500` | `neutral500` | `#6B7280` | 次要文字、ghost 按钮 |
| `neutral-600` | `neutral600` | `#4B5563` | 辅助文字 |
| `neutral-700` | `neutral700` | `#374151` | 正文文字 |
| `neutral-800` | `neutral800` | `#1F2937` | 标题文字 |
| `neutral-900` | `neutral900` | `#111827` | 最深文字、Tooltip 背景 |

### 2.3 Semantic

| Design Token | Tamagui Key | Hex | Usage |
|---|---|---|---|
| `success` | `success` | `#22C55E` | 成功、收入、省钱 |
| `error` | `error` | `#EF4444` | 错误、红点角标 |
| `warning` | `warning` | `#F59E0B` | 警告 |
| `info` | `info` | `#3B82F6` | 信息提示 |

### 2.4 Category（分类固定色）

| Design Token | Tamagui Key | Hex | Category |
|---|---|---|---|
| `cat-dining` | `catDining` | `#F97316` | 餐饮 Orange |
| `cat-transport` | `catTransport` | `#3B82F6` | 交通 Blue |
| `cat-shopping` | `catShopping` | `#8B5CF6` | 购物 Purple |
| `cat-housing` | `catHousing` | `#06B6D4` | 居住 Cyan |
| `cat-fun` | `catFun` | `#EC4899` | 娱乐 Pink |
| `cat-health` | `catHealth` | `#22C55E` | 健康 Green |
| `cat-other` | `catOther` | `#6B7280` | 其他 Gray |

### 2.5 Special

| Design Token | Tamagui Key | Hex | Usage |
|---|---|---|---|
| `trend-up` | `trendUp` | `#F97316` | 趋势上升（橙，非红） |
| `trend-down` | `trendDown` | `#06B6D4` | 趋势下降（青，非绿） |
| `gift-neutral` | `giftNeutral` | `#6B7280` | 人情净额（中性色） |
| `saving-green` | `savingGreen` | `#22C55E` | 省钱潜力（正向激励） |
| `warm-tint` | `warmTint` | `#FFF7ED` | 提示卡暖色背景 |
| `tag-self` | `tagSelf` | `#6366F1` | 受益人：为自己 |
| `tag-spouse` | `tagSpouse` | `#EC4899` | 受益人：为配偶 |
| `tag-child` | `tagChild` | `#F97316` | 受益人：为孩子 |
| `tag-family` | `tagFamily` | `#22C55E` | 受益人：为家庭 |

### 2.6 Surface

| Design Token | Tamagui Key | Hex / rgba | Usage |
|---|---|---|---|
| `surface-primary` | `surfacePrimary` | `#FFFFFF` | 卡片、Modal 背景 |
| `surface-secondary` | `surfaceSecondary` | `#F3F4F6` | 次级容器、locked 卡 |
| `surface-page` | `surfacePage` | `#F9FAFB` | 页面背景 |
| `backdrop` | `backdrop` | `rgba(0,0,0,0.5)` | Modal 遮罩 |

---

## 3. Spacing & Size

设计 token `space-*` 同时注入 Tamagui `tokens.space` 与 `tokens.size`（Tamagui 约定两者共享数值）。组件级 `height-*` 仅注入 `tokens.size`。

### 3.1 Space Scale (→ `tokens.space.*` + `tokens.size.*`)

| Design Token | Tamagui Key | Value (pt) | Usage |
|---|---|---|---|
| `space-1` | `1` | 4 | 最小间距、icon-label gap |
| `space-2` | `2` | 8 | Chip 间距、紧凑 gap |
| `space-3` | `3` | 12 | 卡片内 padding（紧凑） |
| `space-4` | `4` | 16 | 卡片内 padding（标准）、水平 margin |
| `space-5` | `5` | 20 | Section 间距 |
| `space-6` | `6` | 24 | Modal padding、大间距 |
| `space-8` | `8` | 32 | Section 大间距 |
| _（默认键）_ | `true` | 16 | **Tamagui 框架要求**的默认刻度键；值对齐 `space-4`。业务代码不应直接使用 `$true`，仅供 Tamagui 内部 `size="$true"` 回退。 |

> **说明**：Tamagui 约定数字字符串 key（如 `'1'`、`'2'`）为设计系统标准刻度；不使用 `space1` 这类拼接 key，保持与 Tamagui preset 一致，便于在 styled 组件中用 `$2` / `$4` 书写。
>
> **`true` 默认键**（dev 模式强制）：`tamagui` 包 `createTamagui()` 在 `NODE_ENV=development` 下校验 `tokens.size` 与 `tokens.space` 必须包含 `true` key，否则抛 `missing expected tokens.*`。本 config 将 `space.true` / `size.true` 都设为 16（= `space-4`），与 Tamagui 官方 preset 约定一致。

### 3.2 Component Heights (→ `tokens.size.*` 仅)

| Design Token | Tamagui Key | Value (pt) | Usage |
|---|---|---|---|
| `height-button-primary` | `heightButtonPrimary` | 48 | Primary Button |
| `height-button-secondary` | `heightButtonSecondary` | 44 | Secondary Button |
| `height-header` | `heightHeader` | 44 | Header（+ SafeArea） |
| `height-tabbar` | `heightTabbar` | 56 | Bottom Tab Bar（+ SafeArea） |
| `height-input` | `heightInput` | 48 | 标准输入框 |
| `height-search` | `heightSearch` | 40 | 搜索栏 |
| `height-chip` | `heightChip` | 32 | Filter Chip |
| `height-tab` | `heightTab` | 44 | Tab/Segment |
| `height-transaction` | `heightTransaction` | 64 | 交易列表项 |
| `height-event` | `heightEvent` | 72 | 事件卡 |
| `height-category` | `heightCategory` | 76 | 分类卡 |
| `height-contact` | `heightContact` | 76 | 联系人卡 |
| `height-fab` | `heightFab` | 56 | FAB |
| `height-voice` | `heightVoice` | 80 | 语音按钮 |

---

## 4. Border Radius (→ `tokens.radius.*`)

| Design Token | Tamagui Key | Value | Usage |
|---|---|---|---|
| `radius-sm` | `sm` | 4 | Badge label、小元素 |
| `radius-md` | `md` | 8 | Ghost Button、代码块 |
| `radius-lg` | `lg` | 12 | 卡片、Primary Button、输入框 |
| `radius-xl` | `xl` | 16 | Modal、Sheet |
| `radius-full` | `full` | 9999 | 圆形（Avatar、FAB、Chip、Dot） |
| _（默认键）_ | `true` | 8 | **Tamagui 框架要求**与 `tokens.size` 至少有一个 key 重叠；`true` 与 `size.true` 对齐。值对齐 `radius-md`。业务代码不应使用 `$true`，直接用 `$sm` / `$md` / `$lg` / `$xl` / `$full`。 |

---

## 5. Typography (→ `fonts.body.*` + `fonts.heading.*` + `fonts.mono.*`)

### 5.1 Font Family

| 设计 token | Tamagui fonts family | 值 |
|---|---|---|
| Primary (Latin) | `fonts.body.family` / `fonts.heading.family` | `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` |
| Chinese fallback | 并入 family 列表末尾 | `'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif` |
| Mono | `fonts.mono.family` | `'Fira Code', 'SF Mono', monospace` |

**字体文件分发**：本 Story **不引入 `expo-font` 或自定义字体资产**，family 仅声明系统 fallback；真实 Inter / Noto Sans SC 字体加载在后续 Story 完成。

### 5.2 Font Scale (→ `fonts.body.size.*` + `fonts.body.weight.*`)

Tamagui `createFont` 使用**数字索引** key（1..n），通过 `$1`/`$2` 引用；此处用设计语义命名后再对齐 Tamagui 数字索引：

| Design Token | Tamagui Key | Size | Weight | Usage |
|---|---|---|---|---|
| `text-small` | `1` | 12 | 400 | 小字说明 |
| `text-caption` | `2` | 13 | 400 | 辅助说明、分类·时间 |
| `text-body` | `3` | 14 | 400 | 正文 |
| `text-body-medium` | `4` | 14 | 500 | 列表项标题 |
| `text-tab` | `5` | 15 | 400/600 | Tab 标签 |
| `text-button` | `6` | 16 | 600 | Primary Button |
| `text-h2` | `7` | 17 | 600 | 子页面 Header 标题 |
| `text-h1` | `8` | 20 | 700 | 根页面大标题 |
| `text-metric` | `9` | 36 | 700 | 金额大数字 |
| `text-badge` | `10` | 11 | 700 | Badge 标签（NEW） |
| `text-tabbar` | `11` | 10 | 500 | Tab Bar 标签 |

> 说明：Tamagui `createFont` 要求 `size` / `lineHeight` / `weight` 三个对象 key 必须一一对应。不要求连续数字，但约定从 1 开始。

### 5.3 Line Height (→ `fonts.body.lineHeight.*`)

| Design Token | 说明 | 乘数 |
|---|---|---|
| `leading-tight` | 标题、大数字 | 1.2 |
| `leading-normal` | 正文 | 1.5 |
| `leading-relaxed` | 长段落 | 1.75 |

在 Tamagui 中 `lineHeight` 必须为**绝对像素**：`size * 乘数`，例如 `text-body`（14） × `leading-normal`（1.5） = `21`。所有 scale 的 `lineHeight` 默认用 `leading-normal`，`text-h1`/`text-h2`/`text-metric` 用 `leading-tight`。

---

## 6. Shadows (组件层，非 tokens)

Tamagui tokens 不原生支持复合阴影。统一以**组件级样式对象**实现，在 `tamagui.config.ts` 导出命名 shadow 常量：

| Design Token | 实现方式 | 值 |
|---|---|---|
| `shadow-xs` | 组件样式常量 | `shadowOffset: {w:0,h:1}`, `shadowOpacity: 0.04`, `shadowRadius: 2` |
| `shadow-sm` | 同上 | `shadowOffset: {w:0,h:1}`, `shadowOpacity: 0.06`, `shadowRadius: 3` |
| `shadow-md` | 同上 | `shadowOffset: {w:0,h:4}`, `shadowOpacity: 0.08`, `shadowRadius: 12` |
| `shadow-lg` | 同上 | `shadowOffset: {w:0,h:8}`, `shadowOpacity: 0.12`, `shadowRadius: 24` |

Android `elevation` 值（后续 Story 补充）：xs/sm/md/lg → 1/2/4/8。

---

## 7. Transitions (→ `animations.*`)

使用 Tamagui `createAnimations` 接口，基于 `@tamagui/animations-css` 或 `@tamagui/animations-moti`；本 Story 用 `createAnimations` 的基础时长配置：

| Design Token | Tamagui Key | 值 |
|---|---|---|
| `duration-fast` | `fast` | `{ type: 'timing', duration: 100 }` |
| `duration-normal` | `normal` | `{ type: 'timing', duration: 200 }` |
| `duration-slow` | `slow` | `{ type: 'timing', duration: 300 }` |
| `duration-chart` | `chart` | `{ type: 'timing', duration: 400 }` |
| `easing-default` | — | RN Timing 默认 ease-out（不单独定义） |
| `easing-spring` | `spring` | `{ type: 'spring', damping: 15, mass: 1, stiffness: 180 }` |

> 本 Story 仅声明 animation 常量；未安装 `@tamagui/animations-css` / `@tamagui/animations-moti`，动画驱动器在消费动画的 Story 按需安装。

---

## 8. Dark Mode 预留

`themes.dark` 当前占位，所有 semantic key 与 light 同值：

| Semantic Token | Light | Dark (TODO) |
|---|---|---|
| `background` | `surfacePage` (#F9FAFB) | TODO（预留 near-black） |
| `surface` | `surfacePrimary` (#FFFFFF) | TODO |
| `surfaceAlt` | `surfaceSecondary` (#F3F4F6) | TODO |
| `color` | `neutral700` (#374151) | TODO |
| `colorHeading` | `neutral800` (#1F2937) | TODO |
| `colorMuted` | `neutral500` (#6B7280) | TODO |
| `borderColor` | `neutral200` (#E5E7EB) | TODO |
| `backdrop` | `backdrop` (rgba(0,0,0,0.5)) | TODO |
| `brand` | `brand500` (#6366F1) | TODO（可能微调饱和度） |

**后续 Story 更新 dark 值时不需改动 semantic key 名称，只改 theme value**。

---

## 9. 未覆盖 / 延后项

| 项 | 状态 | 延后原因 |
|---|---|---|
| 自定义字体文件 (Inter / Noto Sans SC) | 未引入 | 需 `expo-font` + 资产分发，后续 UI 组件 Story 处理 |
| `@tamagui/lucide-icons` | 未安装 | 本 Story AC 不含图标；在组件库 Story 引入 |
| `@tamagui/animations-*` 驱动器 | 未安装 | 本 Story 不渲染动画组件 |
| Shadow Android elevation 映射 | 延后 | 需与各组件联调，后续 Story 补 |
| Dark mode 语义值 | 占位 | 设计稿未给 dark 色值 |
| Tamagui `shorthands` | 未启用 | 保守策略，等代码规模更大再评估 |
| 响应式 `media` breakpoints | 用 Tamagui 默认 | MVP 未定义 tablet/web 断点 |

---

## 10. 验证清单

- [x] 所有 color / space / size / radius 数值引用 `design-tokens.md`
- [x] 所有 typography 数值源于 `design-tokens.md` Font Scale 表
- [x] `themes.light` 全量 semantic key 已映射
- [x] `themes.dark` 占位存在，标注 TODO
- [x] 未覆盖 Token 显式列出
- [ ] 实际 `tamagui.config.ts` 与本表对齐（由 Dev 填充代码后勾选）
- [ ] `apps/mobile` 启动渲染 Button/Text/TextInput 验证样式匹配
