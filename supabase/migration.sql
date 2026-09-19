-- =============================================
-- AURA Database Schema Migration
-- Run this in your Supabase SQL Editor
-- =============================================

-- =============================================
-- 1. PROFILES
-- =============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT DEFAULT '',
  avatar_url TEXT,
  what_helps TEXT[] DEFAULT '{}',
  what_doesnt_help TEXT[] DEFAULT '{}',
  when_overwhelmed TEXT[] DEFAULT '{}',
  feels_connected TEXT[] DEFAULT '{}',
  support_style TEXT DEFAULT 'listen' CHECK (support_style IN ('listen', 'guide', 'challenge', 'distract')),
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);

-- =============================================
-- 2. EMOTIONS
-- =============================================
CREATE TABLE public.emotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  emotion TEXT NOT NULL,
  free_text TEXT,
  intensity SMALLINT CHECK (intensity BETWEEN 1 AND 10),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_emotions_user_date ON public.emotions(user_id, created_at DESC);
CREATE INDEX idx_emotions_emotion ON public.emotions(emotion);

-- =============================================
-- 3. CHECKINS
-- =============================================
CREATE TABLE public.checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  emotion TEXT NOT NULL,
  body_sensation TEXT,
  energy_level SMALLINT CHECK (energy_level BETWEEN 1 AND 5),
  sleep_quality SMALLINT CHECK (sleep_quality BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_checkins_user_date ON public.checkins(user_id, created_at DESC);

-- =============================================
-- 4. JOURNAL ENTRIES
-- =============================================
CREATE TABLE public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  mood TEXT,
  prompt_used TEXT,
  is_bookmarked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_journal_user_date ON public.journal_entries(user_id, created_at DESC);
CREATE INDEX idx_journal_bookmarked ON public.journal_entries(user_id, is_bookmarked) WHERE is_bookmarked = true;

-- =============================================
-- 5. CHAT SESSIONS
-- =============================================
CREATE TABLE public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mode TEXT DEFAULT 'default' CHECK (mode IN ('default', 'listen', 'guided')),
  emotion_context TEXT,
  message_count INT DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ
);

CREATE INDEX idx_sessions_user ON public.chat_sessions(user_id, started_at DESC);

-- =============================================
-- 6. CHAT MESSAGES
-- =============================================
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'aura', 'system')),
  content TEXT NOT NULL,
  detected_emotion TEXT,
  is_safety_alert BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_messages_session ON public.chat_messages(session_id, created_at ASC);
CREATE INDEX idx_messages_safety ON public.chat_messages(user_id) WHERE is_safety_alert = true;

-- =============================================
-- 7. SUPPORT TASKS
-- =============================================
CREATE TABLE public.support_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  time_estimate TEXT,
  reason TEXT,
  icon TEXT,
  color TEXT,
  href TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'skipped', 'replaced')),
  assigned_date DATE DEFAULT CURRENT_DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_support_user_date ON public.support_tasks(user_id, assigned_date);
CREATE INDEX idx_support_status ON public.support_tasks(user_id, status);

-- =============================================
-- 8. TRUSTED CONTACTS
-- =============================================
CREATE TABLE public.trusted_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  relationship TEXT,
  is_emergency BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_contacts_user ON public.trusted_contacts(user_id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trusted_contacts ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Emotions
CREATE POLICY "emotions_select" ON public.emotions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "emotions_insert" ON public.emotions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "emotions_delete" ON public.emotions FOR DELETE USING (auth.uid() = user_id);

-- Checkins
CREATE POLICY "checkins_select" ON public.checkins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "checkins_insert" ON public.checkins FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Journal Entries
CREATE POLICY "journal_select" ON public.journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "journal_insert" ON public.journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "journal_update" ON public.journal_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "journal_delete" ON public.journal_entries FOR DELETE USING (auth.uid() = user_id);

-- Chat Sessions
CREATE POLICY "sessions_select" ON public.chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "sessions_insert" ON public.chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sessions_update" ON public.chat_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Chat Messages
CREATE POLICY "messages_select" ON public.chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "messages_insert" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Support Tasks
CREATE POLICY "support_select" ON public.support_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "support_insert" ON public.support_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "support_update" ON public.support_tasks FOR UPDATE USING (auth.uid() = user_id);

-- Trusted Contacts
CREATE POLICY "contacts_select" ON public.trusted_contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "contacts_insert" ON public.trusted_contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "contacts_update" ON public.trusted_contacts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "contacts_delete" ON public.trusted_contacts FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- TRIGGERS
-- =============================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at_journal BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Increment message_count on chat_sessions
CREATE OR REPLACE FUNCTION public.increment_message_count()
RETURNS trigger AS $$
BEGIN
  UPDATE public.chat_sessions
  SET message_count = message_count + 1
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_message_insert
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.increment_message_count();
