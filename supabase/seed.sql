-- Development seed data
--
-- Uses application-layer pgp_sym_encrypt for the sensitive PII columns.
-- The key 'dev-encryption-key-do-not-use-in-prod' mirrors the value
-- expected in supabase/.env.example under ENCRYPTION_KEY.

-- =====================================================================
-- System preset categories (is_system = true, user_id = null)
-- =====================================================================
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
  ('00000000-0000-0000-0000-000000000010', '其他',       'more-horizontal', 10,  true, null)
on conflict (id) do nothing;

-- =====================================================================
-- Test user — must exist in auth.users (managed by GoTrue) first.
-- This seed assumes a developer has created the user via the admin API
-- or via supabase local. We insert profile + sample data keyed by a
-- known UUID so tests can reference it deterministically.
-- =====================================================================
do $$
declare
  v_user_id uuid := '11111111-1111-1111-1111-111111111111';
  v_key     text := 'dev-encryption-key-do-not-use-in-prod';
begin
  -- Skip silently if the test user isn't present yet.
  if not exists (select 1 from auth.users where id = v_user_id) then
    raise notice 'Skipping seed: auth.users id % not found (create via admin API first)', v_user_id;
    return;
  end if;

  insert into auth.user_profiles (user_id, wechat_unionid, wechat_openid, phone_number, nickname, consent_at)
  values (
    v_user_id,
    pgp_sym_encrypt('oTestUnionId_dev_seed', v_key, 'cipher-algo=aes256'),
    pgp_sym_encrypt('oTestOpenId_dev_seed', v_key, 'cipher-algo=aes256'),
    pgp_sym_encrypt('+8613800138000', v_key, 'cipher-algo=aes256'),
    '测试用户',
    now()
  )
  on conflict (user_id) do nothing;

  -- Sample transactions covering all three status values
  insert into billing.transactions (user_id, amount_cents, status, category_id, source, merchant, description, transaction_at) values
    (v_user_id,  3500, 'confirmed',             '00000000-0000-0000-0000-000000000001', 'wechat_pay', '星巴克',   '拿铁',       now() - interval '2 days'),
    (v_user_id, 12800, 'pending_confirmation',  '00000000-0000-0000-0000-000000000003', 'alipay',     '淘宝',     '日用品',     now() - interval '1 day'),
    (v_user_id,  2000, 'rejected',              '00000000-0000-0000-0000-000000000010', 'wechat_pay', '未知商户', '疑似误识别', now() - interval '6 hours')
  on conflict do nothing;
end $$;
