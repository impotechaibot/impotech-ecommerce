-- ==========================================================
--  site_settings.sql — সাইট সেটিংস (থিম, লেআউট, কনটেন্ট)
-- ----------------------------------------------------------
--  কোথায় চালাবেন:  Supabase Dashboard → SQL Editor → New query
--                   পুরোটা পেস্ট করে "Run" চাপুন।
--
--  ⚠️ গুরুত্বপূর্ণ: আপনার প্রজেক্টে এই টেবিলটা আগেই আছে —
--     StoreContext.jsx এভাবে পড়ে:
--         supabase.from('site_settings').select('*')
--         map[row.key] = row.value
--     অর্থাৎ গঠন key/value। তাই এই স্ক্রিপ্টও সেই গঠনই
--     ব্যবহার করে — নতুন কলাম বানায় না, শুধু নিশ্চিত করে।
--
--  কী হয়:
--    • site_settings টেবিল না থাকলে তৈরি হয় (key/value)
--    • সবাই (anon) পড়তে পারে  → সাইট লোডে থিম আসে
--    • অ্যাডমিন লিখতে পারে    → সেভ করলে আপডেট হয়
--    • key = 'site' রেকর্ডে পুরো সেটিংস JSON হিসেবে থাকে
-- ==========================================================

-- ---------- ১. টেবিল ----------
create table if not exists public.site_settings (
  key         text primary key,
  value       jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

comment on table  public.site_settings is 'সাইটের সেটিংস — key/value জোড়ায় (key = site হলে পুরো কনফিগ)';
comment on column public.site_settings.value is 'useSiteConfig.js-এর DEFAULT_SITE-এর মতো গঠন';

-- ---------- ২. RLS চালু ----------
alter table public.site_settings enable row level security;

-- ---------- ৩. সবাই পড়তে পারবে ----------
drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read"
  on public.site_settings
  for select
  to anon, authenticated
  using (true);

-- ---------- ৪. অ্যাডমিন লিখতে পারবে (SIMPLE MODE) ----------
-- ⚠️ এই অ্যাপে Supabase Auth লগইন নেই (অ্যাডমিন পাসওয়ার্ড
--    শুধু ক্লায়েন্টে)। তাই লেখার অনুমতি anon-কে দেওয়া হচ্ছে —
--    নাহলে অ্যাডমিন সেভই করতে পারবে না।
drop policy if exists "site_settings_anon_insert" on public.site_settings;
create policy "site_settings_anon_insert"
  on public.site_settings
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "site_settings_anon_update" on public.site_settings;
create policy "site_settings_anon_update"
  on public.site_settings
  for update
  to anon, authenticated
  using (true)
  with check (true);

-- ---------- ৫. প্রাথমিক খালি রেকর্ড ----------
-- (খালি থাকলে সাইট ডিফল্ট থিম ব্যবহার করবে)
insert into public.site_settings (key, value)
values ('site', '{}'::jsonb)
on conflict (key) do nothing;

-- ==========================================================
--  SECURE MODE — Supabase Auth যোগ করার পরে
-- ----------------------------------------------------------
--  উপরের ৪ নম্বর অংশের দুটো policy ডিলিট করে এগুলো চালান:
--
--  drop policy if exists "site_settings_anon_insert" on public.site_settings;
--  drop policy if exists "site_settings_anon_update" on public.site_settings;
--
--  create policy "site_settings_auth_insert"
--    on public.site_settings for insert
--    to authenticated with check (true);
--
--  create policy "site_settings_auth_update"
--    on public.site_settings for update
--    to authenticated using (true) with check (true);
--
--  তারপর অ্যাডমিন প্যানেলে supabase.auth.signInWithPassword(...)
--  দিয়ে লগইন করালে তবেই সেভ কাজ করবে।
-- ==========================================================

-- ---------- যাচাই ----------
-- select key, updated_at, jsonb_pretty(value -> 'theme') from public.site_settings;
