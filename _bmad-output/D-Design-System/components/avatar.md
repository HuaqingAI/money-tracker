# Avatar [avt-001]

**Type:** Content
**Category:** Identity
**Purpose:** 用户/成员头像展示，支持图片、首字母、占位符
**Library:** Tamagui v2 → `Avatar` component

---

## Overview

Avatar 用于展示用户身份的视觉标识。支持图片上传、首字母回退、品牌色占位。

---

## Variants

### image — 图片头像
- 圆形裁切，1:1 比例
- 上传自动压缩 <500KB

### initials — 首字母头像
- 圆形，hash 色背景 + 白色首字母
- 无图片时自动回退

### editable — 可编辑头像
- 右下角相机图标覆盖层
- 点击触发 Bottom Sheet（拍照/相册/查看大图）

---

## Sizes

| Size | Diameter | Usage |
|------|----------|-------|
| sm | 32pt | 列表项内嵌 |
| md | 44-48pt | 联系人卡、Hub Profile |
| lg | 64pt | Hub Profile Card |
| xl | 80pt | 个人资料页 |

---

## States

- **default** — 正常展示
- **loading** — 上传中，覆盖层 spinner
- **placeholder** — 无图片，显示首字母或默认图标

---

## Styling

```yaml
colors:
  background: hash-generated from name
  text: $color.white
  border: $color.neutral-200 (optional)
  overlay: rgba(0,0,0,0.3)

effects:
  borderRadius: $radius.full    # 50%
  border: 2px white (family member variant)
```

### Library Component (Tamagui)

```typescript
import { Avatar as TAvatar } from 'tamagui'

<TAvatar circular size="$6">
  <TAvatar.Image src={imageUrl} />
  <TAvatar.Fallback backgroundColor="$brandPrimary">
    <Text color="$white">{initials}</Text>
  </TAvatar.Fallback>
</TAvatar>
```

---

## Accessibility

- role: img
- aria-label: "{用户名}的头像"

---

## Used In

**Pages:** 4+ (02.2, 04.1, 08.0, 08.2)

| Page | OBJECT ID | Size | Context |
|------|-----------|------|---------|
| 08.2 | prof-avatar-image | xl (80pt) | 个人资料页 |
| 08.0 | hub-profile-avatar | lg (64pt) | 我的 Hub |
| 02.2 | ledger-member-avatar | md (44pt) | 家庭成员 |
| 04.1 | gift-contact-avatar | md (44pt) | 联系人卡 |

---

## Version History

**Created:** 2026-04-11
