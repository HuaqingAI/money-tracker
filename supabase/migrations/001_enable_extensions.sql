-- Migration 001: Enable required PostgreSQL extensions
-- Purpose: Provide UUID generation and field-level encryption primitives
-- PIPL compliance: pgcrypto is used for application-layer encryption of
-- sensitive PII fields (wechat unionid, phone numbers).

create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- Create custom schemas by domain
create schema if not exists billing;
create schema if not exists analytics;

-- Note: `auth` schema is pre-created by GoTrue and owns auth.users.
-- Our custom user profile fields live in `auth.user_profiles` (see 002).

comment on schema billing is 'Transactions, categories, parse rules';
comment on schema analytics is 'Monthly summaries and trend aggregates';
