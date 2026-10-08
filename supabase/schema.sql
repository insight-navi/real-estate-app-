-- =========================================================
-- 不動産管理アプリ用のテーブル定義
-- Supabase の SQL Editor に貼り付けて実行する（何度実行しても壊れないように書いている）
-- =========================================================

-- 物件テーブル
create table if not exists public.properties (
  id         uuid primary key default gen_random_uuid(),
  -- 登録したユーザー（ユーザーが削除されたら物件も削除する）
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- 物件名
  name       text not null check (char_length(trim(name)) > 0),
  -- 家賃（円）
  rent       integer not null check (rent >= 0),
  -- エリア名
  area       text not null check (char_length(trim(area)) > 0),
  -- 間取り（例：1LDK）
  layout     text not null check (char_length(trim(layout)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ユーザーごとの一覧取得を速くするためのインデックス
create index if not exists properties_user_id_idx on public.properties (user_id);

-- 更新時に updated_at を自動で現在時刻にする
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists properties_set_updated_at on public.properties;
create trigger properties_set_updated_at
  before update on public.properties
  for each row execute function public.set_updated_at();

-- =========================================================
-- 行レベルセキュリティ（RLS）
-- 自分が登録した物件だけを表示・登録・編集・削除できるようにする
-- =========================================================
alter table public.properties enable row level security;

-- ログインユーザーにだけテーブル操作を許可する（未ログインの anon には許可しない）
revoke all on public.properties from anon;
grant select, insert, update, delete on public.properties to authenticated;

-- 表示：自分の物件のみ
drop policy if exists "自分の物件のみ表示できる" on public.properties;
create policy "自分の物件のみ表示できる"
  on public.properties for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- 登録：登録者を自分以外にはできない
drop policy if exists "自分の物件として登録できる" on public.properties;
create policy "自分の物件として登録できる"
  on public.properties for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- 編集：自分の物件のみ。登録者を他人に書き換えることもできない
drop policy if exists "自分の物件のみ編集できる" on public.properties;
create policy "自分の物件のみ編集できる"
  on public.properties for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- 削除：自分の物件のみ
drop policy if exists "自分の物件のみ削除できる" on public.properties;
create policy "自分の物件のみ削除できる"
  on public.properties for delete
  to authenticated
  using ((select auth.uid()) = user_id);
