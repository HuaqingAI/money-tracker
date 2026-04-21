-- Migration 002: auth schema — user profiles and subscriptions
-- GoTrue owns auth.users. We extend it via auth.user_profiles for custom
-- fields the product requires (wechat identifiers, phone, consent).
-- Sensitive PII fields are stored as bytea holding application-layer
-- pgp_sym_encrypt output; the encryption key lives in application env
-- (ENCRYPTION_KEY) and is never persisted to the database.

create table if not exists auth.user_profiles (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null unique references auth.users(id) on delete cascade,
  wechat_unionid  bytea,
  wechat_openid   bytea,
  phone_number    bytea,
  nickname        text,
  avatar_url      text,
  consent_at      timestamptz not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table auth.user_profiles is 'Custom user fields extending GoTrue auth.users';
comment on column auth.user_profiles.wechat_unionid is 'pgp_sym_encrypt ciphertext, AES-256';
comment on column auth.user_profiles.wechat_openid is 'pgp_sym_encrypt ciphertext, AES-256';
comment on column auth.user_profiles.phone_number is 'pgp_sym_encrypt ciphertext, AES-256';
comment on column auth.user_profiles.consent_at is 'PIPL consent timestamp — required';

-- auth.subscriptions: paid plan tracking (Phase 2 paid features)
create table if not exists auth.subscriptions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  provider     text not null check (provider in ('wechat', 'alipay', 'apple_iap')),
  plan         text not null,
  expires_at   timestamptz not null,
  created_at   timestamptz not null default now()
);

create index if not exists idx_user_profiles_user_id on auth.user_profiles(user_id);
create index if not exists idx_subscriptions_user_id on auth.subscriptions(user_id);
create index if not exists idx_subscriptions_expires_at on auth.subscriptions(expires_at);
