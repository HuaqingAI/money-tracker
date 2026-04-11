# Logical View Map: Scenario 02 — 大强的家庭共享账本

**Created:** 2026-04-11
**Scenario:** 02-dannys-family-shared-ledger

---

## Logical Views

Scenario 02 has **3 logical views** — each page spec maps 1:1 to a distinct screen.

| # | Logical View | Spec(s) | States | Build Order |
|---|-------------|---------|--------|-------------|
| LV-1 | Subscription (订阅/免费领取) | 02.1 | Default → Claiming → Success → Failed → Already Claimed | 1st |
| LV-2 | Shared Family Ledger (共享家庭账本) | 02.2 | Create → Creating → Invite → QR Expanded → Sharing → Waiting | 2nd |
| LV-3 | Beneficiary Tagging (受益人标注) | 02.3 | Loading → Phase 1 Rules → Phase 1 All Confirmed → Phase 2 Remaining → Phase 2 All Tagged → Empty → Error | 3rd |

---

## Navigation Flow

```
Dashboard "邀请家人共享" Card
        ↓
  [LV-1] Subscription (免费领取)
        ↓ (领取成功)
  [LV-2] Shared Family Ledger (创建→邀请)
        ↓ (邀请已发送)
  [LV-3] Beneficiary Tagging (标注受益人)
        ↓ (完成)
  Dashboard (family ledger view)
```

---

## Shared Components (from Scenario 01)

- Tailwind config (liaoran color palette)
- Bottom Tab Bar pattern
- Card component pattern (bg-white rounded-2xl shadow-sm)
- Primary CTA button pattern
- Page transition animations (slideUp, fadeIn)

## New Components Needed

- Success overlay pattern (02.1)
- Expandable card pattern (02.1 features, 02.3 rules)
- Invite method buttons (02.2)
- QR code display (02.2)
- Tag chip component (02.3)
- Progress bar component (02.3)
- Confirmation dialog (02.3)
