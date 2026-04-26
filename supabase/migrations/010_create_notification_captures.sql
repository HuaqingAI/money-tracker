-- Migration 010: persisted notification capture staging

create table if not exists billing.notification_captures (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  device_id       text not null,
  platform        text not null check (platform in ('alipay', 'wechat', 'icbc', 'cmb', 'ccb', 'bank')),
  amount_cents    bigint not null,
  merchant        text not null,
  merchant_key    text not null,
  transaction_at  timestamptz not null,
  captured_at     timestamptz not null default now(),
  created_at      timestamptz not null default now()
);

create index if not exists idx_notification_captures_user_device
  on billing.notification_captures(user_id, device_id);

create index if not exists idx_notification_captures_dedupe
  on billing.notification_captures(
    user_id,
    device_id,
    platform,
    amount_cents,
    merchant_key,
    transaction_at
  );

alter table billing.notification_captures enable row level security;

create policy notification_captures_select_own on billing.notification_captures
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy notification_captures_insert_own on billing.notification_captures
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy notification_captures_write_service on billing.notification_captures
  for all to service_role
  using (true)
  with check (true);

comment on table billing.notification_captures is 'Structured notification captures only; raw notification text is never stored.';
