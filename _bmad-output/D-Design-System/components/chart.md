# Chart [chr-001]

**Type:** Content
**Category:** Data Visualization
**Purpose:** 数据可视化图表，覆盖趋势、分布、对比等分析场景
**Library:** 第三方图表库（推荐 react-native-svg + victory-native 或 react-native-chart-kit）

---

## Overview

Chart 是了然 APP 数据分析层的核心可视化组件。由于图表渲染复杂度高，建议使用专业图表库而非 Tamagui 原生实现。

---

## Variants

### donut — 环形饼图
- 180pt 直径，空心环形
- 中心显示总额或选中分类金额+百分比
- 固定分类色映射（餐饮=橙、交通=蓝、购物=紫、居住=青、娱乐=粉、其他=灰）
- 点击扇区高亮 + 中心文字更新
- 图例：Top 6 分类 + "其他"
- ID: `report-chart-pie`
- 页面：01.8

### line — 趋势折线图
- 200pt 高度（总览）/ 180pt（分类）
- 品牌色线条 + 10% 透明度渐变填充
- 圆形数据点，触摸显示 Tooltip（金额+月份）
- 支持水平滑动浏览
- 切换分类/时间范围时 morphing 动画 0.4s
- Y轴千元单位(K)，X轴月份
- ID: `trend-total-chart`, `trend-category-chart`
- 页面：03.3

### radar — 雷达图
- 240pt 直径
- 6维度：餐饮/购物/交通/居住/娱乐/健康
- 15% 品牌色填充 + 2pt 边框线
- 入场 bloom 动画 0.8s spring
- 顶点触摸显示 Tooltip（金额、评分0-100、占比%）
- 浮动"消费人格标签"（如"外卖达人"）
- ID: `radar-chart-main`
- 页面：03.4

### bar — 水平柱状图
- 用于对比展示（同类对比百分位、成员贡献）
- 值标签右对齐
- 页面：07.4, 02.2

---

## Styling

### Color Mapping (分类固定色)

| Category | Color | Hex |
|----------|-------|-----|
| 餐饮 | Orange | #F97316 |
| 交通 | Blue | #3B82F6 |
| 购物 | Purple | #8B5CF6 |
| 居住 | Cyan | #06B6D4 |
| 娱乐 | Pink | #EC4899 |
| 健康 | Green | #22C55E |
| 其他 | Gray | #6B7280 |

### Trend Chart Colors

```yaml
colors:
  line: $color.brand-primary
  fill: rgba($color.brand-primary, 0.1)
  dataPoint: $color.brand-primary
  tooltip:
    background: $color.neutral-900
    text: $color.white
  axis: $color.neutral-400
  grid: $color.neutral-100

# 趋势图特殊：橙+青双色（非红绿，避免色觉障碍）
trend:
  up: $color.trend-orange       # #F97316
  down: $color.trend-cyan       # #06B6D4
```

### Animation

```yaml
donut:
  entry: rotate 0.6s ease-out
  sectorHighlight: scale 0.15s

line:
  morphing: 0.4s ease-in-out
  tooltip: fade 0.15s

radar:
  bloom: 0.8s spring (damping: 15)
  vertexTooltip: fade 0.15s

bar:
  entry: width grow 0.3s ease-out
```

---

## Behavior

**Donut Tap:** 选中扇区高亮，中心更新为该分类金额+百分比
**Line Pan:** 水平滑动浏览数据点，触摸显示 Tooltip
**Radar Vertex Tap:** 显示该维度详情 Tooltip
**Bar Tap:** 高亮该条目

---

## Accessibility

- role: img (整体图表)
- aria-label: 图表摘要描述（如"4月消费分布：餐饮32%、购物25%..."）
- 数据表格作为屏幕阅读器替代内容

---

## Used In

**Pages:** 4+ (01.8, 03.3, 03.4, 05.2, 07.4)

| Page | OBJECT ID | Variant | Content |
|------|-----------|---------|---------|
| 01.8 | report-chart-pie | donut | 月度消费分布 |
| 03.3 | trend-total-chart | line | 总支出趋势 |
| 03.3 | trend-category-chart | line | 分类趋势 |
| 03.4 | radar-chart-main | radar | 消费习惯雷达 |
| 05.2 | identity-pnl-chart | bar | 身份损益对比 |
| 07.4 | sim-comparison-chart | bar | 同类对比百分位 |

---

## Notes

- 图表库推荐：`victory-native` (声明式API，动画好) 或 `react-native-gifted-charts` (性能优)
- 雷达图可能需要自定义 SVG 实现（多数库不原生支持）
- 分类色映射需全局统一，建议抽为 token

---

## Version History

**Created:** 2026-04-11
