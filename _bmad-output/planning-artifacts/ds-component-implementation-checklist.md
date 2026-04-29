# DS Component Implementation Checklist

- **Owner**: Developer (Amelia)
- **使用范围**: Story 1.5.3 DS 组件层实现；后续任何新增/修改 DS 组件的 Story 复用本清单
- **来源参考**: `_bmad-output/D-Design-System/components/*.md`（spec 唯一来源）
- **落地位置**: `packages/ui/src/`
- **创建日期**: 2026-04-29
- **关联文档**: `sprint-change-proposal-2026-04-29.md` §4.5

## 进度总览

- **已实现 (4/20)**: button / text-input / text / provider
- **待实现 (16/20)**: 见下方清单

## 16 个待实现组件清单

每个组件的验收口径完全一致，见本文件末尾"每个组件的 Definition of Done"。

- [ ] avatar
- [ ] badge
- [ ] bottom-tab-bar
- [ ] card
- [ ] chart
- [ ] divider
- [ ] filter-chip
- [ ] header
- [ ] modal-sheet
- [ ] progress
- [ ] search-bar
- [ ] skeleton
- [ ] tab
- [ ] toast
- [ ] toggle
- [ ] tooltip

## 每个组件的 Definition of Done

一个组件声明为 "done" 必须同时满足以下全部条目：

1. **文件**：`packages/ui/src/<component>.tsx` 存在
2. **Spec 对齐**：Props / 状态 / 变体完全对齐 `_bmad-output/D-Design-System/components/<component>.md`
3. **Token 绑定**：颜色 / 间距 / 字体 / 圆角 / 阴影全部来自 Tamagui config token，禁止硬编码
4. **可访问性**：`accessibilityRole` / `accessibilityLabel` 完整；可聚焦组件支持键盘导航
5. **单元测试**：`packages/ui/src/__tests__/<component>.test.tsx` 覆盖：
   - 默认渲染快照
   - 主要变体（size / variant / state）
   - 关键交互（onPress / onChange / focus / blur）
   - 禁用态不触发交互
6. **Storybook**：`packages/ui/src/<component>.stories.tsx` 覆盖：
   - Default
   - 所有主要变体
   - Disabled
   - Error / Invalid（如适用）
   - Loading（如适用）
7. **导出**：从 `packages/ui/src/index.ts` 具名导出
8. **TypeScript**：严格模式无错误；Props interface 导出供消费者使用
9. **平台兼容**：iOS / Android / Web 三端渲染一致性通过 Storybook 手动验证

## 组件级特殊要求（补充项）

### chart
- 使用 Skia（`@shopify/react-native-skia`），不使用 SVG
- 支持空数据态（无数据）+ 加载态（骨架）+ 错误态
- 动画遵循 `D-Design-System/motion-and-animations.md`

### bottom-tab-bar
- 由 Story 1.5.4 直接消费；必须与 Expo Router `Tabs` 容器兼容
- 支持 badge（红点 + 数字）
- 活跃 Tab 视觉标识与高保真原型 01.7-dashboard.html 底部对齐

### modal-sheet
- 使用 Gorhom BottomSheet 或等效 library
- 支持 snap points / backdrop / 手势关闭
- 与 Toast / Tooltip 的 z-index 关系明确

### toast
- 全局单例，由 provider 承载
- 支持 success / error / warning / info 四态
- 自动消失时间与 `motion-and-animations.md` 一致

### chart / progress
- SSR / Web 环境下不破坏构建（React Native Web 兼容）

## 质量闸门

Story 1.5.3 整体 done 判定：

- [ ] 16 个组件的清单全部勾选
- [ ] 每个组件的 9 条 DoD 均满足
- [ ] `pnpm test --filter @liaoran/ui` 全绿
- [ ] `pnpm storybook --filter @liaoran/ui` 可启动且无报错
- [ ] 至少一次真机/等效环境视觉走查，记录在 Dev Agent Record

## 变更日志

- 2026-04-29 · Amelia · 初始创建；列出 16 个待实现组件清单
