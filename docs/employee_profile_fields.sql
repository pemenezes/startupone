-- Optional profile fields for employee Profile screen
-- Run in Supabase SQL Editor once.

alter table public.profiles
  add column if not exists department text;
