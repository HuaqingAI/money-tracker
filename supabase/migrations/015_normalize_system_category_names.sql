-- Migration 015: Normalize system category display names

insert into billing.categories (id, name, icon, sort_order, is_system, user_id) values
  ('00000000-0000-0000-0000-000000000001', '餐饮',       'utensils',         1,  true, null),
  ('00000000-0000-0000-0000-000000000002', '交通',       'car',              2,  true, null),
  ('00000000-0000-0000-0000-000000000003', '购物',       'shopping-bag',     3,  true, null),
  ('00000000-0000-0000-0000-000000000004', '住房',       'home',             4,  true, null),
  ('00000000-0000-0000-0000-000000000005', '娱乐',       'gamepad',          5,  true, null),
  ('00000000-0000-0000-0000-000000000006', '医疗',       'heart-pulse',      6,  true, null),
  ('00000000-0000-0000-0000-000000000007', '教育',       'book-open',        7,  true, null),
  ('00000000-0000-0000-0000-000000000008', '生活服务',   'wrench',           8,  true, null),
  ('00000000-0000-0000-0000-000000000009', '转账',       'arrow-left-right', 9,  true, null),
  ('00000000-0000-0000-0000-000000000010', '其他',       'more-horizontal', 10, true, null)
on conflict (id) do update
set
  name = excluded.name,
  icon = excluded.icon,
  sort_order = excluded.sort_order,
  is_system = true,
  user_id = null;
