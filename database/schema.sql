-- ============================================
-- Server Survival - Database Schema
-- Supabase PostgreSQL + Row Level Security
-- ============================================
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. USER PROFILES
-- ============================================
create table if not exists user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  created_at timestamptz default now()
);

-- Enable RLS
alter table user_profiles enable row level security;

-- RLS Policies
create policy "read own profile"
on user_profiles for select
using (auth.uid() = user_id);

create policy "insert own profile"
on user_profiles for insert
with check (auth.uid() = user_id);

-- ============================================
-- 2. TUTORIAL PROGRESS
-- ============================================
create table if not exists tutorial_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  tutorial_id text not null,
  status text check (status in ('locked', 'available', 'completed')),
  completed_at timestamptz,
  created_at timestamptz default now(),
  unique (user_id, tutorial_id)
);

-- Enable RLS
alter table tutorial_progress enable row level security;

-- RLS Policies
create policy "read own tutorial progress"
on tutorial_progress for select
using (auth.uid() = user_id);

create policy "insert own tutorial progress"
on tutorial_progress for insert
with check (auth.uid() = user_id);

-- UPDATE policy needed for upsert operations
create policy "update own tutorial progress"
on tutorial_progress for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- ============================================
-- 3. MCQ ATTEMPTS
-- ============================================
create table if not exists mcq_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  challenge_id text not null,
  score int not null,
  percentage int not null,
  time_taken int not null,
  completed_at timestamptz default now()
);

-- Enable RLS
alter table mcq_attempts enable row level security;

-- RLS Policies
create policy "read own mcq attempts"
on mcq_attempts for select
using (auth.uid() = user_id);

create policy "insert own mcq attempts"
on mcq_attempts for insert
with check (auth.uid() = user_id);

-- ============================================
-- 4. GAME SESSIONS
-- ============================================
create table if not exists game_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  mode text check (mode in ('PLAY', 'SANDBOX')),
  final_score int,
  duration int,
  failures int,
  budget_used int,
  result text check (result in ('COMPLETED', 'FAILED', 'ABANDONED')),
  created_at timestamptz default now()
);

-- Enable RLS
alter table game_sessions enable row level security;

-- RLS Policies
create policy "read own game sessions"
on game_sessions for select
using (auth.uid() = user_id);

create policy "insert own game sessions"
on game_sessions for insert
with check (auth.uid() = user_id);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
create index if not exists idx_tutorial_progress_user_id on tutorial_progress(user_id);
create index if not exists idx_mcq_attempts_user_id on mcq_attempts(user_id);
create index if not exists idx_mcq_attempts_challenge_id on mcq_attempts(challenge_id);
create index if not exists idx_game_sessions_user_id on game_sessions(user_id);
create index if not exists idx_game_sessions_mode on game_sessions(mode);

-- ============================================
-- VALIDATION QUERIES (Run after schema creation)
-- ============================================
-- Check tables exist:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Check policies:
-- SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';
