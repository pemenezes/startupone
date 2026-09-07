-- Notification preferences for employees (JSON on profiles)
-- Run once in Supabase SQL Editor.

alter table public.profiles
  add column if not exists notification_prefs jsonb not null default '{}'::jsonb;
