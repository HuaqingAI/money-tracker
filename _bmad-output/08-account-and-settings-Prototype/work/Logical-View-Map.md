# Logical View Map: Scenario 08 — 账户与设置管理

**Scenario:** 08-account-and-settings
**Created:** 2026-04-11
**Approved by:** Sue

---

## Logical Views

| View | Page | Name | States | Build Order |
|------|------|------|--------|-------------|
| A | 08.0 | My Hub 我的 | Free / Member / Expired / Loading / Error | 1 |
| B | 08.1 | Settings 设置 | Default / Loading / Security Expanded / Notification Off / Offline | 2 |
| C | 08.2 | Profile / Account 个人资料 | Default / Loading / Editing Avatar / Editing Field / Save Error / Offline | 3 |

## Relationships

- 08.0 Hub 是导航枢纽，08.1 和 08.2 从 Hub push 进入
- 08.0 Profile Card → 08.2 Profile
- 08.0 Menu "设置" → 08.1 Settings
- 三个视图完全独立，无复用关系

## Build Strategy

1. **08.0 My Hub** — 先建导航枢纽，三态会员卡片 + 功能网格 + 菜单列表
2. **08.1 Settings** — 数据安全手风琴展开 + 通知偏好 Toggle + 退出登录
3. **08.2 Profile** — 头像编辑 + Bottom Sheet 编辑 + 会员状态卡片 + 注销入口

## Shared Components (Cross-page)

- Bottom Tab Bar（复用 01.7 定义）
- Top Bar with Back（08.1 / 08.2 共用模式）
- Membership Badge / Card（08.0 紧凑 Badge，08.2 完整卡片，4 态视觉）
