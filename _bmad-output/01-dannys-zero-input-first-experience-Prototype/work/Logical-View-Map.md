# Logical View Map: Scenario 01 — 大强的零记账初体验

**Created:** 2026-04-11
**Confirmed by:** Sue
**Total Views:** 8 (all independent, no reuse)

---

## View Mapping

| View | Page | Name | States | Complexity | Shared Components |
|------|------|------|--------|------------|-------------------|
| V1 | 01.1 | Welcome | 1 | Simple | — |
| V2 | 01.2 | Onboarding | 3 (三幕滑页) | Medium | — |
| V3 | 01.3 | Registration | 5+ (微信/手机Tab, 验证码, 错误) | Medium | — |
| V4 | 01.4 | Permission | 4 (Android/iOS/已授权/跳过) | Medium | — |
| V5 | 01.5 | Bill Import | 5+ (条件标题, 文件选择, 上传, 错误) | Medium | — |
| V6 | 01.6 | Import Processing | 8+ (状态机) | Complex | — |
| V7 | 01.7 | Dashboard | 5+ (Full/Empty/Banner) | Complex | Bottom Tab Bar |
| V8 | 01.8 | Monthly Report | 14+ (图表/分享/AI洞察) | Complex | Bottom Tab Bar |

---

## Build Order

Linear, following user journey:

```
V1 → V2 → V3 → V4 → V5 → V6 → V7 → V8
```

Rationale: 前面的简单页面自然积累共享组件（品牌样式、按钮、布局模式），为后面复杂页面打基础。

---

## Cross-View Shared Components

| Component | Used By | Notes |
|-----------|---------|-------|
| Bottom Tab Bar | V7, V8 | 首页/交易/AI/我的 |
| Primary CTA Button | All | 统一品牌按钮样式 |
| Brand Header | V1-V3 | Logo + 品牌视觉语言 |
| Error State Pattern | V3, V5, V6, V8 | 统一错误处理 UI |
| Loading Skeleton | V7, V8 | 数据加载占位 |

---

## Navigation Flow

```
[App Store]
    ↓
V1 Welcome ──→ V2 Onboarding ──→ V3 Registration
                                       ↓
                              ┌── new user ──┐
                              ↓              ↓ (existing)
                         V4 Permission    V7 Dashboard
                              ↓
                         V5 Bill Import ──→ V7 Dashboard (skip)
                              ↓
                         V6 Import Processing
                              ↓
                         V7 Dashboard ──→ V8 Monthly Report
```
