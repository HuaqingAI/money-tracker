alter table auth.user_profiles
  add column if not exists gender text,
  add column if not exists birthday date;

alter table auth.user_profiles
  drop constraint if exists user_profiles_gender_check;

alter table auth.user_profiles
  add constraint user_profiles_gender_check
  check (gender is null or gender in ('male', 'female', 'undisclosed'));
