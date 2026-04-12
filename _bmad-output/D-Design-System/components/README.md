# Design System Components — 了然 (Liaoran)

**Total Components:** 17
**Library:** Tamagui v2
**Last Updated:** 2026-04-11

## Component List

### Interactive Components
- Button [btn-001] — 主要/次要/幽灵/图标/FAB/语音 6变体，全部页面使用
- Filter Chip [chp-001] — 筛选/快捷金额 2变体，3+页面使用

### Content Components
- Card [crd-001] — 指标/分类/交易/洞察/引导/提示/spotlight/snapshot/联系人/事件/锁定/分享/空状态 13变体，20+页面使用
- Badge [bdg-001] — 红点/文字标签/可选标签/计量 4变体，10+页面使用
- Avatar [avt-001] — 图片/首字母/可编辑 3变体，4+页面使用
- Chart [chr-001] — 环形饼图/趋势折线/雷达图/柱状图 4变体，4+页面使用

### Form Components
- Text Input [inp-001] — 手机号/验证码/金额/文本/聊天 5变体，8+页面使用
- Search Bar [src-001] — 吸顶/内嵌 2变体，3+页面使用
- Toggle / Switch [swi-001] — 标准/三态 2变体，2+页面使用

### Layout Components
- Divider [div-001] — 全宽/缩进 2变体，6+页面使用

### Navigation Components
- Bottom Tab Bar [nav-001] — 4栏全局底部导航，20+页面固定展示
- Header / TopBar [nav-002] — 根页面/子页面/Modal 3变体，25+页面使用
- Tab / Segment [tab-001] — 等宽分段/模式切换 2变体，3页面使用

### Feedback Components
- Modal / Bottom Sheet [sht-001] — 居中对话框/底部面板/选择器 3变体，15+页面使用
- Progress Indicator [prg-001] — 页面指示器/线性进度条/动态计数器/行内 4变体，5+页面使用
- Toast [tst-001] — 成功/错误/信息 3变体，5+页面使用
- Tooltip / Popover [pop-001] — 图表数据提示/功能说明 2变体，4+页面使用
- Skeleton [skn-001] — 卡片/列表项/图表/文字行 4变体，5+页面使用

---

## Component Naming Convention

**Format:** `[type]-[number]`

Examples:
- btn-001 (Button)
- inp-001 (Input Field)
- crd-001 (Card)
- nav-001 (Navigation)
- sht-001 (Sheet/Modal)

## Component File Structure

Each component file includes:
- Component ID
- Type and purpose
- Tamagui base component mapping
- Variants (if any)
- States
- Styling/tokens
- Usage tracking (which pages use this component)

---

**Components are added as they're discovered during specification.**
