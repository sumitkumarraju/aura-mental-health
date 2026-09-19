// AURA — Database service layer
// Wraps Supabase queries. Falls back to localStorage when not authenticated.

import { createClient } from './supabase';

function getSupabase() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url || url === 'your_supabase_project_url') return null;
    return createClient();
  } catch {
    return null;
  }
}

// ─── Profiles ────────────────────────────────────────

export async function getProfileDB() {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) return null;
  return {
    name: data.name || '',
    whatHelps: data.what_helps || [],
    whatDoesntHelp: data.what_doesnt_help || [],
    whenOverwhelmed: data.when_overwhelmed || [],
    feelsConnected: data.feels_connected || [],
    supportStyle: data.support_style || 'listen',
    avatarUrl: data.avatar_url,
    onboardingCompleted: data.onboarding_completed,
  };
}

export async function saveProfileDB(profile) {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { error } = await supabase
    .from('profiles')
    .update({
      name: profile.name,
      what_helps: profile.whatHelps || [],
      what_doesnt_help: profile.whatDoesntHelp || [],
      when_overwhelmed: profile.whenOverwhelmed || [],
      feels_connected: profile.feelsConnected || [],
      support_style: profile.supportStyle || 'listen',
    })
    .eq('user_id', user.id);

  return !error;
}

// ─── Emotions ────────────────────────────────────────

export async function saveEmotionDB(emotion) {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { error } = await supabase
    .from('emotions')
    .insert({
      user_id: user.id,
      emotion: emotion.emotion,
      free_text: emotion.text || null,
      intensity: emotion.intensity || null,
    });

  return !error;
}

export async function getEmotionHistoryDB(limit = 50) {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('emotions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return null;
  return data.map((e) => ({
    emotion: e.emotion,
    text: e.free_text,
    intensity: e.intensity,
    timestamp: e.created_at,
  }));
}

// ─── Check-ins ───────────────────────────────────────

export async function saveCheckinDB(checkin) {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { error } = await supabase
    .from('checkins')
    .insert({
      user_id: user.id,
      emotion: checkin.emotion,
      body_sensation: checkin.bodySensation || null,
      energy_level: checkin.energyLevel || null,
      sleep_quality: checkin.sleepQuality || null,
      notes: checkin.notes || null,
    });

  return !error;
}

export async function getCheckinsDB(limit = 30) {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('checkins')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return null;
  return data.map((c) => ({
    id: c.id,
    emotion: c.emotion,
    bodySensation: c.body_sensation,
    energyLevel: c.energy_level,
    sleepQuality: c.sleep_quality,
    notes: c.notes,
    timestamp: c.created_at,
  }));
}

// ─── Journal Entries ─────────────────────────────────

export async function getJournalEntriesDB() {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return null;
  return data.map((j) => ({
    id: j.id,
    title: j.title,
    content: j.content,
    mood: j.mood,
    promptUsed: j.prompt_used,
    isBookmarked: j.is_bookmarked,
    createdAt: j.created_at,
    updatedAt: j.updated_at,
  }));
}

export async function saveJournalEntryDB(entry) {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  if (entry.id) {
    // Update existing
    const { error } = await supabase
      .from('journal_entries')
      .update({
        title: entry.title,
        content: entry.content,
        mood: entry.mood,
        is_bookmarked: entry.isBookmarked || false,
      })
      .eq('id', entry.id)
      .eq('user_id', user.id);
    return !error;
  } else {
    // Insert new
    const { error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: user.id,
        title: entry.title || null,
        content: entry.content,
        mood: entry.mood || null,
        prompt_used: entry.promptUsed || null,
      });
    return !error;
  }
}

export async function deleteJournalEntryDB(id) {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  return !error;
}

// ─── Chat Sessions & Messages ────────────────────────

export async function createChatSessionDB(mode = 'default', emotionContext = null) {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({
      user_id: user.id,
      mode,
      emotion_context: emotionContext,
    })
    .select()
    .single();

  if (error) return null;
  return data;
}

export async function saveChatMessageDB(sessionId, role, content, detectedEmotion = null, isSafetyAlert = false) {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { error } = await supabase
    .from('chat_messages')
    .insert({
      session_id: sessionId,
      user_id: user.id,
      role,
      content,
      detected_emotion: detectedEmotion,
      is_safety_alert: isSafetyAlert,
    });

  return !error;
}

export async function getChatMessagesDB(sessionId) {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) return null;
  return data.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    detectedEmotion: m.detected_emotion,
    isSafetyAlert: m.is_safety_alert,
    timestamp: m.created_at,
  }));
}

export async function getChatSessionsDB(limit = 20) {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) return null;
  return data;
}

// ─── Support Tasks ───────────────────────────────────

export async function getSupportTasksDB() {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('support_tasks')
    .select('*')
    .eq('user_id', user.id)
    .eq('assigned_date', today);

  if (error) return null;
  return data.map((t) => ({
    id: t.id,
    category: t.category,
    title: t.title,
    description: t.description,
    time: t.time_estimate,
    reason: t.reason,
    icon: t.icon,
    color: t.color,
    href: t.href,
    status: t.status,
  }));
}

export async function updateSupportTaskStatusDB(taskId, status) {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const updates = { status };
  if (status === 'completed') {
    updates.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('support_tasks')
    .update(updates)
    .eq('id', taskId)
    .eq('user_id', user.id);

  return !error;
}

export async function insertSupportTasksDB(tasks) {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const rows = tasks.map((t) => ({
    user_id: user.id,
    category: t.category,
    title: t.title,
    description: t.description,
    time_estimate: t.time,
    reason: t.reason,
    icon: t.icon,
    color: t.color,
    href: t.href || null,
  }));

  const { error } = await supabase.from('support_tasks').insert(rows);
  return !error;
}

// ─── Trusted Contacts ────────────────────────────────

export async function getTrustedContactsDB() {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('trusted_contacts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) return null;
  return data;
}

export async function saveTrustedContactDB(contact) {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  if (contact.id) {
    const { error } = await supabase
      .from('trusted_contacts')
      .update({
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        relationship: contact.relationship,
        is_emergency: contact.isEmergency || false,
      })
      .eq('id', contact.id)
      .eq('user_id', user.id);
    return !error;
  } else {
    const { error } = await supabase
      .from('trusted_contacts')
      .insert({
        user_id: user.id,
        name: contact.name,
        phone: contact.phone || null,
        email: contact.email || null,
        relationship: contact.relationship || null,
        is_emergency: contact.isEmergency || false,
      });
    return !error;
  }
}

export async function deleteTrustedContactDB(id) {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { error } = await supabase
    .from('trusted_contacts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  return !error;
}
